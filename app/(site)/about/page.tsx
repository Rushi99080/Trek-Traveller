import type { Metadata } from "next";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { getLeaders } from "@/lib/data";
import { site } from "@/site.config";
import Img from "@/components/Img";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About us",
  description: `The story, team and safety standards behind ${site.name}.`,
  alternates: { canonical: "/about" },
};

const safety = [
  "Trained trek leaders on every trip, with one at the front and one at the back",
  "First aid kit on every trip; oxygen and oximeter on Himalayan treks",
  "Safety briefing before every climb",
  "Leader-to-traveller ratio of [1:12] on treks",
  "Weather and trail checks before departure; we cancel if it isn't safe",
  "Women-friendly groups with separate sharing on request",
];

export default async function AboutPage() {
  const leaders = await getLeaders();
  return (
    <>
      <div className="relative h-64 overflow-hidden bg-forest-900 sm:h-80">
        <Img src="/images/trips/kalsubai-night-trek-2.svg" alt="A group of trekkers on a Sahyadri ridge at sunrise" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 to-transparent" />
        <div className="container-site relative flex h-full items-end pb-8">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">About {site.name}</h1>
        </div>
      </div>

      <div className="container-site mt-12 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="section-title">Our story</h2>
          <div className="prose-trip mt-4">
            <p>[Write 2–3 short paragraphs: how the company started, who started it, and the first trek you ran. Mention how many years you&apos;ve been running trips from Pune.]</p>
            <p>[What makes your trips different: the people, the food, the way you look after first-timers and solo travellers.]</p>
          </div>
        </section>
        <section>
          <h2 className="section-title">Our mission</h2>
          <p className="mt-4 text-lg leading-relaxed text-mountain-700">
            [One or two sentences. For example: To get more people out to the Sahyadris and the Himalayas safely, and to make sure nobody who wants to go has to stay home because they have no one to go with.]
          </p>
        </section>
      </div>

      <section className="container-site mt-16">
        <h2 className="section-title">Team & trek leaders</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leaders.map((l) => (
            <li key={l.id} className="card flex gap-4 p-5">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest-100 text-forest-600">
                {l.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.photo} alt={l.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <UserRound size={30} />
                )}
              </span>
              <div>
                <p className="font-semibold text-forest-900">{l.name}</p>
                {l.experience && <p className="text-sm font-medium text-sunset-700">{l.experience}</p>}
                {l.bio && <p className="mt-1 text-sm leading-relaxed text-mountain-600">{l.bio}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-site mt-16">
        <div className="rounded-card bg-forest-800 p-6 text-white sm:p-10">
          <h2 className="section-title text-white">Safety standards</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {safety.map((s) => (
              <li key={s} className="flex gap-3 text-forest-100">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sunset-400" /> {s}
              </li>
            ))}
          </ul>
          <Link href="/policies/safety" className="btn-ghost-light mt-6">Read our safety guidelines</Link>
        </div>
      </section>
    </>
  );
}
