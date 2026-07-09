// app/lib/invenimus-page-content.ts
// SUNUCU tarafı: landing içeriğini statik sözlük + DB (InvenimusSection) overlay'i olarak çözer.
// - getInvenimusPageContent(lang): landing'in kullandığı { copy, media, seo }.
// - getAllSectionData(): admin editörü için her bölümün ham saklı verisi (yoksa statikten default).
// Statik sözlük her zaman yedektir → DB boşsa/hatalıysa site aynen çalışır.

import prisma from "@/app/lib/prisma";
import {
  getInvenimusCopy,
  type InvenimusCopy,
  VENTURE_META,
  PROCESS_META,
} from "@/app/components/site-i18n/invenimus-content";
import type { Locale } from "@/app/lib/i18n-routing";
import { SECTION_KEYS } from "@/app/admin/pages/section-schema";

// —————————————————————————— Tipler ——————————————————————————
export type ProcessMedia = { image: string; tint: string };
export type VentureMedia = {
  name: string;
  year: string;
  color: string;
  ink?: string;
  image?: string;
};
export type InvenimusMedia = { process: ProcessMedia[]; ventures: VentureMedia[] };
export type InvenimusSeo = { title: string; description: string; ogImage: string };
export type InvenimusPageContent = {
  copy: InvenimusCopy;
  media: InvenimusMedia;
  seo: InvenimusSeo;
  lang: Locale;
};

// —————————————————————————— Yardımcılar ——————————————————————————
type I18n = { tr?: string; en?: string; de?: string };
const LANGS = ["tr", "en", "de"] as const;

// {tr,en,de} objesini locale'e göre çöz (fallback tr→en→de). Düz string ise aynen döndür.
function L(v: unknown, lang: Locale): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    const o = v as I18n;
    return o[lang] || o.tr || o.en || o.de || "";
  }
  return "";
}
// non-empty ise atar (statik yedeği ezmemek için)
function put<T extends object, K extends keyof T>(obj: T, key: K, val: string) {
  if (val) (obj[key] as unknown as string) = val;
}
function arr(x: unknown): any[] {
  return Array.isArray(x) ? x : [];
}

const TR = getInvenimusCopy("tr");
const EN = getInvenimusCopy("en");
const DE = getInvenimusCopy("de");
// Üç dilden i18n objesi kur (statikten default üretmek için)
function tri(pick: (c: InvenimusCopy) => string | undefined): I18n {
  return { tr: pick(TR) || "", en: pick(EN) || "", de: pick(DE) || "" };
}

// —————————————————————————— Bölüm adaptörleri ——————————————————————————
// default(): statikten türetilmiş SAKLI şekil (i18n alanlar {tr,en,de}).
// apply(): saklı veriyi (stored) locale'e çözüp ctx.copy/media/seo'ya işler.
type Ctx = { copy: InvenimusCopy; media: InvenimusMedia; seo: InvenimusSeo };
type Adapter = { default: () => any; apply: (ctx: Ctx, stored: any, lang: Locale) => void };

