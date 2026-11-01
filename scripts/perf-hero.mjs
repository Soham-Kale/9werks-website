#!/usr/bin/env node
// Scrolls through the home hero the way a person does (wheel ticks, ~60 per
// second) and records every frame, so animation smoothness can be compared
// before and after a change.
//
//   node scripts/perf-hero.mjs [baseUrl] [label]
//
// Reports average FPS, the share of frames slower than 25 ms (visible jank),
// the worst frames, and main-thread long tasks during the scroll.

import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3000";
const label = process.argv[3] ?? "run";
// Optional CSS injected before measuring, to test a styling change without a rebuild.
const extraCss = process.argv[4] ?? "";

const browser = await chromium.launch({
  channel: "chrome",
  headless: false, // a real window, so the GPU and compositor behave as they do for a visitor
  args: ["--use-angle=d3d11", "--ignore-gpu-blocklist", "--window-size=1440,900", "--window-position=0,0"],
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 820 } });
const page = await ctx.newPage();
await page.goto(base + "/", { waitUntil: "networkidle" });
if (extraCss) await page.addStyleTag({ content: extraCss });
await page.mouse.move(700, 400);
await page.mouse.wheel(0, 1);
await page.waitForSelector(".hero-track[data-ready]", { timeout: 90000 });
await page.waitForTimeout(2500);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1500);

await page.evaluate(() => {
  const w = window;
  w.__frames = [];
  w.__long = [];
  let last = performance.now();
  const label = document.querySelector("[data-dial-label]");
  w.__chapters = [];
  const loop = (t) => {
    w.__frames.push(t - last);
    w.__chapters.push(label?.textContent ?? "?");
    last = t;
    if (!w.__stop) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  new PerformanceObserver((l) => l.getEntries().forEach((e) => w.__long.push(Math.round(e.duration)))).observe({ type: "longtask", buffered: false });
});

// Scroll the whole hero track with wheel ticks: 100px every ~16ms.
const trackPx = await page.evaluate(() => {
  const s = document.querySelector(".hero-track");
  return s.offsetHeight - innerHeight;
});
for (let y = 0; y < trackPx; y += 100) {
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(16);
}
await page.waitForTimeout(2000);

const r = await page.evaluate(() => {
  window.__stop = true;
  const f = window.__frames.slice(2);
  const total = f.reduce((a, b) => a + b, 0);
  const sorted = [...f].sort((a, b) => b - a);
  return {
    frames: f.length,
    fps: Math.round((f.length / total) * 1000),
    jankPct: Math.round((f.filter((d) => d > 25).length / f.length) * 1000) / 10,
    over50: f.filter((d) => d > 50).length,
    worst: sorted.slice(0, 6).map(Math.round),
    p95: Math.round(sorted[Math.floor(f.length * 0.05)]),
    longTasks: window.__long.length,
    longTaskMs: window.__long.reduce((a, b) => a + b, 0),
    longest: window.__long.sort((a, b) => b - a).slice(0, 5),
    tier: document.querySelector(".hero-track")?.dataset.tier ?? "?",
    chapters: Object.entries(
      window.__chapters.slice(2).reduce((acc, c, i) => {
        (acc[c] ??= []).push(f[i]);
        return acc;
      }, {}),
    ).map(([c, xs]) => `ch${c} ${Math.round((xs.length / xs.reduce((a, b) => a + b, 0)) * 1000)}fps`),
  };
});
console.log(`${label}: ${r.fps} fps avg | ${r.jankPct}% frames >25ms | ${r.over50} frames >50ms | p95 ${r.p95}ms | worst ${r.worst.join("/")}ms | long tasks ${r.longTasks} (${r.longTaskMs}ms, longest ${r.longest.join("/")}) | tier ${r.tier} | ${r.chapters.join(" ")}`);
await browser.close();
