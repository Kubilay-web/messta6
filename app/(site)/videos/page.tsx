// app/(site)/videos/page.tsx — Videolar (grid + modal oynatıcı).

import { getCeyhunT } from "@/app/lib/ceyhunT";
import { getPublishedVideos } from "@/app/lib/ceyhun-cache";
import VideoGallery from "@/app/components/ceyhun/VideoGallery";
import { PageHero } from "@/app/components/ceyhun/ui";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getCeyhunT();
  return { title: t.videos.title, description: t.videos.subtitle };
}

export default async function VideosPage() {
  const { t, locale } = await getCeyhunT();
  const videos = await getPublishedVideos();

  return (
    <>
      <PageHero eyebrow={t.videos.eyebrow} title={t.videos.title} subtitle={t.videos.subtitle} />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
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
    </>
  );
}
