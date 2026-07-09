"use client";

// app/admin/articles/ArticleManager.tsx
// Yazı/makale yönetimi: liste + oluştur/düzenle modalı. Çok dilli başlık/özet + zengin gövde.

import { useActionState, useEffect, useState, useTransition } from "react";
import { Plus, Pencil, Trash2, X, Save, EyeOff, Star } from "lucide-react";
import Image from "next/image";
import { saveArticle, deleteArticle, type AdminResult } from "../ceyhun-actions";
import MultiLangField from "../_components/MultiLangField";
import RichTextField from "../_components/RichTextField";
import ImageUpload from "../_components/ImageUpload";

type Lang = { tr: string; en: string; de: string };
export type ArticleDTO = {
  id: string;
  slug: string;
  title: Lang;
  excerpt: Lang;
  body: Lang;
  coverUrl: string | null;
  category: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  order: number;
  readMinutes: number;
  views: number;
};

const initial: AdminResult = { ok: false };

const empty: ArticleDTO = {
  id: "",
  slug: "",
  title: { tr: "", en: "", de: "" },
  excerpt: { tr: "", en: "", de: "" },
  body: { tr: "", en: "", de: "" },
  coverUrl: null,
  category: "",
  tags: [],
  featured: false,
  published: true,
  order: 0,
  readMinutes: 0,
  views: 0,
};

export default function ArticleManager({ items }: { items: ArticleDTO[] }) {
  const [editing, setEditing] = useState<ArticleDTO | null>(null);
  const [state, formAction, pending] = useActionState(saveArticle, initial);
  const [delPending, startDel] = useTransition();

  useEffect(() => {
    if (state.ok) setEditing(null);
  }, [state]);

  return (
    <div>
      <div className="mb-5">
        <button
          onClick={() => setEditing(empty)}
          className="inline-flex items-center gap-2 rounded-full bg-ceyhun-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ceyhun-gold-deep"
        >
          <Plus className="h-4 w-4" /> Yeni yazı
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-3 border-b border-black/5 px-4 py-3.5 last:border-0 sm:px-5">
            <div className="relative hidden h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:block">
              {it.coverUrl && (
                <Image src={it.coverUrl} alt="" fill className="object-cover" sizes="64px" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                {it.featured && <Star className="h-3.5 w-3.5 shrink-0 fill-ceyhun-gold text-ceyhun-gold" />}
                {it.title.tr || it.title.en || "—"}
              </p>
              <p className="truncate text-xs text-ink/40">
                /{it.slug} · {it.category || "genel"} · {it.readMinutes} dk · {it.views} görüntülenme
              </p>
            </div>
            {!it.published && <EyeOff className="h-4 w-4 shrink-0 text-ink/30" />}
            <span className="shrink-0 text-[11px] text-ink/30">sıra: {it.order}</span>
            <div className="flex shrink-0 gap-1.5">
              <button onClick={() => setEditing(it)} className="rounded-lg p-2 text-ink/50 hover:bg-gray-100 hover:text-ink">
                <Pencil className="h-4 w-4" />
              </button>
              <button
                disabled={delPending}
                onClick={() => {
                  if (confirm("Bu yazı silinsin mi?")) startDel(() => void deleteArticle(it.id));
                }}
                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-ink/40">Henüz yazı yok.</p>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <form action={formAction} className="my-8 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-syne text-xl font-bold">{editing.id ? "Yazıyı düzenle" : "Yeni yazı"}</h3>
              <button type="button" onClick={() => setEditing(null)} className="text-ink/40 hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            {editing.id && <input type="hidden" name="id" value={editing.id} />}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block sm:col-span-1">
                <span className="mb-1 block text-xs font-medium text-ink/50">Slug (boşsa otomatik)</span>
                <input name="slug" defaultValue={editing.slug} placeholder="ornek-yazi"
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-ink/50">Kategori</span>
                <input name="category" defaultValue={editing.category} placeholder="vaaz / makale / duyuru"
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-ink/50">Sıra</span>
                <input name="order" type="number" defaultValue={String(editing.order)}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold" />
              </label>
            </div>

            <MultiLangField base="title" label="Başlık" value={editing.title} required />
            <MultiLangField base="excerpt" label="Özet" value={editing.excerpt} textarea rows={2} />
            <RichTextField base="body" label="Gövde" value={editing.body} />

            <div className="mt-4">
              <ImageUpload name="coverUrl" defaultValue={editing.coverUrl ?? ""} label="Kapak görseli" folder="articles" />
            </div>

            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-medium text-ink/50">Etiketler (virgülle)</span>
              <input name="tags" defaultValue={editing.tags.join(", ")} placeholder="lütuf, dua, tanıklık"
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold" />
            </label>

            <div className="mt-4 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="featured" defaultChecked={editing.featured} className="h-4 w-4 rounded border-black/20" />
                Öne çıkar
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="published" defaultChecked={editing.published} className="h-4 w-4 rounded border-black/20" />
                Yayında
              </label>
            </div>

            {state.message && !state.ok && <p className="mt-3 text-sm text-red-600">{state.message}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-ink/60 hover:bg-gray-100">Vazgeç</button>
              <button type="submit" disabled={pending}
                className="inline-flex items-center gap-2 rounded-full bg-ceyhun-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ceyhun-gold-deep disabled:opacity-60">
                <Save className="h-4 w-4" /> {pending ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
