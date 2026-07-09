// app/lib/i18n-routing.ts
// Locale ARTIK URL'de taşınmaz. Diller çerezle (NEXT_LOCALE) yönetilir; URL'ler
// öneksiz, "normal" linklerdir: /login, /register, /shop/cart ...
// Bu modül geriye dönük uyumluluk için aynı fonksiyon adlarını korur ama artık
// hiçbir /tr /en /de öneki ya da çevrili slug üretmez.

export const LOCALES = ["tr", "en", "de"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";

// Open Graph için BCP-47 bölge kodları (og:locale).
export const OG_LOCALE: Record<Locale, string> = {
  tr: "tr_TR",
  en: "en_US",
  de: "de_DE",
};

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

// Önek/çeviri kalmadı: yollar dahili (canonical) hâliyle kullanılır.
export function toLocalizedPath(_locale: Locale, internal: string): string {
  return internal;
}

// Görünen yol = dahili yol (artık slug çevirisi yok).
export function toInternalPath(_locale: Locale, localized: string): string {
  return localized;
}

// URL'de locale öneki taşınmadığı için asla ayrıştırma yapılmaz.
export function stripLocale(pathname: string): {
  locale: Locale | null;
  pathname: string;
} {
  return { locale: null, pathname };
}

// (locale, DAHİLİ yol) → görünen URL. Artık önek eklemez; yolu olduğu gibi döner.
// Harici / relatif / hash / query linklere dokunmaz.
export function localizedHref(_locale: Locale, internalPath: string = "/"): string {
  if (
    typeof internalPath !== "string" ||
    !internalPath.startsWith("/") ||
    internalPath.startsWith("//")
  ) {
    return internalPath;
  }
  return internalPath;
}

// Dil değişiminde URL değişmez (locale çerezde tutulur).
export function swapLocaleInPath(browserPath: string, _toLocale: Locale): string {
  return browserPath;
}

// Sitenin mutlak kök URL'i. Öncelik: NEXT_PUBLIC_SITE_URL > istek host'u > BASE_URL.
export function siteUrl(host?: string | null, proto: string = "https"): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/+$/, "");
  if (host) {
    const scheme = host.startsWith("localhost") || host.startsWith("127.") ? "http" : proto;
    return `${scheme}://${host}`.replace(/\/+$/, "");
  }
  return (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
}

// Bir sayfanın canonical bloğu. Tek URL olduğu için hreflang alternatifleri üretilmez.
// internalPath: DAHİLİ yol ("/", "/shop", "/shop/premium-urun").
export function buildAlternates(
  _currentLocale: Locale,
  internalPath: string,
  base: string
): { canonical: string; languages: Record<string, string> } {
  return {
    canonical: `${base}${internalPath === "/" ? "" : internalPath}`,
    languages: {},
  };
}

// robots.ts için: özel dahili yollar (öneksiz, olduğu gibi).
export function localizedDisallow(internalPaths: string[]): string[] {
  return Array.from(new Set(internalPaths));
}
