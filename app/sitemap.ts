import type { MetadataRoute } from "next";
import { siteUrl, LOCALES, DEFAULT_LOCALE, HREFLANG, toLocalizedPath } from "@/app/lib/i18n-routing";
import {
  getPublishedArticles,
  getPublishedCourses,
  getPublishedMeetings,
} from "@/app/lib/ceyhun-cache";

// Sitemap saatte bir yenilenir. Üretimde mutlak host için NEXT_PUBLIC_SITE_URL ayarlayın.
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

// Bir İÇ yol için, tüm diller hreflang alternatifiyle TEK sitemap girişi üretir.
// url = varsayılan dil; alternates.languages = tr/en/de (Google xhtml:link).
function entry(
  base: string,
  internalPath: string,
  opts: {
    lastModified?: string | Date;
    changeFrequency?: Entry["changeFrequency"];
    priority?: number;
  } = {}
): Entry {
  // Her dil KENDİ çevrili segmentiyle (ör. /tr/makaleler, /de/artikel).
  const abs = (l: (typeof LOCALES)[number]) => {
    const lp = toLocalizedPath(l, internalPath);
    return `${base}/${l}${lp === "/" ? "" : lp}`;
  };
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[HREFLANG[l]] = abs(l);

  return {
    url: abs(DEFAULT_LOCALE),
    lastModified: opts.lastModified ?? new Date(),
    changeFrequency: opts.changeFrequency ?? "weekly",
    priority: opts.priority ?? 0.6,
    alternates: { languages },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  // ── Statik (herkese açık, indekslenebilir) rotalar ──────────────────────
  const staticEntries: Entry[] = [
    entry(base, "/", { changeFrequency: "daily", priority: 1 }),
    entry(base, "/about", { priority: 0.7 }),
    entry(base, "/articles", { changeFrequency: "daily", priority: 0.9 }),
    entry(base, "/gallery", { priority: 0.6 }),
    entry(base, "/videos", { changeFrequency: "weekly", priority: 0.8 }),
    entry(base, "/tours", { priority: 0.9 }),
    entry(base, "/courses", { priority: 0.8 }),
    entry(base, "/prayer", { changeFrequency: "daily", priority: 0.8 }),
    entry(base, "/asistan", { priority: 0.5 }),
    entry(base, "/donate", { priority: 0.6 }),
  ];

  // ── Dinamik içerik (yayınlanmış slug'lar) ───────────────────────────────
  let dynamicEntries: Entry[] = [];
  try {
    const [articles, courses, meetings] = await Promise.all([
      getPublishedArticles(),
      getPublishedCourses(),
      getPublishedMeetings(),
    ]);

    dynamicEntries = [
      ...articles.map((a) =>
        entry(base, `/articles/${a.slug}`, {
          lastModified: a.updatedAt ?? a.createdAt,
          changeFrequency: "monthly",
          priority: 0.7,
        })
      ),
      ...courses.map((c) =>
        entry(base, `/courses/${c.slug}`, {
          lastModified: c.updatedAt ?? c.createdAt,
          changeFrequency: "monthly",
          priority: 0.7,
        })
      ),
      ...meetings.map((m) =>
        entry(base, `/prayer/${m.slug}`, {
          lastModified: m.updatedAt ?? m.createdAt,
          changeFrequency: "weekly",
          priority: 0.6,
        })
      ),
    ];
  } catch {
    // DB erişilemezse en azından statik girişleri döndür.
    dynamicEntries = [];
  }

  return [...staticEntries, ...dynamicEntries];
}
