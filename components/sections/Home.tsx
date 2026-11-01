import Link from "next/link";
import { site } from "@/lib/site";
import { services } from "@/lib/services";
import { gallery } from "@/lib/photos";
import { Reveal, MaskedLines } from "@/components/animations/Reveal";
import { Kicker } from "@/components/ui/Kicker";
import { Photo } from "@/components/ui/Photo";
import { Stats } from "./Stats";
import { ServicesIndex } from "./ServicesIndex";
import { Process } from "./Process";
import { BookingCta } from "./BookingCta";

export function Intro() {
  return (
    <section className="section shell" aria-labelledby="intro-title">
      <div className="grid gap-12 md:grid-cols-12">
        <Kicker index="01" className="md:col-span-3 md:pt-4">
          The workshop
        </Kicker>
        <div className="md:col-span-9">
          <Reveal as="h2" id="intro-title" className="t-display-m max-w-[22ch]">
            A specialist workshop for exotics, supercars and sports cars, in Aundh, Pune.
          </Reveal>
          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            <Reveal as="p" delay={100} className="t-body-l measure text-muted">
              One crew handles everything your car needs, from a routine service to collision repair, paint and wraps.
            </Reveal>
            <Reveal delay={180} className="flex flex-col items-start gap-6">
              <a href={site.reviews.url} target="_blank" rel="noopener noreferrer" className="group flex items-baseline gap-4">
                <span className="font-display tabular text-5xl font-light">{site.reviews.rating}</span>
                <span className="t-label text-muted">
                  <span className="link group-hover:bg-[length:100%_1px]">{site.reviews.count} Google reviews</span>
                </span>
              </a>
              <Link href="/about" className="t-label link link-u">
                About 9WERKS
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Craft() {
  return (
    <section className="section relative overflow-hidden" aria-labelledby="craft-title">
      <div className="shell grid items-end gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <Photo k="m5" ratio="4 / 5" sizes="(min-width: 768px) 58vw, 100vw" position="50% 60%" />
        </div>
        <div className="md:col-span-5 md:pb-16">
          <Kicker index="02">Craftsmanship</Kicker>
          <MaskedLines as="h2" id="craft-title" lines={["Precision", "you can see", "under the bonnet."]} className="t-display-l t-fit mt-8" />
          <Reveal as="p" delay={150} className="t-body-l measure mt-8 text-muted">
            Performance cars need more than a general garage. Every job is planned, checked and explained, and done with premium parts and the right fluids.
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-4">
            <Photo k="brakes" ratio="5 / 6" sizes="(min-width: 768px) 20vw, 50vw" delay={120} caption="Brakes" />
            <Photo k="crew" ratio="5 / 6" sizes="(min-width: 768px) 20vw, 50vw" delay={220} caption="Crew at work" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ServicesOverview() {
  return (
    <section className="section shell" aria-labelledby="services-title">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <Kicker index="03">Services</Kicker>
          <MaskedLines as="h2" id="services-title" lines={["Everything", "your car needs."]} className="t-display-l mt-8" />
        </div>
        <Reveal>
          <Link href="/services" className="btn">
            All services <span className="arrow" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
      <ServicesIndex items={services.map(({ slug, index, title, short, photo }) => ({ slug, index, title, short, photo }))} />
    </section>
  );
}

export function Why() {
  return (
    <section className="section bg-charcoal" aria-labelledby="why-title">
      <div className="shell">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Kicker index="04">Why 9WERKS</Kicker>
            <Reveal as="h2" id="why-title" className="t-display-m mt-8 max-w-[12ch]">
              Workshop-grade care, every visit.
            </Reveal>
          </div>
          <ol className="grid gap-px bg-line md:col-span-8 md:grid-cols-3">
            {site.why.map((w, i) => (
              <Reveal as="li" key={w.title} delay={i * 110} className="flex flex-col bg-charcoal py-8 md:px-8 md:py-0 md:first:pl-0">
                <span className="font-display tabular text-6xl font-light text-champagne">0{i + 1}</span>
                <h3 className="t-display-s mt-10">{w.title}</h3>
                <p className="t-body-s mt-4 text-muted">{w.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Makes() {
  const row = [...site.makes, ...site.makes, ...site.makes];
  return (
    <section className="section overflow-hidden" aria-labelledby="makes-title">
      <div className="shell">
        <Kicker index="06">Makes we look after</Kicker>
        <h2 id="makes-title" className="sr-only">
          Makes we look after: {site.makes.join(", ")}
        </h2>
      </div>
      <div className="marquee mt-14 border-y border-line py-10" aria-hidden="true">
        <div className="marquee-track">
          {row.map((m, i) => (
            <span key={i} className="t-display-l flex items-center gap-[clamp(32px,5vw,80px)] whitespace-nowrap pr-[clamp(32px,5vw,80px)] text-ivory/90">
              {m}
              <span className="inline-block h-2 w-2 rotate-45 border border-champagne" />
            </span>
          ))}
        </div>
      </div>
      <p className="shell t-body-s mt-8 text-muted">Make names are listed for identification only.</p>
    </section>
  );
}

export function Gallery() {
  const spans = ["md:col-span-5", "md:col-span-4 md:mt-32", "md:col-span-3 md:mt-12", "md:col-span-4", "md:col-span-5 md:-mt-24", "md:col-span-3 md:mt-16"];
  const ratios = ["4 / 5", "4 / 5", "3 / 4", "4 / 5", "16 / 10", "3 / 4"];
  return (
    <section className="section shell" aria-labelledby="gallery-title">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <Kicker index="08">On the floor</Kicker>
          <MaskedLines as="h2" id="gallery-title" lines={["Cars we love", "working on."]} className="t-display-l mt-8" />
        </div>
        <Reveal>
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="btn">
            Follow {site.instagramHandle} <span className="arrow" aria-hidden="true" />
          </a>
        </Reveal>
      </div>
      <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-12 md:gap-6">
        {gallery.map((g, i) => (
          <Photo
            key={g.key}
            k={g.key}
            ratio={ratios[i]}
            className={`${spans[i]} ${i === 4 ? "col-span-2" : ""}`}
            sizes="(min-width: 768px) 40vw, 50vw"
            delay={(i % 3) * 90}
            caption={g.caption}
          />
        ))}
      </div>
    </section>
  );
}

export function HomeSections() {
  return (
    <>
      <Intro />
      <Craft />
      <ServicesOverview />
      <Why />
      <Stats index="05" />
      <Makes />
      <Process index="07" />
      <Gallery />
      <BookingCta />
    </>
  );
}
