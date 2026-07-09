"use client";

// app/lib/useLocaleSwitch.ts
// Dil değiştirme yardımcısı. URL öneksiz olduğu için yalnızca çerezi yazar ve
// sunucu bileşenlerini yeni dille yeniden render etmek için refresh eder.

import { useRouter } from "next/navigation";
import { type Locale } from "./i18n-routing";
import { setLocaleCookie } from "./useLocale";

export function useLocaleSwitch() {
  const router = useRouter();

  return (l: Locale) => {
    setLocaleCookie(l); // çerez + <html lang> + "localechange" olayı
    router.refresh(); // sunucu bileşenleri yeni dilde yeniden render edilsin
  };
}
