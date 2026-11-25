import { site } from "@/site.config";

/** Shows your logo image if set in site.config.ts, otherwise the company name */
export default function Logo({ light = false }: { light?: boolean }) {
  if (site.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={site.logo} alt={site.name} className="h-9 w-auto" />;
  }
  return (
    <span className={`flex items-center gap-2 ${light ? "text-white" : "text-forest-800"}`}>
      <svg viewBox="0 0 40 28" className="h-7 w-10" aria-hidden="true">
        <circle cx="29" cy="8" r="4" fill="#EE6A1F" />
        <path d="M0 28 L12 9 L19 19 L24 12 L40 28 Z" fill="currentColor" />
        <path d="M12 9 L15.5 14.5 L13 13.5 L10.5 15 Z" fill={light ? "#143726" : "#F5F6F2"} opacity=".9" />
      </svg>
      <span className="font-display text-lg font-bold leading-none tracking-tight">{site.name}</span>
    </span>
  );
}
