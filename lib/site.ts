// Verified business facts supplied by 9WERKS. Nothing on the site may claim
// more than what is written here: no invented awards, reviews or numbers.

export const site = {
  name: "9WERKS",
  url: "https://www.9werksofficial.com",
  tagline: "A crew for your luxe ride.",
  description:
    "Exotic, supercar and sports car specialists in Aundh, Pune. Servicing, diagnostics, brakes, collision repair and paint, wraps and detailing, alloy wheels and tyres.",
  locality: "Aundh, Pune",

  phoneDisplay: "+91 70831 99986",
  phoneE164: "+917083199986",
  whatsapp: "https://wa.me/917083199986",
  email: "9werks9@gmail.com",
  instagramHandle: "@9werksofficial",
  instagram: "https://www.instagram.com/9werksofficial/",

  address: {
    lines: [
      "S No 259/3, Shatik Park, behind Seasons Road",
      "Shambhu Vihar Society, Sanewadi, Aundh",
      "Pune, Maharashtra 411007",
    ],
    street: "S No 259/3, Shatik Park, behind Seasons Road, Shambhu Vihar Society, Sanewadi",
    locality: "Aundh, Pune",
    region: "Maharashtra",
    postalCode: "411007",
    country: "IN",
  },

  hours: [
    { label: "Monday to Friday", short: "Mon to Fri", time: "9 AM to 9 PM", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "21:00" },
    { label: "Saturday and Sunday", short: "Sat and Sun", time: "9 AM to 12 PM", days: ["Saturday", "Sunday"], opens: "09:00", closes: "12:00" },
  ],

  reviews: {
    rating: "4.9",
    count: 191,
    url: "https://maps.google.com/?cid=1339525493130839216",
  },

  stats: [
    { value: 35, suffix: "", label: "Years of experience" },
    { value: 19, suffix: "", label: "Expert technicians" },
    { value: 1500, suffix: "+", label: "Satisfied clients" },
    { value: 1500, suffix: "+", label: "Projects completed" },
  ],

  why: [
    { title: "Quality servicing", body: "Premium parts and the right fluids, fitted to the standard your car left the factory with." },
    { title: "Expert certified crew", body: "Certified technicians who know performance and luxury cars, from routine checks to complex repairs." },
    { title: "Modern diagnostic equipment", body: "Current diagnostic tools that find the real fault fast, so you only fix what needs fixing." },
  ],

  process: [
    { step: "Book", body: "Send a request online or on WhatsApp, or call us. Pick a day that suits you." },
    { step: "Inspect", body: "We check the car, find what it needs and walk you through it before any work starts." },
    { step: "Service", body: "The crew does the work with quality parts and the right equipment." },
    { step: "Drive away", body: "Collect your car, checked and ready for the road." },
  ],

  makes: ["BMW", "MINI", "Porsche", "Mercedes-Benz", "Land Rover", "Bentley", "Rolls-Royce", "Lamborghini"],
} as const;

export const mapsDirections = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  "9WERKS, " + site.address.lines.join(", "),
)}`;
export const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(
  "9WERKS, " + site.address.lines.join(", "),
)}&output=embed`;
