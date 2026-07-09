"use client";

// app/components/ceyhun/PhotoGallery.tsx
// Fotoğraf ızgarası + lightbox (ileri/geri). Locale'e göre başlık seçer.

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { pick, type Locale } from "@/app/lib/ceyhun";

export type PublicPhoto = { id: string; url: string; caption: string };

export default function PhotoGallery({ photos, locale }: { photos: PublicPhoto[]; locale: Locale }) {
  const [idx, setIdx] = useState<number | null>(null);

  const close = useCallback(() => setIdx(null), []);
  const prev = useCallback(() => setIdx((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)), [photos.length]);
  const next = useCallback(() => setIdx((i) => (i === null ? i : (i + 1) % photos.length)), [photos.length]);

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, close, prev, next]);

  if (photos.length === 0) {
    return <p className="rounded-2xl border border-dashed border-ceyhun-ink/15 py-16 text-center text-sm text-ceyhun-ink/40">—</p>;
  }

  return (
    <>
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
        {photos.map((p, i) => (
          <button key={p.id} onClick={() => setIdx(i)} className="group block w-full overflow-hidden rounded-xl bg-ceyhun-cream-deep">
            <div className="relative w-full">
              <Image
                src={p.url}
                alt={pick(p.caption, locale)}
                width={500}
                height={500}
                className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width:768px) 50vw, 25vw"
              />
            </div>
          </button>
        ))}
      </div>

      {idx !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={close}>
          <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={close}><X className="h-6 w-6" /></button>
          <button className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); prev(); }}><ChevronLeft className="h-7 w-7" /></button>
          <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); next(); }}><ChevronRight className="h-7 w-7" /></button>
          <div className="max-h-[85vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={photos[idx].url} alt="" width={1400} height={1000} className="max-h-[80vh] w-auto rounded-lg object-contain" />
            {pick(photos[idx].caption, locale) && (
              <p className="mt-3 text-center text-sm text-white/70">{pick(photos[idx].caption, locale)}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
