"use client";

// app/admin/_components/RichTextField.tsx
// TR/EN/DE sekmeli zengin metin (HTML) editörü — react-quill-new.
// Her dilin HTML çıktısı gizli input `${base}_${lang}` içine yazılır; server action
// bunları packLangFromForm ile toplar.

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-40 animate-pulse rounded-lg border border-black/10 bg-gray-50" />
  ),
});

const LANGS = [
  { code: "tr", flag: "🇹🇷" },
  { code: "en", flag: "🇬🇧" },
  { code: "de", flag: "🇩🇪" },
] as const;

type LangVal = { tr?: string; en?: string; de?: string };

// Toolbar "resim" düğmesi: dosya seç → /api/admin/upload (Cloudinary) → düzenleyiciye göm.
// Quill, handler'ı toolbar modülü bağlamıyla (this.quill) çağırır.
type QuillLike = {
  getSelection: (focus?: boolean) => { index: number; length: number };
  setSelection: (index: number, length?: number) => void;
  insertText: (index: number, text: string, format?: string, value?: unknown) => void;
  deleteText: (index: number, length: number) => void;
  insertEmbed: (index: number, type: string, value: string, source?: string) => void;
};
function imageHandler(this: { quill: QuillLike }) {
  const quill = this.quill;
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.click();
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    const range = quill.getSelection(true);
    // Yükleme sırasında yer tutucu metin.
    quill.insertText(range.index, "  yükleniyor…", "italic", true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "articles");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      quill.deleteText(range.index, "  yükleniyor…".length);
      if (res.ok && data?.url) {
        quill.insertEmbed(range.index, "image", data.url, "user");
        quill.setSelection(range.index + 1, 0);
      } else {
        quill.insertText(range.index, `  [görsel yüklenemedi: ${data?.error ?? "hata"}]`, "user");
      }
    } catch {
      quill.deleteText(range.index, "  yükleniyor…".length);
      quill.insertText(range.index, "  [görsel yüklenemedi]", "user");
    }
  };
}

const MODULES = {
  toolbar: {
    container: [
      [{ header: [2, 3, false] }],
      ["bold", "italic", "underline", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
    handlers: { image: imageHandler },
  },
};

export default function RichTextField({
  base,
  label,
  value,
}: {
  base: string;
  label: string;
  value?: LangVal;
}) {
  const [active, setActive] = useState<(typeof LANGS)[number]["code"]>("tr");
  const [vals, setVals] = useState<LangVal>({
    tr: value?.tr ?? "",
    en: value?.en ?? "",
    de: value?.de ?? "",
  });

  const set = (code: keyof LangVal, html: string) =>
    setVals((v) => ({ ...v, [code]: html }));

  const editors = useMemo(() => LANGS, []);

  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-ink/50">{label} (TR / EN / DE)</span>
        <div className="flex gap-1">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setActive(l.code)}
              className={`rounded-md px-2 py-1 text-xs transition-colors ${
                active === l.code
                  ? "bg-ceyhun-ink text-white"
                  : "bg-gray-100 text-ink/50 hover:bg-gray-200"
              }`}
            >
              {l.flag} {l.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {editors.map((l) => (
        <div key={l.code} className={active === l.code ? "block" : "hidden"}>
          <div className="ceyhun-quill rounded-lg border border-black/10 bg-white">
            <ReactQuill
              theme="snow"
              value={vals[l.code] ?? ""}
              onChange={(html) => set(l.code, html)}
              modules={MODULES}
            />
          </div>
          <input type="hidden" name={`${base}_${l.code}`} value={vals[l.code] ?? ""} readOnly />
        </div>
      ))}
      <style>{`.ceyhun-quill .ql-container{min-height:180px;font-size:15px}.ceyhun-quill .ql-editor{min-height:180px}`}</style>
    </div>
  );
}
