import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { services } from "@/lib/services";
import { photos } from "@/lib/photos";
import { PageHeader } from "@/components/sections/PageHeader";
import { BookingCta } from "@/components/sections/BookingCta";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/animations/Reveal";

export const metadata: Metadata = pageMetadata({
  title: "Services",
  description:
    "Servicing, diagnostics, brakes, collision repair and paint, wraps and detailing, alloy wheels and tyres for exotics, supercars and sports cars in Aundh, Pune.",
  path: "/services",
});

// Each service gets its own composition so no two neighbours share a skeleton.
const layouts = [
  { img: "md:col-span-6", text: "md:col-span-5 md:col-start-8", ratio: "4 / 5" },
  { img: "md:col-span-4 md:col-start-9", text: "md:col-span-6 md:col-start-1 md:row-start-1", ratio: "9 / 16" },
  { img: "md:col-span-4", text: "md:col-span-6 md:col-start-7", ratio: "5 / 6" },
  { img: "md:col-span-5 md:col-start-8", text: "md:col-span-6 md:col-start-1 md:row-start-1", ratio: "1 / 1" },
  { img: "md:col-span-12", text: "md:col-span-7", ratio: "16 / 9" },
  { img: "md:col-span-5", text: "md:col-span-6 md:col-start-7", ratio: "3 / 4" },
];

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        label="Services"
        lines={["Everything", "your car needs."]}
        lede="From a routine service to collision repair, paint and wraps, one crew handles it all, with the right tools for the job."
        photo="m4"
        position="50% 40%"
      />

      <nav aria-label="Services on this page" className="shell hidden border-b border-line lg:block">
        <ul className="flex justify-between gap-6 py-4">
          {services.map((s) => (
            <li key={s.slug}>
              <a href={`#${s.slug}`} className="t-label link text-muted hover:text-ivory">
                <span className="tabular text-champagne">{s.index}</span> {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {services.map((s, i) => {
        const l = layouts[i];
        const p = photos[s.photo];
        return (
          <section key={s.slug} id={s.slug} aria-labelledby={`${s.slug}-title`} className={`section scroll-mt-[calc(var(--nav-h)+64px)] ${i % 2 ? "bg-charcoal" : ""}`}>
            <div className="shell grid items-center gap-12 md:grid-cols-12">
              <div className={l.img}>
                <Photo
                  k={s.photo}
                  ratio={l.ratio}
                  sizes={p.lowRes ? "(min-width: 768px) 34vw, 100vw" : "(min-width: 768px) 50vw, 100vw"}
                  eager={i === 0}
                />
              </div>
              <div className={l.text}>
                <Reveal as="p" className="t-label flex items-center gap-4 text-muted">
                  <span className="tabular text-ivory">{s.index}</span>
                  <span aria-hidden="true" className="h-px w-8 bg-champagne" />
                  <span>Service</span>
                </Reveal>
                <Reveal as="h2" id={`${s.slug}-title`} className="t-display-l t-fit mt-8 max-w-[16ch]">
                  {s.title}
                </Reveal>
                <Reveal as="p" delay={100} className="t-body-l measure mt-8 text-muted">
                  {s.lede}
                </Reveal>
                <Reveal as="ul" delay={180} className="mt-10 border-t border-line">
                  {s.includes.map((x) => (
                    <li key={x} className="t-body-s flex items-baseline justify-between border-b border-line py-4">
                      <span>{x}</span>
                      <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 border border-champagne" />
                    </li>
                  ))}
                </Reveal>
                <Reveal delay={240} className="mt-10">
                  <Link href={`/booking?service=${s.slug}`} className="btn">
                    Book this service<span className="sr-only">: {s.title}</span> <span className="arrow" aria-hidden="true" />
                  </Link>
                </Reveal>
              </div>
            </div>
          </section>
        );
      })}

      <BookingCta photo="porsche" />
    </>
  );
}
