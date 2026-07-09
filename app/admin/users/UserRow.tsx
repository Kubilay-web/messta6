"use client";

// app/admin/users/UserRow.tsx
// Tek kullanıcı: Ceyhun yetki rolünü (OWNER / VIEWER) değiştirir.

import { useState, useTransition } from "react";
import { updateUserCeyhunRole } from "../ceyhun-actions";
import { CEYHUN_ROLE_LABEL, type CeyhunRole } from "@/app/lib/ceyhun-roles";

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  ceyhunRole: string | null;
};

// İki rol. Rolsüz (null) kullanıcılar da üye (VIEWER) olarak gösterilir.
const ORDER: CeyhunRole[] = ["VIEWER", "OWNER"];
const LABEL: Record<string, string> = { ...CEYHUN_ROLE_LABEL };

const TONE: Record<string, string> = {
  VIEWER: "bg-blue-100 text-blue-700",
  OWNER: "bg-green-100 text-green-700",
};

export default function UserRow({ user, isSelf }: { user: UserDTO; isSelf: boolean }) {
  const [role, setRole] = useState<CeyhunRole>((user.ceyhunRole as CeyhunRole) || "VIEWER");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const change = (next: CeyhunRole) => {
    if (next === role) return;
    const prev = role;
    setRole(next);
    setErr(null);
    start(async () => {
      const res = await updateUserCeyhunRole(user.id, next);
      if (!res.ok) {
        setRole(prev);
        setErr(res.message ?? "Hata");
      }
    });
  };

  return (
    <div className="flex flex-col gap-3 border-b border-black/5 px-4 py-3.5 last:border-0 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ceyhun-ink text-xs font-bold text-ceyhun-gold">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            (user.name || user.email || "?").slice(0, 2).toUpperCase()
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {user.name || "—"}
            {isSelf && <span className="ml-2 rounded bg-ceyhun-gold px-1.5 py-0.5 text-[10px] font-bold text-ceyhun-ink">sen</span>}
          </p>
          <p className="truncate text-xs text-ink/40">{user.email}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className={`hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline ${TONE[role]}`}>{LABEL[role]}</span>
        <select
          value={role}
          disabled={pending}
          onChange={(e) => change(e.target.value as CeyhunRole)}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceyhun-gold disabled:opacity-60"
        >
          {ORDER.map((r) => (
            <option key={r} value={r}>{LABEL[r]}</option>
          ))}
        </select>
      </div>
      {err && <span className="text-xs text-red-600 sm:ml-2">{err}</span>}
    </div>
  );
}
