// app/(site)/gallery/page.tsx — Galeri (albümler + fotoğraflar, lightbox).

import { getCeyhunT } from "@/app/lib/ceyhunT";
import { getPublishedAlbums, getPublishedPhotos } from "@/app/lib/ceyhun-cache";
import { pick } from "@/app/lib/ceyhun";
import PhotoGallery from "@/app/components/ceyhun/PhotoGallery";
import { PageHero } from "@/app/components/ceyhun/ui";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getCeyhunT();
  return { title: t.gallery.title, description: t.gallery.subtitle };
}

export default async function GalleryPage() {
  const { t, locale } = await getCeyhunT();
  const [albums, allPhotos] = await Promise.all([getPublishedAlbums(), getPublishedPhotos()]);
  const loose = allPhotos.filter((p) => !p.albumId);

  const hasAny = albums.some((a) => a.photos.length > 0) || loose.length > 0;

  return (
    <>
      <PageHero eyebrow={t.gallery.eyebrow} title={t.gallery.title} subtitle={t.gallery.subtitle} />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      {!hasAny && (
        <p className="rounded-2xl border border-dashed border-ceyhun-ink/15 py-20 text-center text-ceyhun-ink/40">{t.common.empty}</p>
      )}

      {albums.map((a) =>
        a.photos.length === 0 ? null : (
          <section key={a.id} className="mb-14">
            <h2 className="mb-1 font-syne text-2xl font-bold text-ceyhun-ink">{pick(a.title, locale)}</h2>
            {pick(a.note, locale) && <p className="mb-5 text-sm text-ceyhun-slate">{pick(a.note, locale)}</p>}
            <PhotoGallery photos={a.photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption }))} locale={locale} />
          </section>
        )
      )}

      {loose.length > 0 && (
        <section className="mb-6">
          {albums.some((a) => a.photos.length > 0) && (
            <h2 className="mb-5 font-syne text-2xl font-bold text-ceyhun-ink">{t.common.viewAll}</h2>
          )}
          <PhotoGallery photos={loose.map((p) => ({ id: p.id, url: p.url, caption: p.caption }))} locale={locale} />
        </section>
      )}
      </div>
    </>
  );
}
