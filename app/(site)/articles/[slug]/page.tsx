// app/(site)/articles/[slug]/page.tsx — Yazı detayı.

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import prisma from "@/app/lib/prisma";
import { getArticleBySlug } from "@/app/lib/ceyhun-data";
import { getCeyhunT } from "@/app/lib/ceyhunT";
import { pick, formatDate, safeArray } from "@/app/lib/ceyhun";
import { Prose } from "@/app/components/ceyhun/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  if (!a) return { title: "Yazı bulunamadı" };
  const title = pick(a.title, "tr");
  const description = pick(a.excerpt, "tr");
  return {
    title,
    description,
    openGraph: { title, description, images: a.coverUrl ? [a.coverUrl] : [], type: "article" },
  };
}

export default async function ArticleDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { t, locale } = await getCeyhunT();
  const a = await getArticleBySlug(slug);
  if (!a || !a.published) notFound();

  // Görüntülenme sayacı (fire-and-forget).
  prisma.ceyhunArticle.update({ where: { id: a.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const title = pick(a.title, locale);
  const body = pick(a.body, locale);
  const tags = safeArray<string>(a.tags);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <Link href="/articles" className="inline-flex items-center gap-1.5 text-sm font-medium text-ceyhun-ink/60 transition-colors hover:text-ceyhun-gold-deep">
        <ArrowLeft className="h-4 w-4" /> {t.nav.articles}
      </Link>

      <header className="mt-6">
        {a.category && (
          <span className="rounded-full bg-ceyhun-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ceyhun-gold-deep">{a.category}</span>
        )}
        <h1 className="mt-4 font-syne text-3xl font-extrabold leading-tight tracking-tight text-ceyhun-ink sm:text-4xl">{title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ceyhun-ink/50">
          {a.publishedAt && <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDate(a.publishedAt, locale)}</span>}
          {a.readMinutes > 0 && <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {a.readMinutes} {t.common.minRead}</span>}
        </div>
      </header>

      {a.coverUrl && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-ceyhun-cream-deep">
          <Image src={a.coverUrl} alt={title} fill priority className="object-cover" sizes="(max-width:768px) 100vw, 768px" />
        </div>
      )}

      {body ? (
        <Prose html={body} className="mt-8" />
      ) : (
        <p className="mt-8 text-ceyhun-ink/40">{t.common.empty}</p>
      )}

      {tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-ceyhun-ink/10 pt-6">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-ceyhun-ink/5 px-3 py-1 text-xs text-ceyhun-ink/60">#{tag}</span>
          ))}
        </div>
      )}
    </article>
  );
}