const ADAPTERS: Record<string, Adapter> = {
  hero: {
    default: () => ({
      badge: tri((c) => c.hero.badge),
      titleLead: tri((c) => c.hero.titleLead),
      titleAccent: tri((c) => c.hero.titleAccent),
      descA: tri((c) => c.hero.descA),
      descStrong: tri((c) => c.hero.descStrong),
      descB: tri((c) => c.hero.descB),
      ctaPrimary: tri((c) => c.hero.ctaPrimary),
      ctaSecondary: tri((c) => c.hero.ctaSecondary),
      techLabel: tri((c) => c.hero.techLabel),
    }),
    apply: (ctx, s, lang) => {
      const h = ctx.copy.hero;
      put(h, "badge", L(s.badge, lang));
      put(h, "titleLead", L(s.titleLead, lang));
      put(h, "titleAccent", L(s.titleAccent, lang));
      put(h, "descA", L(s.descA, lang));
      put(h, "descStrong", L(s.descStrong, lang));
      put(h, "descB", L(s.descB, lang));
      put(h, "ctaPrimary", L(s.ctaPrimary, lang));
      put(h, "ctaSecondary", L(s.ctaSecondary, lang));
      put(h, "techLabel", L(s.techLabel, lang));
    },
  },

  stats: {
    default: () => ({
      items: TR.stats.map((_, i) => ({
        value: TR.stats[i].value,
        label: tri((c) => c.stats[i]?.label),
      })),
    }),
    apply: (ctx, s, lang) => {
      const items = arr(s.items);
      if (items.length) {
        ctx.copy.stats = items.map((it) => ({
          value: String(it.value ?? ""),
          label: L(it.label, lang),
        }));
      }
    },
  },

  services: {
    default: () => ({
      eyebrow: tri((c) => c.services.eyebrow),
      titleA: tri((c) => c.services.titleA),
      titleB: tri((c) => c.services.titleB),
      sub: tri((c) => c.services.sub),
      items: TR.services.items.map((_, i) => ({
        title: tri((c) => c.services.items[i]?.title),
        body: tri((c) => c.services.items[i]?.body),
        tag: tri((c) => c.services.items[i]?.tag),
      })),
    }),
    apply: (ctx, s, lang) => {
      const sv = ctx.copy.services;
      put(sv, "eyebrow", L(s.eyebrow, lang));
      put(sv, "titleA", L(s.titleA, lang));
      put(sv, "titleB", L(s.titleB, lang));
      put(sv, "sub", L(s.sub, lang));
      const items = arr(s.items);
      if (items.length) {
        sv.items = items.map((it) => ({
          title: L(it.title, lang),
          body: L(it.body, lang),
          tag: L(it.tag, lang),
        }));
      }
    },
  },

  process: {
    default: () => ({
      eyebrow: tri((c) => c.process.eyebrow),
      titleA: tri((c) => c.process.titleA),
      titleAccent: tri((c) => c.process.titleAccent),
      items: TR.process.items.map((_, i) => ({
        title: tri((c) => c.process.items[i]?.title),
        body: tri((c) => c.process.items[i]?.body),
        image: PROCESS_META[i]?.image ?? "",
        tint: PROCESS_META[i]?.tint ?? "#0b0b0b",
      })),
    }),
    apply: (ctx, s, lang) => {
      const p = ctx.copy.process;
      put(p, "eyebrow", L(s.eyebrow, lang));
      put(p, "titleA", L(s.titleA, lang));
      put(p, "titleAccent", L(s.titleAccent, lang));
      const items = arr(s.items);
      if (items.length) {
        p.items = items.map((it) => ({ title: L(it.title, lang), body: L(it.body, lang) }));
        ctx.media.process = items.map((it, i) => ({
          image: String(it.image || PROCESS_META[i]?.image || ""),
          tint: String(it.tint || PROCESS_META[i]?.tint || "#0b0b0b"),
        }));
      }
    },
  },

  marketing: {
    default: () => ({
      eyebrow: tri((c) => c.marketing.eyebrow),
      titleA: tri((c) => c.marketing.titleA),
      titleAccent: tri((c) => c.marketing.titleAccent),
      sub: tri((c) => c.marketing.sub),
      items: TR.marketing.items.map((_, i) => ({
        title: tri((c) => c.marketing.items[i]?.title),
        body: tri((c) => c.marketing.items[i]?.body),
        metric: TR.marketing.items[i]?.metric ?? "",
        metricLabel: tri((c) => c.marketing.items[i]?.metricLabel),
      })),
      cta: tri((c) => c.marketing.cta),
    }),
    apply: (ctx, s, lang) => {
      const m = ctx.copy.marketing;
      put(m, "eyebrow", L(s.eyebrow, lang));
      put(m, "titleA", L(s.titleA, lang));
      put(m, "titleAccent", L(s.titleAccent, lang));
      put(m, "sub", L(s.sub, lang));
      put(m, "cta", L(s.cta, lang));
      const items = arr(s.items);
      if (items.length) {
        m.items = items.map((it) => ({
          title: L(it.title, lang),
          body: L(it.body, lang),
          metric: String(it.metric ?? ""),
          metricLabel: L(it.metricLabel, lang),
        }));
      }
    },
  },

  investors: {
    default: () => ({
      eyebrow: tri((c) => c.investors.eyebrow),
      titleA: tri((c) => c.investors.titleA),
      titleAccent: tri((c) => c.investors.titleAccent),
      sub: tri((c) => c.investors.sub),
      steps: TR.investors.steps.map((_, i) => ({
        title: tri((c) => c.investors.steps[i]?.title),
        body: tri((c) => c.investors.steps[i]?.body),
      })),
      stats: TR.investors.stats.map((_, i) => ({
        value: TR.investors.stats[i].value,
        label: tri((c) => c.investors.stats[i]?.label),
      })),
      formTitle: tri((c) => c.investors.formTitle),
      formSub: tri((c) => c.investors.formSub),
    }),
    apply: (ctx, s, lang) => {
      const inv = ctx.copy.investors;
      put(inv, "eyebrow", L(s.eyebrow, lang));
      put(inv, "titleA", L(s.titleA, lang));
      put(inv, "titleAccent", L(s.titleAccent, lang));
      put(inv, "sub", L(s.sub, lang));
      put(inv, "formTitle", L(s.formTitle, lang));
      put(inv, "formSub", L(s.formSub, lang));
      const steps = arr(s.steps);
      if (steps.length) inv.steps = steps.map((it) => ({ title: L(it.title, lang), body: L(it.body, lang) }));
      const stats = arr(s.stats);
      if (stats.length)
        inv.stats = stats.map((it) => ({ value: String(it.value ?? ""), label: L(it.label, lang) }));
    },
  },

  features: {
    default: () => ({
      items: TR.features.map((_, i) => ({
        title: tri((c) => c.features[i]?.title),
        body: tri((c) => c.features[i]?.body),
      })),
    }),
    apply: (ctx, s, lang) => {
      const items = arr(s.items);
      if (items.length) ctx.copy.features = items.map((it) => ({ title: L(it.title, lang), body: L(it.body, lang) }));
    },
  },

  ventures: {
    default: () => ({
      eyebrow: tri((c) => c.ventures.eyebrow),
      titleA: tri((c) => c.ventures.titleA),
      titleB: tri((c) => c.ventures.titleB),
      link: tri((c) => c.ventures.link),
      items: VENTURE_META.map((v, i) => ({
        name: v.name,
        year: v.year,
        tag: tri((c) => c.ventures.tags[i]),
        color: v.color,
        ink: v.ink ?? "",
        image: "",
      })),
    }),
    apply: (ctx, s, lang) => {
      const v = ctx.copy.ventures;
      put(v, "eyebrow", L(s.eyebrow, lang));
      put(v, "titleA", L(s.titleA, lang));
      put(v, "titleB", L(s.titleB, lang));
      put(v, "link", L(s.link, lang));
      const items = arr(s.items);
      if (items.length) {
        v.tags = items.map((it) => L(it.tag, lang));
        ctx.media.ventures = items.map((it, i) => ({
          name: String(it.name || VENTURE_META[i]?.name || ""),
          year: String(it.year || VENTURE_META[i]?.year || ""),
          color: String(it.color || VENTURE_META[i]?.color || "#111827"),
          ink: it.ink ? String(it.ink) : VENTURE_META[i]?.ink,
          image: it.image ? String(it.image) : undefined,
        }));
      }
    },
  },

  testimonials: {
    default: () => ({
      eyebrow: tri((c) => c.testimonials.eyebrow),
      titleA: tri((c) => c.testimonials.titleA),
      titleB: tri((c) => c.testimonials.titleB),
      items: TR.testimonials.items.map((_, i) => ({
        quote: tri((c) => c.testimonials.items[i]?.quote),
        name: TR.testimonials.items[i]?.name ?? "",
        role: tri((c) => c.testimonials.items[i]?.role),
      })),
    }),
    apply: (ctx, s, lang) => {
      const t2 = ctx.copy.testimonials;
      put(t2, "eyebrow", L(s.eyebrow, lang));
      put(t2, "titleA", L(s.titleA, lang));
      put(t2, "titleB", L(s.titleB, lang));
      const items = arr(s.items);
      if (items.length)
        t2.items = items.map((it) => ({
          quote: L(it.quote, lang),
          name: String(it.name ?? ""),
          role: L(it.role, lang),
        }));
    },
  },

  faq: {
    default: () => ({
      eyebrow: tri((c) => c.faq.eyebrow),
      titleA: tri((c) => c.faq.titleA),
      titleB: tri((c) => c.faq.titleB),
      desc: tri((c) => c.faq.desc),
      items: TR.faq.items.map((_, i) => ({
        q: tri((c) => c.faq.items[i]?.q),
        a: tri((c) => c.faq.items[i]?.a),
      })),
    }),
    apply: (ctx, s, lang) => {
      const f = ctx.copy.faq;
      put(f, "eyebrow", L(s.eyebrow, lang));
      put(f, "titleA", L(s.titleA, lang));
      put(f, "titleB", L(s.titleB, lang));
      put(f, "desc", L(s.desc, lang));
      const items = arr(s.items);
      if (items.length) f.items = items.map((it) => ({ q: L(it.q, lang), a: L(it.a, lang) }));
    },
  },

  contact: {
    default: () => ({
      badge: tri((c) => c.contact.badge),
      title: tri((c) => c.contact.title),
      desc: tri((c) => c.contact.desc),
      email: TR.contact.email,
      backToTop: tri((c) => c.contact.backToTop),
    }),
    apply: (ctx, s, lang) => {
      const c = ctx.copy.contact;
      put(c, "badge", L(s.badge, lang));
      put(c, "title", L(s.title, lang));
      put(c, "desc", L(s.desc, lang));
      put(c, "email", String(s.email ?? ""));
      put(c, "backToTop", L(s.backToTop, lang));
    },
  },

  footer: {
    default: () => ({
      tagline: tri((c) => c.footer.tagline),
      links: TR.footer.links.map((l, i) => ({
        label: tri((c) => c.footer.links[i]?.label),
        href: l.href,
      })),
      rights: TR.footer.rights,
      location: TR.footer.location,
    }),
    apply: (ctx, s, lang) => {
      const f = ctx.copy.footer;
      put(f, "tagline", L(s.tagline, lang));
      put(f, "rights", String(s.rights ?? ""));
      put(f, "location", String(s.location ?? ""));
      const links = arr(s.links);
      if (links.length)
        f.links = links.map((it) => ({ label: L(it.label, lang), href: String(it.href ?? "#") }));
    },
  },

  seo: {
    default: () => ({
      title: { tr: "Invenimus — Venture Studio", en: "Invenimus — Venture Studio", de: "Invenimus — Venture Studio" },
      description: tri((c) => c.footer.tagline),
      ogImage: "",
    }),
    apply: (ctx, s, lang) => {
      put(ctx.seo, "title", L(s.title, lang));
      put(ctx.seo, "description", L(s.description, lang));
      put(ctx.seo, "ogImage", String(s.ogImage ?? ""));
    },
  },
};

