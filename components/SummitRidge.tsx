import { plateauRidge, rng } from "@/lib/scenery";

const W = 1600;
const H = 140;
const ridge = (() => {
  const r = plateauRidge(rng(99), W, H, H, 70);
  // highest point gets the summit flag
  const top = r.pts.reduce((a, b) => (b[1] < a[1] && b[0] > 620 && b[0] < 980 ? b : a), [W / 2, H] as [number, number]);
  return { d: r.d, top };
})();

/** Mountain silhouette at the top of the footer — the page ends at the summit */
export default function SummitRidge() {
  const [x, y] = ridge.top;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="no-print -mb-px block h-16 w-full sm:h-24" aria-hidden="true">
      <path d={ridge.d} className="fill-forest-900" />
      <path d={`M${x},${y}V${y - 34}`} className="stroke-forest-900" strokeWidth="3" />
      <path d={`M${x},${y - 34} l26,6 l-26,7z`} fill="#EE6A1F" />
    </svg>
  );
}
