# 9WERKS

Website for 9WERKS, exotic, supercar and sports car specialists in Aundh, Pune. Five routes (`/`, `/services`, `/about`, `/booking`, `/contact`), with a scroll-driven 3D wheel and car assembly on the home page.

Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS 4, React Three Fiber, drei, postprocessing, GSAP ScrollTrigger, Lenis and Framer Motion.

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

## Behaviour notes

- The 3D bundle loads after the page is idle, so text and the poster photo paint first. If WebGL is unavailable or the model fails to load, the hero falls back to a still photograph with the headline and booking buttons.
- With `prefers-reduced-motion`, the hero shows the finished car with no scroll assembly, and every reveal shows its final state.
- Phones get a lighter scene: lower pixel ratio, no reflective floor, no post-processing and a shorter scroll.
- The booking form stores nothing. On submit it validates, then opens WhatsApp (`wa.me/917083199986`) with a filled-in message.
