// Brand artwork used inside the 3D scene and the site chrome.
// Source: the logo on the current 9werksofficial.com (960px PNG). Run
// `node scripts/brand-assets.mjs` after replacing public/images/brand/logo.png
// with a higher-resolution or vector export (see ASSET-REQUIREMENTS.md).

export const brandConfig = {
  /**
   * Artwork for the wheel centre caps and the hero medallion face: a square
   * PNG or SVG with a transparent background. `null` falls back to the drawn
   * interim emblem in lib/emblem.ts.
   */
  capArtwork: "/images/brand/mark.png" as string | null,
  /** Ivory logo for the dark UI, and its natural size in pixels. */
  logo: { src: "/images/brand/logo-mono.png", width: 960, height: 243 },
  /** Text on the rear number plate of the placeholder car. */
  plateText: "9WERKS",
};
