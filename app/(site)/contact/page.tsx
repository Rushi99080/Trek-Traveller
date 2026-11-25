import type { Metadata } from "next";
import { Suspense } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import EnquiryForm from "@/components/EnquiryForm";
import { site, whatsappLink } from "@/site.config";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/SocialIcons";

export const metadata: Metadata = {
  title: "Contact us",
  description: `Call, WhatsApp or email ${site.name}. Office in Pune.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const items = [
    { Icon: Phone, label: "Call", value: site.phone, href: `tel:${site.phone.replace(/[^\d+]/g, "")}` },
    { Icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { Icon: MapPin, label: "Office", value: site.address, href: site.mapsLink },
    { Icon: Clock, label: "Hours", value: site.officeHours },
  ];
  return (
    <div className="container-site pt-8 sm:pt-12">
      <h1 className="text-4xl font-extrabold sm:text-5xl">Contact us</h1>
      <p className="mt-2 text-lg text-mountain-600">The fastest way to reach us is WhatsApp.</p>
      <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn mt-5 bg-[#25D366] text-white hover:bg-[#1fb757]">
        <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
      </a>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <ul className="card divide-y divide-mountain-100">
            {items.map(({ Icon, label, value, href }) => (
              <li key={label} className="flex gap-4 p-4">
                <Icon size={20} className="mt-0.5 shrink-0 text-forest-600" />
                <div>
                  <p className="text-sm text-mountain-500">{label}</p>
                  {href ? (
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="font-semibold text-forest-900 hover:text-forest-600">{value}</a>
                  ) : (
                    <p className="font-semibold text-forest-900">{value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-3">
            {[
              { href: site.instagram, Icon: InstagramIcon, label: "Instagram" },
              { href: site.youtube, Icon: YoutubeIcon, label: "YouTube" },
              { href: site.facebook, Icon: FacebookIcon, label: "Facebook" },
            ].map(({ href, Icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-11 w-11 items-center justify-center rounded-full border border-mountain-200 bg-white text-forest-800 hover:border-forest-400">
                <Icon />
              </a>
            ))}
          </div>
          <div className="mt-6 aspect-[4/3] overflow-hidden rounded-card border border-mountain-100 bg-mountain-100">
            <iframe
              title="Office location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(site.mapEmbedQuery)}&output=embed`}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-bold">Send us a message</h2>
          <Suspense fallback={<div className="card h-96" />}>
            <EnquiryForm variant="contact" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
