// app/api/admin/upload/route.ts
// Admin görsel yükleme uç noktası. EDITOR+ yetkisi ister; dosyayı Cloudinary'ye yükler.
// multipart/form-data ("file" alanı) alır, { url, publicId } döner.

import { NextResponse } from "next/server";
import { requireCeyhunCap } from "@/app/lib/ceyhun-auth";
import { uploadImage, isCloudinaryConfigured } from "@/app/lib/cloudinary";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"];

export async function POST(req: Request) {
  // Yetki: giriş yoksa /login'e yönlendirir; yetersiz rolde hata fırlatır.
  try {
    await requireCeyhunCap("upload");
  } catch {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary yapılandırılmamış (env anahtarları eksik)." },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const file = form.get("file");
  const folder = String(form.get("folder") ?? "cms").replace(/[^a-z0-9/_-]/gi, "") || "cms";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Yalnızca görsel dosyaları yüklenebilir." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Dosya 8MB sınırını aşıyor." }, { status: 413 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImage(buffer, folder);
    return NextResponse.json(result);
  } catch (e) {
    console.error("[admin/upload] Cloudinary hatası:", e);
    return NextResponse.json({ error: "Yükleme başarısız oldu." }, { status: 502 });
  }
}
