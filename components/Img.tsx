import Image from "next/image";

/**
 * Image that fills its parent box (parent needs `relative` and a size).
 * Lazy-loads automatically. Photos are compressed by Next.js; SVG
 * placeholders are served as they are.
 */
export default function Img({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  className = "object-cover",
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const fallback = "/images/trips/hero.svg";
  const url = src || fallback;
  // Next.js only resizes photos from your own site and Supabase storage.
  // Links from anywhere else are shown as they are, so they never break the page.
  const optimisable =
    !url.endsWith(".svg") &&
    (url.startsWith("/") || /^https:\/\/([a-z0-9-]+\.)*supabase\.co\//.test(url) || url.startsWith("https://images.unsplash.com/"));
  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={!optimisable}
      className={className}
    />
  );
}
