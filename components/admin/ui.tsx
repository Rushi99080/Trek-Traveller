import type { BookingStatus, EnquiryStatus, PaymentStatus } from "@/lib/types";

export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

const payTone: Record<PaymentStatus, string> = {
  paid: "bg-forest-50 text-forest-700 ring-forest-200",
  advance: "bg-sky-50 text-sky-800 ring-sky-200",
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  refunded: "bg-mountain-100 text-mountain-600 ring-mountain-200",
  failed: "bg-red-50 text-red-700 ring-red-200",
};
const payLabel: Record<PaymentStatus, string> = { paid: "Paid", advance: "Advance", pending: "Pending", refunded: "Refunded", failed: "Failed" };

export function PaymentPill({ s }: { s: PaymentStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${payTone[s]}`}>{payLabel[s]}</span>;
}

const bookTone: Record<BookingStatus, string> = {
  confirmed: "text-forest-700",
  pending: "text-amber-700",
  waitlist: "text-sky-700",
  cancelled: "text-mountain-400 line-through",
};
export function BookingStatusText({ s }: { s: BookingStatus }) {
  return <span className={`text-xs font-semibold capitalize ${bookTone[s]}`}>{s}</span>;
}

export const enquiryStatuses: { key: EnquiryStatus; label: string; tone: string }[] = [
  { key: "new", label: "New", tone: "bg-sunset-50 text-sunset-700 ring-sunset-200" },
  { key: "contacted", label: "Contacted", tone: "bg-sky-50 text-sky-800 ring-sky-200" },
  { key: "quoted", label: "Quoted", tone: "bg-violet-50 text-violet-800 ring-violet-200" },
  { key: "confirmed", label: "Confirmed", tone: "bg-forest-50 text-forest-700 ring-forest-200" },
  { key: "lost", label: "Lost", tone: "bg-mountain-100 text-mountain-600 ring-mountain-200" },
];

export function FillBar({ booked, total }: { booked: number; total: number }) {
  const pct = total ? Math.min(100, Math.round((booked / total) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-mountain-100">
        <div className={`h-full rounded-full ${pct >= 100 ? "bg-sunset-500" : pct >= 75 ? "bg-amber-500" : "bg-forest-500"}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-mountain-600">{booked}/{total}</span>
    </div>
  );
}
