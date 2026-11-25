"use client";

/**
 * LIVE HERO
 * The Sahyadris as they look right now in Pune: the sky, sun/moon, stars and
 * light change with the time of day. At night you see a line of headlamps
 * climbing the ridge (a night trek in progress). Ridges move in parallax when
 * you scroll, and a countdown shows when the next group leaves.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { fortPath, plateauRidge, rng, rollingRidge, yAt } from "@/lib/scenery";

const W = 1600;
const H = 1000;

type Phase = "night" | "dawn" | "day" | "golden" | "dusk";

const PALETTE: Record<Phase, { sky: [string, string, string]; ridges: string[]; sun: string; body: [number, number]; stars: number; lamps: number; mist: number; birds: boolean }> = {
  night: { sky: ["#060F1D", "#13264A", "#2E4670"], ridges: ["#2B3F62", "#213452", "#192A43", "#112034", "#0A1522"], sun: "#F4EFD8", body: [960, 190], stars: 1, lamps: 1, mist: 0.12, birds: false },
  dawn: { sky: ["#3D5279", "#C88C92", "#F7B07A"], ridges: ["#B49CB1", "#8D809B", "#577078", "#2F5444", "#163325"], sun: "#FFE6B5", body: [760, 430], stars: 0.15, lamps: 0.35, mist: 0.45, birds: true },
  day: { sky: ["#5F98C2", "#A4C9DF", "#E4EFEF"], ridges: ["#A9C0C3", "#7FA28B", "#4F7C5E", "#2C5B3F", "#163A27"], sun: "#FFF6DA", body: [920, 150], stars: 0, lamps: 0, mist: 0.35, birds: true },
  golden: { sky: ["#6A8CB3", "#EFBF8A", "#F4954B"], ridges: ["#C69C86", "#9D7B77", "#5F6B5D", "#33503D", "#193324"], sun: "#FFE1A0", body: [970, 340], stars: 0, lamps: 0.2, mist: 0.25, birds: true },
  dusk: { sky: ["#252E5C", "#A0587A", "#EF8A4D"], ridges: ["#7F5D79", "#5C4767", "#3C3655", "#26283B", "#151827"], sun: "#FFC98A", body: [700, 440], stars: 0.55, lamps: 0.8, mist: 0.15, birds: false },
};

function phaseFor(hour: number): Phase {
  if (hour < 5) return "night";
  if (hour < 7.5) return "dawn";
  if (hour < 16) return "day";
  if (hour < 18) return "golden";
  if (hour < 19.5) return "dusk";
  return "night";
}

function puneNow() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const label = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date());
  return { hour: h + m / 60, label: label.replace(/\s?(am|pm)/i, (s) => " " + s.trim().toLowerCase()) };
}

function countdown(ms: number) {
  if (ms <= 0) return "today";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return d > 0 ? `${d}d ${h}h ${m}m ${String(sec).padStart(2, "0")}s` : `${h}h ${m}m ${String(sec).padStart(2, "0")}s`;
}

/* ---------- the landscape (same on server and browser) ---------- */
const scene = (() => {
  const rand = rng(20261125);
  const layers = [
    { base: 0.49, amp: 0.21, k: 0.06 },
    { base: 0.57, amp: 0.19, k: 0.12 },
    { base: 0.66, amp: 0.17, k: 0.2 },
    { base: 0.78, amp: 0.15, k: 0.3 },
    { base: 0.93, amp: 0.13, k: 0.42 },
  ].map((l, i) => ({
    ...l,
    ridge: i === 4 ? rollingRidge(rand, W, H, H * l.base, H * l.amp) : plateauRidge(rand, W, H, H * l.base, H * l.amp),
  }));
  const fortFlat =
    layers[2].ridge.flats.filter((f) => (f.x0 + f.x1) / 2 > 640 && (f.x0 + f.x1) / 2 < 1080 && f.x1 - f.x0 > 150).sort((a, b) => a.y - b.y)[0] ??
    layers[2].ridge.flats[3];
  const fort = fortPath(fortFlat);
  // Night-trek trail zig-zagging up the 4th ridge
  const r3 = layers[3].ridge.pts;
  const topX = 960;
  const topY = yAt(r3, topX) + 8;
  const trail: [number, number][] = [];
  for (let k = 0; k <= 9; k++) {
    const t = k / 9;
    trail.push([700 + t * (topX - 700) + (k % 2 ? 55 : -35) * (1 - t), H * 0.99 + (topY - H * 0.99) * t]);
  }
  const trailD = "M" + trail.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L");
  const starRand = rng(7);
  const stars = Array.from({ length: 110 }, () => ({ x: starRand() * W, y: starRand() * H * 0.55, r: starRand() < 0.1 ? 2.2 : 0.9 + starRand() * 0.8, d: starRand() * 4 }));
  const nearPts = layers[4].ridge.pts;
  const hikers = [0, 1, 2, 3, 4, 5].map((i) => {
    const x = 1010 + i * 26;
    return { x, y: yAt(nearPts, x) + 2, h: 20 + (i % 3) * 3 };
  });
  return { layers, fort, trailD, stars, hikers };
})();

