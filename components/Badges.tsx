import type { Difficulty, DisplayStatus } from "@/lib/types";
import { cn, statusClasses } from "@/lib/format";

const peaks: Record<Difficulty, number> = { Easy: 1, Moderate: 2, Difficult: 3 };
const tone: Record<Difficulty, string> = {
  Easy: "bg-forest-50 text-forest-700",
  Moderate: "bg-sunset-50 text-sunset-700",
  Difficult: "bg-red-50 text-red-700",
};

/** Difficulty shown as 1, 2 or 3 small peaks */
export function DifficultyBadge({ level, className }: { level: Difficulty; className?: string }) {
  const n = peaks[level] ?? 1;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", tone[level], className)}>
      <svg viewBox="0 0 30 10" className="h-2.5 w-[1.4rem]" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${i * 10} 10 L${i * 10 + 5} 1 L${i * 10 + 10} 10 Z`} fill="currentColor" opacity={i < n ? 1 : 0.22} />
        ))}
      </svg>
      {level}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: DisplayStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", statusClasses(status), className)}>
      {status}
    </span>
  );
}
