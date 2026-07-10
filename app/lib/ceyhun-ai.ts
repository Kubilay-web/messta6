// app/lib/ceyhun-ai.ts
// Admin içerik yardımcısı için SUNUCU tarafı yapay zekâ katmanı (Anthropic Claude).
// SDK'sız: doğrudan Messages API'sine fetch. ANTHROPIC_API_KEY yoksa zarifçe hata verir.

import "server-only";

const API_KEY = process.env.ANTHROPIC_API_KEY || "";
const MODEL = process.env.CEYHUN_AI_MODEL || "claude-sonnet-5";

export function isAiConfigured(): boolean {
  return Boolean(API_KEY);
}

const LANG_NAME: Record<string, string> = { tr: "Türkçe", en: "English", de: "Deutsch" };

const SYSTEM =
  "You are a careful writing assistant for 'Avrupa Uyanış Hizmetleri' (European Awakening Services), " +
  "a Christian ministry platform (sermons, biblical tourism in Turkey, online prayer, courses). " +
  "Write warm, respectful, pastoral and theologically careful content. Never invent Bible verse references; " +
  "if you cite Scripture, keep it accurate. Respond with ONLY the requested output, no preamble.";

type Article = { title: string; excerpt: string; body: string };

// Ham metinden JSON gövdesini güvenle çıkar (```json çitleri veya çevresel metin olsa da).
function extractJson<T>(text: string): T {
  let s = text.trim();
  s = s.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1) s = s.slice(first, last + 1);
  return JSON.parse(s) as T;
}

async function complete(user: string, maxTokens: number): Promise<string> {
  if (!API_KEY) throw new Error("AI yapılandırılmadı: ANTHROPIC_API_KEY eksik.");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: SYSTEM,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`AI hatası (${res.status}): ${t.slice(0, 300)}`);
  }
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  return (data.content ?? [])
    .filter((b) => b.type === "text" && b.text)
    .map((b) => b.text as string)
    .join("\n")
    .trim();
}

// Bir konudan tek dilde yazı taslağı (başlık + özet + zengin HTML gövde).
export async function draftArticle(topic: string, lang: string): Promise<Article> {
  const langName = LANG_NAME[lang] ?? "Türkçe";
  const user =
    `Write a blog/sermon-style article in ${langName}.\n` +
    `Topic: "${topic}".\n` +
    `Return ONLY minified JSON with exactly these keys:\n` +
    `{"title": "<compelling title>", "excerpt": "<one-sentence summary>", ` +
    `"body": "<HTML using only <h2>,<h3>,<p>,<ul>,<li>,<strong>,<blockquote> tags; 4-7 paragraphs>"}\n` +
    `No markdown code fences. HTML must be valid and use double quotes escaped for JSON.`;
  const raw = await complete(user, 3000);
  const out = extractJson<Article>(raw);
  return { title: out.title ?? "", excerpt: out.excerpt ?? "", body: out.body ?? "" };
}

// Bir yazıyı kaynak dilden hedef dillere çevir (HTML etiketleri korunur).
export async function translateArticle(
  source: Article,
  from: string,
  targets: string[]
): Promise<Record<string, Article>> {
  const fromName = LANG_NAME[from] ?? from;
  const targetSpec = targets.map((t) => `"${t}" (${LANG_NAME[t] ?? t})`).join(", ");
  const user =
    `Translate the following article from ${fromName} into these languages: ${targetSpec}.\n` +
    `Preserve all HTML tags and structure in "body"; translate only human-readable text. ` +
    `Keep the tone pastoral and natural (not literal).\n\n` +
    `SOURCE (JSON):\n${JSON.stringify(source)}\n\n` +
    `Return ONLY minified JSON keyed by language code, e.g. ` +
    `{${targets.map((t) => `"${t}":{"title":"..","excerpt":"..","body":".."}`).join(",")}}\n` +
    `No markdown code fences.`;
  const raw = await complete(user, 4000);
  return extractJson<Record<string, Article>>(raw);
}
