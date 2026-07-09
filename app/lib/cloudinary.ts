// app/lib/cloudinary.ts
// SUNUCU tarafı Cloudinary yapılandırması + görsel yükleme yardımcısı.
// Yalnızca server bileşenlerinden / API route'lardan import edilmelidir (secret sızmasın).
//
// NOT: env anahtarları şu an NEXT_PUBLIC_ önekli. Secret'ı burada SUNUCUDA okuyoruz.
// Güvenlik için ileride .env'de NEXT_PUBLIC_CLOUDINARY_API_SECRET → CLOUDINARY_API_SECRET
// olarak yeniden adlandırılması önerilir (aşağıdaki fallback her iki ismi de destekler).

import { v2 as cloudinary } from "cloudinary";

const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const apiSecret =
  process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export function isCloudinaryConfigured() {
  return Boolean(cloudName && apiKey && apiSecret);
}

// Tarayıcıdan doğrudan (imzalı) yükleme için imza üretir.
// Büyük video dosyaları sunucudan geçmeden doğrudan Cloudinary'ye yüklenir.
// paramsToSign: file/api_key/resource_type/cloud_name HARİÇ, gönderilecek tüm alanlar (ör. folder).
export function signUpload(paramsToSign: Record<string, string | number> = {}): {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
} {
  const timestamp = Math.round(Date.now() / 1000);
  const toSign = { ...paramsToSign, timestamp };
  const signature = cloudinary.utils.api_sign_request(toSign, apiSecret as string);
  return { signature, timestamp, apiKey: apiKey as string, cloudName: cloudName as string };
}

export type UploadResult = { url: string; publicId: string; width?: number; height?: number };

// Buffer'ı Cloudinary'ye yükler. folder → "invenimus/<folder>".
export function uploadImage(buffer: Buffer, folder = "cms"): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `invenimus/${folder}`,
        resource_type: "image",
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary yükleme başarısız."));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        });
      }
    );
    stream.end(buffer);
  });
}

// Cloudinary secure_url'inden public_id + kaynak türünü çıkarır (silme için).
// Örn: https://res.cloudinary.com/<cloud>/video/upload/v123/invenimus/videos/abc.mp4
//      → { publicId: "invenimus/videos/abc", resourceType: "video" }
export function parseCloudinaryUrl(
  url: string | null | undefined
): { publicId: string; resourceType: "image" | "video" | "raw" } | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!/(^|\.)res\.cloudinary\.com$/.test(u.hostname)) return null;
    const parts = u.pathname.split("/").filter(Boolean); // [cloud, rtype, "upload", ...rest]
    const uploadIdx = parts.indexOf("upload");
    if (uploadIdx < 1) return null;
    const rtype = parts[uploadIdx - 1];
    let rest = parts.slice(uploadIdx + 1);
    // sürüm segmentini (v1234...) at
    if (rest[0] && /^v\d+$/.test(rest[0])) rest = rest.slice(1);
    if (!rest.length) return null;
    const last = rest[rest.length - 1].replace(/\.[^.]+$/, ""); // uzantıyı at
    const publicId = [...rest.slice(0, -1), last].join("/");
    const resourceType = rtype === "video" || rtype === "raw" ? (rtype as "video" | "raw") : "image";
    return { publicId, resourceType };
  } catch {
    return null;
  }
}

// Cloudinary URL'sine ait varlığı siler (best-effort; Cloudinary URL değilse sessizce geçer).
// Videoyu silmek, ondan türetilen poster/thumbnail'leri de temizler (invalidate).
export async function destroyByUrl(url: string | null | undefined): Promise<void> {
  const parsed = parseCloudinaryUrl(url);
  if (!parsed) return;
  try {
    await cloudinary.uploader.destroy(parsed.publicId, {
      resource_type: parsed.resourceType,
      invalidate: true,
    });
  } catch (e) {
    console.error("[cloudinary] destroy hatası:", e);
  }
}

export default cloudinary;
