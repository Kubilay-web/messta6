// app/lib/media-server.ts
// KENDİ Node.js medya sunucumuzla konuşan SUNUCU tarafı yardımcılar.
// Yalnız server bileşenlerinden / API route'lardan / server action'lardan import edilmeli
// (MEDIA_UPLOAD_SECRET / MEDIA_ADMIN_SECRET tarayıcıya sızmamalı).
//
// Akış:
//   1) Tarayıcı → Next.js'ten kısa ömürlü imzalı token alır (signMediaUpload).
//   2) Tarayıcı → dosyayı DOĞRUDAN medya sunucusuna yükler (secret sunucuda kalır).
//   3) Silme → yalnız sunucu-sunucu ADMIN_SECRET ile (deleteFromMediaServer).

import crypto from "crypto";

// Herkese açık taban adres (medya sunucusunun PUBLIC_URL'i ile aynı olmalı). Örn: https://medya.site.com
const PUBLIC_URL = (process.env.MEDIA_PUBLIC_URL || "").replace(/\/+$/, "");
const UPLOAD_SECRET = process.env.MEDIA_UPLOAD_SECRET || "";
const ADMIN_SECRET = process.env.MEDIA_ADMIN_SECRET || "";

export function isMediaServerConfigured(): boolean {
  return Boolean(PUBLIC_URL && UPLOAD_SECRET);
}

// Tarayıcının doğrudan yükleme yapması için kısa ömürlü (varsayılan 15 dk) imzalı token üretir.
// Token biçimi: "<exp>.<hmac>" — medya sunucusu aynı secret ile doğrular.
export function signMediaUpload(ttlSec = 900): { uploadUrl: string; token: string; publicUrl: string } {
  const exp = Math.round(Date.now() / 1000) + ttlSec;
  const signature = crypto.createHmac("sha256", UPLOAD_SECRET).update(String(exp)).digest("hex");
  return { uploadUrl: `${PUBLIC_URL}/upload`, token: `${exp}.${signature}`, publicUrl: PUBLIC_URL };
}

// Bir URL bizim medya sunucumuza mı ait?
export function isMediaServerUrl(url: string | null | undefined): boolean {
  return Boolean(url && PUBLIC_URL && url.startsWith(`${PUBLIC_URL}/`));
}

// Medya sunucusundaki bir videoyu (+ posterini) siler. Best-effort — hata DB işlemini engellemez.
export async function deleteFromMediaServer(url: string | null | undefined): Promise<void> {
  if (!isMediaServerUrl(url) || !ADMIN_SECRET) return;
  try {
    await fetch(url as string, {
      method: "DELETE",
      headers: { "x-admin-secret": ADMIN_SECRET },
    });
  } catch (e) {
    console.error("[media] silme hatası:", e);
  }
}