export interface NextDeparture {
  tripName: string;
  href: string;
  departAt: string; // ISO time
  seatsLeft: number;
}

export default function LiveHero({ headline, subheadline, next }: { headline: string; subheadline: string; next: NextDeparture | null }) {
  const [phase, setPhase] = useState<Phase>("dawn");
  const [risen, setRisen] = useState(false);
  const [clock, setClock] = useState("");
  const [left, setLeft] = useState("");
  const layerRefs = useRef<(SVGGElement | null)[]>([]);
  const textRef = useRef<HTMLDivElement>(null);
  const pointer = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);

  // Time of day + clock + countdown
  useEffect(() => {
    const tick = () => {
      const now = puneNow();
      setPhase(phaseFor(now.hour));
      setClock(now.label);
      if (next) setLeft(countdown(new Date(next.departAt).getTime() - Date.now()));
    };
    tick();
    const id = setInterval(tick, 1000);
    const raf = requestAnimationFrame(() => setRisen(true));
    return () => {
      clearInterval(id);
      cancelAnimationFrame(raf);
    };
  }, [next]);

  // Parallax on scroll and (desktop) pointer
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      svgRef.current?.pauseAnimations();
      return;
    }
    let frame = 0;
    const apply = () => {
      frame = 0;
      const y = Math.min(window.scrollY, 900);
      scene.layers.forEach((l, i) => {
        const g = layerRefs.current[i];
        if (g) g.style.transform = `translate3d(${(pointer.current * l.k * 80).toFixed(1)}px, ${(y * l.k * 0.9).toFixed(1)}px, 0)`;
      });
      if (textRef.current) {
        textRef.current.style.transform = `translate3d(0, ${(y * 0.22).toFixed(1)}px, 0)`;
        textRef.current.style.opacity = String(Math.max(0, 1 - y / 520));
      }
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current = e.clientX / window.innerWidth - 0.5;
      request();
    };
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  const p = PALETTE[phase];
  const words = useMemo(() => headline.split(" "), [headline]);
  const isNight = phase === "night" || phase === "dusk";

  return (
    <div className="relative h-[calc(100svh-4rem)] min-h-[36rem] max-h-[58rem] overflow-hidden bg-[#13264A]">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="hero-stop" style={{ stopColor: p.sky[0] }} />
            <stop offset="55%" className="hero-stop" style={{ stopColor: p.sky[1] }} />
            <stop offset="100%" className="hero-stop" style={{ stopColor: p.sky[2] }} />
          </linearGradient>
          <radialGradient id="hero-glow">
            <stop offset="0%" className="hero-stop" style={{ stopColor: p.sun, stopOpacity: 0.75 }} />
            <stop offset="100%" className="hero-stop" style={{ stopColor: p.sun, stopOpacity: 0 }} />
          </radialGradient>
          <radialGradient id="hero-lamp">
            <stop offset="0%" stopColor="#FFB45C" stopOpacity=".95" />
            <stop offset="100%" stopColor="#FFB45C" stopOpacity="0" />
          </radialGradient>
          <mask id="hero-moon">
            <circle r="40" fill="#fff" />
            <circle cx="15" cy="-9" r="35" fill="#000" />
          </mask>
          <filter id="hero-blur" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        <rect width={W} height={H} fill="url(#hero-sky)" />

        {/* Stars */}
        <g className="transition-opacity duration-[2000ms]" style={{ opacity: p.stars }}>
          {scene.stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" className="animate-twinkle" style={{ animationDelay: `${s.d}s` }} />
          ))}
        </g>

        {/* Sun or moon — rises into place on load */}
        <g
          className="transition-[transform,opacity] duration-[2600ms] ease-[cubic-bezier(.2,.7,.2,1)]"
          style={{ transform: `translate(${p.body[0]}px, ${p.body[1] + (risen ? 0 : 320)}px)`, opacity: risen ? 1 : 0 }}
        >
          <circle r={isNight ? 160 : 300} fill="url(#hero-glow)" />
          <circle r={phase === "night" ? 40 : 54} className="transition-[fill] duration-[2000ms]" style={{ fill: p.sun }} mask={phase === "night" ? "url(#hero-moon)" : undefined} />
        </g>

        {/* Birds at day */}
        {p.birds && (
          <g fill="none" stroke="#1F2D2A" strokeWidth="3" strokeLinecap="round" opacity=".55">
            <animateTransform attributeName="transform" type="translate" from="-200 330" to="1800 210" dur="34s" repeatCount="indefinite" />
            {[0, 1, 2, 3].map((i) => (
              <path key={i} transform={`translate(${i * 34} ${(i % 2) * 18 - i * 6})`} d="M-10,0 Q-5,-6 0,0 Q5,-6 10,0">
                <animate attributeName="d" values="M-10,0 Q-5,-6 0,0 Q5,-6 10,0;M-10,-4 Q-5,2 0,0 Q5,2 10,-4;M-10,0 Q-5,-6 0,0 Q5,-6 10,0" dur={`${0.7 + i * 0.1}s`} repeatCount="indefinite" />
              </path>
            ))}
          </g>
        )}

        {/* Ridges, back to front */}
        {scene.layers.map((l, i) => (
          <g key={i} ref={(el) => { layerRefs.current[i] = el; }} style={{ willChange: "transform" }}>
            <path d={l.ridge.d} className="transition-[fill] duration-[2000ms]" style={{ fill: p.ridges[i] }} />
            {i === 2 && (
              <>
                <path d={scene.fort.d} className="transition-[fill] duration-[2000ms]" style={{ fill: p.ridges[i] }} />
                <path d={`M${scene.fort.flagX},${scene.fort.flagY}V${scene.fort.flagY - 40}`} stroke={p.ridges[i]} strokeWidth="3" />
                <path fill="#EE6A1F" d={`M${scene.fort.flagX},${scene.fort.flagY - 40} q14,-4 26,4 q-12,8 -26,8z`}>
                  <animate
                    attributeName="d"
                    values={`M${scene.fort.flagX},${scene.fort.flagY - 40} q14,-4 26,4 q-12,8 -26,8z;M${scene.fort.flagX},${scene.fort.flagY - 40} q14,4 26,1 q-12,6 -26,11z;M${scene.fort.flagX},${scene.fort.flagY - 40} q14,-4 26,4 q-12,8 -26,8z`}
                    dur="1.6s"
                    repeatCount="indefinite"
                  />
                </path>
              </>
            )}
            {i === 1 && (
              <g className="transition-opacity duration-[2000ms]" style={{ opacity: p.mist }}>
                {[0, 1, 2, 3].map((k) => (
                  <ellipse key={k} cx={200 + k * 420} cy={H * 0.6 + (k % 2) * 30} rx={300} ry={26} fill="#fff" filter="url(#hero-blur)">
                    <animateTransform attributeName="transform" type="translate" values={`-80 0;80 0;-80 0`} dur={`${26 + k * 6}s`} repeatCount="indefinite" />
                  </ellipse>
                ))}
              </g>
            )}
            {i === 3 && (
              // Night trekkers: headlamps climbing the trail
              <g className="transition-opacity duration-[2000ms]" style={{ opacity: p.lamps }}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
                  <g key={k}>
                    <circle r="16" fill="url(#hero-lamp)" />
                    <circle r="3.2" fill="#FFE7B8" />
                    <animateMotion dur="22s" begin={`${-k * 1.1}s`} repeatCount="indefinite" path={scene.trailD} />
                  </g>
                ))}
              </g>
            )}
            {i === 4 && (
              <g className="transition-[fill] duration-[2000ms]" style={{ fill: p.ridges[4] }}>
                {scene.hikers.map((h, k) => (
                  <g key={k} transform={`translate(${h.x} ${h.y})`}>
                    <circle cy={-h.h - 6} r="5" />
                    <rect x="-4" y={-h.h} width="8" height={h.h} rx="3" />
                    <rect x="-10" y={-h.h + 2} width="7" height="11" rx="2" />
                  </g>
                ))}
              </g>
            )}
          </g>
        ))}
      </svg>

      <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 via-forest-900/10 via-45% to-transparent" />

      {/* Live chips */}
      <div className="container-site relative pt-5 sm:pt-7">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex h-9 items-center gap-2 rounded-full bg-black/25 px-3.5 text-sm font-medium text-white backdrop-blur-md" aria-live="off">
            {isNight ? <Moon size={15} /> : <Sun size={15} />}
            <span className="tabular-nums">{clock ? `${clock} in Pune` : "Pune"}</span>
          </span>
          {next && (
            <Link href={next.href} className="inline-flex h-9 max-w-full items-center gap-2 rounded-full bg-black/25 px-3.5 text-sm font-medium text-white backdrop-blur-md hover:bg-black/35">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sunset-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sunset-400" />
              </span>
              <span className="truncate">
                {next.tripName} leaves in <span className="tabular-nums">{left || "…"}</span>
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Headline */}
      <div className="absolute inset-x-0 bottom-0">
        <div ref={textRef} className="container-site pb-28 lg:pb-36" style={{ willChange: "transform, opacity" }}>
          <h1 className="max-w-4xl text-[2.9rem] font-extrabold leading-[0.98] text-white sm:text-7xl lg:text-[5.5rem]" aria-label={headline}>
            {words.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-1 align-bottom" aria-hidden="true">
                <span className="inline-block animate-rise" style={{ animationDelay: `${150 + i * 90}ms` }}>
                  {w}&nbsp;
                </span>
              </span>
            ))}
          </h1>
          <p className="mt-4 max-w-xl animate-fade-up text-[17px] leading-relaxed text-white/85 [animation-delay:900ms] sm:text-lg">{subheadline}</p>
          <div className="mt-6 flex animate-fade-up flex-wrap gap-3 [animation-delay:1100ms]">
            <Link href="/treks" className="btn-primary px-6">
              Explore trips
            </Link>
            <Link href="/plan-a-trip" className="btn-ghost-light px-6">
              Plan a custom trip
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
