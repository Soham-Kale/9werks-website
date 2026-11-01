import type { Metadata, Viewport } from "next";
import { Archivo, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { ogImage } from "@/lib/seo";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { LocalBusinessJsonLd } from "@/components/layout/JsonLd";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  // Our own wide fallback (globals.css): the default one is sized for normal
  // width, so swapping to expanded Archivo would grow the headline and log a
  // second, later largest paint.
  adjustFontFallback: false,
  fallback: ["Archivo Wide Fallback", "Arial", "sans-serif"],
});
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "9WERKS | Exotic, Supercar & Sports Car Specialists in Aundh, Pune",
    template: "%s | 9WERKS, Aundh, Pune",
  },
  description: site.description,
  applicationName: "9WERKS",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "9WERKS",
    locale: "en_IN",
    url: "/",
    title: "9WERKS | A crew for your luxe ride",
    description: site.description,
    images: [ogImage],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#080909",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${archivo.variable} ${hanken.variable} ${plexMono.variable}`}>
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <div className="grain" aria-hidden="true" />
        <SmoothScroll />
        <Nav />
        <main id="main" tabIndex={-1} className="relative z-[1] outline-none">
          {children}
        </main>
        <Footer />
        <LocalBusinessJsonLd />
      </body>
    </html>
  );
}
