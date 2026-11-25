import type { MetadataRoute } from "next";
import { getTrips } from "@/lib/data";
import { site } from "@/site.config";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const trips = await getTrips();
  const now = new Date();
  const pages = ["", "/treks", "/plan-a-trip", "/about", "/contact", "/policies/terms", "/policies/privacy", "/policies/cancellation-refund", "/policies/safety"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...trips.map((t) => ({ url: `${site.url}/treks/${t.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.9 })),
  ];
}
