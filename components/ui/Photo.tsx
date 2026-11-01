import Image from "next/image";
import { photos, type PhotoKey } from "@/lib/photos";
import { Reveal } from "@/components/animations/Reveal";

type Props = {
  k: PhotoKey;
  className?: string;
  /** CSS aspect ratio of the frame, e.g. "4 / 5". Defaults to the photo's own. */
  ratio?: string;
  sizes: string;
  position?: string;
  delay?: number;
  caption?: string;
  /**
   * For a photo that can sit in the first screen: no wipe (which waits for
   * JavaScript) and an eager load, so it never holds back the largest paint.
   */
  eager?: boolean;
};

/** A photograph that wipes in on entry, with a slow light sweep once visible. */
export function Photo({ k, className = "", ratio, sizes, position = "50% 50%", delay, caption, eager }: Props) {
  const p = photos[k];
  return (
    <figure className={className}>
      <Reveal variant={eager ? "" : "rv-img"} delay={delay} className="sweep relative overflow-hidden bg-charcoal" style={{ aspectRatio: ratio ?? `${p.width} / ${p.height}` }}>
        <div className="absolute inset-0">
          <Image src={p.src} alt={p.alt} fill sizes={sizes} loading={eager ? "eager" : "lazy"} className="object-cover" style={{ objectPosition: position }} />
        </div>
      </Reveal>
      {caption && <figcaption className="t-label mt-4 text-muted">{caption}</figcaption>}
    </figure>
  );
}
