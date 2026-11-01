# 9WERKS Design Brief

The single source of truth for how 9WERKS looks, reads and moves. Every component, image and animation is checked against this file before it ships.

---

## 1. Research notes

Studied on 1 November 2026: rolls-roycemotorcars.com, bentleymotors.com, porsche.com, ferrari.com, lamborghini.com, bmw.com (served bmw.in), and the current 9werksofficial.com.

| Observation | Seen at | What 9WERKS takes from it |
|---|---|---|
| A single full-bleed photograph or film owns the first screen. No cards, no collage. | All six | The hero is one cinematic 3D stage, edge to edge. |
| Navigation is almost absent: a "Menu" word on one side, the mark centred, one or two icons on the other. | Rolls-Royce, Porsche, Lamborghini | A centred emblem, a quiet word menu, one CTA. Full menu in an overlay. |
| Small labels are uppercase and widely tracked (0.2em to 0.35em) and sit far from the headline they label. | Rolls-Royce, BMW, Ferrari | Mono kicker labels with wide tracking, used sparingly. |
| Headlines are light or regular weight, very large, set in wide sans faces, not heavy serifs. | Porsche, Rolls-Royce, Lamborghini | A wide, light display grotesk. Weight comes from size, not boldness. |
| Buttons are rectangles with hairline outlines or solid fills. No pills, no gradients. | BMW, Ferrari, Bentley | Square-cornered buttons (2px radius at most). |
| Motion is slow, sparing and always has a pause control when it loops. | Ferrari (pause button), Rolls-Royce | No idle motion that cannot be stopped. Reduced motion is a first-class layout. |
| The car is photographed on a diagonal, low, with deep shadow and one hard light. | Porsche, BMW | 3/4 front camera, low horizon, one key light plus long strip lights. |
| Cookie and consent layers dominate first paint. | Bentley, Lamborghini | 9WERKS sets no tracking cookies, so it has no banner. |

What we do not take: logos, model names, layouts, typefaces, photographs, or any wording. The identity below is original.

---

## 2. Design philosophy

**"Engineered calm."** 9WERKS is a workshop, not a car maker. Its luxury is the confidence of people who take a car apart and put it back together correctly. The site says that by doing it: the 3D hero assembles a wheel and then a car, part by part, and the rest of the site keeps the same order and precision.

Three rules follow from that:

1. **Precision over decoration.** Every line, number and label exists because it explains something. If removing an element changes nothing, it goes.
2. **Darkness as the workshop floor.** Obsidian is the room, ivory is the light, champagne is the polished metal. Nothing else.
3. **One thing at a time.** Each screen has one subject, one headline and one action.

**Signature element: the Assembly Index.** A thin champagne ring with seven tick marks, one per wheel component. It appears as the hero's scroll dial, as the section number device (the active tick marks the section) and as the emblem's outer ring. Engineering callouts (a hairline leader plus a mono label such as `03 · RIM`) attach to 3D parts as they arrive. Without these the page would read as a generic dark car site, so they get the boldness budget and everything else stays quiet.

**One interactive moment:** at the end of the hero, the visitor picks a finish (Obsidian, Ivory, Champagne) and the car is repainted live. It ties directly to the Wraps & Detailing service.

---

## 3. Colour system

| Token | Hex | Role |
|---|---|---|
| `--obsidian` | `#080909` | Page canvas, 3D background |
| `--charcoal` | `#151617` | Raised surfaces, form fields, alternating bands |
| `--graphite` | `#232425` | Hover states on charcoal, image letterbox |
| `--ivory` | `#F5F3EE` | Primary text, primary buttons |
| `--muted` | `#999A98` | Secondary text, captions |
| `--champagne` | `#B6AA91` | Accent: CTA hover, focus ring, Assembly Index, one emphasis per screen |
| `--champagne-deep` | `#8E8470` | Pressed accent |
| `--line` | `rgba(245,243,238,0.10)` | Decorative hairlines only |
| `--line-strong` | `#646563` | Interactive borders (inputs, outline buttons): 3.4:1 on obsidian |

