"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import Logo from "./Logo";
import TrailProgress from "./TrailProgress";
import { site } from "@/site.config";

const links = [
  { href: "/treks", label: "All trips" },
  { href: "/plan-a-trip", label: "Plan a custom trip" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-mountain-100 bg-mist/95 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label={`${site.name} home`}>
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-[15px] font-medium transition-colors hover:text-forest-600 ${
                pathname.startsWith(l.href) ? "text-forest-700" : "text-mountain-600"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/treks" className="btn-primary py-2.5">
            Book a trip
          </Link>
        </nav>
        <button
          className="-mr-2 rounded-full p-2 text-forest-800 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>
      <TrailProgress />

      {open && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col bg-mist px-4 pb-8 pt-4 md:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="border-b border-mountain-100 py-4 font-display text-2xl font-semibold text-forest-900">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto grid gap-3">
            <Link href="/treks" className="btn-primary w-full">
              Book a trip
            </Link>
            <a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className="btn-outline w-full">
              <Phone size={18} /> Call {site.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
