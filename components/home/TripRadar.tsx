"use client";

/**
 * "HOW FAR IS YOUR WEEKEND?"
 * Every trip plotted on a radar centred on Pune, at its real distance and
 * direction. A sweep circles the radar and each trip pings as it passes.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import Img from "../Img";
import { DifficultyBadge } from "../Badges";
import { contourLoops } from "@/lib/scenery";
import type { Difficulty } from "@/lib/types";

export interface RadarPoint {
  id: string;
  name: string;
  km: number;
  bearing: number;
  direction: string;
  difficulty: Difficulty;
  durationLabel: string;
  image: string;
  next: string;
  price: string;
  href: string;
  bookHref: string;
}

const S = 440;
const C = S / 2;
const R = 192;
const MAX_KM = 600;
const RINGS = [50, 150, 300, 600];
const radius = (km: number) => R * Math.sqrt(Math.min(km, MAX_KM) / MAX_KM);
const pinColor: Record<Difficulty, string> = { Easy: "#86EFAC", Moderate: "#FDBA74", Difficult: "#FCA5A5" };

const contours = contourLoops(11, C - 40, C + 30, 9, 26).concat(contourLoops(5, C + 110, C - 90, 5, 22));

export default function TripRadar({ points }: { points: RadarPoint[] }) {
  const sorted = useMemo(() => [...points].sort((a, b) => a.km - b.km), [points]);
  const [selected, setSelected] = useState(sorted[0]?.id);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.2 });
    if (el) io.observe(el);
    return () => io.disconnect();
  }, []);

  // Positions, nudged apart where two trips are very close together
  const placed = useMemo(() => {
    const pts = sorted.map((p) => {
      const r = radius(p.km);
      const t = (p.bearing * Math.PI) / 180;
      return { ...p, x: C + r * Math.sin(t), y: C - r * Math.cos(t), far: p.km > MAX_KM, side: 0 as 0 | 1 };
    });
    for (let pass = 0; pass < 4; pass++) {
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[j].x - pts[i].x;
          const dy = pts[j].y - pts[i].y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 18) {
            const push = (18 - d) / 2;
            pts[i].x -= (dx / d) * push;
            pts[i].y -= (dy / d) * push;
            pts[j].x += (dx / d) * push;
            pts[j].y += (dy / d) * push;
          }
        }
    }
    // Labels: left or right of the dot, flipped when two would collide
    pts.forEach((p) => (p.side = p.x < C ? 0 : 1));
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++)
        if (Math.abs(pts[i].y - pts[j].y) < 15 && pts[i].side === pts[j].side && Math.abs(pts[i].x - pts[j].x) < 130) pts[j].side = pts[j].side ? 0 : 1;
    return pts;
  }, [sorted]);

  const sel = placed.find((p) => p.id === selected) ?? placed[0];
  if (!sel) return null;

  return (
    <div ref={ref} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
      {/* Radar */}
      <div className="relative mx-auto aspect-square w-full max-w-[30rem]">
        <svg viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 h-full w-full" role="img" aria-label="Map of trips by distance from Pune">
          <defs>
            <radialGradient id="radar-bg">
              <stop offset="0%" stopColor="#1C4A33" />
              <stop offset="100%" stopColor="#0C2318" />
            </radialGradient>
            <clipPath id="radar-clip">
              <circle cx={C} cy={C} r={R + 14} />
            </clipPath>
          </defs>
          <circle cx={C} cy={C} r={R + 14} fill="url(#radar-bg)" />
          <g clipPath="url(#radar-clip)" fill="none" stroke="#9FD3B3" strokeOpacity=".09" strokeWidth="1">
            {contours.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          {/* Rings and cross */}
          <g fill="none" stroke="#B8E2C8" strokeOpacity=".22">
            {RINGS.map((km) => (
              <circle key={km} cx={C} cy={C} r={radius(km)} strokeDasharray={km === MAX_KM ? undefined : "3 5"} />
            ))}
            <path d={`M${C},${C - R - 10}V${C + R + 10}M${C - R - 10},${C}H${C + R + 10}`} strokeOpacity=".12" />
          </g>
          <g fill="#B8E2C8" fillOpacity=".55" fontSize="10" fontWeight="600" textAnchor="middle">
            {RINGS.map((km) => (
              <text key={km} x={C + 4} y={C - radius(km) + 12} textAnchor="start">
                {km} km
              </text>
            ))}
            <text x={C} y={C - R - 20} fontSize="12">N</text>
            <text x={C + R + 22} y={C + 4} fontSize="12">E</text>
            <text x={C} y={C + R + 28} fontSize="12">S</text>
            <text x={C - R - 22} y={C + 4} fontSize="12">W</text>
          </g>

          {/* Pune */}
          <circle cx={C} cy={C} r="5" fill="#fff" />
          <circle cx={C} cy={C} r="5" fill="none" stroke="#fff" className={active ? "animate-ping" : ""} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
          <text x={C} y={C + 20} fill="#fff" fontSize="12" fontWeight="700" textAnchor="middle">
            Pune
          </text>

          {/* Trips */}
          {placed.map((p) => {
            const on = p.id === sel.id;
            const color = pinColor[p.difficulty];
            return (
              <g key={p.id} onClick={() => setSelected(p.id)} className="cursor-pointer outline-none" role="button" aria-label={`${p.name}, ${p.km} km`} tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(p.id)}>
                <circle cx={p.x} cy={p.y} r="16" fill="transparent" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  className={active ? "animate-radar-ping" : "opacity-0"}
                  style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: `${(p.bearing / 360) * 6}s` }}
                />
                {on && <circle cx={p.x} cy={p.y} r="11" fill="none" stroke="#fff" strokeWidth="1.5" />}
                <circle cx={p.x} cy={p.y} r={on ? 6.5 : 5} fill={color} stroke="#0C2318" strokeWidth="1.5" />
                {p.far && (
                  <path
                    d={`M${p.x},${p.y}l${(Math.sin((p.bearing * Math.PI) / 180) * 14).toFixed(1)},${(-Math.cos((p.bearing * Math.PI) / 180) * 14).toFixed(1)}`}
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                )}
                <text
                  x={p.x + (p.side ? 11 : -11)}
                  y={p.y + 4}
                  textAnchor={p.side ? "start" : "end"}
                  fontSize={on ? 13 : 11}
                  fontWeight={on ? 700 : 600}
                  fill={on ? "#fff" : "#D6EEDF"}
                  className={on ? "" : "hidden sm:inline"}
                  style={{ paintOrder: "stroke", stroke: "#0C2318", strokeWidth: 3 }}
                >
                  {p.name.replace(/ (Trek|Trip|Himalayan Trek|Backpacking Trip|Jungle Trek|Night Trek|Beach Trek|Fort Trek)$/, "")}
                  {p.far ? ` ${p.km.toLocaleString("en-IN")} km` : ""}
                </text>
              </g>
            );
          })}
        </svg>
        {/* Sweep */}
        <div
          className={`pointer-events-none absolute rounded-full ${active ? "animate-sweep" : "opacity-0"}`}
          style={{
            inset: `${((C - R - 14) / S) * 100}%`,
            background: "conic-gradient(from 0deg, transparent 0deg 300deg, rgba(238,106,31,.05) 310deg, rgba(251,160,103,.38) 360deg)",
          }}
        />
      </div>

      {/* Selected trip */}
      <div className="min-w-0">
        <div className="card overflow-hidden">
          <div className="relative aspect-[16/9] bg-forest-100">
            <Img src={sel.image} alt={sel.name} sizes="(max-width: 1024px) 100vw, 40vw" />
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-sm font-semibold text-white backdrop-blur">
              <MapPin size={14} /> {sel.km.toLocaleString("en-IN")} km {sel.direction} of Pune
            </span>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <DifficultyBadge level={sel.difficulty} />
              <span className="flex items-center gap-1 text-[13px] text-mountain-500">
                <Clock size={14} /> {sel.durationLabel}
              </span>
            </div>
            <h3 className="mt-2 text-2xl font-bold">{sel.name}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-mountain-500">
              <CalendarDays size={15} /> {sel.next}
            </p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <p className="leading-tight">
                <span className="block text-xs text-mountain-500">From</span>
                <span className="font-display text-2xl font-bold text-forest-800">{sel.price}</span>
              </p>
              <div className="flex gap-2">
                <Link href={sel.href} className="btn-outline px-4 py-2.5 text-sm">
                  Details
                </Link>
                <Link href={sel.bookHref} className="btn-primary px-4 py-2.5 text-sm">
                  Book now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Nearest first */}
        <div className="rail mt-4 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
          {sorted.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p.id)}
              aria-pressed={p.id === sel.id}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                p.id === sel.id ? "border-forest-700 bg-forest-700 text-white" : "border-mountain-200 bg-white text-mountain-700 hover:border-forest-400"
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: p.id === sel.id ? "#fff" : pinColor[p.difficulty].replace("#86EFAC", "#22c55e").replace("#FDBA74", "#f97316").replace("#FCA5A5", "#ef4444") }} />
              {p.name.split(" ")[0]} <span className={p.id === sel.id ? "text-white/70" : "text-mountain-400"}>{p.km.toLocaleString("en-IN")} km</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
