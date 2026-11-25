"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ label = "Save as PDF / Print" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn-forest no-print">
      <Printer size={18} /> {label}
    </button>
  );
}
