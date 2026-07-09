// app/lib/ceyhun.ts
// Sözün İzinde platformu için paylaşılan yardımcılar (sunucu + istemci güvenli).
// Çok dilli alanlar {"tr","en","de"} JSON string olarak saklanır (proje geneli desen).

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type Locale = "tr" | "en" | "de";
export const LOCALES: Locale[] = ["tr", "en", "de"];

export type Lang = { tr: string; en: string; de: string };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Çok dilli JSON string → güvenli { tr, en, de }.
export function unpackLang(json: string | null | undefined): Lang {
  try {
    const o = JSON.parse(json || "{}");
    return {
      tr: typeof o?.tr === "string" ? o.tr : "",
      en: typeof o?.en === "string" ? o.en : "",
      de: typeof o?.de === "string" ? o.de : "",
    };
  } catch {
    return { tr: "", en: "", de: "" };
  }
}

// Locale'e göre metin seç; boşsa mantıklı yedeğe düş (tr → en → de).
export function pick(json: string | null | undefined, locale: Locale): string {
  const l = unpackLang(json);
  const order: Locale[] =
    locale === "en" ? ["en", "tr", "de"] : locale === "de" ? ["de", "en", "tr"] : ["tr", "en", "de"];
  for (const k of order) if (l[k]) return l[k];
  return "";
}

// FormData'dan çok dilli alanı topla → JSON string.
export function packLangFromForm(fd: FormData, base: string): string {
  return JSON.stringify({
    tr: String(fd.get(`${base}_tr`) ?? "").trim(),
    en: String(fd.get(`${base}_en`) ?? "").trim(),
    de: String(fd.get(`${base}_de`) ?? "").trim(),
  });
}

// Güvenli JSON dizi çöz.
export function safeArray<T = unknown>(json: string | null | undefined): T[] {
  try {
    const v = JSON.parse(json || "[]");
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

// Güvenli JSON obje çöz.
export function safeObject<T extends Record<string, unknown> = Record<string, unknown>>(
  json: string | null | undefined
): T {
  try {
    const v = JSON.parse(json || "{}");
    return v && typeof v === "object" && !Array.isArray(v) ? (v as T) : ({} as T);
  } catch {
    return {} as T;
  }
}

// ─────────────────────────── Video yardımcıları ───────────────────────────

// YouTube video kimliğini herhangi bir url/id biçiminden çıkar.
export function youtubeId(ref: string): string {
  if (!ref) return "";
  const s = ref.trim();
  // Zaten sadece id (11 karakter) ise
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = s.match(p);
    if (m?.[1]) return m[1];
  }
  return "";
}

export function youtubeEmbed(ref: string): string {
  const id = youtubeId(ref);
  return id ? `https://www.youtube.com/embed/${id}` : "";
}

export function youtubeThumb(ref: string): string {
  const id = youtubeId(ref);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
}

// Video kaydından oynatılabilir embed URL üret.
export function videoEmbedUrl(provider: string, ref: string): string {
  if (provider === "youtube") return youtubeEmbed(ref);
  if (provider === "vimeo") {
    const m = ref.match(/(?:vimeo\.com\/)(\d+)/) || ref.match(/^(\d+)$/);
    return m?.[1] ? `https://player.vimeo.com/video/${m[1]}` : ref;
  }
  return ref; // cloudinary / doğrudan mp4 url
}

// Video küçük resmi: verilen thumbUrl > youtube otomatik > boş.
export function videoThumb(provider: string, ref: string, thumbUrl?: string | null): string {
  if (thumbUrl) return thumbUrl;
  if (provider === "youtube") return youtubeThumb(ref);
  return "";
}

// ─────────────────────────── Biçimlendirme ───────────────────────────

const DATE_LOCALE: Record<Locale, string> = { tr: "tr-TR", en: "en-US", de: "de-DE" };

export function formatDate(d: Date | string | null | undefined, locale: Locale = "tr"): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatMoney(cents: number, currency = "EUR", locale: Locale = "tr"): string {
  return new Intl.NumberFormat(DATE_LOCALE[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format((cents || 0) / 100);
}

// HTML'den düz metin okuma süresi tahmini (dakika).
export function estimateReadMinutes(html: string): number {
  const text = (html || "").replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
