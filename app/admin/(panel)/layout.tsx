import type { Metadata } from "next";
import Link from "next/link";
import { LogOut } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import { isSupabaseConfigured } from "@/lib/data";
import { logoutAction } from "../actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const demo = !isSupabaseConfigured();
  return (
    <div className="flex min-h-screen bg-mist">
      <AdminNav />
      <div className="min-w-0 flex-1 pb-24 lg:pb-10">
        <header className="no-print flex items-center justify-between border-b border-mountain-100 bg-white px-4 py-3 lg:hidden">
          <Link href="/admin" className="font-display text-lg font-bold text-forest-800">Admin</Link>
          <form action={logoutAction}>
            <button className="flex items-center gap-1.5 text-sm text-mountain-600"><LogOut size={16} /> Log out</button>
          </form>
        </header>
        {demo && (
          <p className="no-print border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 lg:px-8">
            Demo mode: showing sample data. Changes are temporary until you connect Supabase (see README).
          </p>
        )}
        <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  );
}