// —————————————————————————— Genel API ——————————————————————————

// Landing içeriği: statik + DB overlay. DB hatasında saf statiğe düşer.
export async function getInvenimusPageContent(lang: Locale): Promise<InvenimusPageContent> {
  const copy = structuredClone(getInvenimusCopy(lang));
  const media: InvenimusMedia = {
    process: PROCESS_META.map((p) => ({ image: p.image, tint: p.tint })),
    ventures: VENTURE_META.map((v) => ({ name: v.name, year: v.year, color: v.color, ink: v.ink })),
  };
  const seo: InvenimusSeo = {
    title: "Invenimus — Venture Studio",
    description: copy.footer.tagline,
    ogImage: "",
  };
  const ctx: Ctx = { copy, media, seo };

  try {
    const rows = await prisma.invenimusSection.findMany({ where: { published: true } });
    for (const row of rows) {
      const adapter = ADAPTERS[row.key];
      if (!adapter) continue;
      try {
        adapter.apply(ctx, JSON.parse(row.data || "{}"), lang);
      } catch {
        // bozuk JSON → bu bölüm statik kalır
      }
    }
  } catch {
    // DB erişilemedi → saf statik içerik
  }

  return { copy, media, seo, lang };
}

// Admin editörü için: her bölümün ham saklı verisi (kayıt yoksa statikten default).
export async function getAllSectionData(): Promise<Record<string, any>> {
  const out: Record<string, any> = {};
  let rows: { key: string; data: string }[] = [];
  try {
    rows = await prisma.invenimusSection.findMany();
  } catch {
    rows = [];
  }
  const byKey = new Map(rows.map((r) => [r.key, r.data]));
  for (const key of SECTION_KEYS) {
    const adapter = ADAPTERS[key];
    if (!adapter) continue;
    const raw = byKey.get(key);
    if (raw) {
      try {
        out[key] = JSON.parse(raw);
        continue;
      } catch {
        /* düş */
      }
    }
    out[key] = adapter.default();
  }
  return out;
}

// Bir bölümün statikten default saklı verisi (reset / ilk açılış için).
export function getSectionDefault(key: string): any {
  return ADAPTERS[key]?.default() ?? {};
}
