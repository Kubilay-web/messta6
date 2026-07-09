// app/lib/ceyhunT.ts
// SUNUCU bileşenleri için Ceyhun UI çeviri yardımcısı. Locale çerezden/URL'den gelir.

import { getServerLocale } from "./locale";
import { getDict, type Dict } from "./ceyhun-i18n";
import type { Locale } from "./ceyhun";

export async function getCeyhunT(): Promise<{ t: Dict; locale: Locale }> {
  const locale = (await getServerLocale()) as Locale;
  return { t: getDict(locale), locale };
}
