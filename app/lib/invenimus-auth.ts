// app/lib/invenimus-auth.ts
// Invenimus admin paneli yetkilendirmesi. Rol Prisma enum'ından (InvenimusRole) gelir
// ve hiyerarşiktir: ADMIN > EDITOR > VIEWER.
//  - VIEWER : salt görüntüleme
//  - EDITOR : içerik (CMS/kadro) + gelen başvuruların yönetimi
//  - ADMIN  : yukarıdakiler + kullanıcı & rol yönetimi
// Guard'lar hem sunucu bileşenlerinde (layout/sayfa) hem server action'larda kullanılır.

import { redirect } from "next/navigation";
import { validateRequest } from "@/app/auth";

export type InvenimusRole = "ADMIN" | "EDITOR" | "VIEWER";

export const INVENIMUS_ROLE_RANK: Record<InvenimusRole, number> = {
  VIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
};

export const INVENIMUS_ROLE_LABEL: Record<InvenimusRole, string> = {
  ADMIN: "Yönetici",
  EDITOR: "Editör",
  VIEWER: "İzleyici",
};

// role, en az `min` seviyesinde mi? (tip daraltması ile birlikte)
export function hasInvenimusRole(
  role: string | null | undefined,
  min: InvenimusRole
): role is InvenimusRole {
  if (!role || !(role in INVENIMUS_ROLE_RANK)) return false;
  return INVENIMUS_ROLE_RANK[role as InvenimusRole] >= INVENIMUS_ROLE_RANK[min];
}

export function isInvenimusRole(v: unknown): v is InvenimusRole {
  return v === "ADMIN" || v === "EDITOR" || v === "VIEWER";
}

// Panele erişimi olan kullanıcıyı döndürür (herhangi bir Invenimus rolü).
// Erişim yoksa null döner — layout burada 403/redirect kararını verir.
export async function getInvenimusViewer() {
  const { user } = await validateRequest();
  if (!user || !hasInvenimusRole(user.invenimusRole, "VIEWER")) return null;
  return user;
}

// Server action guard'ı: en az `min` rolü ister; yoksa hata fırlatır.
export async function requireInvenimusRole(min: InvenimusRole) {
  const { user } = await validateRequest();
  if (!user) redirect("/login");
  if (!hasInvenimusRole(user.invenimusRole, min)) {
    throw new Error("Bu işlem için yeterli yetkiniz yok.");
  }
  return user;
}
