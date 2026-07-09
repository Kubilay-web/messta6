"use client";

// app/admin/_components/MuxVideoUpload.tsx
// Mux'a DOĞRUDAN parçalı yükleme (@mux/upchunk) — Next.js'ten geçmez, boyut limiti yok.
// 1) /api/admin/upload-video/mux (POST) → uploadUrl + uploadId
// 2) UpChunk ile dosya doğrudan Mux'a (ilerleme %)
// 3) asset "ready" olana kadar durum poll edilir → videoRef "<assetId>:<playbackId>" döner
//    + otomatik Mux küçük resmi + süre (sn).

import { useRef, useState } from "react";
import * as UpChunk from "@mux/upchunk";
import { UploadCloud, Loader2, X, Film } from "lucide-react";
import { muxThumb } from "@/app/lib/ceyhun";

type Uploaded = { videoRef: string; thumbUrl: string; durationSec: number };

export default function MuxVideoUpload({
  value, // mevcut videoRef ("assetId:playbackId")
  onUploaded,
  onClear,
}: {
  value: string;
  onUploaded: (data: Uploaded) => void;
  onClear: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState<"" | "upload" | "process">("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function start(file: File) {
    setError(null);
    setBusy(true);
    setPct(0);
    setPhase("upload");
    try {
      // 1) Direct Upload oluştur
      const res = await fetch("/api/admin/upload-video/mux", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Yükleme başlatılamadı.");

      // 2) Dosyayı doğrudan Mux'a yükle (parçalı, ilerlemeli)
      await new Promise<void>((resolve, reject) => {
        const up = UpChunk.createUpload({ endpoint: data.uploadUrl, file });
        up.on("error", (e: { detail?: { message?: string } }) =>
          reject(new Error(e?.detail?.message || "Yükleme hatası."))
        );
        up.on("progress", (e: { detail?: number }) =>
          setPct(Math.round(typeof e?.detail === "number" ? e.detail : 0))
        );
        up.on("success", () => resolve());
      });

      // 3) İşleniyor — asset hazır olana kadar bekle
      setPct(100);
      setPhase("process");
      const result = await pollReady(String(data.uploadId));
      onUploaded(result);
      setPhase("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setBusy(false);
    }
  }

  async function pollReady(uploadId: string): Promise<Uploaded> {
    // ~5 dk (150 × 2sn). Uzun videolar Mux'ta biraz sürebilir.
    for (let i = 0; i < 150; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const r = await fetch(`/api/admin/upload-video/mux?uploadId=${encodeURIComponent(uploadId)}`);
      const d = await r.json();
      if (d.status === "ready" && d.playbackId) {
        return {
          videoRef: `${d.assetId}:${d.playbackId}`,
          thumbUrl: `https://image.mux.com/${d.playbackId}/thumbnail.jpg?time=1`,
          durationSec: Number(d.durationSec) || 0,
        };
      }
      if (d.status === "errored") throw new Error("Mux videoyu işleyemedi.");
    }
    throw new Error("İşlenme zaman aşımına uğradı — birazdan sayfayı yenileyip tekrar deneyin.");
  }

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void start(f);
    e.target.value = "";
  };

  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-ink/50">Video dosyası (Mux'a yükle)</span>

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-black/10 bg-black">
          {/* Yüklenmiş videonun Mux küçük resmi */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={muxThumb(value)} alt="" className="max-h-56 w-full object-contain bg-black" />
          <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
            Mux · hazır
          </span>
          <button
            type="button"
            onClick={onClear}
            title="Kaldır"
            className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/15 bg-gray-50 py-8 text-sm text-ink/50 transition-colors hover:border-ceyhun-gold/60 hover:text-ink disabled:opacity-70"
        >
          {busy ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="font-medium">
                {phase === "process" ? "Mux işliyor…" : `Yükleniyor… %${pct}`}
              </span>
              {phase === "upload" && (
                <span className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-black/10">
                  <span
                    className="block h-full rounded-full bg-ceyhun-gold transition-[width] duration-200"
                    style={{ width: `${pct}%` }}
                  />
                </span>
              )}
              {phase === "process" && (
                <span className="text-[11px] text-ink/40">Video hazırlanıyor, kapatma…</span>
              )}
            </>
          ) : (
            <>
              <UploadCloud className="h-6 w-6" />
              <span className="font-medium">Video seç ve Mux'a yükle</span>
              <span className="flex items-center gap-1 text-[11px] text-ink/40">
                <Film className="h-3 w-3" /> MP4, MOV, WEBM · boyut sınırı yok · adaptif HLS
              </span>
            </>
          )}
        </button>
      )}

      <input ref={inputRef} type="file" accept="video/*" onChange={onPick} className="hidden" />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
