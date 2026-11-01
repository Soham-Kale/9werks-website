import type Lenis from "lenis";

// The active Lenis instance, if smooth scrolling is on. Kept outside React so
// reading it never triggers a render.
let current: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  current = l;
};
export const getLenis = () => current;

/** Stop or resume scrolling, used while the menu overlay is open. */
export function lockScroll(locked: boolean) {
  if (current) {
    if (locked) current.stop();
    else current.start();
  }
  document.documentElement.style.overflow = locked ? "hidden" : "";
}
