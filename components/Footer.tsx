import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";
import { site, whatsappLink } from "@/site.config";
import { categories } from "@/data/content";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "./SocialIcons";
import { WhatsAppIcon } from "./WhatsAppButton";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="no-print mt-20 bg-forest-900 text-forest-100">
      <div className="container-site grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-forest-200">{site.description}</p>
          <div className="mt-5 flex gap-3">
            {[
              { href: site.instagram, label: "Instagram", Icon: InstagramIcon },
              { href: site.youtube, label: "YouTube", Icon: YoutubeIcon },
              { href: site.facebook, label: "Facebook", Icon: FacebookIcon },
            ].map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <Icon />
              </a>
            ))}
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
              <WhatsAppIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display text-base font-semibold text-white">Trips</h3>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            {categories.slice(0, 7).map((c) => (
              <li key={c.slug}>
                <Link href={`/treks?type=${c.slug}`} className="text-forest-200 hover:text-white">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base font-semibold text-white">Company</h3>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            <li><Link href="/about" className="text-forest-200 hover:text-white">About us</Link></li>
            <li><Link href="/plan-a-trip" className="text-forest-200 hover:text-white">Plan a custom trip</Link></li>
            <li><Link href="/plan-a-trip?type=Corporate" className="text-forest-200 hover:text-white">Corporate trips</Link></li>
            <li><Link href="/contact" className="text-forest-200 hover:text-white">Contact</Link></li>
            <li><a href={site.whatsappCommunity} target="_blank" rel="noopener noreferrer" className="text-forest-200 hover:text-white">WhatsApp community</a></li>
          </ul>
          <h3 className="mt-8 font-display text-base font-semibold text-white">Policies</h3>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            <li><Link href="/policies/terms" className="text-forest-200 hover:text-white">Terms & conditions</Link></li>
            <li><Link href="/policies/privacy" className="text-forest-200 hover:text-white">Privacy policy</Link></li>
            <li><Link href="/policies/cancellation-refund" className="text-forest-200 hover:text-white">Cancellation & refund</Link></li>
            <li><Link href="/policies/safety" className="text-forest-200 hover:text-white">Safety guidelines</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base font-semibold text-white">Get in touch</h3>
          <ul className="mt-4 space-y-3 text-[15px] text-forest-200">
            <li className="flex gap-2.5">
              <Phone size={18} className="mt-0.5 shrink-0" />
              <a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white">{site.phone}</a>
            </li>
            <li className="flex gap-2.5">
              <Mail size={18} className="mt-0.5 shrink-0" />
              <a href={`mailto:${site.email}`} className="break-all hover:text-white">{site.email}</a>
            </li>
            <li className="flex gap-2.5">
              <MapPin size={18} className="mt-0.5 shrink-0" />
              <a href={site.mapsLink} target="_blank" rel="noopener noreferrer" className="hover:text-white">{site.address}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-2 pb-24 pt-5 text-sm text-forest-300 sm:flex-row sm:justify-between lg:pb-5">
          <p>© {year} {site.legalName}. All rights reserved.</p>
          <p>GSTIN: {site.gstin}</p>
        </div>
      </div>
    </footer>
  );
}
