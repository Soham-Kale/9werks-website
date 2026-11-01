#!/usr/bin/env node
// Mobile Lighthouse for every route, several runs each, reporting the median.
//
//   node scripts/lighthouse.mjs [baseUrl] [runs] [minBenchmark]
//
// Local scores swing with whatever else the machine is doing. Lighthouse's
// `benchmarkIndex` measures the CPU at test time; runs below `minBenchmark`
// (default 0: keep all) are treated as contended, reported, and retried, up
// to three times the requested number of runs.
//
// Needs a running production build (npm run build && npm start) and Chrome.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
const runs = Number(process.argv[3] ?? 3);
const minBench = Number(process.argv[4] ?? 0);
const routes = ["/", "/services", "/about", "/booking", "/contact"];
mkdirSync(".shots", { recursive: true });
process.env.CHROME_PATH ??= "C:/Program Files/Google/Chrome/Application/chrome.exe";

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

for (const route of routes) {
  const kept = [];
  const skipped = [];
  for (let attempt = 0; kept.length < runs && attempt < runs * 3; attempt++) {
    const out = `.shots/lh-${route === "/" ? "home" : route.slice(1)}-${attempt}.json`;
    execFileSync(
      process.platform === "win32" ? "npx.cmd" : "npx",
      ["-y", "lighthouse@12.8.2", base + route, "--quiet", "--form-factor=mobile", "--only-categories=performance,accessibility,best-practices,seo", "--chrome-flags=--headless=new", "--output=json", `--output-path=${out}`],
      { stdio: "ignore", shell: process.platform === "win32" },
    );
    const j = JSON.parse(readFileSync(out, "utf8"));
    const r = {
      bench: Math.round(j.environment.benchmarkIndex),
      perf: Math.round(j.categories.performance.score * 100),
      a11y: Math.round(j.categories.accessibility.score * 100),
      bp: Math.round(j.categories["best-practices"].score * 100),
      seo: Math.round(j.categories.seo.score * 100),
      lcp: j.audits["largest-contentful-paint"].numericValue,
      tbt: j.audits["total-blocking-time"].numericValue,
      cls: j.audits["cumulative-layout-shift"].numericValue,
    };
    (r.bench >= minBench ? kept : skipped).push(r);
  }
  if (!kept.length) {
    console.log(`${route.padEnd(10)} no uncontended runs (benchmarks ${skipped.map((s) => s.bench).join("/")})`);
    continue;
  }
  const m = (k) => median(kept.map((r) => r[k]));
  console.log(
    `${route.padEnd(10)} perf ${m("perf")} (runs ${kept.map((r) => `${r.perf}@${r.bench}`).join(" ")})  a11y ${m("a11y")}  bp ${m("bp")}  seo ${m("seo")}  LCP ${(m("lcp") / 1000).toFixed(1)}s  TBT ${Math.round(m("tbt"))}ms  CLS ${m("cls").toFixed(2)}` +
      (skipped.length ? `  [skipped contended: ${skipped.map((s) => `${s.perf}@${s.bench}`).join(" ")}]` : ""),
  );
}
