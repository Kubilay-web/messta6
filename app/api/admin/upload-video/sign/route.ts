// app/api/admin/upload-video/sign/route.ts
// Video için imzalı doğrudan yükleme uç noktası. EDITOR+ ("upload") yetkisi ister.
// Dosyayı SUNUCUDAN geçirmez — tarayıcı bu token'la doğrudan KENDİ medya sunucumuza yükler.
// Böylece GB'larca vaaz videosu serverless istek-boyutu limitine takılmaz (limitsiz).

import { NextResponse } from "next/server";
import { requireCeyhunCap } from "@/app/lib/ceyhun-auth";
import { signMediaUpload, isMediaServerConfigured } from "@/app/lib/media-server";

export const runtime = "nodejs";

export async function POST() {
  try {
    await requireCeyhunCap("upload");
  } catch {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  if (!isMediaServerConfigured()) {
    return NextResponse.json(
      { error: "Medya sunucusu yapılandırılmamış (MEDIA_PUBLIC_URL / MEDIA_UPLOAD_SECRET eksik)." },
      { status: 500 }
    );
  }

  const { uploadUrl, token, publicUrl } = signMediaUpload();
  return NextResponse.json({ uploadUrl, token, publicUrl });
}
