"use client";

// app/lib/useSiteT.ts
// İSTEMCİ bileşenleri için site çeviri hook'u (SITE_DICT). Locale ARTIK çerezden
// (NEXT_LOCALE) türetilir — URL öneksiz olduğu için. Dil değişiminde "localechange"
// olayıyla canlı güncellenir. Provider gerekmez.

import {
  SITE_DICT,
  SiteDictKey,
} from "@/app/components/site-i18n/site-dictionary";
import { useClientLocale } from "./useLocale";

// Not: siteT.ts'ten İÇE AKTARMA — o modül next/headers çeker ve client bundle'ı bozar.
const SITE_LOCALE_TAG = { tr: "tr-TR", en: "en-US", de: "de-DE" } as const;

export function useSiteT() {
  const lang = useClientLocale();
  const t = (k: SiteDictKey) => SITE_DICT[lang]?.[k] ?? SITE_DICT.tr[k] ?? k;
  return { t, lang, localeTag: SITE_LOCALE_TAG[lang] };
}
