// app/components/ceyhun/SmartImage.tsx
// ────────────────────────────────────────────────────────────────────────────
// GELİŞMİŞ GÖRÜNTÜ BİLEŞENİ (Advanced Image wrapper)
//
// next/image üzerine ince bir sarmalayıcı. Ekstra olarak:
//   • Otomatik "blur-up" placeholder (yumuşak shimmer) — CLS'i sıfırlar, algılanan
//     hızı artırır. Harici blurDataURL üretmeye gerek kalmaz.
//   • Akıllı `sizes` varsayılanı (responsive srcset için).
//   • Makul `quality` varsayılanı.
//   • `fill` veya sabit boyut ile çalışır; tüm next/image prop'larını geçirir.
//
// Kullanım örnekleri:
//   <SmartImage src={url} alt="" fill sizes="100vw" />
//   <SmartImage src={url} alt={name} width={96} height={96} />
// ────────────────────────────────────────────────────────────────────────────

import Image, { type ImageProps } from "next/image";

// ── Host allowlist guard ────────────────────────────────────────────────────
// next/image optimizasyon açıkken, `next.config.ts` remotePatterns'da OLMAYAN
// bir host'lu src için sunucu render'ında RangeError-benzeri "hostname not
// configured" hatası fırlatır → sayfa 500. Görsel URL'leri admin'den geldiği
// için (dışarıdan yapıştırılmış bir link olabilir), allowlist dışı host'ları
// `unoptimized` (optimizer'ı atla, doğrudan yükle) render ederek çökmeyi önler.
// Allowlist next.config.ts ile BİREBİR aynı tutulmalı.
const EXACT_HOSTS = new Set([
  "sb52wuzhjx.ufs.sh",
  "res.cloudinary.com",
  "i.ytimg.com",
  "img.youtube.com",
  "i.vimeocdn.com",
  "image.mux.com",
]);
const SUFFIX_HOSTS = [".ufs.sh", ".cloudinary.com"];

/** src optimize edilebilir mi (allowlist'te / yerel / data-uri)? Değilse unoptimized gerekir. */
export function isOptimizableSrc(src: ImageProps["src"]): boolean {
  if (typeof src !== "string") return true; // StaticImport → yerel, güvenli
  if (!src) return true;
  if (src.startsWith("/") || src.startsWith("data:") || src.startsWith("blob:")) return true; // yerel
  let host: string;
  try {
    host = new URL(src).hostname.toLowerCase();
  } catch {
    return true; // parse edilemeyen (göreli vb.) → optimizer'a bırak
  }
  if (EXACT_HOSTS.has(host)) return true;
  return SUFFIX_HOSTS.some((suf) => host.endsWith(suf));
}

// Hafif, tema-nötr shimmer SVG → base64 blur placeholder.
// (Gri tonlu yumuşak degrade; herhangi bir görsel için güvenli.)
function shimmer(w: number, h: number) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#eae6dd" offset="20%" />
      <stop stop-color="#f4f1ea" offset="50%" />
      <stop stop-color="#eae6dd" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#eae6dd" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.4s" repeatCount="indefinite" />
</svg>`;
}

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

/** Verilen boyut için hazır blur data URI üretir. */
export function blurDataURL(w = 700, h = 475) {
  return `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`;
}

export type SmartImageProps = ImageProps & {
  /** Blur placeholder'ı kapatmak için false ver. Varsayılan: açık. */
  blur?: boolean;
};

export default function SmartImage({
  blur = true,
  sizes,
  quality,
  placeholder,
  blurDataURL: providedBlur,
  unoptimized,
  ...props
}: SmartImageProps) {
  // `fill` yoksa width/height'tan blur boyutunu türet.
  const w = typeof props.width === "number" ? props.width : 700;
  const h = typeof props.height === "number" ? props.height : 475;

  const usePlaceholder =
    placeholder ?? (blur ? "blur" : undefined);

  // Çağıran açıkça belirtmediyse, allowlist dışı host'ları unoptimized yap (çökme koruması).
  const resolvedUnoptimized = unoptimized ?? !isOptimizableSrc(props.src);

  return (
    <Image
      {...props}
      unoptimized={resolvedUnoptimized}
      quality={quality ?? 78}
      // fill kullanılıyorsa çağıran taraf `sizes` vermeli; yoksa güvenli varsayılan.
      sizes={sizes ?? (props.fill ? "100vw" : undefined)}
      placeholder={usePlaceholder}
      blurDataURL={
        usePlaceholder === "blur"
          ? providedBlur ?? blurDataURL(w, h)
          : undefined
      }
    />
  );
}
