"use client";

import { useState } from "react";
import { Check } from "lucide-react";

/** Tick-off packing list */
export default function CarryChecklist({ items }: { items: string[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setDone((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item, i) => {
        const on = done.has(i);
        return (
          <li key={i}>
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={on}
              className="flex w-full items-start gap-3 rounded-xl border border-mountain-100 bg-white p-3 text-left text-[15px] hover:border-forest-300"
            >
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${on ? "border-forest-600 bg-forest-600 text-white" : "border-mountain-300"}`}>
                {on && <Check size={14} strokeWidth={3} />}
              </span>
              <span className={on ? "text-mountain-400 line-through" : "text-mountain-700"}>{item}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
