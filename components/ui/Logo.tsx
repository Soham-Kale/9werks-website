import Image from "next/image";
import { brandConfig } from "@/config/brand";

/** The client's 9WERKS lockup in ivory, sized by height. */
export function Logo({ height, className, preload }: { height: number; className?: string; preload?: boolean }) {
  const { src, width: w, height: h } = brandConfig.logo;
  return (
    <Image
      src={src}
      alt="9WERKS"
      width={Math.round((w / h) * height)}
      height={height}
      preload={preload}
      className={`max-w-none ${className ?? ""}`}
      style={{ height, width: "auto" }}
    />
  );
}
