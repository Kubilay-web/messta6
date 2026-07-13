"use client";

// app/lib/useLocale.ts
// İSTEMCI dil kaynağı. Artık geçerli dil URL önekinden gelir ve sunucudan
// LocaleContext ile aktarılır → SSR ile birebir aynı (hidrasyon flash'ı YOK).
// Provider dışında kullanılırsa güvenli biçimde çereze/"tr"ye düşer.

import { createContext, useContext } from "react";

export type ClientLocale = "tr" | "en" | "de";
export const LOCALE_COOKIE = "NEXT_LOCALE";
export const LOCALE_EVENT = "localechange";

// Sunucudan (getServerLocale → x-locale) beslenen geçerli dil bağlamı.
export const LocaleContext = createContext<ClientLocale | null>(null);

export function readLocaleCookie(): ClientLocale {
  if (typeof document === "undefined") return "tr";
  const m = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
  const v = m ? decodeURIComponent(m[1]) : null;
  return v === "tr" || v === "en" || v === "de" ? v : "tr";
}

// Çerezi yazar, <html lang>'i günceller ve dinleyicilere haber verir.
export function setLocaleCookie(l: ClientLocale) {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${l};path=/;max-age=${
    60 * 60 * 24 * 365
  };SameSite=Lax`;
  document.documentElement.lang = l;
  window.dispatchEvent(new Event(LOCALE_EVENT));
}

// Geçerli dili döndüren hook. Öncelik: LocaleContext (SSR-doğru) > çerez > "tr".
export function useClientLocale(): ClientLocale {
  const ctx = useContext(LocaleContext);
  return ctx ?? readLocaleCookie();
}
