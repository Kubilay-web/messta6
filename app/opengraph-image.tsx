// app/opengraph-image.tsx
// Site geneli varsayılan sosyal paylaşım görseli (OG + Twitter).
// Statik dosya gerektirmeden next/og ile üretilir; sayfa kendi görselini
// vermezse tüm paylaşımlarda bu markalı kart görünür.
import { ImageResponse } from "next/og";
import { BRAND_NAME, BRAND_TAGLINE_TR } from "@/app/lib/seo";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = BRAND_NAME;

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0b0b0b 0%, #1a1206 100%)",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: 34,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#d4af37",
            fontWeight: 700,
          }}
        >
          European Awakening Services
        </div>
        <div
          style={{
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 24,
            maxWidth: 960,
          }}
        >
          {BRAND_NAME}
        </div>
        <div style={{ fontSize: 36, color: "#e6dcc4", marginTop: 28, maxWidth: 900 }}>
          {BRAND_TAGLINE_TR}
        </div>
      </div>
    ),
    { ...size }
  );
}
