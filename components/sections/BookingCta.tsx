import Image from "next/image";
import Link from "next/link";
import { photos } from "@/lib/photos";
import { site } from "@/lib/site";
import { MaskedLines, Reveal } from "@/components/animations/Reveal";

/** Closing call to action: one photograph, one line, two ways to book. */
export function BookingCta({ photo = "wash", heading = ["Book your", "next visit."] }: { photo?: "wash" | "porsche" | "m5"; heading?: string[] }) {
  const p = photos[photo];
  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="cta-title">
      <div className="absolute inset-0 -z-10">
        <Image src={p.src} alt="" fill sizes="100vw" className="object-cover object-center opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-obsidian/40" />
      </div>
      <div className="shell flex min-h-[78svh] flex-col justify-end py-[clamp(72px,10vw,160px)]">
        <p className="t-label text-champagne">Book a service</p>
        <MaskedLines as="h2" id="cta-title" lines={heading} className="t-display-xl mt-6" />
        <Reveal className="mt-10 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <p className="t-body-l measure text-muted">
            Tell us about your car and what it needs. We confirm every booking on WhatsApp.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/booking" className="btn btn-primary">
              Book a service <span className="arrow" aria-hidden="true" />
            </Link>
            <a href={`tel:${site.phoneE164}`} className="btn">
              Call {site.phoneDisplay}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
