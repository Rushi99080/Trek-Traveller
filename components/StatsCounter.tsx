"use client";

import { useEffect, useRef, useState } from "react";

type Stat = { value: number; suffix?: string; label: string; decimals?: number };

/** Numbers that count up once when they scroll into view */
export default function StatsCounter({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDListElement>(null);
  // Real numbers are rendered first (for Google and slow phones), then
  // animated once when the section scrolls into view.
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setProgress(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1400);
          setProgress(1 - Math.pow(1 - t, 3));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <dl ref={ref} className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
      {stats.map((s) => {
        const v = s.value * progress;
        const shown = s.decimals ? v.toFixed(s.decimals) : Math.round(v).toLocaleString("en-IN");
        return (
          <div key={s.label} className="flex flex-col-reverse">
            <dt className="mt-1 text-[15px] text-forest-200">{s.label}</dt>
            <dd className="font-display text-4xl font-bold tabular-nums text-white sm:text-5xl">
              {shown}
              <span className="text-sunset-300">{s.suffix}</span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
