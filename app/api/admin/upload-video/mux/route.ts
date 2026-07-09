// app/api/admin/upload-video/mux/route.ts
// Mux Direct Upload uç noktası. EDITOR+ ("upload") yetkisi ister.
//   POST → yeni bir Direct Upload oluşturur, { uploadId, uploadUrl } döner.
//         Tarayıcı dosyayı bu URL'ye DOĞRUDAN yükler (Next.js'ten geçmez → boyut limiti yok).
//   GET ?uploadId=… → asset durumu: waiting | processing | ready | errored.
//         "ready" olunca { assetId, playbackId, durationSec } döner.

import { NextResponse } from "next/server";
import { requireCeyhunCap } from "@/app/lib/ceyhun-auth";
import { createMuxDirectUpload, getMuxUploadResult, isMuxConfigured } from "@/app/lib/ceyhun-mux";

export const runtime = "nodejs";

async function guard(): Promise<NextResponse | null> {
  try {
    await requireCeyhunCap("upload");
  } catch {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }
  if (!isMuxConfigured()) {
    return NextResponse.json(
      { error: "Mux yapılandırılmamış (MUX_TOKEN_ID / MUX_TOKEN_SECRET eksik)." },
      { status: 500 }
    );
  }
  return null;
}

export async function POST(req: Request) {
  const blocked = await guard();
  if (blocked) return blocked;
  try {
    const corsOrigin = req.headers.get("origin") || new URL(req.url).origin || "*";
    const { uploadId, uploadUrl } = await createMuxDirectUpload(corsOrigin);
    return NextResponse.json({ uploadId, uploadUrl });
  } catch (e) {
    console.error("mux upload create", e);
    return NextResponse.json({ error: "Yükleme başlatılamadı." }, { status: 502 });
  }
}

export async function GET(req: Request) {
  const blocked = await guard();
  if (blocked) return blocked;
  const uploadId = new URL(req.url).searchParams.get("uploadId");
  if (!uploadId) return NextResponse.json({ error: "uploadId gerekli." }, { status: 400 });
  try {
    const result = await getMuxUploadResult(uploadId);
    return NextResponse.json(result);
  } catch (e) {
    console.error("mux upload status", e);
    return NextResponse.json({ status: "errored", error: "Durum alınamadı." }, { status: 502 });
  }
}
