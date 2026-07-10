"use client";

// app/components/ceyhun/live/VideoTile.tsx
// Tek bir katılımcının video/ses karosu. Video yoksa baş harf avatarı gösterir.
// Uzaktaki ses için açık play() çağrısı yapılır; tarayıcı otomatik oynatmayı
// engellerse (masaüstü Chrome/Firefox'ta sık) "Sesi aç" yedeği gösterilir.

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";

export default function VideoTile({
  stream,
  name,
  role,
  muted = false,
  mirror = false,
  camOn = true,
}: {
  stream: MediaStream | null;
  name: string;
  role?: string;
  muted?: boolean;
  mirror?: boolean;
  camOn?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (v.srcObject !== stream) v.srcObject = stream;

    // Kendi karomuz (muted) veya yayın yoksa yedeğe gerek yok.
    if (!stream || muted) {
      setNeedsTap(false);
      return;
    }

    let cancelled = false;
    const tryPlay = () => {
      // autoPlay attribute'üne güvenme: track asenkron geldiğinden açık play() gerekir.
      v.play()
        .then(() => !cancelled && setNeedsTap(false))
        .catch(() => !cancelled && setNeedsTap(true));
    };

    tryPlay();
    // Konuşmacı sonradan mikrofon/kamera açınca (yeni track) yeniden dene.
    stream.addEventListener("addtrack", tryPlay);
    v.addEventListener("loadedmetadata", tryPlay);
    return () => {
      cancelled = true;
      stream.removeEventListener("addtrack", tryPlay);
      v.removeEventListener("loadedmetadata", tryPlay);
    };
  }, [stream, muted]);

  const enableSound = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = false;
    v.play()
      .then(() => setNeedsTap(false))
      .catch(() => {});
  }, []);

  const showVideo = Boolean(stream) && camOn;

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-ceyhun-ink shadow">
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={muted}
        className={`h-full w-full object-cover transition-opacity ${mirror ? "scale-x-[-1]" : ""} ${showVideo ? "opacity-100" : "opacity-0"}`}
      />
      {!showVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ceyhun-gold/20 text-2xl font-bold text-ceyhun-gold">
            {name?.[0]?.toUpperCase() || "?"}
          </span>
        </div>
      )}
      {needsTap && (
        <button
          onClick={enableSound}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/60 text-white backdrop-blur-sm"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ceyhun-gold text-ceyhun-ink">
            <Volume2 className="h-6 w-6" />
          </span>
          <span className="text-sm font-semibold">Sesi aç</span>
        </button>
      )}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
        {role === "host" && <span className="text-ceyhun-gold">★</span>}
        <span className="max-w-[10rem] truncate">{name}</span>
      </div>
    </div>
  );
}
