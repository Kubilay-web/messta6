// app/(site)/about/page.tsx — Hakkımızda (Avrupa Uyanış Hizmetleri tanıtımı).
import type { Metadata } from "next";
import { getCeyhunProfile } from "@/app/lib/ceyhun-data";
import { getCeyhunT } from "@/app/lib/ceyhunT";
import { pick } from "@/app/lib/ceyhun";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getCeyhunT();
  const titles: Record<string, string> = { tr: "Hakkımızda", en: "About Us", de: "Über uns" };
  const descs: Record<string, string> = {
    tr: "Avrupa Uyanış Hizmetleri nedir, ne yapar ve vizyonu nedir?",
    en: "What Avrupa Uyanış Hizmetleri is, what it does and its vision.",
    de: "Was Avrupa Uyanış Hizmetleri ist, was es tut und seine Vision.",
  };
  return { title: titles[locale] ?? titles.tr, description: descs[locale] ?? descs.tr };
}

export default async function AboutPage() {
  const { t, locale } = await getCeyhunT();
  const p = await getCeyhunProfile();
  const html = pick(p.about, locale) || "";

  return (
    <div className="bg-ceyhun-cream">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ceyhun-ink text-white">
        {p.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        )}
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="inline-block rounded-full border border-ceyhun-gold/40 bg-ceyhun-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ceyhun-gold">
            {t.nav.about}
          </span>
          <h1 className="mt-4 font-syne text-4xl font-extrabold tracking-tight sm:text-5xl">{p.name}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">{t.brandTag}</p>
        </div>
      </section>

      {/* İçerik */}
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {html ? (
          <article className="ceyhun-prose" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className="text-center text-ceyhun-slate">{t.common.empty}</p>
        )}
      </section>
    </div>
  );
}
