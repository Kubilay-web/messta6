"use client";

// app/components/site/LangSwitcher.tsx
// Landing için provider gerektirmeyen bayraklı dil değiştirici.
// Locale çerezden (NEXT_LOCALE) okunur; seçim çereze yazılıp router.refresh ile
// sunucu bileşenleri yeni dilde yeniden render edilir.

import { useEffect, useRef, useState } from "react";
import { SITE_LANGS } from "@/app/components/site-i18n/site-dictionary";
import { useClientLocale } from "@/app/lib/useLocale";
import { useLocaleSwitch } from "@/app/lib/useLocaleSwitch";

export default function LangSwitcher({
  variant = "light",
  className = "",
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const lang = useClientLocale();
  const switchLocale = useLocaleSwitch();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const active = SITE_LANGS.find((l) => l.code === lang) ?? SITE_LANGS[0];
  const dark = variant === "dark";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Language"
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-medium transition-colors ${
          dark
            ? "border-paper/30 text-paper hover:bg-paper hover:text-ink"
            : "border-ink/25 text-ink hover:bg-ink hover:text-paper"
        }`}
      >
        <span>{active.flag}</span>
        <span>{active.code.toUpperCase()}</span>
        <span className="text-[10px] opacity-60">▾</span>
      </button>
      {open && (
        <div
          className={`absolute right-0 z-[80] mt-2 w-40 overflow-hidden rounded-xl border py-1 shadow-xl ${
            dark ? "border-white/10 bg-ink text-paper" : "border-ink/10 bg-white text-ink"
          }`}
        >
          {SITE_LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                switchLocale(l.code);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                dark ? "hover:bg-white/10" : "hover:bg-ink/5"
              } ${lang === l.code ? "font-semibold text-kotapink" : ""}`}
            >
              <span>{l.flag}</span> {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
