// app/admin/users/page.tsx
// Kullanıcılar & Roller — Ceyhun platformu yetki rolü yönetimi. Yalnızca OWNER (users yeteneği).

import prisma from "@/app/lib/prisma";
import Link from "next/link";
import { getCeyhunViewer } from "@/app/lib/ceyhun-auth";
import { can, CEYHUN_ROLE_LABEL, CEYHUN_ROLE_DESC, CEYHUN_ROLES, PANEL_ROLES } from "@/app/lib/ceyhun-roles";
import { PageHeader, Card, EmptyState, AdminForbidden } from "../_ui";
import UserRow, { type UserDTO } from "./UserRow";

export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const gate = await getCeyhunViewer();
  if (!gate || !can(gate.role, "users")) return <AdminForbidden />;
  const me = gate.user;

  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const where = query
    ? {
        OR: [
          { username: { contains: query, mode: "insensitive" as const } },
          { name: { contains: query, mode: "insensitive" as const } },
          { email: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  // Ekip = yönetim yetkisi olan roller (PANEL_ROLES). Üyeler = VIEWER veya rolsüz (herkes).
  const [staff, others] = await Promise.all([
    prisma.user.findMany({
      where: { ...where, ceyhunRole: { in: [...PANEL_ROLES] } },
      select: { id: true, name: true, username: true, email: true, avatarUrl: true, ceyhunRole: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.user.findMany({
      where: { ...where, NOT: { ceyhunRole: { in: [...PANEL_ROLES] } } },
      select: { id: true, name: true, username: true, email: true, avatarUrl: true, ceyhunRole: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const toDTO = (u: (typeof staff)[number]): UserDTO => ({
    id: u.id,
    name: u.name || u.username || "",
    email: u.email || "",
    avatarUrl: u.avatarUrl,
    ceyhunRole: u.ceyhunRole,
  });

  return (
    <div>
      <PageHeader title="Kullanıcılar & Roller" subtitle="Ekip yetkilerini yönet — yetenek tabanlı roller." />

      {/* Rol açıklamaları */}
      <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {CEYHUN_ROLES.map((r) => (
          <div key={r} className="rounded-xl border border-black/5 bg-white p-3 shadow-sm">
            <p className="text-sm font-semibold text-ink">{CEYHUN_ROLE_LABEL[r]}</p>
            <p className="text-xs text-ink/50">{CEYHUN_ROLE_DESC[r]}</p>
          </div>
        ))}
      </div>

      <form className="mb-5" action="/admin/users">
        <input name="q" defaultValue={query} placeholder="İsim, kullanıcı adı veya e-posta ara…"
          className="w-full max-w-md rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-ceyhun-gold" />
      </form>

      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink/60">
        Yetkili ekip <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs">{staff.length}</span>
      </div>
      {staff.length === 0 ? (
        <EmptyState text="Henüz yetki atanmış kullanıcı yok. Aşağıdan rol ver." />
      ) : (
        <Card className="mb-8 !p-0">
          {staff.map((u) => <UserRow key={u.id} user={toDTO(u)} isSelf={u.id === me.id} />)}
        </Card>
      )}

      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink/60">
        {query ? "Arama sonuçları" : "Diğer kullanıcılar"}
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs">{others.length}</span>
      </div>
      {others.length === 0 ? (
        <EmptyState text={query ? "Eşleşen kullanıcı yok." : "Kullanıcı yok."} />
      ) : (
        <Card className="!p-0">
          {others.map((u) => <UserRow key={u.id} user={toDTO(u)} isSelf={u.id === me.id} />)}
        </Card>
      )}

      <p className="mt-6 text-xs text-ink/40">
        Not: Buradaki roller yalnızca Ceyhun yönetim panelini kapsar; kullanıcıların genel uygulama
        rolüne dokunmaz. <Link href="/admin" className="text-ceyhun-gold-deep hover:underline">Panele dön</Link>
      </p>
    </div>
  );
}
