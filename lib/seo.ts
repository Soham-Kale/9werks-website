import type { Metadata } from "next";

export const ogImage = { url: "/images/brand/og.jpg", width: 1200, height: 630, alt: "The 9WERKS workshop sign in Aundh, Pune" };

/**
 * Per-page metadata. Next merges `openGraph` shallowly, so a page that sets
 * any Open Graph field must restate the image or it is dropped.
 */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "9WERKS",
      locale: "en_IN",
      url: path,
      title: `${title} | 9WERKS`,
      description,
      images: [ogImage],
    },
  };
}
