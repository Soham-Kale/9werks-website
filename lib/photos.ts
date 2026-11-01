// Every photograph on the site, in one manifest. All are 9WERKS's own photos,
// taken from the current 9werksofficial.com at the largest size it serves.
// ASSET-REQUIREMENTS.md asks for full-resolution originals: drop them into
// /public/images/client/ and update `src`, `width` and `height` here.

export type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Below 1200px on the long side: only used in small slots until originals arrive. */
  lowRes?: boolean;
};

const img = (file: string, width: number, height: number, alt: string, lowRes = false): Photo => ({
  src: `/images/client/${file}`,
  alt,
  width,
  height,
  lowRes,
});

export const photos = {
  m5: img("m5-lift-1200.webp", 1200, 1600, "A black BMW M5 raised on a lift in the 9WERKS workshop, bonnet open"),
  facade: img("facade-1280.webp", 1280, 1920, "The 9WERKS workshop in Aundh, with a red Mitsubishi Lancer Evolution parked outside"),
  crew: img("crew-1200.webp", 1200, 1600, "A 9WERKS technician working in the engine bay of a MINI"),
  m4: img("bmw-m4-1200.webp", 1200, 1800, "Engine bay of a blue BMW M4 with the bonnet raised"),
  porsche: img("porsche-1200.webp", 1200, 1600, "A white Porsche Cayenne outside the workshop at dusk"),
  wash: img("wash-1600.webp", 1600, 900, "A Mercedes-Benz G-Class covered in foam during a detailing wash"),
  brakes: img("brakes-500.webp", 500, 600, "A technician cleaning a drilled brake disc and wheel hub", true),
  underbody: img("underbody-500.webp", 500, 600, "Two technicians inspecting the underside of an SUV on a lift", true),
  ferrari: img("ferrari-600.webp", 600, 600, "Tail light and red paintwork of a Ferrari in the workshop", true),
  z4: img("z4-poster-540.webp", 540, 960, "Engine bay of a red BMW Z4 with the bonnet raised", true),
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

export const gallery: { key: PhotoKey; caption: string }[] = [
  { key: "facade", caption: "The workshop, Aundh" },
  { key: "m5", caption: "On the lift" },
  { key: "porsche", caption: "Evening handover" },
  { key: "crew", caption: "Crew at work" },
  { key: "wash", caption: "Detailing" },
  { key: "m4", caption: "Under the bonnet" },
];
