"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, ExternalLink, Inbox, LayoutDashboard, LogOut, Map, UserRound } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";

const items = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/trips", label: "Trips & batches", Icon: Map },
  { href: "/admin/bookings", label: "Bookings", Icon: CalendarCheck },
  { href: "/admin/enquiries", label: "Enquiries", Icon: Inbox },
  { href: "/admin/leaders", label: "Trek leaders", Icon: UserRound },
];

export default function AdminNav() {
  const pathname = usePathname();
  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="no-print hidden w-60 shrink-0 flex-col border-r border-mountain-100 bg-white p-4 lg:flex">
        <p className="px-3 font-display text-lg font-bold text-forest-800">Admin</p>
        <nav className="mt-4 flex flex-col gap-1">
          {items.map(({ href, label, Icon, exact }) => (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium ${active(href, exact) ? "bg-forest-50 text-forest-800" : "text-mountain-600 hover:bg-mountain-50"}`}>
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-1">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] text-mountain-600 hover:bg-mountain-50">
            <ExternalLink size={18} /> View website
          </Link>
          <form action={logoutAction}>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] text-mountain-600 hover:bg-mountain-50">
              <LogOut size={18} /> Log out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile tabs */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-mountain-100 bg-white lg:hidden">
        {items.map(({ href, label, Icon, exact }) => (
          <Link key={href} href={href} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${active(href, exact) ? "text-forest-700" : "text-mountain-500"}`}>
            <Icon size={20} /> {label.split(" ")[0]}
          </Link>
        ))}
      </nav>
    </>
  );
}
