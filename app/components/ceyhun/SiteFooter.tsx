"use client";

// app/components/ceyhun/SiteFooter.tsx
// Ceyhun sitesi alt bilgisi — bağlantılar, iletişim, sosyal, dil.

import Link from "next/link";
import { Youtube, Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { useCeyhunT } from "@/app/lib/useCeyhunT";

type Socials = { youtube?: string; instagram?: string; facebook?: string; x?: string };

export default function SiteFooter({
  name,
  email,
  phone,
  location,
  socials,
}: {
  name: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  socials: Socials;
}) {
  const { t } = useCeyhunT();
  const year = 2026; // sunucu yeniden derlemesinde güncellenir; sabit tutuldu

  const cols = [
    { title: t.nav.about, href: "/about" },
    { title: t.nav.articles, href: "/articles" },
    { title: t.nav.gallery, href: "/gallery" },
    { title: t.nav.videos, href: "/videos" },
    { title: t.nav.tours, href: "/tours" },
    { title: t.nav.courses, href: "/courses" },
    { title: t.nav.prayer, href: "/prayer" },
    { title: t.nav.assistant, href: "/asistan" },
  ];

  return (
    <footer className="bg-ceyhun-ink text-white/80">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ceyhun-gold font-syne text-sm font-extrabold text-ceyhun-ink">AU</span>
            <span className="font-syne text-lg font-extrabold text-white">{name}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-white/60">{t.brandTag}</p>
          <div className="mt-4 flex gap-2">
            {socials.youtube && <SocialLink href={socials.youtube} icon={Youtube} />}
            {socials.instagram && <SocialLink href={socials.instagram} icon={Instagram} />}
            {socials.facebook && <SocialLink href={socials.facebook} icon={Facebook} />}
          </div>
        </div>

        <div>
          <h4 className="font-syne text-sm font-bold uppercase tracking-wide text-white/50">Menü</h4>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {cols.map((c) => (
              <li key={c.href}><Link href={c.href} className="text-white/70 transition-colors hover:text-ceyhun-gold">{c.title}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-syne text-sm font-bold uppercase tracking-wide text-white/50">{t.nav.contact}</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            {email && <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-ceyhun-gold" /><a href={`mailto:${email}`} className="hover:text-ceyhun-gold">{email}</a></li>}
            {phone && <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-ceyhun-gold" /><a href={`tel:${phone}`} className="hover:text-ceyhun-gold">{phone}</a></li>}
            {location && <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-ceyhun-gold" />{location}</li>}
          </ul>
          <Link href="/tours" className="mt-4 inline-flex rounded-full bg-ceyhun-gold px-4 py-2 text-sm font-semibold text-ceyhun-ink transition-colors hover:bg-white">
            {t.home.heroCta}
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/40 sm:flex-row sm:px-6">
          <span>© {year} {name}. {t.footer.rights}</span>
          <span>{t.footer.built}</span>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon: Icon }: { href: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-ceyhun-gold hover:text-ceyhun-gold">
      <Icon className="h-4 w-4" />
    </a>
  );
}
