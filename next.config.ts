import type { NextConfig } from "next";
import path from "path";

// ────────────────────────────────────────────────────────────────────────────
// GELİŞMİŞ PERFORMANS YAPILANDIRMASI (Advanced Performance Config)
//
// Bellek anahtarı:  NEXT_LOW_MEMORY=1  → düşük RAM'li makinelerde derleme için
//   minify + webpack persistent cache KAPATILIR (eski davranış korunur).
//   Ayarlanmazsa (varsayılan/production): tam optimizasyon (SWC minify + cache).
//
// Görüntü anahtarı: NEXT_IMAGES_UNOPTIMIZED=1 → Next görüntü optimizasyonunu
//   tamamen kapatır (listelenmemiş bir host görsel kırılması yaparsa kaçış yolu).
//   Varsayılan: AVIF/WebP + responsive yeniden boyutlandırma AÇIK.
// ────────────────────────────────────────────────────────────────────────────

const LOW_MEMORY = process.env.NEXT_LOW_MEMORY === "1";
const IMAGES_UNOPTIMIZED = process.env.NEXT_IMAGES_UNOPTIMIZED === "1";

const nextConfig: NextConfig = {
  trailingSlash: false,

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Yanıtları gzip/br ile sıkıştır; "X-Powered-By" başlığını gizle (güvenlik + bayt).
  compress: true,
  poweredByHeader: false,

  sassOptions: {
    includePaths: [path.join(__dirname, "public/assets/scss")],
    silenceDeprecations: ["legacy-js-api"],
    quietDeps: true,
  },

  reactStrictMode: false,

  productionBrowserSourceMaps: false, // source map üretimini kapat (küçük + hızlı build)

  // ── GELİŞMİŞ KOD BÖLME: barrel-import optimizasyonu ───────────────────────
  // Bu paketlerden `import { X } from "paket"` yapıldığında, Next SADECE
  // kullanılan alt-modülü paketler (ör. tek bir lucide ikonu → binlerce ikon
  // yerine). İlk yük (initial) JS'ini ciddi ölçüde küçültür.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "date-fns",
      "dayjs",
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-slot",
      "@tanstack/react-query",
    ],
  },

  webpack(config, { isServer, dev }) {
    // Yalnızca düşük-bellek modunda ağır optimizasyonları kapat; aksi halde
    // SWC minify + persistent cache açık kalır (daha küçük paket, daha hızlı rebuild).
    if (LOW_MEMORY && !isServer && !dev) {
      config.optimization.minimize = false;
      config.cache = false;
    }
    return config;
  },

  rewrites: async () => {
    return [
      {
        source: "/social/hashtag/:tag",
        destination: "/social/search?q=%23:tag",
      },
    ];
  },

  // ── GELİŞMİŞ STATİK VARLIK ÖNBELLEKLEME (HTTP cache başlıkları) ────────────
  headers: async () => {
    return [
      {
        // Derlenmiş/parmak-izli CSS & JS ve public/assets: uzun ömürlü, immutable.
        source: "/assets/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Yazı tipleri: uzun ömürlü, immutable.
        source: "/:path*.(woff|woff2|ttf|otf|eot)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Tüm rotalar için güvenlik + performans başlıkları.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  images: {
    // ── GELİŞMİŞ GÖRÜNTÜ OPTİMİZASYONU ──────────────────────────────────────
    unoptimized: IMAGES_UNOPTIMIZED,
    // Modern formatlar: aynı görselde %30–50 daha küçük bayt.
    formats: ["image/avif", "image/webp"],
    // Ölçeklenmiş varyantlar için kırılım noktaları (responsive srcset).
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Optimize edilmiş görseller için CDN/tarayıcı önbellek ömrü (30 gün).
    minimumCacheTTL: 60 * 60 * 24 * 30,
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    remotePatterns: [
      { protocol: "https", hostname: "sb52wuzhjx.ufs.sh", pathname: "/f/*" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.vimeocdn.com" },
      { protocol: "https", hostname: "image.mux.com" },
      // UploadThing / Cloudinary alt alan adları için joker.
      { protocol: "https", hostname: "**.ufs.sh" },
      { protocol: "https", hostname: "**.cloudinary.com" },
    ],
  },
};

export default nextConfig;
