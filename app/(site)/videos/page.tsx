// app/(site)/videos/page.tsx — Videolar (grid + modal oynatıcı).

import { getCeyhunT } from "@/app/lib/ceyhunT";
import { getPublishedVideos } from "@/app/lib/ceyhun-data";
import VideoGallery from "@/app/components/ceyhun/VideoGallery";

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const { t, locale } = await getCeyhunT();
  const videos = await getPublishedVideos();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="mb-10">
        <h1 className="font-syne text-4xl font-extrabold tracking-tight text-ceyhun-ink sm:text-5xl">{t.videos.title}</h1>
        <p className="mt-3 text-lg text-ceyhun-slate">{t.videos.subtitle}</p>
      </header>

      {videos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ceyhun-ink/15 py-20 text-center text-ceyhun-ink/40">{t.common.empty}</p>
      ) : (
        <VideoGallery
          videos={videos.map((v) => ({
            id: v.id, title: v.title, description: v.description, provider: v.provider,
            videoRef: v.videoRef, thumbUrl: v.thumbUrl, category: v.category,
          }))}
          locale={locale}
        />
      )}
    </div>
  );
}