Computed contrast on obsidian: ivory 17.98:1, muted 7.05:1, champagne 8.68:1, line-strong 3.40:1. On charcoal: ivory 16.34:1, muted 6.41:1, line-strong 3.09:1. All text passes WCAG AA.

**Usage limits.** Champagne covers under 2% of any screen. It is never a background fill behind text and never a gradient. Pure `#000` and `#fff` are never used.

**A note on the palette.** Near-black with a warm metallic accent is a common "luxury" default. The client chose this palette, so we keep it, but avoid the cliché that usually comes with it (a high-contrast serif). Type is a wide engineered sans, and the warmth comes from metal in the 3D scene, not from brown UI.

---

## 4. Typography

| Role | Face | Weights | Why |
|---|---|---|---|
| Display | **Archivo**, width axis at 118 to 125 (expanded) | 300, 400, 500 | A wide, engineered grotesk. It reads like a badge on a machined part, which suits a workshop better than a fashion serif. |
| Body | **Hanken Grotesk** | 400, 500 | Quiet, open and very readable at small sizes on dark backgrounds. |
| Labels | **IBM Plex Mono** | 400, 500 | Spec-sheet labels, part numbers, callouts, form hints. |

All three are self-hosted through `next/font` (no runtime requests to Google), subset to Latin, with `display: swap`.

### Type scale (fluid, 360px to 2560px)

| Token | Size | Line height | Tracking | Use |
|---|---|---|---|---|
| `display-xl` | `clamp(3rem, 9vw, 10.5rem)` | 0.92 | -0.02em | Hero statements, one per page |
| `display-l` | `clamp(2.5rem, 6vw, 6.5rem)` | 0.95 | -0.015em | Section openers |
| `display-m` | `clamp(1.875rem, 3.6vw, 3.75rem)` | 1.02 | -0.01em | Sub-sections, service names |
| `display-s` | `clamp(1.375rem, 2vw, 2rem)` | 1.15 | 0 | Card titles, stats labels |
| `body-l` | `clamp(1.0625rem, 1.2vw, 1.3125rem)` | 1.6 | 0 | Lead paragraphs |
| `body` | `1rem` | 1.65 | 0 | Body copy |
| `body-s` | `0.875rem` | 1.55 | 0.005em | Captions, footnotes |
| `label` | `0.6875rem` to `0.75rem` | 1.3 | 0.22em, uppercase | Mono kickers, callouts |

Rules: display text is uppercase only at `display-xl` and `display-l`. Paragraph blocks cap at `60ch` set on the paragraph itself. Numbers in stats use tabular figures.

---

## 5. Spacing and layout

- **Base unit 4px.** Steps: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192.
- **Section rhythm:** `clamp(96px, 14vw, 224px)` vertical padding. Space is the main luxury signal.
- **Gutters:** 20px at 360px, 32px from 768px, 56px from 1280px, 80px from 1920px.
- **Grid:** 12 columns on desktop, 6 on tablet, 4 on mobile. Content max width 1600px. Text never spans more than 7 columns.
- **Adjacency rule:** no two neighbouring sections share a layout skeleton. Alternate full-bleed image, split editorial, typographic list, and ruled tables.
- **Hairlines:** 1px `--line` separators replace boxes. Cards are used once (services overview) and have no rounded corners.

---

## 6. Image direction

- **Light:** one hard key light from high side, long reflections, deep falloff to obsidian. Never flat, never HDR-crunchy.
- **Grade:** cool neutral shadows, warm highlights that sit near champagne, low saturation. Paint colours stay true.
- **Crops:** 16:9 and 21:9 for full-bleed, 4:5 for editorial portrait pairs, 1:1 only for detail macro shots.
- **Subjects:** wheels and brakes in macro, paint surfaces, hands and tools at work, cars under single light. No visible third-party badges or wordmarks.
- **Honesty:** generated or stock images are placeholders, listed in `CREDITS.md` and marked in the code with `placeholder: true`. No generated image is ever presented as the 9WERKS workshop, its crew or a client car. Real client photographs replace them (see `ASSET-REQUIREMENTS.md`).
- **Treatment:** images reveal with a clip-path wipe plus a 1.06 to 1.0 scale settle. Hover never zooms more than 1.03.

