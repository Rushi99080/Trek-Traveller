import type { Metadata } from "next";
import { Suspense } from "react";
import { Building2, GraduationCap, Users } from "lucide-react";
import EnquiryForm from "@/components/EnquiryForm";

export const metadata: Metadata = {
  title: "Plan a custom trip — corporate offsites, college and family trips",
  description: "Tell us your group size, dates and budget. We plan treks, camping and tours for companies, colleges, friends and families from Pune and Mumbai.",
  alternates: { canonical: "/plan-a-trip" },
};

const who = [
  { Icon: Building2, title: "Corporate teams", text: "Offsites, team outings and leadership treks with activities, stays and invoices sorted." },
  { Icon: GraduationCap, title: "Colleges & schools", text: "Safe, supervised group treks and camps with clear permissions and first aid." },
  { Icon: Users, title: "Friends & families", text: "Private trips on your dates, at your pace, to any of our destinations or a new one." },
];

export default function PlanTripPage() {
  return (
    <div className="container-site pt-8 sm:pt-12">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">Plan a custom trip</h1>
          <p className="mt-3 text-lg leading-relaxed text-mountain-600">
            Your group, your dates, your budget. Fill this in and we&apos;ll send a plan and a quote within one working day.
          </p>
          <ul className="mt-8 space-y-5">
            {who.map(({ Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-700"><Icon size={22} /></span>
                <div>
                  <h2 className="font-display text-lg font-semibold">{title}</h2>
                  <p className="text-[15px] leading-relaxed text-mountain-600">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <Suspense fallback={<div className="card h-[32rem]" />}>
          <EnquiryForm variant="custom" />
        </Suspense>
      </div>
    </div>
  );
}
