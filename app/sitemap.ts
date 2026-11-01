import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: [string, number][] = [
    ["", 1],
    ["/services", 0.9],
    ["/booking", 0.9],
    ["/about", 0.7],
    ["/contact", 0.8],
  ];
  return routes.map(([path, priority]) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly",
    priority,
  }));
}
