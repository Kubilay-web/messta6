// app/components/ceyhun/ui.tsx
// Ceyhun genel sitesi için sunucu-güvenli sunum bileşenleri.

import Link from "next/link";
import SmartImage from "./SmartImage";
import { ArrowRight, Clock } from "lucide-react";

// Tüm liste/iç sayfalar için ortak, konsepte uygun canlı başlık bandı
// (derin mor zemin + "Holy Ghost fire" ışıltıları + eyebrow aksan çizgisi).
export function PageHero({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  const center = align === "center";
  return (
    <section className="relative overflow-hidden bg-ceyhun-ink text-white">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-ceyhun-gold/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-ceyhun-wine/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ceyhun-olive/10 blur-3xl" />
      <div className={`relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 ${center ? "text-center" : ""}`}>
        {eyebrow && (
          <span
            className={`inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-ceyhun-gold sm:text-xs ${center ? "justify-center" : ""}`}
          >
            <span className="h-px w-7 bg-ceyhun-gold/50" />
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 break-words font-syne text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {subtitle && <p className={`mt-4 max-w-2xl text-white/70 ${center ? "mx-auto" : ""}`}>{subtitle}</p>}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <span className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-ceyhun-gold-deep">
            <span className="h-px w-6 bg-ceyhun-gold-deep/50" />
            {eyebrow}
          </span>
        )}
        <h2 className="font-syne text-3xl font-extrabold tracking-tight text-ceyhun-ink sm:text-4xl">
          {title}
        </h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-ceyhun-ink/70 transition-colors hover:text-ceyhun-gold-deep sm:inline-flex"
        >
          {action.label} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function ArticleCard({
  href,
  title,
  excerpt,
  cover,
  category,
  minutes,
  minLabel,
  date,
}: {
  href: string;
  title: string;
  excerpt: string;
  cover: string | null;
  category?: string;
  minutes?: number;
  minLabel: string;
  date?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ceyhun-ink/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-ceyhun-gold/40 hover:shadow-xl hover:shadow-ceyhun-ink/10"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ceyhun-cream-deep">
        {cover ? (
          <SmartImage src={cover} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width:768px) 100vw, 33vw" />
        ) : (
          <div className="flex h-full items-center justify-center font-syne text-4xl text-ceyhun-gold/40">✝</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ceyhun-ink/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {category && (
          <span className="absolute left-3 top-3 rounded-full bg-ceyhun-ink/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ceyhun-gold backdrop-blur-sm">
            {category}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="flex items-start justify-between gap-2 font-syne text-lg font-bold leading-snug text-ceyhun-ink transition-colors group-hover:text-ceyhun-gold-deep">
          <span>{title}</span>
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 -translate-x-1 text-ceyhun-gold-deep opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
        </h3>
        {excerpt && <p className="mt-2 line-clamp-3 flex-1 text-sm text-ceyhun-slate">{excerpt}</p>}
        <div className="mt-4 flex items-center gap-3 text-xs text-ceyhun-ink/40">
          {date && <span>{date}</span>}
          {minutes ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {minutes} {minLabel}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

// Zengin metin (HTML) gövde — makale/hakkında için tipografi.
export function Prose({ html, className = "" }: { html: string; className?: string }) {
  return (
    <div
      className={`ceyhun-prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
