import { ImageResponse } from "next/og";
import { OgCard } from "@/components/og";
import { getTripBySlug, getTrips } from "@/lib/data";
import { fromPrice } from "@/lib/format";
import { site } from "@/site.config";

export const alt = "Trip preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export async function generateStaticParams() {
  const trips = await getTrips();
  return trips.map((t) => ({ slug: t.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) return new ImageResponse(<OgCard title={site.name} lines={[]} />, size);
  const price = `From Rs ${fromPrice(trip).toLocaleString("en-IN")}`;
  return new ImageResponse(<OgCard title={trip.name} lines={[trip.durationLabel, trip.difficulty]} price={price} />, size);
}
