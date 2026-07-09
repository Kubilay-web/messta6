"use client";

// app/components/ceyhun/live/VideoTile.tsx
// Tek bir katılımcının video/ses karosu. Video yoksa baş harf avatarı gösterir.

import { useEffect, useRef } from "react";

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
  useEffect(() => {
    const v = ref.current;
    if (v && v.srcObject !== stream) v.srcObject = stream;
  }, [stream]);

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
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
        {role === "host" && <span className="text-ceyhun-gold">★</span>}
        <span className="max-w-[10rem] truncate">{name}</span>
      </div>
    </div>
  );
}