---

## 7. Animation principles

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances, reveals |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | State changes, camera moves |
| `--dur-fast` | 240ms | Hover, focus |
| `--dur-base` | 600ms | Reveals |
| `--dur-slow` | 1200ms | Image wipes, page transitions |

1. **Physical, not playful.** No bounce, no elastic, no random floating. Parts move like they are on a jig: straight paths, eased arrival, a small settle.
2. **Scroll owns the story.** The hero timeline is scrubbed by scroll and fully reversible. Scroll up and the car comes apart again.
3. **Stagger is 80 to 120ms.** Delays are cleared after the entrance, so hovers never lag.
4. **Only transform and opacity** animate in the DOM. Filters, layout and colour change only on hover.
5. **One living element per section** at whisper level (a slow light sweep, a ticking index), paused off-screen and on hidden tabs.
6. **Reduced motion** shows every final state at once: the finished car, drawn lines, final numbers. No scroll-driven assembly.

### The hero timeline (desktop: 720vh of scroll, mobile: 460vh)

| Progress | Scene | Camera | Copy |
|---|---|---|---|
| 0.00 to 0.10 | 1. Emblem medallion | Close, slow push and 12° drift | "A crew for your luxe ride." |
| 0.10 to 0.16 | Medallion becomes the centre cap | Pulls back to frame the wheel axis | "Every car starts at the centre." |
| 0.16 to 0.46 | 2. Wheel assembly: hub, spokes, rim, brake disc, caliper, tyre, centre cap | Slow orbit 25° around the wheel | Callouts 01 to 07 |
| 0.46 to 0.70 | 3. Vehicle assembly: wheel to its arch, three wheels, chassis, panels, glass, lights, mirrors, trim | Rises and pulls to a 3/4 view | "Built the way it left the factory." |
| 0.70 to 0.84 | 4. Complete vehicle | Low 3/4 front, slow dolly | "Exotic, supercar and sports car specialists." |
| 0.84 to 1.00 | 5. Headlights on, showroom floor, orbit | Orbit 40° with bloom and contact shadow | Finish selector and "Book a service" |

---

## 8. Responsive rules

- Designed and tested at 360, 390, 768, 1024, 1440 and 2560px.
- Below 768px: navigation collapses to the emblem plus a "Menu" button with a 48px target. The overlay menu traps focus and closes on Escape.
- Mobile 3D: pixel ratio capped at 1.25, no reflective floor, no bloom, contact shadows at 512px, a shorter timeline (460vh) and a simpler camera path with no orbit beyond 20°.
- Touch targets are at least 44px under `(pointer: coarse)`.
- `overflow-x: clip` on `html` and `body`. No horizontal scroll at any width.
- Display type scales with `clamp()`; it never breaks a word across lines (`hyphens: none`, `overflow-wrap: normal`), so wide words are sized to fit at 360px.

---

## 9. Component principles

- **Buttons:** primary is ivory fill with obsidian text. Secondary is a hairline outline in `--line-strong`. Hover moves a 1px champagne underline or border in over 240ms. 2px radius maximum. Labels are mono uppercase at `label` size.
- **Links:** ivory with a 1px underline offset 4px that draws in from the left on hover.
- **Navigation:** fixed, transparent over the hero, then obsidian at 85% with a hairline once scrolled. Hides on scroll down and returns on scroll up.
- **Forms:** labels always visible above fields (never placeholder-only). Fields are charcoal with a `--line-strong` bottom border that turns champagne on focus. Errors appear inline under the field in ivory with a champagne marker, are announced via `aria-live`, and focus moves to the first invalid field.
- **Focus:** a 2px champagne outline offset 3px on every interactive element.
- **Stats:** large tabular numerals with mono labels, separated by hairlines, counting up once on entry (final values shown instantly in reduced motion).
- **Images:** always `next/image` with explicit sizes, AVIF and WebP, and alt text that describes the photograph, not the marketing message.
- **Copy:** plain, short, confident. No em dashes, no invented awards, testimonials or claims. Only the verified facts in `lib/site.ts`.
