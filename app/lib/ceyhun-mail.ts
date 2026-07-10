// app/lib/ceyhun-mail.ts
// Ceyhun platformu — SUNUCU tarafı e-posta bildirimleri (Resend).
// Best-effort: yapılandırma yoksa veya gönderim başarısızsa sessizce geçer,
// asla çağıran akışı (form gönderimi vb.) bozmaz.

import "server-only";
import { Resend } from "resend";
import prisma from "./prisma";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

// Doğrulanmış domain yoksa Resend sandbox adresi (yalnız hesap sahibine gider).
const FROM = process.env.CEYHUN_MAIL_FROM || "Avrupa Uyanış Hizmetleri <onboarding@resend.dev>";
const BRAND = process.env.CEYHUN_BRAND_NAME || "Avrupa Uyanış Hizmetleri";

export function isMailConfigured() {
  return Boolean(resend);
}

// Bildirimlerin gideceği yönetici adresi: CEYHUN_NOTIFY_EMAIL > profil e-postası.
export async function ceyhunNotifyTo(): Promise<string | null> {
  const env = process.env.CEYHUN_NOTIFY_EMAIL?.trim();
  if (env) return env;
  try {
    const p = await prisma.ceyhunProfile.findUnique({
      where: { key: "main" },
      select: { email: true },
    });
    return p?.email?.trim() || null;
  } catch {
    return null;
  }
}

export async function sendMail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; skipped?: boolean }> {
  if (!resend) return { ok: false, skipped: true };
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    if (error) {
      console.error("sendMail", error);
      return { ok: false };
    }
    return { ok: true };
  } catch (e) {
    console.error("sendMail", e);
    return { ok: false };
  }
}

// ─────────────────────────── HTML şablon yardımcıları ───────────────────────────

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Basit, markasız-güvenli, e-posta istemcilerinde çalışan inline-stil şablon.
export function mailShell(opts: { heading: string; intro?: string; rows?: [string, string][]; body?: string; footer?: string }): string {
  const rowsHtml = (opts.rows ?? [])
    .filter(([, v]) => v != null && String(v).trim() !== "")
    .map(
      ([k, v]) =>
        `<tr>
           <td style="padding:8px 0;color:#8a7b5c;font-size:13px;width:38%;vertical-align:top;">${esc(k)}</td>
           <td style="padding:8px 0;color:#1c1917;font-size:14px;font-weight:600;">${esc(v)}</td>
         </tr>`
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;background:#faf7f0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f0;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06);">
        <tr><td style="background:#1c1917;padding:18px 28px;">
          <span style="color:#e8c96a;font-size:15px;font-weight:700;letter-spacing:.5px;">${esc(BRAND)}</span>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 6px;font-size:20px;color:#1c1917;">${esc(opts.heading)}</h1>
          ${opts.intro ? `<p style="margin:0 0 18px;color:#57534e;font-size:14px;line-height:1.5;">${esc(opts.intro)}</p>` : ""}
          ${rowsHtml ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0ece3;margin-top:8px;">${rowsHtml}</table>` : ""}
          ${opts.body ? `<div style="margin-top:16px;padding:14px 16px;background:#faf7f0;border-radius:10px;color:#1c1917;font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(opts.body)}</div>` : ""}
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #f0ece3;color:#a8a29e;font-size:12px;">
          ${esc(opts.footer ?? `${BRAND} — otomatik bildirim`)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
