import Image from "next/image";
import { photos, type PhotoKey } from "@/lib/photos";

type Props = {
  label: string;
  lines: string[];
  lede: string;
  photo?: PhotoKey;
  position?: string;
};

/**
 * Opening band for inner pages: label, headline, lede and an optional
 * photograph. Its entrance is pure CSS (`.enter`), so it plays on first paint
 * without waiting for JavaScript.
 */
export function PageHeader({ label, lines, lede, photo, position = "50% 50%" }: Props) {
  const p = photo ? photos[photo] : null;
  return (
    <header className="relative isolate overflow-hidden pt-[calc(var(--nav-h)+clamp(56px,10vw,160px))]">
      {p && (
        <div className="enter-fade absolute inset-0 -z-10" aria-hidden="true">
          <Image src={p.src} alt="" fill preload sizes="100vw" className="object-cover opacity-35" style={{ objectPosition: position }} />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/60 via-obsidian/75 to-obsidian" />
        </div>
      )}
      <div className="shell pb-[clamp(64px,9vw,140px)]">
        <p className="enter t-label text-champagne">{label}</p>
        <h1 className="t-display-xl mt-8">
          {lines.map((line, i) => (
            <span key={i} className="enter block" style={{ animationDelay: `${80 + i * 90}ms` }}>
              {line}
            </span>
          ))}
        </h1>
        <p className="enter t-body-l measure mt-10 text-muted" style={{ animationDelay: "260ms" }}>
          {lede}
        </p>
      </div>
      <div className="shell">
        <hr className="rule" />
      </div>
    </header>
  );
}
