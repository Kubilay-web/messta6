"use client";

// app/lib/useLocale.ts
// Provider gerektirmeyen, hafif istemci dil yardımcısı.
// Tek paylaşılan çerezi (NEXT_LOCALE) okur ve "localechange" olayını dinleyerek
// dil değişiminde canlı güncellenir. Sidebar gibi provider dışındaki bileşenler kullanır.

import { useEffect, useState } from "react";

export type ClientLocale = "tr" | "en" | "de";
export const LOCALE_COOKIE = "NEXT_LOCALE";
export const LOCALE_EVENT = "localechange";

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

// Geçerli dili döndüren hook. Hidrasyon uyumu için "tr" ile başlar, mount'ta günceller.
export function useClientLocale(): ClientLocale {
  const [lang, setLang] = useState<ClientLocale>("tr");
  useEffect(() => {
    const sync = () => setLang(readLocaleCookie());
    sync();
    window.addEventListener(LOCALE_EVENT, sync);
    return () => window.removeEventListener(LOCALE_EVENT, sync);
  }, []);
  return lang;
}
