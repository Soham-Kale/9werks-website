# Credits and Licences

Every third-party asset in this project, its licence, and whether it is a **placeholder** (to be replaced) or a **production** asset.

## Placeholder assets (replace before launch)

### 3D car model: `public/models/car.glb`

| | |
|---|---|
| Status | **Placeholder.** To be replaced by the client's licensed vehicle model. |
| Asset | "Car Concept", Khronos glTF Sample Assets |
| Source | https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept |
| Author | Eric Chadwick, © 2024 Darmstadt Graphics Group GmbH, based on a public-domain (CC0) model by Unity Fan |
| Licence | Creative Commons Attribution 4.0 International (CC BY 4.0), https://creativecommons.org/licenses/by/4.0/ |
| Changes | Compressed with Meshopt geometry compression and WebP textures (`scripts/optimize-model.mjs`). Paint, interior and rim colours are changed at runtime. |
| Excluded | The model's Khronos and 3D Commerce logos are trademarks and are not covered by the licence. They are hidden at runtime (`config/vehicle.ts`, the `hidden` group) and the number plate is replaced with 9WERKS artwork. |

Attribution text, if the placeholder is ever shown publicly: *"Car Concept" by Eric Chadwick / Darmstadt Graphics Group GmbH, CC BY 4.0, modified.*

## Production assets

### Studio lighting: `public/textures/studio_small_09_1k.hdr`

| | |
|---|---|
| Asset | "Studio Small 09" HDRI, 1k |
| Source | https://polyhaven.com/a/studio_small_09 |
| Licence | CC0 1.0 (public domain). No attribution required. |

### Draco decoder: `public/draco/`

Copied from three.js (`examples/jsm/libs/draco/gltf`). Draco is © Google, Apache License 2.0. three.js is MIT.

### Fonts

Archivo, Hanken Grotesk and IBM Plex Mono, all under the SIL Open Font License 1.1, self-hosted at build time by `next/font`.

## Client assets (owned by 9WERKS)

These came from the current 9werksofficial.com, with the client's permission to reuse them. They are the business's own material and are not covered by any open licence.

| File | Notes |
|---|---|
| `public/images/brand/logo.png` | Original logo, 960 px PNG |
| `public/images/brand/logo-mono.png`, `mark.png`, `mark-mono.png` | Derived from `logo.png` by `scripts/brand-assets.mjs` |
| `public/images/brand/og.jpg` | Social sharing image |
| `public/images/client/*.webp` | Ten workshop photographs. See `ASSET-REQUIREMENTS.md` for the higher-resolution versions needed. |

Car makes named on the site (BMW, MINI, Porsche, Mercedes-Benz, Land Rover, Bentley, Rolls-Royce, Lamborghini) are text only, for identification. No manufacturer logos are used. Some client photographs show cars with their makers' badges, as they appear in the workshop.
