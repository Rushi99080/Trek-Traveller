import { site } from "@/site.config";

/** Shows your logo image if set in site.config.ts, otherwise the company name */
export default function Logo({ light = false }: { light?: boolean }) {
  if (site.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={site.logo} alt={site.name} className="h-10 w-auto" />;
  }
  return (
    <span className={`flex items-center gap-2.5 ${light ? "text-white" : "text-forest-900"}`}>
      <svg viewBox="0 0 40 28" className="h-7 w-10 shrink-0" aria-hidden="true">
        <path d="M0 28 L13 8 L20 18 L25 11 L40 28 Z" fill="currentColor" />
        <path d="M13 8 L16.5 13.5 L14 12.6 L11.4 14 Z" fill={light ? "#143726" : "#fff"} />
        <path d="M25 11 L27.5 15 L25.6 14.2 L23.6 15.4 Z" fill={light ? "#143726" : "#fff"} />
        <circle cx="31" cy="6" r="3.2" fill="#EE6A1F" />
      </svg>
      <span className="leading-none">
        <span className="block text-[17px] font-extrabold tracking-tight">{site.name}</span>
        <span className={`mt-1 block text-[9.5px] font-semibold uppercase tracking-[0.2em] ${light ? "text-white/60" : "text-mountain-400"}`}>{site.logoTagline}</span>
      </span>
    </span>
  );
}
