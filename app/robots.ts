import type { MetadataRoute } from "next";
import { siteUrl, localizedDisallow } from "@/app/lib/i18n-routing";

// Özel/işlevsel dahili yollar — tüm dillerin çevrili + önekli görünümleri üretilir.
const PRIVATE_INTERNAL = [
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
        disallow: ["/api/", ...localizedDisallow(PRIVATE_INTERNAL)],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
