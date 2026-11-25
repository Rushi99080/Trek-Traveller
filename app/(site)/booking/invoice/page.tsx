import type { Metadata } from "next";
import { Suspense } from "react";
import Invoice from "@/components/booking/Invoice";

export const metadata: Metadata = { title: "Invoice", robots: { index: false } };

export default function InvoicePage() {
  return (
    <div className="container-site py-8 print:py-0">
      <Suspense fallback={<div className="card mx-auto h-96 max-w-3xl" />}>
        <Invoice />
      </Suspense>
    </div>
  );
}
