"use client";

// app/components/ceyhun/SiteHeader.tsx
// Ceyhun sitesi üst menüsü — sticky, mobil açılır menü, dil değiştirici, bağış CTA.

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, HandHeart } from "lucide-react";
import LangSwitcher from "@/app/components/site/LangSwitcher";
import { useCeyhunT } from "@/app/lib/useCeyhunT";

export default function SiteHeader({ name }: { name: string }) {
  const { t } = useCeyhunT();
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

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/articles", label: t.nav.articles },
    { href: "/gallery", label: t.nav.gallery },
    { href: "/videos", label: t.nav.videos },
    { href: "/tours", label: t.nav.tours },
    { href: "/courses", label: t.nav.courses },
    { href: "/prayer", label: t.nav.prayer },
  ];

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-ceyhun-ink/10 bg-ceyhun-cream/90 backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ceyhun-ink font-syne text-sm font-extrabold text-ceyhun-gold">
            CA
          </span>
          <span className="font-syne text-lg font-extrabold tracking-tight text-ceyhun-ink">
            {name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                active(l.href) ? "text-ceyhun-gold-deep" : "text-ceyhun-ink/70 hover:text-ceyhun-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangSwitcher className="hidden sm:block" />
          <Link
            href="/donate"
            className="hidden items-center gap-1.5 rounded-full bg-ceyhun-gold px-4 py-2 text-sm font-semibold text-ceyhun-ink transition-colors hover:bg-ceyhun-gold-deep hover:text-white sm:inline-flex"
          >
            <HandHeart className="h-4 w-4" /> {t.nav.donate}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menü"
            className="rounded-lg border border-ceyhun-ink/20 p-2 text-ceyhun-ink lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobil menü */}
      {open && (
        <div className="border-t border-ceyhun-ink/10 bg-ceyhun-cream lg:hidden">
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
              <LangSwitcher />
              <Link href="/donate" className="inline-flex items-center gap-1.5 rounded-full bg-ceyhun-gold px-4 py-2 text-sm font-semibold text-ceyhun-ink">
                <HandHeart className="h-4 w-4" /> {t.nav.donate}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
