"use client";

// app/admin/videos/VideoManager.tsx
// Video yönetimi: YouTube/Vimeo (embed) + kendi yüklemen (Cloudinary'ye doğrudan yükleme).
// Kaynak "cloudinary" seçilince dosya yükleyici çıkar; videoRef/küçük resim/süre otomatik dolar.

import { useActionState, useEffect, useState, useTransition } from "react";
import { Plus, Pencil, Trash2, X, Save, EyeOff, Star, Play } from "lucide-react";
import Image from "next/image";
import { saveVideo, deleteVideo, type AdminResult } from "../ceyhun-actions";
import { videoThumb } from "@/app/lib/ceyhun";
import MultiLangField from "../_components/MultiLangField";
import ImageUpload from "../_components/ImageUpload";
import VideoUpload from "../_components/VideoUpload";
import MuxVideoUpload from "../_components/MuxVideoUpload";

type Lang = { tr: string; en: string; de: string };
export type VideoDTO = {
  id: string;
  title: Lang;
  description: Lang;
  provider: string;
  videoRef: string;
  thumbUrl: string | null;
  category: string;
  featured: boolean;
  published: boolean;
  order: number;
  durationSec: number;
  views: number;
};

const initial: AdminResult = { ok: false };
const empty: VideoDTO = {
  id: "",
  title: { tr: "", en: "", de: "" },
  description: { tr: "", en: "", de: "" },
  provider: "youtube",
  videoRef: "",
  thumbUrl: null,
  category: "",
  featured: false,
  published: true,
  order: 0,
  durationSec: 0,
  views: 0,
};

