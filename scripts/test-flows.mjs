#!/usr/bin/env node
// Functional checks against a running build, with real browser interaction.
//   node scripts/test-flows.mjs [baseUrl]
// Exits non-zero if any check fails.

import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3109";
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=d3d11", "--ignore-gpu-blocklist"] });
const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail });

async function ctx(opts = {}) {
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const p = await c.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return { c, p, errors };
}

// 1. Every route responds and has one h1, a title, a description and a canonical.
for (const route of ["/", "/services", "/about", "/booking", "/contact"]) {
  const { c, p, errors } = await ctx();
  const res = await p.goto(base + route, { waitUntil: "networkidle" });
  const meta = await p.evaluate(() => ({
    h1: document.querySelectorAll("h1").length,
    title: document.title,
    desc: document.querySelector('meta[name="description"]')?.content ?? "",
    canonical: document.querySelector('link[rel="canonical"]')?.href ?? "",
    ogImage: document.querySelector('meta[property="og:image"]')?.content ?? "",
    jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent)["@type"]),
    imgsNoAlt: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length,
    brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter((a) => a.getAttribute("href").length > 1 && !document.querySelector(a.getAttribute("href"))).length,
    labelled: [...document.querySelectorAll("section[aria-labelledby]")].filter((s) => !document.getElementById(s.getAttribute("aria-labelledby"))).length,
  }));
  check(`${route} responds 200`, res.status() === 200, String(res.status()));
  check(`${route} has exactly one h1`, meta.h1 === 1, String(meta.h1));
  check(`${route} title, description, canonical, og:image`, meta.title && meta.desc.length > 50 && meta.canonical && meta.ogImage, `${meta.title} | ${meta.canonical}`);
  check(`${route} LocalBusiness JSON-LD`, meta.jsonld.includes("AutoRepair"));
  check(`${route} all images have alt`, meta.imgsNoAlt === 0, String(meta.imgsNoAlt));
  check(`${route} in-page anchors resolve`, meta.brokenAnchors === 0, String(meta.brokenAnchors));
  check(`${route} aria-labelledby targets exist`, meta.labelled === 0, String(meta.labelled));
  check(`${route} no console errors`, errors.length === 0, errors.join(" / ").slice(0, 200));
  await c.close();
}

// 2. Every internal link points at a route that exists.
{
  const { c, p } = await ctx();
  await p.goto(base + "/", { waitUntil: "networkidle" });
  const hrefs = await p.evaluate(() => [...new Set([...document.querySelectorAll("a[href^='/']")].map((a) => a.getAttribute("href").split("#")[0].split("?")[0]))]);
  for (const h of hrefs) {
    const r = await p.request.get(base + h);
    check(`link ${h} resolves`, r.status() === 200, String(r.status()));
  }
  for (const f of ["/sitemap.xml", "/robots.txt", "/icon.png", "/models/car.glb", "/textures/studio_small_09_1k.hdr"]) {
    const r = await p.request.get(base + f);
    check(`asset ${f} serves`, r.status() === 200, String(r.status()));
  }
  await c.close();
}

