import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { policies } from "@/data/policies";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = policies[slug];
  return { title: p?.title ?? "Policy", alternates: { canonical: `/policies/${slug}` } };
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params;
  const p = policies[slug];
  if (!p) notFound();
  return (
    <div className="container-site max-w-3xl pt-8 sm:pt-12">
      <nav className="mb-6 flex flex-wrap gap-2 text-sm" aria-label="Policies">
        {Object.entries(policies).map(([k, v]) => (
          <Link key={k} href={`/policies/${k}`} className={`rounded-full px-3 py-1.5 font-medium ${k === slug ? "bg-forest-700 text-white" : "bg-white text-mountain-600 ring-1 ring-mountain-200"}`}>
            {v.title}
          </Link>
        ))}
      </nav>
      <h1 className="text-4xl font-extrabold">{p.title}</h1>
      <p className="mt-3 text-lg text-mountain-600">{p.intro}</p>
      {p.sections.map((s) => (
        <section key={s.heading} className="mt-8">
          <h2 className="text-xl font-bold">{s.heading}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-mountain-700">
            {s.points.map((pt) => <li key={pt}>{pt}</li>)}
          </ul>
        </section>
      ))}
    </div>
  );
}
