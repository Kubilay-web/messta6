"use server";

// app/admin/pages/actions.ts
// Landing bölüm CMS'i mutasyonları. EDITOR+ ister. Bölüm verisi JSON string olarak
// InvenimusSection.data'ya upsert edilir; kaydedince ana sayfa (/) ve CMS ekranı tazelenir.

import { revalidatePath } from "next/cache";
import prisma from "@/app/lib/prisma";
import { requireInvenimusRole } from "@/app/lib/invenimus-auth";
import { SECTION_KEYS } from "./section-schema";

export type SectionResult = { ok: boolean; message?: string };

export async function saveSection(key: string, dataJson: string): Promise<SectionResult> {
  await requireInvenimusRole("EDITOR");

  if (!SECTION_KEYS.includes(key)) return { ok: false, message: "Geçersiz bölüm." };

  // Geçerli JSON mu? (istemci zaten JSON gönderir ama sunucuda da doğrula)
  let normalized: string;
  try {
    normalized = JSON.stringify(JSON.parse(dataJson));
  } catch {
    return { ok: false, message: "İçerik verisi geçersiz." };
  }

  await prisma.invenimusSection.upsert({
    where: { key },
    create: { key, data: normalized, published: true },
    update: { data: normalized, published: true },
  });

  revalidatePath("/");
  revalidatePath("/admin/pages");
  return { ok: true };
}

// Bölümü statik içeriğe döndür (DB kaydını sil).
export async function resetSection(key: string): Promise<SectionResult> {
  await requireInvenimusRole("EDITOR");
  if (!SECTION_KEYS.includes(key)) return { ok: false, message: "Geçersiz bölüm." };

  await prisma.invenimusSection.deleteMany({ where: { key } });

  revalidatePath("/");
  revalidatePath("/admin/pages");
  return { ok: true };
}
