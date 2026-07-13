"use client";

// app/admin/AdminSidebar.tsx
// Avrupa Uyanış Hizmetleri admin paneli yan menüsü — aktif linki vurgular, mobilde açılır.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  UserCircle,
  Info,
  FileText,
  Images,
  Video,
  Plane,
  GraduationCap,
  HandHeart,
  Radio,
  Shield,
  Menu,
  X,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/(components)/(authentication-layout)/authentication/actions";
import { localizedHref, stripLocale, toInternalPath } from "@/app/lib/i18n-routing";
import { useClientLocale } from "@/app/lib/useLocale";

// Panel (/admin) her role görünür; diğerleri `allowed` (rolün yetenekleri) ile filtrelenir.
const NAV = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/admin/profile", label: "Profil", icon: UserCircle },
  { href: "/admin/about", label: "Hakkımızda", icon: Info },
  { href: "/admin/articles", label: "Yazılar", icon: FileText },
  { href: "/admin/gallery", label: "Galeri", icon: Images },
  { href: "/admin/videos", label: "Videolar", icon: Video },
  { href: "/admin/courses", label: "Eğitimler", icon: GraduationCap },
  { href: "/admin/tours", label: "Tur Başvuruları", icon: Plane },
  { href: "/admin/prayer", label: "Online Dua", icon: Radio },
  { href: "/admin/donations", label: "Bağışlar", icon: HandHeart },
  { href: "/admin/users", label: "Kullanıcılar & Roller", icon: Shield },
];

export default function AdminSidebar({
  userName,
  role,
  roleLabel,
  allowed,
}: {
  userName: string;
  role: string;
  roleLabel: string;
  allowed: string[];
}) {
  const pathname = usePathname();
  const locale = useClientLocale();
  const current = toInternalPath(stripLocale(pathname).pathname); // önek + çeviriyi soy
  const [open, setOpen] = useState(false);
  const nav = NAV.filter((item) => item.href === "/admin" || allowed.includes(item.href));

  const isActive = (href: string, exact?: boolean) =>
    exact ? current === href : current === href || current.startsWith(href + "/");

  return (
    <>
      {/* Mobil üst bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-ceyhun-ink px-4 py-3 text-white lg:hidden">
        <span className="font-syne text-base font-extrabold">
          Avrupa Uyanış Hizmetleri<span className="text-ceyhun-gold">.</span> admin
        </span>
        <button onClick={() => setOpen((v) => !v)} aria-label="Menü" className="rounded-lg border border-white/20 p-2">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <aside
        className={`${open ? "block" : "hidden"} w-full shrink-0 border-b border-white/10 bg-ceyhun-ink text-white lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64 lg:border-b-0 lg:border-r`}
      >
        <div className="flex h-full flex-col">
          <div className="hidden items-center gap-2 px-6 py-6 lg:flex">
            <span className="font-syne text-base font-extrabold tracking-tight leading-tight">
              Avrupa Uyanış<br />Hizmetleri<span className="text-ceyhun-gold">.</span>
            </span>
            <span className="rounded-full bg-ceyhun-gold px-2 py-0.5 text-[11px] font-bold text-ceyhun-ink">admin</span>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3 lg:py-2">
            {nav.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={localizedHref(locale, item.href)}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? "bg-ceyhun-gold text-ceyhun-ink" : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 px-4 py-4">
            <Link href={localizedHref(locale, "/")} className="mb-3 flex items-center gap-2 text-xs text-white/50 hover:text-white">
              <ExternalLink className="h-3.5 w-3.5" /> Siteyi görüntüle
            </Link>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ceyhun-gold text-xs font-bold text-ceyhun-ink">
                {userName.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{userName}</p>
                <p className="text-[11px] text-white/40">{roleLabel}</p>
              </div>
            </div>
            <form action={logout} className="mt-3">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="h-4 w-4" /> Çıkış yap
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