// 3. Booking: empty submit shows errors and focuses the first; a valid submit opens WhatsApp with the details.
{
  const { c, p, errors } = await ctx();
  await p.goto(base + "/booking?service=brakes", { waitUntil: "networkidle" });
  const preset = await p.$eval("#f-service", (s) => s.value);
  check("booking: ?service=brakes preselects Brakes", preset === "Brakes", preset);
  await p.click('button[type="submit"]');
  const invalid = await p.$$eval('[aria-invalid="true"]', (els) => els.map((e) => e.id));
  const focused = await p.evaluate(() => document.activeElement?.id);
  check("booking: empty submit flags name, phone, car, day", ["f-name", "f-phone", "f-car", "f-day"].every((id) => invalid.includes(id)), invalid.join(","));
  check("booking: focus moves to first invalid field", focused === "f-name", focused);
  await p.fill("#f-name", "Test Customer");
  await p.fill("#f-phone", "12345");
  await p.fill("#f-car", "Porsche 911");
  const tomorrow = await p.evaluate(() => {
    const d = new Date(Date.now() + 2 * 864e5);
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
  });
  await p.fill("#f-day", tomorrow);
  await p.fill("#f-notes", "Squeal from front left under braking");
  await p.click('button[type="submit"]');
  const phoneErr = await p.$eval("#f-phone", (e) => e.getAttribute("aria-invalid"));
  check("booking: short phone number rejected", phoneErr === "true");
  await p.fill("#f-phone", "+91 98765 43210");
  // Capture the WhatsApp popup instead of letting it load.
  await c.route("https://wa.me/**", (route) => route.fulfill({ status: 200, body: "ok" }));
  const [popup] = await Promise.all([p.waitForEvent("popup"), p.click('button[type="submit"]')]);
  const url = new URL(popup.url());
  const text = url.searchParams.get("text") ?? "";
  check("booking: opens wa.me/917083199986", url.host === "wa.me" && url.pathname === "/917083199986", popup.url().slice(0, 60));
  check(
    "booking: message carries all details",
    ["Name: Test Customer", "Phone: +91 98765 43210", "Car: Porsche 911", "Service: Brakes", "Preferred day:", "Notes: Squeal"].every((s) => text.includes(s)),
    text.replace(/\n/g, " | "),
  );
  const done = await p.textContent('[role="status"]');
  check("booking: confirmation state shown", /Send the message in WhatsApp/.test(done ?? ""));
  check("booking: no console errors", errors.length === 0, errors.join(" / "));
  await c.close();
}

// 4. Mobile menu: opens, traps focus, closes on Escape.
{
  const { c, p } = await ctx({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await p.goto(base + "/services", { waitUntil: "networkidle" });
  await p.click('button[aria-controls="site-menu"]');
  const open = await p.$eval("#site-menu", (m) => !m.hidden);
  for (let i = 0; i < 12; i++) await p.keyboard.press("Tab");
  const inside = await p.evaluate(() => !!document.activeElement?.closest("header"));
  await p.keyboard.press("Escape");
  const closed = await p.$eval("#site-menu", (m) => m.hidden);
  check("mobile menu opens", open);
  check("mobile menu keeps focus inside", inside);
  check("mobile menu closes on Escape", closed);
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check("mobile: no horizontal overflow on /services", ov <= 0, String(ov));
  await c.close();
}

// 5. Keyboard: skip link is the first tab stop and focus is visible.
{
  const { c, p } = await ctx();
  await p.goto(base + "/about", { waitUntil: "networkidle" });
  await p.keyboard.press("Tab");
  const first = await p.evaluate(() => ({ text: document.activeElement?.textContent, outline: getComputedStyle(document.activeElement).outlineStyle }));
  check("skip link is the first tab stop", /Skip to content/.test(first.text ?? ""), first.text);
  await p.keyboard.press("Tab");
  const ring = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  check("focus ring visible on nav links", ring !== "none", ring);
  await c.close();
}

// 6. Contact map loads once scrolled into view.
{
  const { c, p } = await ctx();
  await p.goto(base + "/contact", { waitUntil: "networkidle" });
  await p.locator("iframe").scrollIntoViewIfNeeded();
  await p.waitForTimeout(4000);
  const frame = p.frames().find((f) => f.url().includes("google.com/maps"));
  check("contact: Google Maps embed loads", !!frame, frame?.url().slice(0, 60) ?? "no frame");
  await p.screenshot({ path: ".shots/contact-map.png" });
  await c.close();
}

// 7. 404 page.
{
  const { c, p } = await ctx();
  const r = await p.goto(base + "/no-such-page", { waitUntil: "networkidle" });
  check("unknown route returns 404 page", r.status() === 404 && (await p.textContent("h1")).includes("Wrong turn"));
  await c.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.ok ? "" : "  -> " + r.detail}`);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
