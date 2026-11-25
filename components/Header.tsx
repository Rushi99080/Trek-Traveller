"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, Search, X } from "lucide-react";
import Logo from "./Logo";
import { site } from "@/site.config";

const links = [
  { href: "/", label: "Home", exact: true },
  { href: "/treks", label: "All trips" },
  { href: "/plan-a-trip", label: "Custom trips" },
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
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <header className="no-print sticky top-0 z-40 h-16 border-b border-mountain-100/70 bg-white/95 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label={`${site.name} home`}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 rounded-full bg-mist p-1 ring-1 ring-mountain-100 lg:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive(l.href, l.exact) ? "bg-white text-forest-900 shadow-sm" : "text-mountain-600 hover:text-forest-900"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/treks" aria-label="Search trips" className="hidden h-11 w-11 items-center justify-center rounded-full bg-mist text-forest-900 ring-1 ring-mountain-100 hover:bg-mountain-100 sm:flex">
            <Search size={18} />
          </Link>
          <Link href="/treks" className="hidden rounded-full bg-sunset-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-sunset-600 lg:inline-flex">
            Book a trip
          </Link>
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full bg-mist text-forest-900 ring-1 ring-mountain-100 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col bg-white px-4 pb-8 pt-4 lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="border-b border-mountain-100 py-4 text-2xl font-bold text-forest-900">
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