export default function VideoManager({ items }: { items: VideoDTO[] }) {
  const [editing, setEditing] = useState<VideoDTO | null>(null);
  const [state, formAction, pending] = useActionState(saveVideo, initial);
  const [delPending, startDel] = useTransition();

  useEffect(() => {
    if (state.ok) setEditing(null);
  }, [state]);

  return (
    <div>
      <div className="mb-5">
        <button onClick={() => setEditing(empty)}
          className="inline-flex items-center gap-2 rounded-full bg-ceyhun-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ceyhun-gold-deep">
          <Plus className="h-4 w-4" /> Yeni video
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => {
          const thumb = videoThumb(it.provider, it.videoRef, it.thumbUrl);
          return (
            <div key={it.id} className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
              <div className="relative aspect-video bg-gray-900">
                {thumb ? (
                  <Image src={thumb} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/40"><Play className="h-8 w-8" /></div>
                )}
                <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                  {it.provider}
                </span>
                {it.featured && <Star className="absolute right-2 top-2 h-4 w-4 fill-ceyhun-gold text-ceyhun-gold" />}
                {!it.published && <EyeOff className="absolute bottom-2 right-2 h-4 w-4 text-white/70" />}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium">{it.title.tr || it.title.en || "—"}</p>
                <p className="truncate text-xs text-ink/40">{it.category || "genel"} · {it.views} izlenme</p>
                <div className="mt-2 flex gap-1.5">
                  <button onClick={() => setEditing(it)} className="flex-1 rounded-lg border border-black/10 py-1.5 text-xs font-medium hover:bg-gray-50">
                    <Pencil className="mx-auto h-3.5 w-3.5" />
                  </button>
                  <button disabled={delPending}
                    onClick={() => { if (confirm("Video silinsin mi?")) startDel(() => void deleteVideo(it.id)); }}
                    className="flex-1 rounded-lg border border-red-100 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50">
                    <Trash2 className="mx-auto h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="col-span-full rounded-2xl border border-dashed border-black/10 px-5 py-12 text-center text-sm text-ink/40">Henüz video yok.</p>
        )}
      </div>

      {editing && (
        <VideoEditor
          key={editing.id || "new"}
          editing={editing}
          state={state}
          formAction={formAction}
          pending={pending}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

// ─────────────── Düzenleme modalı (kontrollü alan durumu) ───────────────
function VideoEditor({
  editing,
  state,
  formAction,
  pending,
  onClose,
}: {
  editing: VideoDTO;
  state: AdminResult;
  formAction: (fd: FormData) => void;
  pending: boolean;
  onClose: () => void;
}) {
  const [provider, setProvider] = useState(editing.provider || "youtube");
  const [videoRef, setVideoRef] = useState(editing.videoRef || "");
  const [thumbUrl, setThumbUrl] = useState(editing.thumbUrl ?? "");
  const [durationSec, setDurationSec] = useState(editing.durationSec || 0);
  const isMux = provider === "mux";
  // Kendi medya sunucumuza yükleme (yeni: "mediaserver"; eski kayıtlar "cloudinary" olabilir).
  const isUpload = provider === "mediaserver" || provider === "cloudinary";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <form action={formAction} className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-syne text-xl font-bold">{editing.id ? "Videoyu düzenle" : "Yeni video"}</h3>
          <button type="button" onClick={onClose} className="text-ink/40 hover:text-ink"><X className="h-5 w-5" /></button>
        </div>
        {editing.id && <input type="hidden" name="id" value={editing.id} />}

        {/* Server action'a taşınan gizli alanlar (kontrollü) */}
        <input type="hidden" name="videoRef" value={videoRef} readOnly />
        <input type="hidden" name="thumbUrl" value={thumbUrl} readOnly />
        <input type="hidden" name="durationSec" value={String(durationSec)} readOnly />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/50">Kaynak *</span>
            <select name="provider" value={provider} onChange={(e) => setProvider(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceyhun-gold">
              <option value="mux">Mux (yükle · adaptif · önerilen)</option>
              <option value="mediaserver">Kendi sunucum (dosya yükleme)</option>
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/50">Sıra</span>
            <input name="order" type="number" defaultValue={String(editing.order)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold" />
          </label>
        </div>

        {/* Kaynağa göre: Mux yükleyici / kendi sunucu yükleyici / bağlantı alanı */}
        {isMux ? (
          <div className="mt-4">
            <MuxVideoUpload
              value={videoRef}
              onUploaded={({ videoRef: ref, thumbUrl: tb, durationSec: d }) => {
                setVideoRef(ref);
                setThumbUrl((prev) => prev || tb); // elle küçük resim konmadıysa Mux otomatiğini kullan
                if (d) setDurationSec(d);
              }}
              onClear={() => setVideoRef("")}
            />
          </div>
        ) : isUpload ? (
          <div className="mt-4">
            <VideoUpload
              value={videoRef}
              onUploaded={({ url, thumbUrl: tb, durationSec: d }) => {
                setVideoRef(url);
                setThumbUrl((prev) => prev || tb); // elle küçük resim konmadıysa otomatiği kullan
                if (d) setDurationSec(d);
              }}
              onClear={() => setVideoRef("")}
            />
          </div>
        ) : (
          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-medium text-ink/50">Video bağlantısı / kimliği *</span>
            <input value={videoRef} onChange={(e) => setVideoRef(e.target.value)} placeholder="https://youtu.be/… veya video ID"
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold" />
          </label>
        )}

        <MultiLangField base="title" label="Başlık" value={editing.title} required />
        <MultiLangField base="description" label="Açıklama" value={editing.description} textarea rows={2} />

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/50">Kategori</span>
            <input name="category" defaultValue={editing.category} placeholder="vaaz / öğreti"
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/50">Süre (saniye)</span>
            <input type="number" value={String(durationSec)} onChange={(e) => setDurationSec(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold" />
          </label>
        </div>

        <div className="mt-4">
          <ImageUpload
            value={thumbUrl}
            onChange={setThumbUrl}
            label="Küçük resim (opsiyonel — YouTube ve yüklenen videoda otomatik)"
            folder="videos"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={editing.featured} className="h-4 w-4 rounded border-black/20" /> Öne çıkar
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={editing.published} className="h-4 w-4 rounded border-black/20" /> Yayında
          </label>
        </div>

        {state.message && !state.ok && <p className="mt-3 text-sm text-red-600">{state.message}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-medium text-ink/60 hover:bg-gray-100">Vazgeç</button>
          <button type="submit" disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-ceyhun-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ceyhun-gold-deep disabled:opacity-60">
            <Save className="h-4 w-4" /> {pending ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
