"use client";

/** Flag planted on a summit with a burst of confetti — shown when a booking is confirmed */
const COLORS = ["#EE6A1F", "#FBA067", "#F3EFE2", "#82AE93", "#FFD27A"];
const pieces = Array.from({ length: 26 }, (_, i) => {
  const a = (i / 26) * Math.PI * 2;
  const dist = 60 + ((i * 37) % 70);
  return {
    dx: Math.round(Math.cos(a) * dist),
    dy: Math.round(Math.sin(a) * dist * 0.7 + 40),
    rot: ((i * 83) % 360) + 180,
    color: COLORS[i % COLORS.length],
    delay: (i % 6) * 40,
    w: 5 + (i % 3) * 2,
  };
});

export default function SummitCelebration() {
  return (
    <div className="relative mx-auto h-24 w-40" aria-hidden="true">
      <svg viewBox="0 0 160 96" className="absolute inset-0 h-full w-full overflow-visible">
        <path d="M10 96 L58 40 L72 54 L86 30 L150 96 Z" fill="#F3EFE2" opacity=".14" />
        <path d="M86 30 L98 44 L92 42 L86 48 L80 41 L76 44 Z" fill="#F3EFE2" opacity=".5" />
        <g className="animate-flag-up">
          <path d="M86 30 V2" stroke="#F3EFE2" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M86 3 l24 6 l-24 7 z" fill="#EE6A1F" className="animate-flag-wave" style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }} />
        </g>
      </svg>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute left-[54%] top-[8%] block animate-confetti rounded-[1px]"
          style={
            {
              width: p.w,
              height: p.w * 1.6,
              background: p.color,
              animationDelay: `${600 + p.delay}ms`,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              "--rot": `${p.rot}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
