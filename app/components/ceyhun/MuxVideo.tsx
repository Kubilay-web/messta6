"use client";

// app/components/ceyhun/MuxVideo.tsx
// Mux Player sarmalayıcısı — adaptif HLS oynatma (kurs/video). SSR'de web-component
// sorunlarını önlemek için dinamik (ssr:false) yüklenir.

import dynamic from "next/dynamic";
import type { ComponentType, CSSProperties } from "react";

type MuxPlayerProps = {
  playbackId: string;
  streamType?: string;
  accentColor?: string;
  metadata?: Record<string, string>;
  autoPlay?: boolean;
  poster?: string;
  style?: CSSProperties;
  className?: string;
};

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
}) as unknown as ComponentType<MuxPlayerProps>;

export default function MuxVideo({
  playbackId,
  title,
  autoPlay = false,
  accentColor = "#C9A227", // ceyhun-gold
}: {
  playbackId: string;
  title?: string;
  autoPlay?: boolean;
  accentColor?: string;
}) {
  if (!playbackId) return null;
  return (
    <MuxPlayer
      playbackId={playbackId}
      streamType="on-demand"
      accentColor={accentColor}
      metadata={title ? { video_title: title } : undefined}
      autoPlay={autoPlay}
      style={{ height: "100%", width: "100%" }}
      className="h-full w-full"
    />
  );
}
