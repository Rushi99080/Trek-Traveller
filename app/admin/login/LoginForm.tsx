"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="mt-5 space-y-4">
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" className="input" required autoFocus />
      </div>
      {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-forest w-full">{pending ? "Checking…" : "Log in"}</button>
    </form>
  );
}
