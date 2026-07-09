"use client";

// app/components/site-i18n/LocaleSwitcher.tsx
// Bağımsız (provider gerektirmeyen) dil değiştirici. Geçerli dili çerezden
// (useCurrentLocale → NEXT_LOCALE) okur, seçimde çerezi yazıp sayfayı yeniden
// yükler. URL öneksiz olduğu için yol değişmez. Ana site sunucu tarafı getSiteT()
// ile render edildiği için tam sayfa render tüm metinleri yeni dile geçirir.

import React, { useEffect, useRef, useState } from "react";
import { SITE_LANGS } from "./site-dictionary";
import { useCurrentLocale } from "@/app/components/LocaleLink";
import { setLocaleCookie } from "@/app/lib/useLocale";

export default function LocaleSwitcher({
  className = "",
}: {
  className?: string;
}) {
  const lang = useCurrentLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Dil değiştir: çerez + <html lang> anında güncellenir, sonra sayfa yeniden yüklenir.
  // Ana site metinleri hem sunucu (getSiteT) hem istemci (useSiteT) kaynaklı olduğundan,
  // tam sayfa render TÜM metinlerin aynı anda yeni dile geçmesini garantiler.
  const changeLang = (l: (typeof SITE_LANGS)[number]["code"]) => {
    if (l === lang) {
      setOpen(false);
      return;
    }
    setLocaleCookie(l);
    window.location.reload();
  };

  // Dışına tıklanınca menüyü kapat.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const active = SITE_LANGS.find((l) => l.code === lang) ?? SITE_LANGS[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={active.label}
        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-1.5 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:gap-1.5 sm:px-2.5 sm:py-1.5"
      >
        <span>{active.flag}</span>
        <span className="hidden sm:inline">{active.code.toUpperCase()}</span>
        <span className="text-[10px] text-gray-400 sm:text-xs">▾</span>
      </button>
      {open && (
        <div className="absolute end-0 right-0 z-[60] mt-1 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {SITE_LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => changeLang(l.code)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-start text-sm hover:bg-gray-50 ${
                lang === l.code ? "font-semibold text-indigo-600" : "text-gray-700"
              }`}
            >
              <span>{l.flag}</span> {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
