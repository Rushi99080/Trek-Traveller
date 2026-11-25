"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { dateRange, inr, longDate } from "@/lib/format";
import { site } from "@/site.config";
import PrintButton from "../PrintButton";
import { useBooking } from "./useBooking";

/** GST invoice (Tax Invoice) for a paid booking */
export default function Invoice() {
  const id = useSearchParams().get("id");
  const { data, state } = useBooking(id);

  if (state === "loading") return <div className="card h-96 animate-pulse" />;
  if (!data || (data.booking.paymentStatus !== "paid" && data.booking.paymentStatus !== "advance")) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-bold">Invoice not available</h1>
        <p className="mt-2 text-mountain-600">Invoices are available once a payment has been received.</p>
      </div>
    );
  }

  const b = data.booking;
  const rate = site.gstRate;
  // Tax is calculated on the amount actually paid so far
  const paid = b.amountPaid;
  const taxable = paid / (1 + rate / 100); // amounts charged always include GST
  const tax = paid - taxable;
  const half = tax / 2;
  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-5 flex items-center justify-between gap-3">
        <Link href={`/booking?id=${b.id}`} className="font-semibold text-forest-700">Back to booking</Link>
        <PrintButton label="Download PDF" />
      </div>
      <article className="rounded-card bg-white p-6 text-sm ring-1 ring-mountain-100 sm:p-10 print:p-0 print:ring-0">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-mountain-200 pb-5">
          <div>
            <p className="font-display text-xl font-bold text-forest-900">{site.legalName}</p>
            <p className="mt-1 max-w-xs text-mountain-600">{site.address}</p>
            <p className="text-mountain-600">GSTIN: {site.gstin}</p>
            <p className="text-mountain-600">{site.phone} | {site.email}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-bold text-forest-800">Tax Invoice</p>
            <p className="mt-1">Invoice no: <strong>{b.bookingCode}</strong></p>
            <p>Date: {longDate(b.createdAt.slice(0, 10))}</p>
            <p>Place of supply: {site.stateName} ({site.stateCode})</p>
          </div>
        </header>

        <section className="mt-5">
          <p className="text-mountain-500">Billed to</p>
          <p className="font-semibold">{b.contactName}</p>
          <p>{b.contactPhone}{b.contactEmail ? ` | ${b.contactEmail}` : ""}</p>
        </section>

        <table className="mt-6 w-full text-left">
          <thead>
            <tr className="border-y border-mountain-200 text-mountain-600">
              <th className="py-2 pr-2 font-semibold">Description</th>
              <th className="py-2 pr-2 font-semibold">SAC</th>
              <th className="py-2 pr-2 text-right font-semibold">Qty</th>
              <th className="py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-mountain-100 align-top">
              <td className="py-3 pr-2">
                <p className="font-semibold">{b.tripName}</p>
                <p className="text-mountain-500">{dateRange(b.batchStart, b.batchEnd)}, pickup: {b.pickup}{b.stayOption ? `, ${b.stayOption}` : ""}</p>
              </td>
              <td className="py-3 pr-2">998555</td>
              <td className="py-3 pr-2 text-right">{b.travellersCount}</td>
              <td className="whitespace-nowrap py-3 text-right">{fmt(b.baseAmount)}</td>
            </tr>
            {b.groupDiscount > 0 && (
              <tr className="border-b border-mountain-100"><td className="py-2" colSpan={3}>Group discount</td><td className="whitespace-nowrap py-2 text-right">− {fmt(b.groupDiscount)}</td></tr>
            )}
            {b.couponDiscount > 0 && (
              <tr className="border-b border-mountain-100"><td className="py-2" colSpan={3}>Coupon {b.couponCode}</td><td className="whitespace-nowrap py-2 text-right">− {fmt(b.couponDiscount)}</td></tr>
            )}
            <tr className="border-b border-mountain-200 font-semibold"><td className="py-2" colSpan={3}>Trip total (incl. GST)</td><td className="whitespace-nowrap py-2 text-right">{fmt(b.totalAmount)}</td></tr>
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <dl className="w-full max-w-xs space-y-1.5">
            <div className="flex justify-between"><dt>Amount received</dt><dd className="font-semibold">{fmt(paid)}</dd></div>
            <div className="flex justify-between text-mountain-600"><dt>Taxable value</dt><dd>{fmt(taxable)}</dd></div>
            <div className="flex justify-between text-mountain-600"><dt>CGST @ {rate / 2}%</dt><dd>{fmt(half)}</dd></div>
            <div className="flex justify-between text-mountain-600"><dt>SGST @ {rate / 2}%</dt><dd>{fmt(half)}</dd></div>
            {b.totalAmount > paid && (
              <div className="flex justify-between border-t border-mountain-200 pt-1.5"><dt>Balance due</dt><dd className="font-semibold">{inr(b.totalAmount - paid)}</dd></div>
            )}
          </dl>
        </div>

        <footer className="mt-10 border-t border-mountain-200 pt-4 text-xs text-mountain-500">
          <p>Payment ID: {b.razorpayPaymentId || "—"}. This is a computer-generated invoice and does not need a signature.</p>
          <p className="mt-1">SAC 998555: Tour operator services. {site.legalName}, PAN {site.pan}.</p>
        </footer>
      </article>
    </div>
  );
}
