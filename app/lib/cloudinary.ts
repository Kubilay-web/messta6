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

export default cloudinary;
