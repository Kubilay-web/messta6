// app/(site)/gallery/page.tsx — Galeri (albümler + fotoğraflar, lightbox).

import { getCeyhunT } from "@/app/lib/ceyhunT";
import { getPublishedAlbums, getPublishedPhotos } from "@/app/lib/ceyhun-data";
import { pick } from "@/app/lib/ceyhun";
import PhotoGallery from "@/app/components/ceyhun/PhotoGallery";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const { t, locale } = await getCeyhunT();
  const [albums, allPhotos] = await Promise.all([getPublishedAlbums(), getPublishedPhotos()]);
  const loose = allPhotos.filter((p) => !p.albumId);

  const hasAny = albums.some((a) => a.photos.length > 0) || loose.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="mb-10">
        <h1 className="font-syne text-4xl font-extrabold tracking-tight text-ceyhun-ink sm:text-5xl">{t.gallery.title}</h1>
        <p className="mt-3 text-lg text-ceyhun-slate">{t.gallery.subtitle}</p>
      </header>

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
  );
}
