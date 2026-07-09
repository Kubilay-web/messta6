"use server";

// app/lib/ceyhun-public-actions.ts
// Herkese açık (giriş gerektirmeyen) form action'ları: tur başvurusu, dua kaydı vb.
// Spam koruması: gizli "company" honeypot alanı doldurulmuşsa sessizce başarı döner.

import { z } from "zod";
import prisma from "./prisma";
import { validateRequest } from "@/app/auth";
import { getServerLocale } from "./locale";
import { TOUR_SLUGS, TOURS } from "./ceyhun-tours";
import { sendMail, ceyhunNotifyTo, mailShell } from "./ceyhun-mail";

function tourLabel(slug: string): string {
  return TOURS.find((t) => t.slug === slug)?.title.tr ?? (slug === "custom" ? "Özel Tur" : slug);
}

export type PublicResult = { ok: boolean; message?: string };

const tourSchema = z.object({
  name: z.string().trim().min(2, "İsim çok kısa").max(120),
  email: z.string().trim().email("Geçerli bir e-posta girin").max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  tourType: z.string().trim(),
  groupSize: z.coerce.number().int().min(1).max(500).default(1),
  startDate: z.string().trim().optional().or(z.literal("")),
  endDate: z.string().trim().optional().or(z.literal("")),
  budget: z.string().trim().max(80).optional().or(z.literal("")),
  needHotel: z.enum(["on", "off"]).optional(),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
});

function toDate(v?: string): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function submitTourApplication(
  _prev: PublicResult,
  fd: FormData
): Promise<PublicResult> {
  // Honeypot
  if (String(fd.get("company") ?? "").trim()) return { ok: true };

  const parsed = tourSchema.safeParse({
    name: fd.get("name"),
    email: fd.get("email"),
    phone: fd.get("phone") ?? "",
    country: fd.get("country") ?? "",
    tourType: fd.get("tourType") ?? "istanbul",
    groupSize: fd.get("groupSize") ?? 1,
    startDate: fd.get("startDate") ?? "",
    endDate: fd.get("endDate") ?? "",
    budget: fd.get("budget") ?? "",
    needHotel: fd.get("needHotel") ? "on" : "off",
    message: fd.get("message") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Geçersiz form." };
  }

  const d = parsed.data;
  const tourType = [...TOUR_SLUGS, "custom"].includes(d.tourType) ? d.tourType : "custom";

  try {
    const locale = await getServerLocale();
    await prisma.ceyhunTourApplication.create({
      data: {
        name: d.name,
        email: d.email,
        phone: d.phone || null,
        country: d.country || null,
        tourType,
        groupSize: d.groupSize,
        startDate: toDate(d.startDate),
        endDate: toDate(d.endDate),
        budget: d.budget || null,
        needHotel: d.needHotel !== "off",
        message: d.message || null,
        locale,
      },
    });

    // Bildirim (best-effort, akışı bloklamaz)
    const label = tourLabel(tourType);
    const notify = await ceyhunNotifyTo();
    if (notify) {
      await sendMail({
        to: notify,
        replyTo: d.email,
        subject: `Yeni tur başvurusu — ${label} (${d.name})`,
        html: mailShell({
          heading: "Yeni tur başvurusu",
          intro: "Web sitesi üzerinden yeni bir biblical tur başvurusu geldi.",
          rows: [
            ["Tur", label],
            ["Ad", d.name],
            ["E-posta", d.email],
            ["Telefon", d.phone || ""],
            ["Ülke", d.country || ""],
            ["Kişi sayısı", String(d.groupSize)],
            ["Tarih", [d.startDate, d.endDate].filter(Boolean).join(" → ")],
            ["Bütçe", d.budget || ""],
            ["Konaklama isteniyor", d.needHotel !== "off" ? "Evet" : "Hayır"],
          ],
          body: d.message || "",
          footer: "Yanıtlamak için bu e-postayı doğrudan cevaplayabilirsiniz.",
        }),
      });
    }
    // Başvurana teyit (opsiyonel, sessiz)
    await sendMail({
      to: d.email,
      subject: `Başvurunuz alındı — ${label}`,
      html: mailShell({
        heading: "Başvurunuzu aldık 🙏",
        intro: `Merhaba ${d.name}, "${label}" için başvurunuz bize ulaştı. En kısa sürede sizinle iletişime geçeceğiz.`,
        rows: [
          ["Tur", label],
          ["Kişi sayısı", String(d.groupSize)],
          ["Tarih", [d.startDate, d.endDate].filter(Boolean).join(" → ")],
        ],
      }),
    });

    return { ok: true };
  } catch (e) {
    console.error("submitTourApplication", e);
    return { ok: false, message: "Sunucu hatası. Lütfen tekrar deneyin." };
  }
}

// ─────────────────────────── Dua isteği / toplantı kaydı ───────────────────────────

const prayerSchema = z.object({
  meetingId: z.string().trim().min(1),
  name: z.string().trim().min(2, "İsim çok kısa").max(120),
  email: z.string().trim().email("Geçerli bir e-posta girin").max(160),
  prayerRequest: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function submitPrayerRequest(_prev: PublicResult, fd: FormData): Promise<PublicResult> {
  if (String(fd.get("company") ?? "").trim()) return { ok: true }; // honeypot

  const parsed = prayerSchema.safeParse({
    meetingId: fd.get("meetingId"),
    name: fd.get("name"),
    email: fd.get("email"),
    prayerRequest: fd.get("prayerRequest") ?? "",
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Geçersiz form." };

  const d = parsed.data;
  try {
    const meeting = await prisma.ceyhunPrayerMeeting.findUnique({ where: { id: d.meetingId } });
    if (!meeting) return { ok: false, message: "Toplantı bulunamadı." };
    const { user } = await validateRequest();
    await prisma.ceyhunPrayerRegistration.create({
      data: {
        meetingId: d.meetingId,
        name: d.name,
        email: d.email,
        userId: user?.id ?? null,
        prayerRequest: d.prayerRequest || null,
      },
    });

    // Bildirim (best-effort)
    const notify = await ceyhunNotifyTo();
    if (notify) {
      await sendMail({
        to: notify,
        replyTo: d.email,
        subject: d.prayerRequest
          ? `Yeni dua isteği — ${d.name}`
          : `Dua buluşmasına yeni kayıt — ${d.name}`,
        html: mailShell({
          heading: d.prayerRequest ? "Yeni dua isteği" : "Dua buluşmasına yeni kayıt",
          intro: `Toplantı: ${meeting.slug}`,
          rows: [
            ["Ad", d.name],
            ["E-posta", d.email],
          ],
          body: d.prayerRequest || "",
          footer: "Yanıtlamak için bu e-postayı doğrudan cevaplayabilirsiniz.",
        }),
      });
    }

    return { ok: true };
  } catch (e) {
    console.error("submitPrayerRequest", e);
    return { ok: false, message: "Sunucu hatası. Lütfen tekrar deneyin." };
  }
}
