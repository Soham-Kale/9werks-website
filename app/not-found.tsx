import Link from "next/link";

export default function NotFound() {
  return (
    <section className="shell flex min-h-[80svh] flex-col justify-end pb-24 pt-[calc(var(--nav-h)+96px)]">
      <p className="t-label text-champagne">404</p>
      <h1 className="t-display-xl mt-6">Wrong turn.</h1>
      <p className="t-body-l measure mt-8 text-muted">This page does not exist. The workshop does.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primary">
          Back to home <span className="arrow" aria-hidden="true" />
        </Link>
        <Link href="/booking" className="btn">
          Book a service
        </Link>
      </div>
    </section>
  );
}
