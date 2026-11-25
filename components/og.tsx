import { site } from "@/site.config";

/** Layout for the preview image shown when a link is shared on WhatsApp / Instagram */
export function OgCard({ title, lines, price }: { title: string; lines: string[]; price?: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(160deg, #22583C 0%, #0E271B 100%)", padding: 64, color: "white", position: "relative" }}>
      <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", left: 0, top: 0 }}>
        <circle cx="940" cy="190" r="70" fill="#EE6A1F" opacity="0.9" />
        <path d="M0 630 L0 470 L180 470 L230 400 L430 400 L470 450 L640 450 L700 360 L900 360 L950 420 L1200 420 L1200 630 Z" fill="#143726" />
        <path d="M0 630 L0 540 L260 540 L300 500 L560 500 L600 560 L820 560 L860 510 L1200 510 L1200 630 Z" fill="#0B1F15" />
      </svg>
      <div style={{ display: "flex", fontSize: 30, fontWeight: 700, opacity: 0.9 }}>{site.name}</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.05, maxWidth: 900 }}>{title}</div>
        <div style={{ display: "flex", gap: 16, marginTop: 24, fontSize: 30 }}>
          {lines.map((l) => (
            <div key={l} style={{ display: "flex", background: "rgba(255,255,255,0.14)", borderRadius: 999, padding: "8px 22px" }}>{l}</div>
          ))}
          {price && <div style={{ display: "flex", background: "#EE6A1F", borderRadius: 999, padding: "8px 22px", fontWeight: 700 }}>{price}</div>}
        </div>
      </div>
    </div>
  );
}
