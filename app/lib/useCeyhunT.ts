"use client";

// app/lib/useCeyhunT.ts
// İSTEMCI bileşenleri için Ceyhun UI çevirisi. Locale çerezden (NEXT_LOCALE) türetilir,
// "localechange" olayıyla canlı güncellenir. Provider gerekmez.

import { getDict, type Dict } from "./ceyhun-i18n";
import { useClientLocale } from "./useLocale";
import type { Locale } from "./ceyhun";

export function useCeyhunT(): { t: Dict; locale: Locale } {
  const locale = useClientLocale() as Locale;
  return { t: getDict(locale), locale };
}
