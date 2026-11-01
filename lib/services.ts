import type { PhotoKey } from "./photos";

// The six services, written from the descriptions on the current 9WERKS site.
// "includes" lists the kind of work in each service, not promises or numbers.

export type Service = {
  slug: string;
  index: string;
  title: string;
  short: string;
  lede: string;
  includes: string[];
  photo: PhotoKey;
};

export const services: Service[] = [
  {
    slug: "servicing",
    index: "01",
    title: "Servicing & Routine Checks",
    short: "Scheduled servicing and health checks, done properly.",
    lede: "Scheduled servicing and routine health checks for exotics, supercars and performance cars, with quality parts and the right fluids for your car.",
    includes: ["Scheduled maintenance", "Oil, filters and fluids", "Pre-trip and seasonal checks", "Health report before handover"],
    photo: "m4",
  },
  {
    slug: "diagnostics",
    index: "02",
    title: "Diagnostics",
    short: "Find the real fault fast. Fix only what needs fixing.",
    lede: "Modern performance cars are computers on wheels. We use proper diagnostic equipment to find the real fault quickly, so you only pay to fix what needs fixing.",
    includes: ["Fault code reading", "Electrical and sensor checks", "Warning light investigation", "Clear explanation before work starts"],
    photo: "z4",
  },
  {
    slug: "brakes",
    index: "03",
    title: "Brakes",
    short: "Confident stopping power on every drive.",
    lede: "We inspect, service and replace brake components so your car stops the way it should, every time.",
    includes: ["Pads and discs", "Calipers", "Brake fluid", "Inspection and road test"],
    photo: "brakes",
  },
  {
    slug: "collision-paint",
    index: "04",
    title: "Collision Repair & Paint",
    short: "From scuffs to collision damage, back to factory finish.",
    lede: "From scuffs and scratches to collision damage, our bodywork and paint bring back the finish your car left the factory with.",
    includes: ["Scratch and scuff repair", "Dent and panel repair", "Collision repair", "Paint matching and refinishing"],
    photo: "ferrari",
  },
  {
    slug: "wraps-detailing",
    index: "05",
    title: "Wraps & Detailing",
    short: "Change the look, protect the paint, restore the shine.",
    lede: "Change the look or protect the paint with a wrap, and bring back the showroom shine inside and out.",
    includes: ["Colour and accent wraps", "Paint protection", "Exterior detailing", "Interior detailing"],
    photo: "wash",
  },
  {
    slug: "wheels-tyres",
    index: "06",
    title: "Alloy Wheels & Tyres",
    short: "So your car looks right and grips right.",
    lede: "Alloy wheel work and tyre replacement, so your car looks right and grips right.",
    includes: ["Alloy wheel repair", "Tyre replacement", "Wheel balancing", "Fitment checks"],
    photo: "porsche",
  },
];
