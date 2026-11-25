"use client";

import { useEffect, useRef } from "react";

/** A little trekker that walks along a trail under the header as you scroll */
export default function TrailProgress() {
  const bar = useRef<HTMLDivElement>(null);
  const hiker = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      if (hiker.current) {
        hiker.current.style.left = `calc(${(p * 100).toFixed(2)}% - ${(p * 18).toFixed(1)}px)`;
        hiker.current.style.opacity = p > 0.005 ? "1" : "0";
        hiker.current.dataset.step = String(Math.floor(window.scrollY / 40) % 2);
      }
    };
    const on = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-0 -bottom-px h-[3px]" aria-hidden="true">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(91,102,112,.25)_0_6px,transparent_6px_11px)]" />
      <div ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-sunset-500" />
      <div ref={hiker} className="group absolute -top-[17px] h-[18px] w-[18px] opacity-0 transition-opacity" data-step="0">
        <svg viewBox="0 0 18 18" className="h-full w-full text-forest-800">
          <circle cx="10" cy="3" r="2.2" fill="currentColor" />
          <rect x="8.3" y="5.4" width="3.6" height="6.4" rx="1.4" fill="currentColor" />
          <rect x="5.2" y="6" width="3" height="4.6" rx="1" fill="#EE6A1F" />
          <path className="group-data-[step=0]:hidden" d="M9.2 11.5 7.6 17M11 11.5l2 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path className="group-data-[step=1]:hidden" d="M9.6 11.5 9 17M10.8 11.5l.4 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M12.5 7.5 15.5 17" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
