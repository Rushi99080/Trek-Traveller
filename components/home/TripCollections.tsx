"use client";

/** Trip types as tabs, each showing its trips as photo cards */
import { useState } from "react";

export default function TripCollections({ tabs }: { tabs: { key: string; label: string; cards: React.ReactNode[] }[] }) {
  const [sel, setSel] = useState(0);
  const t = tabs[sel];
  return (
    <div>
      <div className="rail gap-2" role="tablist" aria-label="Trip types">
        {tabs.map((tab, i) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={i === sel}
            onClick={() => setSel(i)}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
              i === sel ? "bg-forest-900 text-white" : "bg-mist text-mountain-700 hover:bg-mountain-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div key={t.key} className="rail mt-6 animate-fade-up sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {t.cards}
      </div>
    </div>
  );
}
