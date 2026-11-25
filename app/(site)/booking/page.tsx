import type { Metadata } from "next";
import { Suspense } from "react";
import BookingConfirmation from "@/components/booking/BookingConfirmation";

export const metadata: Metadata = { title: "Your booking", robots: { index: false } };

export default function BookingPage() {
  return (
    <div className="container-site py-8 sm:py-12">
      <Suspense fallback={<div className="card mx-auto h-80 max-w-2xl" />}>
        <BookingConfirmation />
      </Suspense>
    </div>
  );
}
