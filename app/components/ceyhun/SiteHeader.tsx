"use client";

// app/components/ceyhun/SiteHeader.tsx
// Ceyhun sitesi üst menüsü — sticky, mobil açılır menü, dil değiştirici, bağış CTA.

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, HandHeart } from "lucide-react";
import LangSwitcher from "@/app/components/site/LangSwitcher";
import { useCeyhunT } from "@/app/lib/useCeyhunT";
import { localizedHref, stripLocale, toInternalPath } from "@/app/lib/i18n-routing";

export default function SiteHeader({ name }: { name: string }) {
  const { t, locale } = useCeyhunT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Mobil menü açıkken sesli asistan widget'ını gizle (üst üste binmesin).
  useEffect(() => {
    document.body.classList.toggle("mobile-nav-open", open);
    return () => document.body.classList.remove("mobile-nav-open");
  }, [open]);

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/about", label: t.nav.about },
    { href: "/articles", label: t.nav.articles },
    { href: "/gallery", label: t.nav.gallery },
    { href: "/videos", label: t.nav.videos },
    { href: "/tours", label: t.nav.tours },
    { href: "/courses", label: t.nav.courses },
    { href: "/prayer", label: t.nav.prayer },
    { href: "/asistan", label: t.nav.assistant },
  ];

  // Aktif link tespiti: dil öneki + çevrili segmenti iç yola çevirip karşılaştır.
  const current = toInternalPath(stripLocale(pathname).pathname);
  const active = (href: string) => (href === "/" ? current === "/" : current.startsWith(href));

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-ceyhun-ink/10 bg-ceyhun-cream/90 backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[84rem] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href={localizedHref(locale, "/")} className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ceyhun-ink font-syne text-sm font-extrabold text-ceyhun-gold">
            AU
          </span>
          <span className="truncate font-syne text-sm font-extrabold leading-tight tracking-tight text-ceyhun-ink sm:text-base xl:text-lg">
            {name}
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={localizedHref(locale, l.href)}
              className={`whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] font-medium transition-colors ${
                active(l.href) ? "text-ceyhun-gold-deep" : "text-ceyhun-ink/70 hover:text-ceyhun-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LangSwitcher className="hidden sm:block" />
          <Link
            href={localizedHref(locale, "/donate")}
            className="hidden items-center gap-1.5 whitespace-nowrap rounded-full bg-ceyhun-gold px-4 py-2 text-sm font-semibold text-ceyhun-ink transition-colors hover:bg-ceyhun-gold-deep hover:text-white sm:inline-flex"
          >
            <HandHeart className="h-4 w-4" /> {t.nav.donate}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menü"
            className="rounded-lg border border-ceyhun-ink/20 p-2 text-ceyhun-ink xl:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobil menü */}
      {open && (
        <div className="border-t border-ceyhun-ink/10 bg-ceyhun-cream xl:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  active(l.href) ? "bg-ceyhun-gold/15 text-ceyhun-gold-deep" : "text-ceyhun-ink/80 hover:bg-ceyhun-ink/5"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-ceyhun-ink/10 pt-3">
              <LangSwitcher align="left" openUp />
              <Link href={localizedHref(locale, "/donate")} className="inline-flex items-center gap-1.5 rounded-full bg-ceyhun-gold px-4 py-2 text-sm font-semibold text-ceyhun-ink">
                <HandHeart className="h-4 w-4" /> {t.nav.donate}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
