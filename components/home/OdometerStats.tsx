"use client";

/**
 * Stats that roll into place like a vehicle odometer when they scroll into view.
 * The real numbers are in the page from the start (for Google and screen readers).
 */
import { useEffect, useRef, useState } from "react";

type Stat = { value: number; suffix?: string; label: string; decimals?: number };

function Digits({ text, on, delay }: { text: string; on: boolean; delay: number }) {
  return (
    <span className="inline-flex" aria-hidden="true">
      {text.split("").map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i}>{ch}</span>;
        const d = Number(ch);
        return (
          <span key={i} className="relative inline-block h-[1em] w-[0.62em] overflow-hidden leading-none">
            <span
              className="absolute left-0 top-0 flex flex-col transition-transform duration-[1600ms] ease-[cubic-bezier(.2,.8,.2,1)]"
              style={{ transform: `translateY(${on ? -(10 + d) * 5 : 0}%)`, transitionDelay: `${delay + i * 90}ms` }}
            >
              {/* one full spin (0–9) before landing on the digit */}
              {[...Array(10).keys(), ...Array(10).keys()].map((n, k) => (
                <span key={k} className="block h-[1em] text-center">
                  {n}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default function OdometerStats({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDListElement>(null);
  const [on, setOn] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setOn(false);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <dl ref={ref} className="grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:divide-x sm:divide-mountain-200">
      {stats.map((s, idx) => {
        const text = s.decimals ? s.value.toFixed(s.decimals) : Math.round(s.value).toLocaleString("en-IN");
        return (
          <div key={s.label} className="flex flex-col-reverse items-center px-2 text-center">
            <dt className="mt-2 text-[13px] leading-snug text-mountain-500 sm:text-sm">{s.label}</dt>
            <dd className="font-display text-[2.4rem] font-extrabold leading-none tracking-tight text-forest-900 sm:text-5xl">
              <span className="sr-only">
                {text}
                {s.suffix}
              </span>
              <span className="inline-flex items-end">
                <Digits text={text} on={on} delay={idx * 150} />
                <span className="text-sunset-500" aria-hidden="true">
                  {s.suffix}
                </span>
              </span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
