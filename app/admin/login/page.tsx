import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import Logo from "@/components/Logo";
import { adminPassword } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Admin login", robots: { index: false } };
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const demo = !process.env.ADMIN_PASSWORD && adminPassword() === "admin";
  return (
    <div className="flex min-h-screen items-center justify-center bg-mist p-4">
      <div className="card w-full max-w-sm p-7">
        <Logo />
        <h1 className="mt-6 text-2xl font-bold">Admin login</h1>
        {demo && <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Demo mode: the password is <strong>admin</strong>. Set ADMIN_PASSWORD before going live.</p>}
        <LoginForm />
      </div>
    </div>
  );
}
