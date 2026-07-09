// app/components/ceyhun/ui.tsx
// Ceyhun genel sitesi için sunucu-güvenli sunum bileşenleri.

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";

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
          <span className="mb-2 inline-block text-xs font-bold uppercase tracking-[0.2em] text-ceyhun-gold-deep">
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
      className="group flex flex-col overflow-hidden rounded-2xl border border-ceyhun-ink/10 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ceyhun-cream-deep">
        {cover ? (
          <Image src={cover} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />
        ) : (
          <div className="flex h-full items-center justify-center font-syne text-4xl text-ceyhun-gold/40">✝</div>
        )}
        {category && (
          <span className="absolute left-3 top-3 rounded-full bg-ceyhun-ink/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ceyhun-gold">
            {category}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-syne text-lg font-bold leading-snug text-ceyhun-ink transition-colors group-hover:text-ceyhun-gold-deep">
          {title}
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
