import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container-site py-24 text-center">
        <p className="font-display text-6xl font-extrabold text-forest-200">404</p>
        <h1 className="mt-4 text-3xl font-bold">This trail doesn&apos;t exist</h1>
        <p className="mt-2 text-mountain-600">The page may have moved, or the trip is no longer running.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/treks" className="btn-primary">See all trips</Link>
          <Link href="/" className="btn-outline">Go home</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
