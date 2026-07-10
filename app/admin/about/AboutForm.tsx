"use client";

// app/admin/about/AboutForm.tsx
// Hakkımızda sayfası düzenleyicisi — çok dilli zengin metin (resim gömülebilir).

import { useActionState, useEffect, useState } from "react";
import { Save, Check } from "lucide-react";
import { saveAbout, type AdminResult } from "../ceyhun-actions";
import RichTextField from "../_components/RichTextField";

type Lang = { tr: string; en: string; de: string };

const initial: AdminResult = { ok: false };

export default function AboutForm({ about }: { about: Lang }) {
  const [state, formAction, pending] = useActionState(saveAbout, initial);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (state.ok) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 2500);
      return () => clearTimeout(t);
    }
  }, [state]);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="mb-1 font-syne text-lg font-bold">Hakkımızda içeriği</h2>
        <p className="mb-2 text-sm text-ink/50">
          Avrupa Uyanış Hizmetleri&apos;nin kim/ne olduğunu anlatan metin. Başlık, liste, bağlantı ve{" "}
          <strong>resim</strong> ekleyebilirsiniz. Üç dil de ayrı düzenlenir.
        </p>
        <RichTextField base="about" label="Hakkımızda" value={about} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-ceyhun-ink px-6 py-3 text-sm font-medium text-white hover:bg-ceyhun-gold-deep disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {pending ? "Kaydediliyor…" : "Kaydet"}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
            <Check className="h-4 w-4" /> Kaydedildi
          </span>
        )}
        {state.message && !state.ok && <span className="text-sm text-red-600">{state.message}</span>}
      </div>
    </form>
  );
}
