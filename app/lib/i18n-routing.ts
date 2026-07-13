// app/lib/i18n-routing.ts
// ────────────────────────────────────────────────────────────────────────────
// URL-PREFIX'Lİ + SEGMENT-ÇEVİRİLİ ÇOK DİLLİ YÖNLENDİRME
// (Locale-prefixed i18n routing WITH translated path segments)
//
// Tüm URL'ler hem dil öneki hem ÇEVRİLİ segment taşır:
//   /tr/makaleler · /en/articles · /de/artikel
//   /tr/galeri    · /en/gallery  · /de/galerie
//
//   • ROUTE_SEGMENTS   → iç (app/ klasör) adı ↔ her dildeki görünen segment.
//   • localizedHref    → iç yol → görünen çevrili URL (linkler bunu kullanır).
//   • toInternalPath   → görünen çevrili yol → iç yol (middleware rewrite için).
//   • buildAlternates  → canonical + hreflang (her dil kendi çevrili URL'iyle).
//   • middleware.ts    → öneksiz/yanlış-segment isteği doğru çevrili URL'e 308,
//                        doğru URL'i içte öneksiz+İngilizce rotaya rewrite eder.
// ────────────────────────────────────────────────────────────────────────────

export const LOCALES = ["tr", "en", "de"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";

// Open Graph için BCP-47 bölge kodları (og:locale).
export const OG_LOCALE: Record<Locale, string> = {
  tr: "tr_TR",
  en: "en_US",
  de: "de_DE",
};

// hreflang etiketleri (SEO).
export const HREFLANG: Record<Locale, string> = { tr: "tr", en: "en", de: "de" };

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

// ── İÇ ROTA ADI ↔ DİLE GÖRE GÖRÜNEN SEGMENT ─────────────────────────────────
// Anahtar = app/ içindeki gerçek klasör adı (iç yol). Değer = her dildeki URL.
// (Yalnızca İLK segment çevrilir; dinamik slug — /makaleler/<slug> — korunur.)
export const ROUTE_SEGMENTS = {
  articles: { tr: "makaleler", en: "articles", de: "artikel" },
  gallery: { tr: "galeri", en: "gallery", de: "galerie" },
  videos: { tr: "videolar", en: "videos", de: "videos" },
  tours: { tr: "turlar", en: "tours", de: "touren" },
  courses: { tr: "egitimler", en: "courses", de: "kurse" },
  prayer: { tr: "dua", en: "prayer", de: "gebet" },
  about: { tr: "hakkimizda", en: "about", de: "ueber-uns" },
  donate: { tr: "bagis", en: "donate", de: "spenden" },
  asistan: { tr: "asistan", en: "assistant", de: "assistent" },
  login: { tr: "giris", en: "login", de: "anmelden" },
  register: { tr: "kayit", en: "register", de: "registrieren" },
  admin: { tr: "admin", en: "admin", de: "admin" },
} as const;

// Ters indeks: görünen segment → iç ad (tüm diller + iç adın kendisi).
const SEG_TO_INTERNAL: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const [internal, map] of Object.entries(ROUTE_SEGMENTS)) {
    m[internal] = internal;
    for (const l of LOCALES) m[(map as Record<string, string>)[l]] = internal;
  }
  return m;
})();

// Yolu (path) query/hash'ten ayır.
function splitQuery(path: string): [string, string] {
  const i = path.search(/[?#]/);
  return i === -1 ? [path, ""] : [path.slice(0, i), path.slice(i)];
}

// (locale, İÇ yol) → görünen ÇEVRİLİ yol (öneksiz). "/articles/x" + tr → "/makaleler/x"
export function toLocalizedPath(locale: Locale, internal: string): string {
  if (typeof internal !== "string" || !internal.startsWith("/")) return internal;
  const [p, q] = splitQuery(internal);
  if (p === "/") return "/" + q;
  const segs = p.split("/"); // ["", "articles", "x"]
  const map = (ROUTE_SEGMENTS as Record<string, Record<string, string>>)[segs[1]];
  if (map) segs[1] = map[locale] ?? segs[1];
  return segs.join("/") + q;
}

// Görünen ÇEVRİLİ yol → İÇ yol (dilden bağımsız; tüm dilleri tanır).
// "/makaleler/x" → "/articles/x" · "/artikel" → "/articles"
export function toInternalPath(localized: string): string {
  if (typeof localized !== "string" || !localized.startsWith("/")) return localized;
  const [p, q] = splitQuery(localized);
  if (p === "/") return "/" + q;
  const segs = p.split("/");
  const internal = SEG_TO_INTERNAL[segs[1]];
  if (internal) segs[1] = internal;
  return segs.join("/") + q;
}

// Bir yolun başındaki DİL önekini ayrıştırır (segment çevirisine dokunmaz).
export function stripLocale(pathname: string): { locale: Locale | null; pathname: string } {
  if (typeof pathname !== "string" || !pathname.startsWith("/")) {
    return { locale: null, pathname: pathname || "/" };
  }
  const parts = pathname.split("/");
  if (isLocale(parts[1])) {
    const rest = "/" + parts.slice(2).join("/");
    return { locale: parts[1], pathname: rest === "/" ? "/" : rest.replace(/\/+$/, "") || "/" };
  }
  return { locale: null, pathname };
}

// (locale, İÇ yol) → görünen önekli + çevrili URL. Harici/hash/query ve zaten
// önekli yollara dokunmaz.  localizedHref("tr","/articles") → "/tr/makaleler"
export function localizedHref(locale: Locale, internalPath: string = "/"): string {
  if (
    typeof internalPath !== "string" ||
    !internalPath.startsWith("/") ||
    internalPath.startsWith("//")
  ) {
    return internalPath;
  }
  const seg = internalPath.split("/")[1];
  if (isLocale(seg)) return internalPath; // zaten önekli
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const localized = toLocalizedPath(l, internalPath);
  return `/${l}${localized === "/" ? "" : localized}`;
}

// Görünen bir yolda dili değiştir (aynı sayfa, öneki + segmenti çevir).
// "/en/articles" + "de" → "/de/artikel"
export function swapLocaleInPath(browserPath: string, toLocale: Locale): string {
  const { pathname } = stripLocale(browserPath);
  const internal = toInternalPath(pathname);
  return localizedHref(toLocale, internal);
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

// Bir sayfanın SEO alternatif bloğu: her dil KENDİ çevrili URL'iyle canonical +
// hreflang (+ x-default). internalPath: İÇ yol ("/", "/articles", "/articles/slug").
export function buildAlternates(
  currentLocale: Locale,
  internalPath: string,
  base: string
): { canonical: string; languages: Record<string, string> } {
  // Gelen yol öneksiz iç yoldur; her ihtimale karşı normalize et.
  const clean = toInternalPath(stripLocale(internalPath).pathname);

  const abs = (l: Locale) => {
    const lp = toLocalizedPath(l, clean);
    return `${base}/${l}${lp === "/" ? "" : lp}`;
  };

  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[HREFLANG[l]] = abs(l);
  languages["x-default"] = abs(DEFAULT_LOCALE);

  const cur = isLocale(currentLocale) ? currentLocale : DEFAULT_LOCALE;
  return { canonical: abs(cur), languages };
}

// robots.ts için: özel iç yolları TÜM dillere çevirip önekler.
export function localizedDisallow(internalPaths: string[]): string[] {
  const out = new Set<string>();
  for (const p of internalPaths) for (const l of LOCALES) out.add(localizedHref(l, p));
  return Array.from(out);
}
