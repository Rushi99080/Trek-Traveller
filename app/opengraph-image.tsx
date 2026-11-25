import { ImageResponse } from "next/og";
import { OgCard } from "@/components/og";
import { site } from "@/site.config";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<OgCard title={site.tagline} lines={["Weekend treks", "Camping", "Himalayan treks"]} />, size);
}
