// app/lib/invenimusT.ts
// SUNUCU bileşenleri için Invenimus landing çeviri yardımcısı.
// Locale çerezden/URL'den (getServerLocale) gelir. page.tsx gibi async server
// bileşenleri kullanır.

import { getServerLocale } from "./locale";
import { getInvenimusCopy, type InvenimusCopy } from "@/app/components/site-i18n/invenimus-content";
import type { Locale } from "./i18n-routing";

export async function getInvenimusT(): Promise<{ copy: InvenimusCopy; lang: Locale }> {
  const lang = (await getServerLocale()) as Locale;
  return { copy: getInvenimusCopy(lang), lang };
}
