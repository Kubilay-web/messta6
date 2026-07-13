// middleware.ts (PROJE KÖKÜ)
// ────────────────────────────────────────────────────────────────────────────
// URL-PREFIX'Lİ + SEGMENT-ÇEVİRİLİ ÇOK DİLLİLİK
// Tüm URL'ler: /tr/makaleler · /en/articles · /de/artikel  (dil öneki + çeviri)
//
// Görevler:
//  1) ÖNEKSİZ istek ("/articles", "/makaleler", "/") → tespit edilen dilin DOĞRU
//     çevrili URL'ine 308 REDIRECT ("/tr/makaleler").
//  2) ÖNEKLİ ama YANLIŞ/çevrilmemiş segment ("/tr/articles") → doğru çevrili
//     forma 308 REDIRECT ("/tr/makaleler"). (Tek canonical URL → SEO temiz.)
//  3) ÖNEKLİ + DOĞRU segment ("/tr/makaleler") → içte öneksiz+İngilizce rotaya
//     REWRITE ("/articles") + x-locale header'ı. app/ klasör yapısı değişmez.
//  4) NEXT_LOCALE çerezi URL diliyle senkron; x-site/x-hostname/x-pathname taşınır.
// ────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_LOCALE,
  isLocale,
  toInternalPath,
  toLocalizedPath,
  type Locale,
} from "@/app/lib/i18n-routing";

const LOCALE_COOKIE = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 yıl

function detectLocale(req: NextRequest): Locale {
  const cookie = req.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;
  const accept = req.headers.get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return DEFAULT_LOCALE;
}

function detectSite(hostname: string): string {
  if (hostname.includes("cleververwaltet.de")) return "de";
  if (hostname.includes("cleververwaltet.at")) return "at";
  return "global";
}

function withCookie(res: NextResponse, locale: Locale) {
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  return res;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = req.nextUrl.hostname;
  const fullHost = req.headers.get("host") ?? hostname;
  const site = detectSite(hostname);

  const firstSeg = pathname.split("/")[1];
  const hasLocale = isLocale(firstSeg);

  // ── 1) ÖNEKSİZ → dilin doğru çevrili URL'ine 308 ────────────────────────
  if (!hasLocale) {
    const locale = detectLocale(req);
    const internal = toInternalPath(pathname); // /makaleler|/articles → /articles
    const localized = toLocalizedPath(locale, internal); // → /makaleler (tr)
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${localized === "/" ? "" : localized}`;
    return withCookie(NextResponse.redirect(url, 308), locale);
  }

  // ── önekli istek ──
  const locale = firstSeg as Locale;
  const localizedRest = pathname.slice(`/${locale}`.length) || "/"; // /makaleler/x
  const internalRest = toInternalPath(localizedRest); // /articles/x
  const correctLocalized = toLocalizedPath(locale, internalRest); // /makaleler/x

  // ── 2) YANLIŞ/çevrilmemiş segment → canonical çevrili forma 308 ─────────
  if (localizedRest !== correctLocalized) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${correctLocalized === "/" ? "" : correctLocalized}`;
    return withCookie(NextResponse.redirect(url, 308), locale);
  }

  // ── 3) DOĞRU segment → içte öneksiz rotaya rewrite + header'lar ─────────
  const url = req.nextUrl.clone();
  url.pathname = internalRest;

  const reqHeaders = new Headers(req.headers);
  reqHeaders.set("x-hostname", fullHost);
  reqHeaders.set("x-site", site);
  reqHeaders.set("x-locale", locale);
  reqHeaders.set("x-pathname", internalRest);
  reqHeaders.set("x-internal-path", internalRest);

  const res = NextResponse.rewrite(url, { request: { headers: reqHeaders } });
  if (req.cookies.get(LOCALE_COOKIE)?.value !== locale) withCookie(res, locale);
  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|assets/|.*\\..*).*)",
  ],
};
