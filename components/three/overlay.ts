import { hero, WHEEL_STEPS, WHEEL_LABELS } from "./store";

// Drives the HTML layer over the 3D stage from timeline progress: caption
// bands, the part callout and the Assembly Index dial. Every write is
// delta-gated so a converged frame touches nothing.

const smoothstep = (p: number, e0: number, e1: number) => {
  const t = Math.min(1, Math.max(0, (p - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

export function createOverlay(root: HTMLElement) {
  const bands = Array.from(root.querySelectorAll<HTMLElement>("[data-band]")).map((el, i, all) => ({
    el,
    a: Number(el.dataset.from),
    b: Number(el.dataset.to),
    first: i === 0,
    last: i === all.length - 1,
    op: -1,
    inert: null as boolean | null,
  }));
  const callout = root.querySelector<HTMLElement>("[data-callout]");
  const calloutIndex = callout?.querySelector<HTMLElement>("[data-callout-index]");
  const calloutName = callout?.querySelector<HTMLElement>("[data-callout-name]");
  const dialArc = root.querySelector<SVGCircleElement>("[data-dial-arc]");
  const dialTicks = Array.from(root.querySelectorAll<SVGElement>("[data-dial-tick]"));
  const dialLabel = root.querySelector<HTMLElement>("[data-dial-label]");

  let lastStep = "";
  const lastCallout = { x: -1, y: -1, o: -1 };
  let lastArc = -1;
  let lastLit = -1;
  let lastDialLabel = "";

  function update() {
    const p = hero.progress;

    for (const b of bands) {
      const f = Math.min(0.025, (b.b - b.a) / 4);
      const fadeIn = b.first ? 1 : smoothstep(p, b.a, b.a + f);
      const fadeOut = b.last ? 1 : 1 - smoothstep(p, b.b - f, b.b);
      const op = Math.round(fadeIn * fadeOut * 1000) / 1000;
      if (op !== b.op) {
        b.op = op;
        b.el.style.opacity = String(op);
        b.el.style.setProperty("--k", String(op));
      }
      const inert = op < 0.5;
      if (inert !== b.inert) {
        b.inert = inert;
        b.el.inert = inert;
      }
    }

    // Callout for the wheel part currently arriving.
    if (callout) {
      const s = hero.state;
      let active = -1;
      WHEEL_STEPS.forEach((step, i) => {
        if (s[step] > 0.25) active = i;
      });
      const inPhase = p > 0.17 && p < 0.47 && active >= 0;
      const o = inPhase ? Math.round(smoothstep(p, 0.17, 0.19) * (1 - smoothstep(p, 0.45, 0.47)) * 100) / 100 : 0;
      if (inPhase) {
        const step = WHEEL_STEPS[active];
        if (step !== lastStep) {
          lastStep = step;
          if (calloutIndex) calloutIndex.textContent = String(active + 1).padStart(2, "0");
          if (calloutName) calloutName.textContent = WHEEL_LABELS[step];
          callout.dataset.step = step;
        }
        const pt = hero.project?.(step);
        if (pt && pt.visible) {
          const x = Math.round(pt.x);
          const y = Math.round(pt.y);
          if (x !== lastCallout.x || y !== lastCallout.y) {
            callout.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            lastCallout.x = x;
            lastCallout.y = y;
          }
        }
      }
      if (o !== lastCallout.o) {
        callout.style.opacity = String(o);
        lastCallout.o = o;
      }
    }

    // Assembly Index dial.
    if (dialArc) {
      const arc = Math.round((1 - p) * 1000) / 1000;
      if (arc !== lastArc) {
        dialArc.style.strokeDashoffset = String(arc * 289);
        lastArc = arc;
      }
    }
    let lit = 0;
    WHEEL_STEPS.forEach((step) => {
      if (hero.state[step] > 0.98) lit++;
    });
    if (lit !== lastLit) {
      dialTicks.forEach((t, i) => t.classList.toggle("lit", i < lit));
      lastLit = lit;
    }
    if (dialLabel) {
      const chapter = p < 0.14 ? "00" : p < 0.47 ? "01" : p < 0.7 ? "02" : p < 0.85 ? "03" : "04";
      if (chapter !== lastDialLabel) {
        dialLabel.textContent = chapter;
        lastDialLabel = chapter;
      }
    }
  }

  return { update };
}
