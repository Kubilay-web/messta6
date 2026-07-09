// app/lib/ceyhun-mux.ts
// Mux ile SUNUCU tarafı yardımcılar (Basic tier, pay-as-you-go).
// Yalnız API route / server action'lardan import edilmeli — MUX_TOKEN_SECRET tarayıcıya sızmamalı.
//
// Akış (Direct Upload):
//   1) Tarayıcı → /api/admin/upload-video/mux (POST) ile imzalı yükleme URL'si alır.
//   2) Tarayıcı → dosyayı DOĞRUDAN Mux'a yükler (@mux/upchunk, parçalı + ilerleme).
//   3) Mux videoyu işler → asset "ready" olunca playbackId hazır (poll ile beklenir).
//   4) DB'de saklanan videoRef biçimi:  "<assetId>:<playbackId>"
//      (playbackId oynatma için, assetId silme için gerekir — tek alanda tutulur.)

import Mux from "@mux/mux-node";

const tokenId = process.env.MUX_TOKEN_ID || "";
const tokenSecret = process.env.MUX_TOKEN_SECRET || "";

export function isMuxConfigured(): boolean {
  return Boolean(tokenId && tokenSecret);
}

let _mux: Mux | null = null;
function client(): Mux {
  if (!_mux) _mux = new Mux({ tokenId, tokenSecret });
  return _mux;
}

// Tarayıcının doğrudan yüklemesi için tek kullanımlık Direct Upload oluşturur.
// corsOrigin = yükleyen sayfanın origin'i (Mux CORS için gerekir).
export async function createMuxDirectUpload(
  corsOrigin: string
): Promise<{ uploadId: string; uploadUrl: string }> {
  const upload = await client().video.uploads.create({
    cors_origin: corsOrigin || "*",
    new_asset_settings: {
      playback_policy: ["public"], // kurslar ücretsiz → herkese açık oynatma
      // "baseline" = Mux'un ucuz tier'ı (Dashboard'daki "Basic"); encoding ÜCRETSİZ, on-demand için birebir.
      // Daha yüksek görüntü/tam adaptif ladder istenirse "smart" yapılabilir (encoding ücretlenir).
      encoding_tier: "baseline",
    },
  });
  return { uploadId: upload.id, uploadUrl: upload.url };
}

export type MuxUploadResult =
  | { status: "waiting" | "processing" }
  | { status: "errored"; error?: string }
  | { status: "ready"; assetId: string; playbackId: string; durationSec: number };

// Yükleme sonrası asset'in hazır olup olmadığını kontrol eder (istemci poll eder).
export async function getMuxUploadResult(uploadId: string): Promise<MuxUploadResult> {
  const upload = await client().video.uploads.retrieve(uploadId);
  if (upload.status === "errored" || upload.status === "cancelled") {
    return { status: "errored", error: "Yükleme başarısız." };
  }
  if (!upload.asset_id) {
    // Dosya hâlâ yükleniyor ya da asset henüz oluşmadı.
    return { status: "waiting" };
  }
  const asset = await client().video.assets.retrieve(upload.asset_id);
  if (asset.status === "errored") return { status: "errored", error: "İşleme hatası." };
  if (asset.status !== "ready") return { status: "processing" };
  const playbackId = asset.playback_ids?.[0]?.id || "";
  if (!playbackId) return { status: "processing" };
  return {
    status: "ready",
    assetId: asset.id,
    playbackId,
    durationSec: Math.round(asset.duration || 0),
  };
}

// videoRef ("<assetId>:<playbackId>") içinden Mux asset'ini siler. Best-effort.
export async function deleteMuxByRef(ref: string | null | undefined): Promise<void> {
  if (!ref || !isMuxConfigured()) return;
  const i = ref.indexOf(":");
  const assetId = i === -1 ? "" : ref.slice(0, i);
  if (!assetId) return;
  try {
    await client().video.assets.delete(assetId);
  } catch (e) {
    console.error("[mux] silme hatası:", e);
  }
}
