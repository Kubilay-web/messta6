// app/api/admin/ai/assist/route.ts
// Admin içerik yardımcısı uç noktası (Claude). requireCeyhunCap("content") ister.
// action: "draft" → { topic, lang } · "translate" → { source, from, targets }.

import { NextResponse } from "next/server";
import { requireCeyhunCap } from "@/app/lib/ceyhun-auth";
import { isAiConfigured, draftArticle, translateArticle } from "@/app/lib/ceyhun-ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    await requireCeyhunCap("content");
  } catch {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "AI yapılandırılmadı. .env dosyasına ANTHROPIC_API_KEY ekleyin." },
      { status: 503 }
    );
  }

  let body: {
    action?: string;
    topic?: string;
    lang?: string;
    from?: string;
    targets?: string[];
    source?: { title: string; excerpt: string; body: string };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const LANGS = ["tr", "en", "de"];

  try {
    if (body.action === "draft") {
      const topic = (body.topic ?? "").trim();
      const lang = LANGS.includes(body.lang ?? "") ? body.lang! : "tr";
      if (topic.length < 3) return NextResponse.json({ error: "Konu çok kısa." }, { status: 400 });
      const article = await draftArticle(topic, lang);
      return NextResponse.json({ lang, article });
    }

    if (body.action === "translate") {
      const from = LANGS.includes(body.from ?? "") ? body.from! : "tr";
      const targets = (body.targets ?? []).filter((t) => LANGS.includes(t) && t !== from);
      const src = body.source;
      if (!src || !(src.title || src.body)) {
        return NextResponse.json({ error: "Çevrilecek kaynak içerik boş." }, { status: 400 });
      }
      if (targets.length === 0) return NextResponse.json({ error: "Hedef dil yok." }, { status: 400 });
      const result = await translateArticle(src, from, targets);
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: "Bilinmeyen işlem." }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI isteği başarısız.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
