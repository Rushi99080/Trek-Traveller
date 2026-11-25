"use client";

/**
 * "COME SOLO, LEAVE WITH A CREW"
 * Scattered solo trekkers walk in and gather around a campfire as you scroll.
 * The three steps light up one by one along the way.
 */
import { useEffect, useRef, useState } from "react";
import { rng, rollingRidge } from "@/lib/scenery";

const W = 480;
const H = 300;
const FIRE = { x: 240, y: 236 };

const scene = (() => {
  const rand = rng(42);
  const far = rollingRidge(rand, W, H, 190, 70);
  const mid = rollingRidge(rand, W, H, 222, 40);
  const stars = Array.from({ length: 50 }, () => ({ x: rand() * W, y: rand() * 140, r: 0.6 + rand() * 1.1, d: rand() * 4 }));
  // Start: scattered and alone. End: a ring around the fire.
  const starts: [number, number][] = [
    [24, 250], [70, 214], [118, 268], [402, 212], [452, 262], [356, 276], [180, 286], [300, 290], [440, 230],
  ];
  const hikers = starts.map(([sx, sy], i) => {
    const a = Math.PI * (0.92 + (i / (starts.length - 1)) * 1.16); // around the back and sides of the fire
    const front = i % 3 === 1;
    const ex = FIRE.x + Math.cos(a) * (front ? 70 : 92) * (i % 2 ? 1 : 0.92);
    const ey = FIRE.y + Math.sin(a) * 20 + (front ? 30 : 6);
    return { sx, sy, ex, ey: Math.min(ey, 292), h: 22 + (i % 3) * 3, flip: sx > FIRE.x };
  });
  return { far, mid, stars, hikers };
})();

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clamp = (v: number) => Math.max(0, Math.min(1, v));

export default function SoloToCrew({ steps }: { steps: { title: string; text: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setP(1);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      setP(clamp((vh * 0.92 - r.top) / (vh * 0.7)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const fire = 0.35 + 0.65 * ease(clamp((p - 0.15) / 0.75));
  const stepOn = (i: number) => p >= [0.12, 0.45, 0.8][i];

  return (
    <div ref={ref} className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-center">
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/10">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Solo trekkers gathering around a campfire">
          <defs>
            <linearGradient id="crew-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#081426" />
              <stop offset="100%" stopColor="#1B3156" />
            </linearGradient>
            <radialGradient id="crew-fire">
              <stop offset="0%" stopColor="#FFB25C" stopOpacity=".85" />
              <stop offset="45%" stopColor="#EE6A1F" stopOpacity=".28" />
              <stop offset="100%" stopColor="#EE6A1F" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width={W} height={H} fill="url(#crew-sky)" />
          {scene.stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" className="animate-twinkle" style={{ animationDelay: `${s.d}s` }} />
          ))}
          <path d={scene.far.d} fill="#1A2C46" />
          <path d={scene.mid.d} fill="#122036" />
          <rect y="240" width={W} height="60" fill="#0B1626" />

          {/* Fire glow grows as people arrive */}
          <circle cx={FIRE.x} cy={FIRE.y} r={60 + fire * 120} fill="url(#crew-fire)" />

          {/* Trekkers */}
          {scene.hikers.map((h, i) => {
            const t = ease(clamp((p - i * 0.035) / 0.62));
            const x = h.sx + (h.ex - h.sx) * t;
            const y = h.sy + (h.ey - h.sy) * t;
            const moving = t > 0 && t < 1;
            const bob = moving ? Math.abs(Math.sin(t * Math.PI * 7)) * -2.5 : 0;
            const lit = 0.25 + 0.75 * t;
            const facing = x > FIRE.x ? -1 : 1;
            return (
              <g key={i} transform={`translate(${x.toFixed(1)} ${(y + bob).toFixed(1)}) scale(${facing * 1.3} 1.3)`}>
                <ellipse cx="0" cy="1" rx="7" ry="2" fill="#000" opacity=".35" />
                <g fill={`rgb(${Math.round(20 + 18 * lit)},${Math.round(30 + 14 * lit)},${Math.round(44 + 6 * lit)})`}>
                  <circle cy={-h.h - 6} r="5.2" />
                  <rect x="-4" y={-h.h} width="8" height={h.h} rx="3" />
                  <rect x="-10" y={-h.h + 2} width="7" height="12" rx="2" />
                </g>
                {/* warm rim light from the fire */}
                <rect x="2" y={-h.h + 1} width="2" height={h.h - 3} rx="1" fill="#FFB25C" opacity={0.15 + 0.6 * t} />
              </g>
            );
          })}

          {/* Campfire */}
          <g transform={`translate(${FIRE.x} ${FIRE.y})`}>
            <path d="M-14,4 L14,-2 M-14,-2 L14,4" stroke="#5B3A22" strokeWidth="5" strokeLinecap="round" />
            <g className="animate-fire" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
              <path d={`M0,${-10 - fire * 24} C10,-10 9,0 0,2 C-9,0 -10,-10 0,${-10 - fire * 24}Z`} fill="#F7833B" />
              <path d={`M0,${-6 - fire * 13} C5,-6 4,0 0,1 C-4,0 -5,-6 0,${-6 - fire * 13}Z`} fill="#FFD27A" />
            </g>
          </g>
        </svg>
      </div>

      <ol className="grid gap-3">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className={`flex gap-4 rounded-2xl p-4 ring-1 transition-all duration-500 ${stepOn(i) ? "bg-white/10 ring-white/15" : "bg-white/[.03] ring-white/5 opacity-60"}`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display font-bold transition-colors duration-500 ${
                stepOn(i) ? "bg-sunset-500 text-white" : "bg-white/10 text-white/60"
              }`}
            >
              {i + 1}
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-0.5 text-[15px] leading-relaxed text-forest-100/80">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
