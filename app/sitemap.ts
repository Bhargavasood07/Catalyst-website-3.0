import type { MetadataRoute } from "next";
import { getEvents, getSite } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const { url } = getSite();
  return [
    { url, changeFrequency: "weekly", priority: 1 },
    ...getEvents().map((e) => ({
      url: `${url}/events/${e.slug}`,
      lastModified: new Date(Math.min(e.startMs, Date.now())),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
