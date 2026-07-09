"use server";

// app/lib/invenimus-actions.ts
// Landing sayfasındaki herkese açık formların server action'ları.
// "Fikrini anlat" (lead) ve yatırımcı eşleştirme başvurusu DB'ye yazılır.

import { z } from "zod";
import prisma from "./prisma";
import { getServerLocale } from "./locale";
import { validateRequest } from "@/app/auth";

// requireAuth: giriş yapılmamışsa true → client kullanıcıyı /login'e yönlendirir.
export type ActionResult = { ok: boolean; message?: string; requireAuth?: boolean };

const leadSchema = z.object({
  name: z.string().trim().min(2, "İsim çok kısa").max(120),
  email: z.string().trim().email("Geçerli bir e-posta girin").max(160),
  idea: z.string().trim().min(5, "Biraz daha anlat").max(4000),
  source: z.enum(["contact", "hero"]).optional(),
});

export async function submitLead(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  // Yumuşak kapı: işlem yapmak için giriş şart.
  const { user } = await validateRequest();
  if (!user) return { ok: false, requireAuth: true };

  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    idea: formData.get("idea"),
    source: formData.get("source") || "contact",
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Geçersiz form." };
  }

  try {
    const locale = await getServerLocale();
    await prisma.invenimusLead.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        idea: parsed.data.idea,
        source: parsed.data.source ?? "contact",
        locale,
      },
    });
    return { ok: true };
  } catch (e) {
    console.error("submitLead failed", e);
    return { ok: false, message: "Sunucu hatası." };
  }
}

const investorSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  audience: z.enum(["founder", "investor"]).default("founder"),
  stage: z.string().trim().max(80).optional().or(z.literal("")),
  ticket: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
});

export async function submitInvestorApplication(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  // Yumuşak kapı: işlem yapmak için giriş şart.
  const { user } = await validateRequest();
  if (!user) return { ok: false, requireAuth: true };

  const parsed = investorSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company") ?? "",
    audience: formData.get("audience") || "founder",
    stage: formData.get("stage") ?? "",
    ticket: formData.get("ticket") ?? "",
    message: formData.get("message") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Geçersiz form." };
  }

  try {
    const locale = await getServerLocale();
    await prisma.invenimusInvestorApplication.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        company: parsed.data.company || null,
        audience: parsed.data.audience,
        stage: parsed.data.stage || null,
        ticket: parsed.data.ticket || null,
        message: parsed.data.message || null,
        locale,
      },
    });
    return { ok: true };
  } catch (e) {
    console.error("submitInvestorApplication failed", e);
    return { ok: false, message: "Sunucu hatası." };
  }
}
