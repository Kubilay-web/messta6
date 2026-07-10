"use client";

// app/admin/articles/AiAssist.tsx
// Yazı editörü içi AI yardımcısı: (1) konudan taslak üret, (2) bir dilden diğerlerine çevir.
// Üretilen içerik onApply ile forma uygulanır (alanlar remount edilerek yenilenir).

import { useState } from "react";
import { Sparkles, Loader2, Wand2, Languages, ChevronDown } from "lucide-react";

type Lang = { tr: string; en: string; de: string };
type Code = "tr" | "en" | "de";
export type AiPatch = { title: Partial<Lang>; excerpt: Partial<Lang>; body: Partial<Lang> };

const LANGS: { code: Code; label: string }[] = [
  { code: "tr", label: "🇹🇷 Türkçe" },
  { code: "en", label: "🇬🇧 English" },
  { code: "de", label: "🇩🇪 Deutsch" },
];

export default function AiAssist({
  formRef,
  onApply,
}: {
  formRef: React.RefObject<HTMLFormElement | null>;
  onApply: (patch: AiPatch) => void;
}) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [lang, setLang] = useState<Code>("tr");
  const [from, setFrom] = useState<Code>("tr");
  const [busy, setBusy] = useState<null | "draft" | "translate">(null);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const readField = (name: string): string => {
    const el = formRef.current?.elements.namedItem(name) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    return el?.value ?? "";
  };

  async function post(payload: unknown) {
    const res = await fetch("/api/admin/ai/assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "İstek başarısız.");
    return data;
  }

  async function generateDraft() {
    setErr(null);
    setNote(null);
    if (topic.trim().length < 3) {
      setErr("Lütfen bir konu yazın.");
      return;
    }
    setBusy("draft");
    try {
      const data = await post({ action: "draft", topic: topic.trim(), lang });
      const a = data.article as { title: string; excerpt: string; body: string };
      onApply({
        title: { [lang]: a.title },
        excerpt: { [lang]: a.excerpt },
        body: { [lang]: a.body },
      });
      setNote(`Taslak ${LANGS.find((l) => l.code === lang)?.label} olarak dolduruldu.`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata.");
    } finally {
      setBusy(null);
    }
  }

  async function translate() {
    setErr(null);
    setNote(null);
    const source = {
      title: readField(`title_${from}`),
      excerpt: readField(`excerpt_${from}`),
      body: readField(`body_${from}`),
    };
    if (!source.title && !source.body) {
      setErr("Önce kaynak dilde başlık/gövde girin.");
      return;
    }
    const targets = LANGS.map((l) => l.code).filter((c) => c !== from);
    setBusy("translate");
    try {
      const data = await post({ action: "translate", from, targets, source });
      const r = (data.result ?? {}) as Record<string, { title: string; excerpt: string; body: string }>;
      const patch: AiPatch = { title: {}, excerpt: {}, body: {} };
      for (const c of targets) {
        if (r[c]) {
          patch.title[c] = r[c].title;
          patch.excerpt[c] = r[c].excerpt;
          patch.body[c] = r[c].body;
        }
      }
      onApply(patch);
      setNote("Çeviri diğer dillere uygulandı.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata.");
    } finally {
      setBusy(null);
    }
  }

  const sel =
    "rounded-lg border border-ceyhun-gold/30 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-ceyhun-gold";

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-ceyhun-gold/30 bg-ceyhun-gold/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold text-ceyhun-gold-deep"
      >
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> AI Yazı Yardımcısı
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-ceyhun-gold/20 px-4 py-4">
          {/* Taslak üret */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-ink/60">Konudan taslak üret</p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="ör. Lütuf nedir? / Yedi Kilise'nin önemi"
                className="min-w-0 flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold"
              />
              <select value={lang} onChange={(e) => setLang(e.target.value as Code)} className={sel}>
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={generateDraft}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded-full bg-ceyhun-ink px-3.5 py-2 text-xs font-semibold text-white hover:bg-ceyhun-gold-deep disabled:opacity-50"
              >
                {busy === "draft" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                Üret
              </button>
            </div>
          </div>

          {/* Çevir */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-ink/60">Bir dilden diğerlerine çevir</p>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-ink/50">Kaynak dil</label>
              <select value={from} onChange={(e) => setFrom(e.target.value as Code)} className={sel}>
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={translate}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded-full bg-ceyhun-ink px-3.5 py-2 text-xs font-semibold text-white hover:bg-ceyhun-gold-deep disabled:opacity-50"
              >
                {busy === "translate" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Languages className="h-3.5 w-3.5" />
                )}
                Diğer dillere çevir
              </button>
            </div>
          </div>

          {err && <p className="text-xs text-red-600">{err}</p>}
          {note && <p className="text-xs text-green-600">{note}</p>}
          <p className="text-[11px] text-ink/40">
            AI çıktısı taslaktır — yayınlamadan önce gözden geçirin. ANTHROPIC_API_KEY gerektirir.
          </p>
        </div>
      )}
    </div>
  );
}
