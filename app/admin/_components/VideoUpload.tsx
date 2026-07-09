"use client";

// app/admin/_components/VideoUpload.tsx
// Kendi video yükleme sistemimiz: dosyayı /api/admin/upload-video/sign'dan alınan
// kısa ömürlü token'la DOĞRUDAN KENDİ Node.js medya sunucumuza yükler
// (Next.js'ten geçmez → GB'larca video sorunsuz, limitsiz). Dosya ham gövde olarak
// stream edilir. XHR ile gerçek ilerleme yüzdesi gösterir. Başarıda üst bileşene
// video URL + otomatik poster (ffmpeg varsa) + süre (sn) döner.

import { useRef, useState } from "react";
import { UploadCloud, Loader2, X, Film } from "lucide-react";

type Uploaded = { url: string; thumbUrl: string; durationSec: number };

export default function VideoUpload({
  value,
  onUploaded,
  onClear,
}: {
  value: string; // mevcut videoRef (secure_url)
  onUploaded: (data: Uploaded) => void;
  onClear: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError(null);
    setBusy(true);
    setPct(0);
    try {
      // 1) Sunucudan kısa ömürlü yükleme token'ı al
      const signRes = await fetch("/api/admin/upload-video/sign", { method: "POST" });
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign?.error || "Token alınamadı.");

      // 2) Dosyayı DOĞRUDAN medya sunucusuna ham gövde olarak stream et (limitsiz boyut)
      const result = await new Promise<{ url: string; thumbUrl?: string; durationSec?: number }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", sign.uploadUrl);
          xhr.setRequestHeader("x-upload-token", sign.token);
          xhr.setRequestHeader("x-filename", encodeURIComponent(file.name));
          xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setPct(Math.round((e.loaded / e.total) * 100));
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch {
                reject(new Error("Medya sunucusu yanıtı çözümlenemedi."));
              }
            } else {
              let msg = `Yükleme başarısız (${xhr.status}).`;
              try {
                const j = JSON.parse(xhr.responseText);
                if (j?.error) msg = j.error;
              } catch {
                /* yut */
              }
              reject(new Error(msg));
            }
          };
          xhr.onerror = () => reject(new Error("Ağ hatası — medya sunucusuna ulaşılamadı."));
          xhr.send(file);
        }
      );

      onUploaded({
        url: result.url,
        thumbUrl: result.thumbUrl || "",
        durationSec: Math.round(result.durationSec || 0),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setBusy(false);
    }
  }

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void upload(f);
    e.target.value = "";
  };

  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-ink/50">Video dosyası (kendi yüklemen)</span>

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-black/10 bg-black">
          <video src={value} controls className="max-h-56 w-full bg-black" />
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
              <span className="font-medium">Yükleniyor… %{pct}</span>
              <span className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-black/10">
                <span
                  className="block h-full rounded-full bg-ceyhun-gold transition-[width] duration-200"
                  style={{ width: `${pct}%` }}
                />
              </span>
            </>
          ) : (
            <>
              <UploadCloud className="h-6 w-6" />
              <span className="font-medium">Video seç ve yükle</span>
              <span className="flex items-center gap-1 text-[11px] text-ink/40">
                <Film className="h-3 w-3" /> MP4, MOV, WEBM · boyut sınırı yok
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
