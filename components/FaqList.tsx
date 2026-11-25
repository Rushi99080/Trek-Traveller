import { ChevronDown } from "lucide-react";

export default function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-mountain-100 rounded-card border border-mountain-100 bg-white">
      {items.map((f) => (
        <details key={f.q} className="group px-5">
          <summary className="flex items-center justify-between gap-4 py-4 text-left font-semibold text-forest-900">
            {f.q}
            <ChevronDown size={20} className="shrink-0 text-mountain-400 transition-transform group-open:rotate-180" />
          </summary>
          <p className="-mt-1 pb-5 leading-relaxed text-mountain-600">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
