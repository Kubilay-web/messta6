// middleware.ts (PROJE KÖKÜ — Next.js middleware yalnızca burada veya src/ içinde çalışır)
// Görevler (locale ARTIK URL'de taşınmaz — öneksiz "normal" linkler):
//  1) Dil çerezden (NEXT_LOCALE > Accept-Language > tr) tespit edilip x-locale header'ına yazılır.
//  2) İstek yolu x-pathname / x-internal-path olarak downstream sunucu bileşenlerine taşınır.
//  3) Çok-alan (cleververwaltet.de/.at) tespiti x-site/x-hostname ile taşınır.
//  4) Hiçbir yönlendirme (redirect) veya rewrite yapılmaz.

import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/app/lib/i18n-routing";

const LOCALE_COOKIE = "NEXT_LOCALE";

// Kullanıcının tercih ettiği dili tespit et: çerez → Accept-Language → varsayılan.
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

// Çok-alan tespiti (SEO / SSR metadata için).
function detectSite(hostname: string): string {
  if (hostname.includes("cleververwaltet.de")) return "de";
  if (hostname.includes("cleververwaltet.at")) return "at";
  return "global";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = req.nextUrl.hostname;
  const fullHost = req.headers.get("host") ?? hostname; // port dahil (mutlak URL için)
  const site = detectSite(hostname);
  const locale = detectLocale(req);

  // Downstream (layout/sayfa) sunucu bileşenlerinin okuyacağı istek header'ları.
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set("x-hostname", fullHost);
  reqHeaders.set("x-site", site);
  reqHeaders.set("x-pathname", pathname);
  reqHeaders.set("x-internal-path", pathname);
  reqHeaders.set("x-locale", locale);

  return NextResponse.next({ request: { headers: reqHeaders } });
}

export const config = {
  // _next, statik dosyalar (uzantılı), ve SEO dosyaları (robots/sitemap/manifest) hariç her yol.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|assets/|.*\\..*).*)",
  ],
};
