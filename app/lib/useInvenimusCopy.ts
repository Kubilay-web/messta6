"use client";

// app/lib/useInvenimusCopy.ts
// İSTEMCİ bileşenleri için Invenimus landing içeriği. Locale çerezden (NEXT_LOCALE)
// türetilir ve "localechange" olayıyla canlı güncellenir. Provider gerekmez.

import { getInvenimusCopy, type InvenimusCopy } from "@/app/components/site-i18n/invenimus-content";
import { useClientLocale } from "./useLocale";

export function useInvenimusCopy(): { copy: InvenimusCopy; lang: "tr" | "en" | "de" } {
  const lang = useClientLocale();
  return { copy: getInvenimusCopy(lang), lang };
}
