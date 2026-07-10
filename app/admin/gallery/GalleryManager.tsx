"use client";

// app/admin/gallery/GalleryManager.tsx
// Galeri yönetimi: albümler (oluştur/düzenle/sil) + fotoğraflar (çoklu yükle/sil).

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Plus, Pencil, Trash2, X, Save, EyeOff, UploadCloud, Loader2, FolderOpen } from "lucide-react";
import Image from "next/image";
import { saveAlbum, deleteAlbum, deletePhoto, addPhotos, setPhotoAlbum, type AdminResult } from "../ceyhun-actions";
import MultiLangField from "../_components/MultiLangField";
import ImageUpload from "../_components/ImageUpload";

type Lang = { tr: string; en: string; de: string };
export type AlbumDTO = { id: string; slug: string; title: Lang; note: Lang; coverUrl: string | null; order: number; published: boolean; count: number };
export type PhotoDTO = { id: string; url: string; albumId: string | null; caption: Lang };

const initial: AdminResult = { ok: false };
const emptyAlbum: AlbumDTO = { id: "", slug: "", title: { tr: "", en: "", de: "" }, note: { tr: "", en: "", de: "" }, coverUrl: null, order: 0, published: true, count: 0 };

export default function GalleryManager({ albums, photos }: { albums: AlbumDTO[]; photos: PhotoDTO[] }) {
  const [editing, setEditing] = useState<AlbumDTO | null>(null);
  const [state, formAction, pending] = useActionState(saveAlbum, initial);
  const [delPending, startDel] = useTransition();
  const [movePending, startMove] = useTransition();
  const [filter, setFilter] = useState<string>("all"); // "all" | albumId | "none"

  useEffect(() => { if (state.ok) setEditing(null); }, [state]);

  const shown = photos.filter((p) =>
    filter === "all" ? true : filter === "none" ? !p.albumId : p.albumId === filter
  );

  return (
    <div className="space-y-8">
      {/* ─── Albümler ─── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-syne text-lg font-bold">Albümler</h2>
          <button onClick={() => setEditing(emptyAlbum)}
            className="inline-flex items-center gap-2 rounded-full bg-ceyhun-ink px-4 py-2 text-sm font-medium text-white hover:bg-ceyhun-gold-deep">
            <Plus className="h-4 w-4" /> Yeni albüm
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {albums.map((a) => (
            <div key={a.id} className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
              <div className="relative aspect-[4/3] bg-gray-100">
                {a.coverUrl && <Image src={a.coverUrl} alt="" fill className="object-cover" sizes="200px" />}
                {!a.published && <EyeOff className="absolute right-2 top-2 h-4 w-4 text-white/80" />}
              </div>
              <div className="p-2.5">
                <p className="truncate text-sm font-medium">{a.title.tr || a.title.en || "—"}</p>
                <p className="text-xs text-ink/40">{a.count} foto</p>
                <div className="mt-2 flex gap-1.5">
                  <button onClick={() => setEditing(a)} className="flex-1 rounded-lg border border-black/10 py-1 text-xs hover:bg-gray-50"><Pencil className="mx-auto h-3.5 w-3.5" /></button>
                  <button disabled={delPending} onClick={() => { if (confirm("Albüm silinsin mi? (fotolar kalır, albümsüz olur)")) startDel(() => void deleteAlbum(a.id)); }}
                    className="flex-1 rounded-lg border border-red-100 py-1 text-xs text-red-500 hover:bg-red-50"><Trash2 className="mx-auto h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
          {albums.length === 0 && <p className="col-span-full rounded-xl border border-dashed border-black/10 px-4 py-8 text-center text-sm text-ink/40">Henüz albüm yok. Albümsüz de foto ekleyebilirsin.</p>}
        </div>
      </section>

      {/* ─── Fotoğraflar ─── */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-syne text-lg font-bold">Fotoğraflar</h2>
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-ink/40" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-ceyhun-gold">
              <option value="all">Tümü</option>
              <option value="none">Albümsüz</option>
              {albums.map((a) => <option key={a.id} value={a.id}>{a.title.tr || a.title.en}</option>)}
            </select>
          </div>
        </div>

        <PhotoUploader albumId={filter !== "all" && filter !== "none" ? filter : null} />

        <p className="mt-4 text-xs text-ink/40">Her fotoğrafın altındaki menüden onu bir albüme taşıyabilir (gruplandırabilir) veya albümden çıkarabilirsiniz.</p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {shown.map((p) => (
            <div key={p.id} className="group overflow-hidden rounded-lg border border-black/5 bg-gray-100">
              <div className="relative aspect-square">
                <Image src={p.url} alt={p.caption.tr || ""} fill className="object-cover" sizes="150px" />
                <button disabled={delPending} onClick={() => startDel(() => void deletePhoto(p.id))}
                  className="absolute right-1.5 top-1.5 rounded-lg bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <select
                value={p.albumId ?? ""}
                disabled={movePending}
                onChange={(e) => { const v = e.target.value || null; startMove(() => void setPhotoAlbum(p.id, v)); }}
                title="Albüm"
                className="w-full border-t border-black/5 bg-white px-1.5 py-1 text-[11px] text-ink/70 outline-none focus:bg-ceyhun-gold/5"
              >
                <option value="">— Albümsüz —</option>
                {albums.map((a) => <option key={a.id} value={a.id}>{a.title.tr || a.title.en || a.slug}</option>)}
              </select>
            </div>
          ))}
          {shown.length === 0 && <p className="col-span-full rounded-xl border border-dashed border-black/10 px-4 py-8 text-center text-sm text-ink/40">Bu seçimde foto yok.</p>}
        </div>
      </section>

      {/* Albüm modalı */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <form action={formAction} className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-syne text-xl font-bold">{editing.id ? "Albümü düzenle" : "Yeni albüm"}</h3>
              <button type="button" onClick={() => setEditing(null)} className="text-ink/40 hover:text-ink"><X className="h-5 w-5" /></button>
            </div>
            {editing.id && <input type="hidden" name="id" value={editing.id} />}
            <div className="grid grid-cols-2 gap-4">
              <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">Slug (boşsa otomatik)</span>
                <input name="slug" defaultValue={editing.slug} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold" /></label>
              <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">Sıra</span>
                <input name="order" type="number" defaultValue={String(editing.order)} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold" /></label>
            </div>
            <MultiLangField base="title" label="Albüm adı" value={editing.title} required />
            <MultiLangField base="note" label="Açıklama" value={editing.note} textarea rows={2} />
            <div className="mt-4"><ImageUpload name="coverUrl" defaultValue={editing.coverUrl ?? ""} label="Kapak" folder="gallery" /></div>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" defaultChecked={editing.published} className="h-4 w-4 rounded border-black/20" /> Yayında
            </label>
            {state.message && !state.ok && <p className="mt-3 text-sm text-red-600">{state.message}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="rounded-full px-5 py-2.5 text-sm font-medium text-ink/60 hover:bg-gray-100">Vazgeç</button>
              <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-ceyhun-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ceyhun-gold-deep disabled:opacity-60">
                <Save className="h-4 w-4" /> {pending ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Çoklu fotoğraf yükleyici: her dosyayı Cloudinary'ye yükler, biriken URL'leri addPhotos'a gönderir.
function PhotoUploader({ albumId }: { albumId: string | null }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    const list = Array.from(files);
    if (!list.length) return;
    setBusy(true);
    setProgress({ done: 0, total: list.length });
    const urls: string[] = [];
    for (let i = 0; i < list.length; i++) {
      try {
        const fd = new FormData();
        fd.append("file", list[i]);
        fd.append("folder", "gallery");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok && data.url) urls.push(data.url);
      } catch { /* atla */ }
      setProgress({ done: i + 1, total: list.length });
    }
    if (urls.length) await addPhotos(albumId, urls);
    else setError("Hiçbir görsel yüklenemedi.");
    setBusy(false);
    setProgress(null);
  }

  return (
    <div>
      <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/15 bg-gray-50 py-6 text-sm text-ink/50 transition-colors hover:border-ceyhun-gold/60 hover:text-ink disabled:opacity-60">
        {busy ? <><Loader2 className="h-5 w-5 animate-spin" /> {progress ? `Yükleniyor ${progress.done}/${progress.total}` : "Yükleniyor…"}</>
          : <><UploadCloud className="h-5 w-5" /> {albumId ? "Seçili albüme foto ekle (çoklu)" : "Fotoğraf ekle (çoklu seçim)"}</>}
      </button>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { if (e.target.files) void handleFiles(e.target.files); e.target.value = ""; }} />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
