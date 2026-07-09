// app/(site)/articles/page.tsx — Yazılar listesi.

import { getCeyhunT } from "@/app/lib/ceyhunT";
import { getPublishedArticles } from "@/app/lib/ceyhun-data";
import { pick, formatDate } from "@/app/lib/ceyhun";
import { ArticleCard } from "@/app/components/ceyhun/ui";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const { t, locale } = await getCeyhunT();
  const articles = await getPublishedArticles();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="mb-10">
        <h1 className="font-syne text-4xl font-extrabold tracking-tight text-ceyhun-ink sm:text-5xl">{t.articles.title}</h1>
        <p className="mt-3 text-lg text-ceyhun-slate">{t.articles.subtitle}</p>
      </header>

      {articles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ceyhun-ink/15 py-20 text-center text-ceyhun-ink/40">{t.common.empty}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard
              key={a.id}
              href={`/articles/${a.slug}`}
              title={pick(a.title, locale)}
              excerpt={pick(a.excerpt, locale)}
              cover={a.coverUrl}
              category={a.category ?? undefined}
              minutes={a.readMinutes}
              minLabel={t.common.minRead}
              date={a.publishedAt ? formatDate(a.publishedAt, locale) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
