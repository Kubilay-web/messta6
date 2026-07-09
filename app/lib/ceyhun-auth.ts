// app/lib/ceyhun-auth.ts
// Ceyhun platformu — SUNUCU tarafı yetki guard'ları (validateRequest → next/headers).
// Saf rol/yetenek mantığı ceyhun-roles.ts içindedir (client-güvenli).
// Bu modül YALNIZCA sunucu bileşenleri / server action'lardan import edilmelidir.

import "server-only";
import { redirect } from "next/navigation";
import { validateRequest } from "@/app/auth";
import { resolveCeyhunRole, can, canAccessPanel, type Capability, type CeyhunRole } from "./ceyhun-roles";

// Panele erişimi olan kullanıcı (yönetim yeteneği olan bir rol). VIEWER/null → null.
export async function getCeyhunViewer() {
  const { user } = await validateRequest();
  const role = resolveCeyhunRole(user);
  if (!user || !canAccessPanel(role)) return null;
  return { user, role: role as CeyhunRole };
}

// Sayfa/action guard'ı: belirli yeteneği ister; yoksa hata fırlatır (giriş yoksa /login).
export async function requireCeyhunCap(cap: Capability) {
  const { user } = await validateRequest();
  if (!user) redirect("/login");
  const role = resolveCeyhunRole(user);
  if (!can(role, cap)) throw new Error("Bu işlem için yeterli yetkiniz yok.");
  return { user, role: role as CeyhunRole };
}

// Sadece panele giriş (dashboard) — yönetim yeteneği olan bir rol gerekir (VIEWER hariç).
export async function requireCeyhunPanel() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");
  const role = resolveCeyhunRole(user);
  if (!canAccessPanel(role)) throw new Error("Panel erişiminiz yok.");
  return { user, role: role as CeyhunRole };
}
