import type { MetadataRoute } from "next";
import { BRAND_NAME } from "@/app/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND_NAME,
    short_name: BRAND_NAME,
    description:
      "Avrupa Uyanış Hizmetleri — vaaz, Biblical turlar, online dua ve eğitimler.",
    start_url: "/tr",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
