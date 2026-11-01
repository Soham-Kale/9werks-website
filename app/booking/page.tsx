import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { PageHeader } from "@/components/sections/PageHeader";
import { BookingForm } from "@/components/sections/BookingForm";
import { Reveal } from "@/components/animations/Reveal";

export const metadata: Metadata = pageMetadata({
  title: "Book a Service",
  description:
    "Book a service at 9WERKS, Aundh, Pune. Tell us about your car and we confirm your slot on WhatsApp.",
  path: "/booking",
});

export default function BookingPage() {
  return (
    <>
      <PageHeader
        label="Booking"
        lines={["Book a", "service."]}
        lede="Book a slot in under a minute. Tell us about your car and what it needs, and we confirm on WhatsApp."
      />
      <section className="section shell" aria-label="Booking form">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <BookingForm />
          </div>
          <aside className="lg:col-span-4 lg:col-start-9" aria-label="Other ways to book">
            <Reveal className="border-t border-line pt-8">
              <h2 className="t-label text-muted">Prefer to talk?</h2>
              <ul className="mt-6 space-y-4">
                <li>
                  <a href={`tel:${site.phoneE164}`} className="t-display-s link">
                    {site.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="t-body-l link link-u">
                    Message us on WhatsApp
                  </a>
                </li>
              </ul>
            </Reveal>
            <Reveal delay={100} className="mt-12 border-t border-line pt-8">
              <h2 className="t-label text-muted">Opening hours</h2>
              <dl className="mt-6 space-y-3">
                {site.hours.map((h) => (
                  <div key={h.label} className="flex items-baseline justify-between gap-6 border-b border-line pb-3">
                    <dt className="t-body-s text-muted">{h.label}</dt>
                    <dd className="t-body-s">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={180} className="mt-12 border-t border-line pt-8">
              <h2 className="t-label text-muted">What happens next</h2>
              <ol className="mt-6 space-y-4">
                {site.process.map((p, i) => (
                  <li key={p.step} className="t-body-s flex gap-4">
                    <span className="tabular text-champagne">0{i + 1}</span>
                    <span>
                      <span className="text-ivory">{p.step}.</span> <span className="text-muted">{p.body}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
}
