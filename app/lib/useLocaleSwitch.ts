"use client";

// app/lib/useLocaleSwitch.ts
// Dil değiştirme: aynı sayfada kal, URL önekini değiştir (/en/... → /de/...).
// Çerez de senkronlanır; navigasyon sunucu bileşenlerini yeni dille render eder.

import { useRouter, usePathname } from "next/navigation";
import { type Locale, swapLocaleInPath } from "./i18n-routing";
import { setLocaleCookie } from "./useLocale";

export function useLocaleSwitch() {
  const router = useRouter();
  const pathname = usePathname();

  return (l: Locale) => {
    setLocaleCookie(l); // çerez + <html lang> senkron
    router.push(swapLocaleInPath(pathname, l));
  };
}
