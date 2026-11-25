import type { Metadata } from "next";
import { Suspense } from "react";
import { getTrips } from "@/lib/data";
import TripsBrowser from "@/components/TripsBrowser";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All trips — treks, camping and backpacking from Pune & Mumbai",
  description:
    "Browse upcoming weekend treks, night treks, fort treks, monsoon treks, camping, backpacking and Himalayan treks. Filter by date, difficulty, price and pickup city.",
  alternates: { canonical: "/treks" },
};

export default async function TripsPage() {
  const trips = await getTrips();
  return (
    <div className="container-site pt-8 sm:pt-12">
      <h1 className="text-4xl font-extrabold sm:text-5xl">All trips</h1>
      <p className="mt-2 max-w-2xl text-lg text-mountain-600">
        Upcoming departures from Pune and Mumbai. Pick a date, choose your pickup, and you&apos;re in.
      </p>
      <div className="mt-6">
        <Suspense fallback={<div className="h-96" />}>
          <TripsBrowser trips={trips} />
        </Suspense>
      </div>
    </div>
  );
}
