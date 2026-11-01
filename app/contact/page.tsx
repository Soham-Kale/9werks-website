import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { site, mapsDirections, mapsEmbed } from "@/lib/site";
import { PageHeader } from "@/components/sections/PageHeader";
import { OpenStatus } from "@/components/sections/OpenStatus";
import { Reveal } from "@/components/animations/Reveal";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Visit 9WERKS behind Seasons Road in Sanewadi, Aundh, Pune. Call +91 70831 99986, WhatsApp or email 9werks9@gmail.com.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        label="Contact"
        lines={["Find us", "in Aundh."]}
        lede="Drop in, call ahead or message us on WhatsApp. We are just behind Seasons Road in Sanewadi."
        photo="facade"
        position="50% 30%"
      />

      <section className="section shell" aria-label="Contact details">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal as="h2" className="t-label text-muted">
              Address
            </Reveal>
            <Reveal as="address" delay={60} className="t-display-s mt-6 not-italic leading-snug">
              {site.address.lines.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </Reveal>
            <Reveal delay={120} className="mt-10 flex flex-wrap gap-3">
              <a href={mapsDirections} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Get directions <span className="arrow" aria-hidden="true" />
              </a>
              <a href={site.reviews.url} target="_blank" rel="noopener noreferrer" className="btn">
                Open in Google Maps
              </a>
            </Reveal>
          </div>

          <div className="grid gap-12 sm:grid-cols-2 md:col-span-6 md:col-start-7">
            <Reveal>
              <h2 className="t-label text-muted">Phone</h2>
              <a href={`tel:${site.phoneE164}`} className="t-display-s link mt-6 inline-block">
                {site.phoneDisplay}
              </a>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="t-label text-muted">WhatsApp</h2>
              <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="t-display-s link mt-6 inline-block">
                Message us
              </a>
            </Reveal>
            <Reveal delay={120} className="sm:col-span-2">
              <h2 className="t-label text-muted">Email</h2>
              <a href={`mailto:${site.email}`} className="t-display-s link mt-6 inline-block">
                {site.email}
              </a>
            </Reveal>
            <Reveal delay={180}>
              <h2 className="t-label text-muted">Instagram</h2>
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="t-display-s link mt-6 inline-block">
                {site.instagramHandle}
              </a>
            </Reveal>
            <Reveal delay={240} className="sm:col-span-2">
              <div className="flex items-baseline justify-between border-b border-line pb-4">
                <h2 className="t-label text-muted">Opening hours</h2>
                <OpenStatus />
              </div>
              <dl className="mt-2">
                {site.hours.map((h) => (
                  <div key={h.label} className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                    <dt className="t-body-l text-muted">{h.label}</dt>
                    <dd className="t-body-l">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="pb-[var(--section-y)]" aria-label="Map">
        <div className="shell">
          <Reveal variant="rv-img" className="relative aspect-[4/5] overflow-hidden border border-line bg-charcoal sm:aspect-[16/9] lg:aspect-[21/9]">
            <iframe
              title="Map showing 9WERKS in Sanewadi, Aundh, Pune"
              src={mapsEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full grayscale invert-[0.92] hue-rotate-180 contrast-[0.9]"
            />
          </Reveal>
          <div className="mt-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <p className="t-body-l max-w-[48ch] text-muted">Rated {site.reviews.rating} from {site.reviews.count} reviews on Google.</p>
            <div className="flex flex-wrap gap-3">
              <a href={site.reviews.url} target="_blank" rel="noopener noreferrer" className="btn">
                Read our reviews
              </a>
              <Link href="/booking" className="btn btn-primary">
                Book a service <span className="arrow" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
