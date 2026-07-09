"use client";

// app/components/site-i18n/SiteLang.tsx
// Genel site dil context'i (TR/EN/DE) + dil değiştirici buton.
// Tercih çerezde (site_lang) saklanır.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  SITE_DICT,
  SITE_LANGS,
  SiteDictKey,
  SiteLang,
} from "./site-dictionary";
import { useLocaleSwitch } from "@/app/lib/useLocaleSwitch";

interface SiteLangValue {
  lang: SiteLang;
  setLang: (l: SiteLang) => void;
  t: (key: SiteDictKey) => string;
}

const Ctx = createContext<SiteLangValue | null>(null);

export function SiteLangProvider({
  initialLang = "tr",
  children,
}: {
  initialLang?: SiteLang;
  children: React.ReactNode;
}) {
  // Başlangıç dili sunucudan (URL/x-locale) gelir → ilk render doğru dilde, flash yok
  const [lang, setLangState] = useState<SiteLang>(initialLang);
  const switchLocale = useLocaleSwitch();

  // URL locale'i değişince (soft nav) state'i senkronla.
  useEffect(() => {
    setLangState(initialLang);
  }, [initialLang]);

  const setLang = useCallback(
    (l: SiteLang) => {
      setLangState(l); // anında UI geri bildirimi
      switchLocale(l); // çerez + URL'i /l/... yoluna taşı
    },
    [switchLocale]
  );

  const t = useCallback(
    (key: SiteDictKey) => SITE_DICT[lang]?.[key] ?? SITE_DICT.tr[key] ?? key,
    [lang]
  );

  const value = useMemo<SiteLangValue>(
    () => ({ lang, setLang, t }),
    [lang, setLang, t]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSiteLang() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSiteLang must be used within SiteLangProvider");
  return ctx;
}

// Bayraklı dil değiştirici açılır menü.
export function SiteLangSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useSiteLang();
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

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <span>{active.flag}</span>
        <span>{active.code.toUpperCase()}</span>
        <span className="text-xs text-gray-400">▾</span>
      </button>
      {open && (
        <div className="absolute end-0 right-0 z-50 mt-1 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {SITE_LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
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
