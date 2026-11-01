import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { site, mapsDirections } from "@/lib/site";
import { services } from "@/lib/services";

export function Footer() {
  return (
    <footer className="relative z-[1] border-t border-line bg-obsidian">
      <div className="shell pb-10 pt-24 md:pt-32">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-4" aria-label="9WERKS home">
              <Logo height={56} />
            </Link>
            <p className="t-display-s mt-10 max-w-[18ch] text-ivory">{site.tagline}</p>
            <p className="t-body-s mt-4 max-w-[42ch] text-muted">
              Exotic, supercar and sports car specialists in Aundh, Pune.
            </p>
          </div>

          <div className="grid gap-12 sm:grid-cols-3 md:col-span-7">
            <div>
              <h2 className="t-label text-muted">Services</h2>
              <ul className="mt-6 space-y-3">
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services#${s.slug}`} className="link t-body-s">
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="t-label text-muted">Visit</h2>
              <address className="t-body-s mt-6 not-italic leading-relaxed">
                {site.address.lines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </address>
              <a href={mapsDirections} className="link-u link t-body-s mt-4 inline-block" target="_blank" rel="noopener noreferrer">
                Get directions
              </a>
              <dl className="t-body-s mt-8 space-y-2">
                {site.hours.map((h) => (
                  <div key={h.label} className="flex gap-3">
                    <dt className="text-muted">{h.short}</dt>
                    <dd>{h.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h2 className="t-label text-muted">Contact</h2>
              <ul className="t-body-s mt-6 space-y-3">
                <li>
                  <a href={`tel:${site.phoneE164}`} className="link">
                    {site.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a href={site.whatsapp} className="link" target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href={`mailto:${site.email}`} className="link">
                    {site.email}
                  </a>
                </li>
                <li>
                  <a href={site.instagram} className="link" target="_blank" rel="noopener noreferrer">
                    Instagram {site.instagramHandle}
                  </a>
                </li>
                <li>
                  <a href={site.reviews.url} className="link" target="_blank" rel="noopener noreferrer">
                    {site.reviews.rating} on Google, {site.reviews.count} reviews
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-24 flex flex-col gap-4 border-t border-line pt-8 text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="t-label">© 2026 9WERKS. Aundh, Pune.</p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
            {[
              ["/services", "Services"],
              ["/about", "About"],
              ["/booking", "Booking"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="t-label link">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
