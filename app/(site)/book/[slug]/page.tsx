import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTripBySlug, getTrips } from "@/lib/data";
import { isRazorpayConfigured } from "@/lib/razorpay";
import BookingWizard from "@/components/booking/BookingWizard";

export const revalidate = 30;
type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const trips = await getTrips();
  return trips.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  return { title: trip ? `Book ${trip.name}` : "Book a trip", robots: { index: false } };
}

export default async function BookPage({ params }: Props) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) notFound();

  return (
    <div className="container-site pb-28 pt-6 sm:pt-10">
      <Link href={`/treks/${trip.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-mountain-600 hover:text-forest-700">
        <ArrowLeft size={16} /> {trip.name}
      </Link>
      <h1 className="mb-6 mt-2 text-3xl font-extrabold sm:text-4xl">Book your seat</h1>
      <Suspense fallback={<div className="h-96" />}>
        <BookingWizard trip={trip} testMode={!isRazorpayConfigured()} />
      </Suspense>
    </div>
  );
}
