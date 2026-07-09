"use client";

// app/admin/_components/ImageUpload.tsx
// Yeniden kullanılabilir görsel yükleyici. Dosyayı /api/admin/upload'a POST eder,
// dönen Cloudinary URL'sini gizli <input name={name}>'e yazar → normal <form action>
// (server action) gönderiminde alan otomatik taşınır.
//
// Kontrollü kullanım için opsiyonel onChange verilebilir (form dışı senaryolar).

import { useRef, useState } from "react";
import { UploadCloud, X, Loader2, ImageIcon } from "lucide-react";

export default function ImageUpload({
  name,
  value,
  defaultValue = "",
  label,
  folder = "cms",
  onChange,
}: {
  name?: string;
  value?: string; // verilirse kontrollü (parent state kaynak) — liste sıralamasında senkron kalır
  defaultValue?: string;
  label?: string;
  folder?: string;
  onChange?: (url: string) => void;
}) {
  const [internal, setInternal] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // kontrollü ise parent value'su, değilse iç durum
  const url = value !== undefined ? value : internal;

  const setValue = (v: string) => {
    setInternal(v);
    onChange?.(v);
  };

  async function upload(file: File) {
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Yükleme başarısız.");
      setValue(data.url as string);
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

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void upload(f);
  };

  return (
    <div>
      {label && <span className="mb-1 block text-xs font-medium text-ink/50">{label}</span>}

      {/* Gizli input: form gönderiminde URL'yi taşır */}
      {name && <input type="hidden" name={name} value={url} readOnly />}

      {url ? (
        <div className="group relative inline-flex overflow-hidden rounded-xl border border-black/10 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Yüklenen görsel"
            className="h-32 w-full max-w-xs object-cover"
          />
          <button
            type="button"
            onClick={() => setValue("")}
            title="Kaldır"
            className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="h-5 w-5 animate-spin text-ink" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`flex h-32 w-full max-w-xs flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm transition-colors ${
            drag
              ? "border-kotapink bg-kotapink/5 text-kotapink"
              : "border-black/15 bg-gray-50 text-ink/50 hover:border-kotapink/50 hover:text-ink"
          }`}
        >
          {busy ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Yükleniyor…
            </>
          ) : (
            <>
              <UploadCloud className="h-6 w-6" />
              <span className="font-medium">Görsel seç / sürükle</span>
              <span className="text-[11px] text-ink/40">PNG, JPG, WEBP · ≤ 8MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        className="hidden"
      />

      {/* URL'yi elle de düzenleyebilme (opsiyonel, ileri kullanım) */}
      {url && (
        <div className="mt-2 flex items-center gap-2">
          <ImageIcon className="h-3.5 w-3.5 shrink-0 text-ink/30" />
          <input
            value={url}
            onChange={(e) => setValue(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-xs text-ink/60 outline-none focus:border-kotapink"
          />
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
