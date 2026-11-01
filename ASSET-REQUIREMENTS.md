# Assets Needed from 9WERKS

The site is complete and works with what exists today. These files will raise it from good to launch quality. Each item says where the file goes and what changes once it arrives.

## 1. Licensed 3D car model (highest priority)

| | |
|---|---|
| File | `car.glb` (glTF binary), or `.gltf` / `.fbx` / `.blend` that we convert |
| Goes to | `public/models/car.glb` (replaces the placeholder concept car) |
| Licence | Must allow use on a commercial website. Keep the licence text or invoice. |
| Ideal model | A luxury saloon, real-world scale in metres, nose pointing +Z, with these parts as **separate, named meshes**: each wheel as its own group containing rim, tyre, brake disc and caliper; body panels; glass; headlights and tail lights; mirrors; interior. Under 250k triangles. PBR materials (metallic and roughness). No manufacturer logos or badges. |
| After it arrives | Run `node scripts/inspect-glb.mjs public/models/car.glb`, adjust the patterns in `config/vehicle.ts` to the new mesh names, compress it with `node scripts/optimize-model.mjs <source> public/models/car.glb`, and set `placeholder: false`. |

## 2. Logo files

| File | Format | Used for |
|---|---|---|
| Full logo (9 mark + WERKS + tagline) | **SVG**, or PNG at 3000 px wide or more, transparent background | Nav, footer. Today's 960 px PNG is soft on large retina screens. |
| The "9" turbo mark on its own | **SVG**, or square PNG at 2048 px or more, transparent background | Wheel centre caps and the opening medallion in 3D (`config/brand.ts` → `capArtwork`), favicons |
| Approved one-colour version | SVG, ivory or white | Dark backgrounds. We currently derive it automatically. Please confirm it is acceptable or supply your own. |

After replacing `public/images/brand/logo.png`, run `node scripts/brand-assets.mjs` to rebuild the derived files.

## 3. Photography

The site uses ten photos from the current website. Most are 1200 px or smaller, which is soft on large and retina screens. Please send the **original, full-resolution files** (straight from the camera or phone, at least 3000 px on the long side), especially:

| Current file | Shot | Where it appears | Current size |
|---|---|---|---|
| `m5-lift-1200.webp` | BMW M5 on the lift | Home craftsmanship, About equipment, gallery | 1200 × 1600 |
| `facade-1280.webp` | Workshop exterior with the Evo | About, Contact header, gallery | 1280 × 1920 |
| `crew-1200.webp` | Technician on the MINI | Home, About, gallery | 1200 × 1600 |
| `bmw-m4-1200.webp` | M4 engine bay | Services header, Servicing | 1200 × 1800 |
| `porsche-1200.webp` | Cayenne at dusk | Wheels & Tyres, gallery | 1200 × 1600 |
| `wash-1600.webp` | G-Class wash | Wraps & Detailing, booking banner | 1600 × 900 |
| `brakes-500.webp` | Brake disc being cleaned | Brakes | **500 × 600** |
| `underbody-500.webp` | Two technicians under an SUV | About | **500 × 600** |
| `ferrari-600.webp` | Ferrari tail light | Collision Repair & Paint | **600 × 600** |
| `z4-poster-540.webp` | Z4 engine bay | Diagnostics | **540 × 960** |

### New shots that would strengthen the site

Shoot in the workshop with the main lights low and one strong light on the subject. Keep backgrounds tidy. Landscape 3:2 unless noted.

1. **Hero still** (landscape 16:9, 4000 px+): a finished client car in a dark bay, three-quarter front view, one hard light. Used if 3D cannot load and for social sharing.
2. **Diagnostics in use** (portrait 4:5): a technician with the diagnostic tablet plugged into a car, screen glowing. Currently the Diagnostics service shows an engine bay.
3. **Paint and collision work**: a panel being refinished, or light sweeping across fresh paint. Currently the service shows a Ferrari tail light.
4. **Wheel and tyre work**: a wheel on the balancer or a tyre being fitted, close up.
5. **Brake close-up** (square 1:1): a caliper and disc behind an alloy wheel.
6. **Team portrait** (landscape): the crew together in the workshop, in uniform. Only with everyone's consent.
7. **Interior detailing**: leather or stitching being cleaned.
8. **Handover** (landscape): a client receiving keys at the workshop door, with consent.

Drop new files into `public/images/client/` and update `lib/photos.ts` (file name, width, height, alt text).

## 4. Facts to confirm

The site only states facts supplied in the brief. Please confirm they are current:

- 35 years of experience, 19 expert technicians, 1,500+ satisfied clients, 1,500+ projects completed
- 4.9 rating from 191 Google reviews (update `lib/site.ts` as the count grows)
- Opening hours: Mon to Fri 9 AM to 9 PM, Sat and Sun 9 AM to 12 PM
- Instagram URL: https://www.instagram.com/9werksofficial/
