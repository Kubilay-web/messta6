import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/app/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description:
      "Özenle seçilmiş ürünler — hızlı kargo, güvenli ödeme, koşulsuz iade.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
