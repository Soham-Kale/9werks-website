/** Section label: a mono index, a short champagne rule, then the name. */
export function Kicker({ index, children, className = "" }: { index: string; children: React.ReactNode; className?: string }) {
  return (
    <p className={`t-label flex items-center gap-4 text-muted ${className}`}>
      <span className="tabular text-ivory">{index}</span>
      <span aria-hidden="true" className="h-px w-8 bg-champagne" />
      <span>{children}</span>
    </p>
  );
}
