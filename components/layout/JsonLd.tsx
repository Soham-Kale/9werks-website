import { site } from "@/lib/site";

// LocalBusiness structured data built only from verified facts in lib/site.ts.
// The Google rating is deliberately left out: Google does not accept
// self-published aggregateRating for a business's own page.
export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": `${site.url}/#business`,
    name: site.name,
    slogan: site.tagline,
    description: site.description,
    url: site.url,
    telephone: site.phoneE164,
    email: site.email,
    image: `${site.url}/images/client/facade-1280.webp`,
    logo: `${site.url}/images/brand/logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    openingHoursSpecification: site.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    hasMap: site.reviews.url,
    sameAs: [site.instagram],
    areaServed: { "@type": "City", name: "Pune" },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
