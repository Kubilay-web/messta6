"use client";

// app/components/ceyhun/VideoGallery.tsx
// Video ızgarası + modal oynatıcı. Locale'e göre başlık/açıklama seçer.

import { useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import { pick, videoThumb, videoEmbedUrl, type Locale } from "@/app/lib/ceyhun";

export type PublicVideo = {
  id: string;
  title: string; // JSON
  description: string; // JSON
  provider: string;
  videoRef: string;
  thumbUrl: string | null;
  category: string | null;
};

export default function VideoGallery({ videos, locale }: { videos: PublicVideo[]; locale: Locale }) {
  const [active, setActive] = useState<PublicVideo | null>(null);

  if (videos.length === 0) {
    return <p className="rounded-2xl border border-dashed border-ceyhun-ink/15 py-16 text-center text-sm text-ceyhun-ink/40">—</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => {
          const thumb = videoThumb(v.provider, v.videoRef, v.thumbUrl);
          const title = pick(v.title, locale);
          return (
            <button
              key={v.id}
              onClick={() => setActive(v)}
              className="group text-left"
            >
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-ceyhun-ink shadow-sm">
                {thumb && <Image src={thumb} alt={title} fill className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />}
                <div className="absolute inset-0 flex items-center justify-center bg-ceyhun-ink/30 transition-colors group-hover:bg-ceyhun-ink/10">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ceyhun-gold/95 text-ceyhun-ink shadow-lg transition-transform group-hover:scale-110">
                    <Play className="ml-0.5 h-6 w-6 fill-current" />
                  </span>
                </div>
              </div>
              <h3 className="mt-3 font-syne text-base font-bold leading-snug text-ceyhun-ink group-hover:text-ceyhun-gold-deep">{title}</h3>
              {v.category && <p className="text-xs uppercase tracking-wide text-ceyhun-ink/40">{v.category}</p>}
            </button>
          );
        })}
      </div>

      {active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4" onClick={() => setActive(null)}>
          <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={() => setActive(null)}>
            <X className="h-6 w-6" />
          </button>
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl">
              {active.provider === "cloudinary" ? (
                <video src={active.videoRef} controls autoPlay className="h-full w-full" />
              ) : (
                <iframe
                  src={`${videoEmbedUrl(active.provider, active.videoRef)}?autoplay=1`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
            <h3 className="mt-4 font-syne text-xl font-bold text-white">{pick(active.title, locale)}</h3>
            {pick(active.description, locale) && (
              <p className="mt-1 text-sm text-white/70">{pick(active.description, locale)}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
