"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, UserRound } from "lucide-react";
import type { Leader } from "@/lib/types";
import { deleteLeaderAction, saveLeaderAction } from "@/app/admin/actions";

const empty: Leader = { id: "", name: "", phone: "", photo: "", bio: "", experience: "" };

export default function LeadersEditor({ leaders }: { leaders: Leader[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Leader | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const save = () =>
    start(async () => {
      if (!editing) return;
      const res = await saveLeaderAction(editing);
      if (!res.ok) return setError(res.error || "Couldn't save");
      setEditing(null);
      setError("");
      router.refresh();
    });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
      <ul className="grid gap-3 sm:grid-cols-2">
        {leaders.map((l) => (
          <li key={l.id} className="card flex gap-3 p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest-100 text-forest-600">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {l.photo ? <img src={l.photo} alt="" className="h-full w-full object-cover" /> : <UserRound size={24} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{l.name}</p>
              <p className="text-sm text-mountain-500">{l.experience}</p>
              <div className="mt-2 flex gap-3 text-sm">
                <button type="button" onClick={() => setEditing(l)} className="font-semibold text-forest-700">Edit</button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remove ${l.name}?`)) start(async () => { await deleteLeaderAction(l.id); router.refresh(); });
                  }}
                  className="text-mountain-400 hover:text-red-600"
                  aria-label="Remove leader"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </li>
        ))}
        <li>
          <button type="button" onClick={() => setEditing({ ...empty })} className="flex h-full min-h-24 w-full items-center justify-center gap-2 rounded-card border-2 border-dashed border-mountain-200 font-semibold text-mountain-500 hover:border-forest-400">
            <Plus size={18} /> Add trek leader
          </button>
        </li>
      </ul>

      {editing && (
        <div className="card h-fit space-y-3 p-5">
          <h2 className="text-lg font-bold">{editing.id ? "Edit leader" : "New leader"}</h2>
          {(["name", "phone", "experience", "photo"] as const).map((k) => (
            <label key={k} className="block">
              <span className="label">{{ name: "Name", phone: "Phone (not shown on website)", experience: "Experience, e.g. 8 years, 300+ treks", photo: "Photo link (https://…)" }[k]}</span>
              <input className="input" value={editing[k] ?? ""} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} />
            </label>
          ))}
          <label className="block">
            <span className="label">Short bio</span>
            <textarea className="input" rows={3} value={editing.bio ?? ""} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={pending} className="btn-primary">{pending ? "Saving…" : "Save"}</button>
            <button type="button" onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
