"use server";

// app/admin/actions.ts
// Admin panelinin tüm mutasyonları. Her action ADMIN rolü ister (requireAdmin).
// Landing içeriği (kadro, ventures/services/testimonials/faq) ve gelen başvurular
// (lead, yatırımcı) buradan yönetilir.

import { revalidatePath } from "next/cache";
import prisma from "@/app/lib/prisma";
import {
  requireInvenimusRole,
  isInvenimusRole,
  type InvenimusRole,
} from "@/app/lib/invenimus-auth";

export type AdminResult = { ok: boolean; message?: string };

// İçerik/başvuru mutasyonları EDITOR+ ister; kullanıcı/rol yönetimi ADMIN ister.
const requireEditor = () => requireInvenimusRole("EDITOR");
const requireAdmin = () => requireInvenimusRole("ADMIN");

function revalidateAdmin(path?: string) {
  revalidatePath("/admin");
  if (path) revalidatePath(path);
  revalidatePath("/"); // landing içeriği değiştiyse ana sayfa da tazelensin
}

// —————————————————————————— LEADS ——————————————————————————
const LEAD_STATUSES = ["NEW", "READ", "CONTACTED", "ARCHIVED"];

export async function updateLeadStatus(id: string, status: string): Promise<AdminResult> {
  await requireEditor();
  if (!LEAD_STATUSES.includes(status)) return { ok: false, message: "Geçersiz durum." };
  await prisma.invenimusLead.update({ where: { id }, data: { status } });
  revalidateAdmin("/admin/leads");
  return { ok: true };
}

export async function updateLeadNotes(id: string, notes: string): Promise<AdminResult> {
  await requireEditor();
  await prisma.invenimusLead.update({ where: { id }, data: { notes: notes || null } });
  revalidateAdmin("/admin/leads");
  return { ok: true };
}

export async function deleteLead(id: string): Promise<AdminResult> {
  await requireEditor();
  await prisma.invenimusLead.delete({ where: { id } });
  revalidateAdmin("/admin/leads");
  return { ok: true };
}

// ——————————————————————— INVESTOR APPS ———————————————————————
const INVESTOR_STATUSES = ["NEW", "REVIEWING", "MATCHED", "REJECTED", "ARCHIVED"];

export async function updateInvestorStatus(id: string, status: string): Promise<AdminResult> {
  await requireEditor();
  if (!INVESTOR_STATUSES.includes(status)) return { ok: false, message: "Geçersiz durum." };
  await prisma.invenimusInvestorApplication.update({ where: { id }, data: { status } });
  revalidateAdmin("/admin/investors");
  return { ok: true };
}

export async function updateInvestorNotes(id: string, notes: string): Promise<AdminResult> {
  await requireEditor();
  await prisma.invenimusInvestorApplication.update({ where: { id }, data: { notes: notes || null } });
  revalidateAdmin("/admin/investors");
  return { ok: true };
}

export async function deleteInvestor(id: string): Promise<AdminResult> {
  await requireEditor();
  await prisma.invenimusInvestorApplication.delete({ where: { id } });
  revalidateAdmin("/admin/investors");
  return { ok: true };
}

// —————————————————————————— TEAM ——————————————————————————
// role/bio çok dilli: {"tr":"","en":"","de":""} JSON string olarak saklanır.
function packLang(fd: FormData, base: string) {
  return JSON.stringify({
    tr: String(fd.get(`${base}_tr`) ?? "").trim(),
    en: String(fd.get(`${base}_en`) ?? "").trim(),
    de: String(fd.get(`${base}_de`) ?? "").trim(),
  });
}

export async function saveTeamMember(_prev: AdminResult, fd: FormData): Promise<AdminResult> {
  await requireEditor();
  const id = String(fd.get("id") ?? "");
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return { ok: false, message: "İsim zorunlu." };

  const data = {
    name,
    role: packLang(fd, "role"),
    bio: packLang(fd, "bio"),
    avatarUrl: String(fd.get("avatarUrl") ?? "").trim() || null,
    linkedin: String(fd.get("linkedin") ?? "").trim() || null,
    twitter: String(fd.get("twitter") ?? "").trim() || null,
    order: Number(fd.get("order") ?? 0) || 0,
    published: fd.get("published") === "on",
  };

  if (id) {
    await prisma.invenimusTeamMember.update({ where: { id }, data });
  } else {
    await prisma.invenimusTeamMember.create({ data });
  }
  revalidateAdmin("/admin/team");
  return { ok: true };
}

export async function deleteTeamMember(id: string): Promise<AdminResult> {
  await requireEditor();
  await prisma.invenimusTeamMember.delete({ where: { id } });
  revalidateAdmin("/admin/team");
  return { ok: true };
}

// ——————————————————————— CONTENT (CMS) ———————————————————————
const CONTENT_KINDS = ["venture", "service", "testimonial", "faq"];

export async function saveContentItem(_prev: AdminResult, fd: FormData): Promise<AdminResult> {
  await requireEditor();
  const id = String(fd.get("id") ?? "");
  const kind = String(fd.get("kind") ?? "");
  if (!CONTENT_KINDS.includes(kind)) return { ok: false, message: "Geçersiz içerik türü." };

  // meta serbest JSON (yıl, renk, tag, rol, metrik...). Geçersizse {} kaydet.
  let meta = String(fd.get("meta") ?? "").trim() || "{}";
  let metaObj: Record<string, unknown>;
  try {
    metaObj = JSON.parse(meta);
  } catch {
    return { ok: false, message: "Meta alanı geçerli JSON olmalı." };
  }
  // ImageUpload'tan gelen görsel URL'sini meta.image'e işle (varsa).
  const image = String(fd.get("image") ?? "").trim();
  if (image) {
    metaObj = { ...metaObj, image };
    meta = JSON.stringify(metaObj);
  }

  const data = {
    kind,
    title: packLang(fd, "title"),
    body: packLang(fd, "body"),
    meta,
    order: Number(fd.get("order") ?? 0) || 0,
    published: fd.get("published") === "on",
  };

  if (id) {
    await prisma.invenimusContentItem.update({ where: { id }, data });
  } else {
    await prisma.invenimusContentItem.create({ data });
  }
  revalidateAdmin("/admin/content");
  return { ok: true };
}

export async function deleteContentItem(id: string): Promise<AdminResult> {
  await requireEditor();
  await prisma.invenimusContentItem.delete({ where: { id } });
  revalidateAdmin("/admin/content");
  return { ok: true };
}

// —————————————————————— USERS & ROLES ——————————————————————
// Admin panelinin kendi yetki rolü (InvenimusRole). "NONE" → panele erişim kaldırılır.
// Genel User.role'e (mağaza/uygulama rolü) burada dokunulmaz.
export async function updateUserInvenimusRole(
  id: string,
  role: InvenimusRole | "NONE"
): Promise<AdminResult> {
  const admin = await requireAdmin();
  if (role !== "NONE" && !isInvenimusRole(role)) {
    return { ok: false, message: "Geçersiz rol." };
  }
  // Yönetici kendi ADMIN yetkisini düşüremez/kaldıramaz (kilitlenmeyi önler).
  if (admin.id === id && role !== "ADMIN") {
    return { ok: false, message: "Kendi yönetici yetkinizi kaldıramazsınız." };
  }
  await prisma.user.update({
    where: { id },
    data: { invenimusRole: role === "NONE" ? null : role },
  });
  revalidateAdmin("/admin/users");
  return { ok: true };
}
