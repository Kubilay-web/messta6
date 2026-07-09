"use client";

// app/admin/_components/MultiLangField.tsx
// TR/EN/DE sekmeli çok dilli metin alanı. Her dil için gizli/görünür bir alan;
// form gönderiminde `${base}_tr`, `${base}_en`, `${base}_de` olarak taşınır.

import { useState } from "react";

const LANGS = [
  { code: "tr", flag: "🇹🇷", label: "Türkçe" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
] as const;

type LangVal = { tr?: string; en?: string; de?: string };

export default function MultiLangField({
  base,
  label,
  value,
  textarea = false,
  rows = 3,
  placeholder,
  required = false,
}: {
  base: string;
  label: string;
  value?: LangVal;
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
  required?: boolean;
}) {
  const [active, setActive] = useState<(typeof LANGS)[number]["code"]>("tr");

  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-ink/50">
          {label} {required && <span className="text-kotapink">*</span>}
        </span>
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

      {/* Tüm diller DOM'da; sadece aktif olan görünür → form hepsini gönderir */}
      {LANGS.map((l) => (
        <div key={l.code} className={active === l.code ? "block" : "hidden"}>
          {textarea ? (
            <textarea
              name={`${base}_${l.code}`}
              defaultValue={value?.[l.code] ?? ""}
              rows={rows}
              placeholder={placeholder ?? l.label}
              className="w-full resize-y rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceyhun-gold"
            />
          ) : (
            <input
              name={`${base}_${l.code}`}
              defaultValue={value?.[l.code] ?? ""}
              placeholder={placeholder ?? l.label}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceyhun-gold"
            />
          )}
        </div>
      ))}
    </div>
  );
}
