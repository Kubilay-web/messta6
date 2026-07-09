// app/(site)/page.tsx
// Sözün İzinde ana sayfası — hero, hakkında, son yazılar, videolar, galeri, tur bandı.

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Plane, Quote, LayoutDashboard } from "lucide-react";
import { getCeyhunT } from "@/app/lib/ceyhunT";
import { getCeyhunViewer } from "@/app/lib/ceyhun-auth";
import {
  getCeyhunProfile,
  getPublishedArticles,
  getFeaturedVideos,
  getPublishedVideos,
  getPublishedPhotos,
} from "@/app/lib/ceyhun-data";
import { pick, safeArray } from "@/app/lib/ceyhun";
import { SectionHeading, ArticleCard } from "@/app/components/ceyhun/ui";
import VideoGallery from "@/app/components/ceyhun/VideoGallery";
import PhotoGallery from "@/app/components/ceyhun/PhotoGallery";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { t, locale } = await getCeyhunT();
  const [profile, articles, featured, allVideos, photos, gate] = await Promise.all([
    getCeyhunProfile(),
    getPublishedArticles(3),
    getFeaturedVideos(3),
    getPublishedVideos(6),
    getPublishedPhotos(8),
    getCeyhunViewer(), // yalnızca OWNER için dolu döner
  ]);
  const isOwner = gate?.role === "OWNER";

  const videos = (featured.length ? featured : allVideos).slice(0, 3);
  const verses = safeArray<string>(profile.verses);
  const title = pick(profile.title, locale);
  const tagline = pick(profile.tagline, locale);

  return (
    <>
      {/* ─────────── HERO ─────────── */}
      <section className="relative overflow-hidden bg-ceyhun-ink text-white">
        {profile.coverUrl && (
          <Image src={profile.coverUrl} alt="" fill priority className="object-cover opacity-30" sizes="100vw" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ceyhun-ink/70 via-ceyhun-ink/85 to-ceyhun-ink" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <div className="max-w-2xl">
            {profile.avatarUrl && (
              <div className="mb-6 h-24 w-24 overflow-hidden rounded-2xl border-2 border-ceyhun-gold/60 shadow-xl">
                <Image src={profile.avatarUrl} alt={profile.name} width={96} height={96} className="h-full w-full object-cover" />
              </div>
            )}
            <span className="inline-block rounded-full border border-ceyhun-gold/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-ceyhun-gold">
              {t.brandTag}
            </span>
            <h1 className="mt-5 font-syne text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              {profile.name}
            </h1>
            {title && <p className="mt-3 font-syne text-xl font-semibold text-ceyhun-gold-soft sm:text-2xl">{title}</p>}
            {tagline && <p className="mt-4 max-w-xl text-base text-white/70 sm:text-lg">{tagline}</p>}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/tours" className="inline-flex items-center gap-2 rounded-full bg-ceyhun-gold px-6 py-3 text-sm font-semibold text-ceyhun-ink transition-colors hover:bg-white">
                <Plane className="h-4 w-4" /> {t.home.heroCta}
              </Link>
              <Link href="/articles" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-ceyhun-ink">
                <BookOpen className="h-4 w-4" /> {t.home.heroSecondary}
              </Link>
              {isOwner && (
                <Link href="/admin" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-ceyhun-gold-soft ring-1 ring-ceyhun-gold/40 backdrop-blur transition-colors hover:bg-ceyhun-gold hover:text-ceyhun-ink">
                  <LayoutDashboard className="h-4 w-4" /> Admin Paneli
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── Ayet şeridi ─────────── */}
      {verses.length > 0 && (
        <section className="border-b border-ceyhun-ink/10 bg-ceyhun-cream-deep">
          <div className="mx-auto flex max-w-4xl items-start gap-4 px-4 py-8 sm:px-6">
            <Quote className="h-8 w-8 shrink-0 text-ceyhun-gold" />
            <p className="font-syne text-lg italic text-ceyhun-ink/80 sm:text-xl">{verses[0]}</p>
          </div>
        </section>
      )}

      {/* ─────────── Son yazılar ─────────── */}
      {articles.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading eyebrow="✝" title={t.home.latestArticles} action={{ href: "/articles", label: t.common.viewAll }} />
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
              />
            ))}
          </div>
        </section>
      )}

      {/* ─────────── Öne çıkan videolar ─────────── */}
      {videos.length > 0 && (
        <section className="bg-ceyhun-cream-deep/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionHeading eyebrow="▶" title={t.home.featuredVideos} action={{ href: "/videos", label: t.common.viewAll }} />
            <VideoGallery videos={videos} locale={locale} />
          </div>
        </section>
      )}

      {/* ─────────── Tur bandı ─────────── */}
      <section className="bg-ceyhun-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-ceyhun-gold">Biblical Turizm</span>
              <h2 className="mt-3 font-syne text-3xl font-extrabold sm:text-4xl">{t.home.toursTitle}</h2>
              <p className="mt-4 max-w-lg text-white/70">{t.home.toursText}</p>
              <Link href="/tours" className="mt-6 inline-flex items-center gap-2 rounded-full bg-ceyhun-gold px-6 py-3 text-sm font-semibold text-ceyhun-ink transition-colors hover:bg-white">
                {t.home.heroCta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["İstanbul", "7 Kilise", "Kapadokya"].map((name) => (
                <div key={name} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <span className="font-syne text-lg font-bold text-ceyhun-gold-soft">{name}</span>
                  <p className="mt-1 text-xs text-white/50">Tur</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── Galeri ─────────── */}
      {photos.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading eyebrow="◐" title={t.home.galleryTeaser} action={{ href: "/gallery", label: t.common.viewAll }} />
          <PhotoGallery
            photos={photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption }))}
            locale={locale}
          />
        </section>
      )}
    </>
  );
}
