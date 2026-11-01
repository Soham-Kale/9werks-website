import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { PageHeader } from "@/components/sections/PageHeader";
import { BookingCta } from "@/components/sections/BookingCta";
import { Photo } from "@/components/ui/Photo";
import { Kicker } from "@/components/ui/Kicker";
import { MaskedLines, Reveal } from "@/components/animations/Reveal";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "9WERKS is an exotic, supercar and sports car workshop in Aundh, Pune: 35 years of experience, 19 expert technicians and modern diagnostic equipment.",
  path: "/about",
});

const principles = [
  { title: "No guesswork", body: "We find the real cause before we touch a spanner, and fix only what needs fixing." },
  { title: "No surprises", body: "We inspect the car, walk you through what it needs, and agree the work before it starts." },
  { title: "Done properly", body: "Premium parts, the right fluids and the right tools, to the standard the car left the factory with." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        label="About 9WERKS"
        lines={["A crew for", "your luxe ride."]}
        lede="9WERKS is a specialist workshop for exotics, supercars and sports cars, just behind Seasons Road in Aundh, Pune."
        photo="facade"
        position="50% 35%"
      />

      {/* Introduction: statement plus the workshop exterior */}
      <section className="section shell" aria-labelledby="about-intro">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <Kicker index="01">Who we are</Kicker>
            <Reveal as="h2" id="about-intro" className="t-display-m mt-8 max-w-[20ch]">
              Performance and luxury cars need more than a general garage.
            </Reveal>
            <Reveal as="p" delay={100} className="t-body-l measure mt-8 text-muted">
              We look after each car the way it was built to be looked after, from an oil change to engine diagnostics, brake work, paint and beyond. Our certified crew combines years of experience with modern equipment, so your car gets the right care the first time.
            </Reveal>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <Photo k="facade" ratio="4 / 5" sizes="(min-width: 768px) 40vw, 100vw" position="50% 40%" caption="The workshop, Aundh" />
          </div>
        </div>
      </section>

      {/* Philosophy: typographic, ruled */}
      <section className="section bg-charcoal" aria-labelledby="philosophy-title">
        <div className="shell">
          <Kicker index="02">Philosophy</Kicker>
          <MaskedLines as="h2" id="philosophy-title" lines={["How we work."]} className="t-display-l mt-8" />
          <ol className="mt-16 border-t border-line">
            {principles.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 90} className="grid gap-4 border-b border-line py-10 md:grid-cols-12 md:items-baseline">
                <span className="t-label tabular text-champagne md:col-span-2">0{i + 1}</span>
                <h3 className="t-display-m md:col-span-4">{p.title}</h3>
                <p className="t-body-l text-muted md:col-span-6">{p.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Experience: two numbers, large */}
      <section className="section shell" aria-labelledby="experience-title">
        <Kicker index="03">Experience</Kicker>
        <h2 id="experience-title" className="sr-only">
          Experience
        </h2>
        <div className="mt-14 grid gap-16 md:grid-cols-2">
          {site.stats.slice(0, 2).map((s, i) => (
            <Reveal key={s.label} delay={i * 120}>
              <p className="font-display tabular text-[clamp(5rem,14vw,13rem)] font-light leading-[0.85]">{s.value}</p>
              <p className="t-label mt-6 text-muted">{s.label}</p>
            </Reveal>
          ))}
        </div>
        <Reveal as="p" delay={200} className="t-body-l measure mt-16 text-muted">
          Over {site.stats[2].value.toLocaleString("en-IN")} satisfied clients and {site.stats[3].value.toLocaleString("en-IN")} projects completed, rated {site.reviews.rating} from {site.reviews.count} reviews on Google.
        </Reveal>
      </section>

      {/* Technicians: image pair with text between */}
      <section className="section bg-charcoal" aria-labelledby="crew-title">
        <div className="shell grid items-end gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Photo k="crew" ratio="3 / 4" sizes="(min-width: 768px) 40vw, 100vw" caption="Crew at work" />
          </div>
          <div className="md:col-span-5">
            <Kicker index="04">Expert technicians</Kicker>
            <MaskedLines as="h2" id="crew-title" lines={["Certified,", "and careful."]} className="t-display-l t-fit mt-8" />
            <Reveal as="p" delay={100} className="t-body-l mt-8 text-muted">
              {site.stats[1].value} highly skilled, certified technicians, handling everything from routine maintenance to complex repairs with precision.
            </Reveal>
          </div>
          <div className="md:col-span-3">
            <Photo k="underbody" ratio="5 / 6" sizes="(min-width: 768px) 25vw, 100vw" delay={150} caption="Under the car" />
          </div>
        </div>
      </section>

      {/* Equipment: wide image, text over the lower edge */}
      <section className="section shell" aria-labelledby="equipment-title">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <Photo k="m5" ratio="16 / 11" sizes="(min-width: 768px) 58vw, 100vw" position="50% 45%" caption="On the lift" />
          </div>
          <div className="md:col-span-4 md:col-start-9 md:self-center">
            <Kicker index="05">Modern equipment</Kicker>
            <Reveal as="h2" id="equipment-title" className="t-display-m mt-8">
              The right tools for today&apos;s cars.
            </Reveal>
            <Reveal as="p" delay={100} className="t-body-l mt-8 text-muted">
              Modern performance cars are computers on wheels. Up-to-date diagnostic tools and workshop equipment let us find faults quickly and work accurately.
            </Reveal>
          </div>
        </div>
      </section>

      {/* Workshop photography */}
      <section className="pb-[var(--section-y)]" aria-labelledby="photos-title">
        <div className="shell">
          <Kicker index="06">In the workshop</Kicker>
          <h2 id="photos-title" className="sr-only">
            Workshop photographs
          </h2>
          <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            <Photo k="m4" ratio="3 / 4" sizes="(min-width: 768px) 25vw, 50vw" />
            <Photo k="wash" ratio="3 / 4" sizes="(min-width: 768px) 25vw, 50vw" delay={80} position="30% 50%" />
            <Photo k="z4" ratio="3 / 4" sizes="(min-width: 768px) 25vw, 50vw" delay={160} />
            <Photo k="brakes" ratio="3 / 4" sizes="(min-width: 768px) 25vw, 50vw" delay={240} />
          </div>
        </div>
      </section>

      <BookingCta photo="m5" heading={["Meet the", "crew."]} />
    </>
  );
}
