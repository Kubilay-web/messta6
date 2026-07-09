// app/lib/locale.ts
// Sunucu tarafı geçerli dil kaynağı.
// Artık ÖNCELİK URL'dir: middleware, /tr /en /de önekinden okuyup `x-locale`
// istek header'ına yazar. Header yoksa (ör. henüz yönlenmemiş) çereze düşer.
// <html lang>, metadata ve provider başlangıç dili hep buradan beslenir.

import { cookies, headers } from "next/headers";

export type AppLocale = "tr" | "en" | "de";
export const APP_LOCALES: AppLocale[] = ["tr", "en", "de"];
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isAppLocale(v: unknown): v is AppLocale {
  return v === "tr" || v === "en" || v === "de";
}

// Sunucu bileşenlerinde geçerli dili döndürür: URL (x-locale) > çerez > "tr".
export async function getServerLocale(): Promise<AppLocale> {
  const h = await headers();
  const fromUrl = h.get("x-locale");
  if (isAppLocale(fromUrl)) return fromUrl;

  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isAppLocale(fromCookie) ? fromCookie : "tr";
}
