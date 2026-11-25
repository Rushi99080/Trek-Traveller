"use client";

import { useRef, useState } from "react";
import Img from "./Img";

/** Swipeable photo gallery on mobile, grid on desktop */
export default function Gallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const pics = images.length ? images : ["/images/trips/hero.svg"];

  return (
    <div>
      {/* Mobile */}
      <div className="relative -mx-4 sm:-mx-6 md:hidden">
        <div
          ref={ref}
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
        >
          {pics.map((src, i) => (
            <div key={i} className="relative aspect-[4/3] w-full shrink-0 snap-center bg-forest-100">
              <Img src={src} alt={`${name} — photo ${i + 1}`} priority={i === 0} sizes="100vw" />
            </div>
          ))}
        </div>
        {pics.length > 1 && (
          <span className="absolute bottom-3 right-4 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
            {index + 1} / {pics.length}
          </span>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden h-[26rem] gap-3 overflow-hidden rounded-card md:grid md:grid-cols-[2fr_1fr] md:grid-rows-2">
        <div className="relative row-span-2 bg-forest-100">
          <Img src={pics[0]} alt={`${name} — photo 1`} priority sizes="66vw" />
        </div>
        {pics.slice(1, 3).map((src, i) => (
          <div key={i} className="relative bg-forest-100">
            <Img src={src} alt={`${name} — photo ${i + 2}`} sizes="33vw" />
          </div>
        ))}
      </div>
    </div>
  );
}
