#!/usr/bin/env node
// Playwright screenshots of the running site for visual review.
//
//   node scripts/shoot.mjs hero [baseUrl]      hero scroll journey, desktop + mobile
//   node scripts/shoot.mjs pages [baseUrl]     every route, full page, desktop + mobile
//   node scripts/shoot.mjs reduced [baseUrl]   home with prefers-reduced-motion
//
// Uses the installed Google Chrome, so no browser download is needed.
// Output goes to .shots/ (git-ignored).

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const mode = process.argv[2] ?? "hero";
const base = process.argv[3] ?? "http://localhost:3109";
const out = new URL("../.shots/", import.meta.url);
mkdirSync(out, { recursive: true });
const file = (name) => new URL(name, out).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const viewports = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--use-angle=d3d11", "--enable-gpu-rasterization", "--ignore-gpu-blocklist"],
});

const errors = [];
async function page(vp, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch, reducedMotion: opts.reduced ? "reduce" : "no-preference" });
  const p = await ctx.newPage();
  p.on("console", (m) => {
    if (m.type() === "error") errors.push(`[${vp.width}] ${m.text()}`);
  });
  p.on("pageerror", (e) => errors.push(`[${vp.width}] pageerror ${e.message}`));
  return p;
}

async function heroJourney(name, vp, points) {
  const p = await page(vp);
  await p.goto(base + "/", { waitUntil: "networkidle" });
  await p.waitForSelector(".hero-track[data-ready]", { timeout: 60000 }).catch(() => errors.push(`[${vp.width}] hero never became ready`));
  await p.waitForTimeout(1500);
  for (const pt of points) {
    await p.evaluate((q) => {
      const s = document.querySelector(".hero-track");
      window.scrollTo(0, Math.round(q * (s.offsetHeight - innerHeight)));
    }, pt);
    await p.waitForTimeout(3200);
    await p.screenshot({ path: file(`${name}-hero-${String(Math.round(pt * 100)).padStart(3, "0")}.png`) });
  }
  const stats = await p.evaluate(() => ({ overflowX: document.documentElement.scrollWidth - innerWidth }));
  if (stats.overflowX > 0) errors.push(`[${vp.width}] horizontal overflow ${stats.overflowX}px`);
  await p.context().close();
}

async function pages(name, vp) {
  for (const route of ["/", "/services", "/about", "/booking", "/contact"]) {
    const p = await page(vp);
    await p.goto(base + route, { waitUntil: "networkidle" });
    // Scroll through so reveal-on-scroll content is in its final state.
    await p.evaluate(async () => {
      const step = innerHeight * 0.7;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await p.waitForTimeout(1800);
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (ov > 0) errors.push(`[${vp.width}] ${route} horizontal overflow ${ov}px`);
    const slug = route === "/" ? "home" : route.slice(1);
    if (route === "/") {
      // The hero is a long scroll track; capture what follows it separately.
      await p.evaluate(() => {
        const s = document.querySelector(".hero-track");
        window.scrollTo(0, s.offsetTop + s.offsetHeight);
      });
      await p.waitForTimeout(1200);
      await p.evaluate(() => {
        const s = document.querySelector(".hero-track");
        s.style.height = "100vh";
      });
    }
    await p.screenshot({ path: file(`${name}-${slug}.png`), fullPage: true });
    await p.context().close();
  }
}

if (mode === "hero") {
  const pts = [0, 0.12, 0.2, 0.3, 0.4, 0.46, 0.55, 0.62, 0.7, 0.8, 0.9, 1];
  await heroJourney("desktop", viewports.desktop, pts);
  await heroJourney("mobile", viewports.mobile, [0, 0.2, 0.35, 0.46, 0.6, 0.8, 1]);
} else if (mode === "pages") {
  await pages("desktop", viewports.desktop);
  await pages("mobile", viewports.mobile);
} else if (mode === "reduced") {
  for (const [n, vp] of Object.entries(viewports)) {
    const p = await page(vp, { reduced: true });
    await p.goto(base + "/", { waitUntil: "networkidle" });
    await p.waitForSelector(".hero-track[data-ready]", { timeout: 60000 }).catch(() => errors.push(`[${vp.width}] reduced: hero never ready`));
    await p.waitForTimeout(2000);
    await p.screenshot({ path: file(`reduced-${n}.png`) });
    await p.context().close();
  }
}

await browser.close();
console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "No console errors.");
