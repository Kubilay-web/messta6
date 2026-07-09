// app/lib/siteT.ts
// SUNUCU bileşenleri için site çeviri yardımcısı (SITE_DICT). Locale URL'den (x-locale)
// gelir. Header, Hero, ProductCard, LatestBlog gibi async server bileşenleri kullanır.

import { getServerLocale } from "./locale";
import {
  SITE_DICT,
  SiteDictKey,
} from "@/app/components/site-i18n/site-dictionary";

export const SITE_LOCALE_TAG = { tr: "tr-TR", en: "en-US", de: "de-DE" } as const;

export async function getSiteT() {
  const lang = await getServerLocale();
  const t = (k: SiteDictKey) => SITE_DICT[lang]?.[k] ?? SITE_DICT.tr[k] ?? k;
  return { t, lang, localeTag: SITE_LOCALE_TAG[lang] };
}
