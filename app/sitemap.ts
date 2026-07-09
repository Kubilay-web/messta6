import type { MetadataRoute } from "next";
import { siteUrl } from "@/app/lib/i18n-routing";

// Sitemap saatte bir yenilenir. Üretimde mutlak host için NEXT_PUBLIC_SITE_URL ayarlayın.
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

// Öneksiz tek URL girişi (locale çerezle yönetiliyor, hreflang alternatifi yok).
function entry(
  base: string,
  path: string,
  opts: {
    lastModified?: string | Date;
    changeFrequency?: Entry["changeFrequency"];
    priority?: number;
  }
): Entry {
  return {
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: opts.lastModified ?? new Date(),
    changeFrequency: opts.changeFrequency ?? "weekly",
    priority: opts.priority ?? 0.5,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const staticEntries: Entry[] = [
    entry(base, "/", { changeFrequency: "daily", priority: 1 }),
  ];

  return staticEntries;
}
