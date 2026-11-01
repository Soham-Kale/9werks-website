# 9WERKS

Website for 9WERKS, exotic, supercar and sports car specialists in Aundh, Pune. Five routes (`/`, `/services`, `/about`, `/booking`, `/contact`), with a scroll-driven 3D wheel and car assembly on the home page.

Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS 4, React Three Fiber, drei, postprocessing, GSAP ScrollTrigger and Lenis. Framer Motion was dropped: the page transition is pure CSS, which saved 127 KB of JavaScript on every page.

## Run it

Requires Node.js 20 or later.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm start            # serve the production build
```

## Where things live

| Path | What |
|---|---|
| `lib/site.ts` | Every business fact on the site: phone, address, hours, numbers, process, makes. Edit here, nowhere else. |
| `lib/services.ts` | The six services and their copy |
| `lib/photos.ts` | Every photograph, with alt text and size |
| `lib/booking.ts` | Booking validation and the WhatsApp message |
| `config/vehicle.ts` | How the 3D scene reads the car model: mesh-name patterns, wheel parts, paint finishes |
| `config/brand.ts` | Centre-cap artwork and the UI logo |
| `components/three/` | The 3D experience: rig builder, timeline, scene, overlay |
| `components/sections/` | Page sections |
| `DESIGN.md` | Design brief: colours, type, spacing, motion |
| `CREDITS.md` | Licences for every third-party asset |
| `ASSET-REQUIREMENTS.md` | Files still needed from the client |

## Replacing the car model

1. Put the licensed model at `public/models/car.glb` (compress first: `node scripts/optimize-model.mjs <source.glb> public/models/car.glb`).
2. Run `node scripts/inspect-glb.mjs public/models/car.glb` to list its meshes and materials.
3. Edit the patterns in `config/vehicle.ts` until wheels, body, glass, lights and mirrors are all matched. Unmatched meshes fall into "trim", so nothing disappears.
4. Set `placeholder: false` in `config/vehicle.ts` and update `CREDITS.md`.

## Scripts

| Script | Purpose |
|---|---|
| `scripts/inspect-glb.mjs` | Lists a GLB's hierarchy, mesh names, materials and bounds |
| `scripts/optimize-model.mjs` | Meshopt plus WebP compression for a GLB |
| `scripts/brand-assets.mjs` | Builds the mark and ivory logo variants from `public/images/brand/logo.png` |
| `scripts/shoot.mjs` | Playwright screenshots (`hero`, `pages`, `reduced`) into `.shots/`, using installed Chrome |
| `scripts/contact-sheet.mjs` | Tiles screenshots into one image for review |
| `scripts/test-flows.mjs` | Functional checks: routes, metadata, links, booking to WhatsApp, mobile menu, keyboard, map, 404 |
| `scripts/lighthouse.mjs` | Mobile Lighthouse on every route, several runs each, median scores |
| `scripts/perf-hero.mjs` | Scrolls the hero in a real Chrome window and reports fps, slow frames and freezes per chapter |

## Behaviour notes

- The 3D bundle never competes with the first paint: on desktop it loads when the browser is idle; on phones it waits for the first touch, scroll or key press. Lenis and GSAP load only for mouse and trackpad users and on the 3D hero; phones keep native scrolling.
- The first page load is not animated (so the largest paint is never delayed); in-site navigations ease the new page in.
- If WebGL is unavailable or the model fails to load, the hero falls back to a still photograph with the headline and booking buttons.
- With `prefers-reduced-motion`, the hero shows the finished car with no scroll assembly, and every reveal shows its final state.
- Phones get a lighter scene: lower pixel ratio, no reflective floor, no post-processing and a shorter scroll.
- **Smoothness:** before the hero appears, every shader is compiled and every texture uploaded behind the loader (`Warmup` in `components/three/HeroExperience.tsx`). Without this, each part compiles the first time it appears and the scroll freezes. Lights are never shown or hidden, because changing the light count recompiles every material.
- **Quality steps:** integrated and mobile GPUs start on a light step, with one key light, no headlight beams, no glow pass, contact shadows redrawn in steps, and the interior skipped once the tinted glass is fitted. Faster GPUs start in the middle and can climb to the top step: higher pixel ratio, 4x MSAA and a mirror floor in the showroom. A frame-time monitor steps down if a machine can't keep up. Measure with `node scripts/perf-hero.mjs <url>`.
- The booking form stores nothing. On submit it validates, then opens WhatsApp (`wa.me/917083199986`) with a filled-in message.
