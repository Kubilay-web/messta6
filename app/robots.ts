import type { MetadataRoute } from "next";
import { siteUrl, localizedDisallow } from "@/app/lib/i18n-routing";

// Özel/işlevsel dahili yollar — tüm dillerin çevrili + önekli görünümleri üretilir.
const PRIVATE_INTERNAL = [
  "/admin",
  "/login",
  "/register",
];

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Hem öneksiz (redirect öncesi) hem tüm dil-önekli özel yolları kapat.
        disallow: ["/api/", ...PRIVATE_INTERNAL, ...localizedDisallow(PRIVATE_INTERNAL)],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
