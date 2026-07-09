"use client";

// app/admin/content/ContentManager.tsx
// Genel CMS: portföy(venture) / hizmet(service) / referans(testimonial) / SSS(faq).
// title & body çok dilli; meta serbest JSON (yıl, renk, tag, rol, metrik...).

import { useActionState, useEffect, useState, useTransition } from "react";
import { Plus, Pencil, Trash2, X, Save, EyeOff } from "lucide-react";
import { saveContentItem, deleteContentItem, type AdminResult } from "../actions";
import { KINDS, kindLabel } from "./kinds";
import ImageUpload from "../_components/ImageUpload";

// meta JSON'undan görsel URL'sini güvenli oku (venture/testimonial görseli).
function metaImage(meta: string): string {
  try {
    const o = JSON.parse(meta || "{}");
    return typeof o.image === "string" ? o.image : "";
  } catch {
    return "";
  }
}

type Lang = { tr: string; en: string; de: string };
export type ContentDTO = {
  id: string;
  kind: string;
  title: Lang;
  body: Lang;
  meta: string;
  order: number;
  published: boolean;
};

const initial: AdminResult = { ok: false };

export default function ContentManager({
  items,
  canEdit,
  activeKind,
}: {
  items: ContentDTO[];
  canEdit: boolean;
  activeKind: string;
}) {
  const emptyFor = (kind: string): ContentDTO => ({
    id: "",
    kind,
    title: { tr: "", en: "", de: "" },
    body: { tr: "", en: "", de: "" },
    meta: "{}",
    order: 0,
    published: true,
  });

  const [editing, setEditing] = useState<ContentDTO | null>(null);
  const [state, formAction, pending] = useActionState(saveContentItem, initial);
  const [delPending, startDel] = useTransition();

  useEffect(() => {
    if (state.ok) setEditing(null);
  }, [state]);

  const metaHint = KINDS.find((k) => k.key === (editing?.kind ?? activeKind))?.metaHint ?? "{}";

  return (
    <div>
      {canEdit && (
        <div className="mb-5">
          <button
            onClick={() => setEditing(emptyFor(activeKind === "ALL" ? "venture" : activeKind))}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-kotapink"
          >
            <Plus className="h-4 w-4" /> İçerik ekle
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex items-center gap-3 border-b border-black/5 px-4 py-3.5 last:border-0 sm:px-5"
          >
            <span className="hidden w-24 shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-center text-[11px] font-semibold uppercase text-ink/50 sm:block">
              {kindLabel(it.kind)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{it.title.tr || it.title.en || "—"}</p>
              <p className="truncate text-xs text-ink/40">{it.body.tr || it.body.en}</p>
            </div>
            {!it.published && <EyeOff className="h-4 w-4 shrink-0 text-ink/30" />}
            <span className="shrink-0 text-[11px] text-ink/30">sıra: {it.order}</span>
            {canEdit && (
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => setEditing(it)}
                  className="rounded-lg p-2 text-ink/50 hover:bg-gray-100 hover:text-ink"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  disabled={delPending}
                  onClick={() => {
                    if (confirm("Bu içerik silinsin mi?")) {
                      startDel(() => {
                        void deleteContentItem(it.id);
                      });
                    }
                  }}
                  className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-ink/40">Bu türde içerik yok.</p>
        )}
      </div>

      {editing && canEdit && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <form
            action={formAction}
            className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-syne text-xl font-bold">
                {editing.id ? "İçeriği düzenle" : "Yeni içerik"}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-ink/40 hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editing.id && <input type="hidden" name="id" value={editing.id} />}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-ink/50">Tür *</span>
                <select
                  name="kind"
                  defaultValue={editing.kind}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-kotapink"
                >
                  {KINDS.map((k) => (
                    <option key={k.key} value={k.key}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-ink/50">Sıra</span>
                <input
                  name="order"
                  type="number"
                  defaultValue={String(editing.order)}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-kotapink"
                />
              </label>
            </div>

            <MultiLang label="Başlık" base="title" value={editing.title} />
            <MultiLang label="Metin / açıklama" base="body" value={editing.body} textarea />

            <div className="mt-4">
              <ImageUpload
                name="image"
                defaultValue={metaImage(editing.meta)}
                label="Görsel (opsiyonel — meta.image olarak kaydedilir)"
                folder="content"
              />
            </div>

            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-medium text-ink/50">
                Meta (JSON) — örn. {metaHint}
              </span>
              <textarea
                name="meta"
                defaultValue={editing.meta}
                rows={3}
                spellCheck={false}
                className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-kotapink"
              />
            </label>

            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="published"
                defaultChecked={editing.published}
                className="h-4 w-4 rounded border-black/20"
              />
              Sitede yayında
            </label>

            {state.message && !state.ok && (
              <p className="mt-3 text-sm text-red-600">{state.message}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-ink/60 hover:bg-gray-100"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-kotapink disabled:opacity-60"
              >
                <Save className="h-4 w-4" /> {pending ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const LANGS: { code: keyof Lang; flag: string }[] = [
  { code: "tr", flag: "🇹🇷" },
  { code: "en", flag: "🇬🇧" },
  { code: "de", flag: "🇩🇪" },
];

function MultiLang({
  label,
  base,
  value,
  textarea,
}: {
  label: string;
  base: string;
  value: Lang;
  textarea?: boolean;
}) {
  return (
    <div className="mt-4">
      <span className="mb-1.5 block text-xs font-medium text-ink/50">
        {label} (TR / EN / DE)
      </span>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {LANGS.map((l) =>
          textarea ? (
            <textarea
              key={l.code}
              name={`${base}_${l.code}`}
              defaultValue={value[l.code]}
              rows={3}
              placeholder={l.flag}
              className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-kotapink"
            />
          ) : (
            <input
              key={l.code}
              name={`${base}_${l.code}`}
              defaultValue={value[l.code]}
              placeholder={l.flag}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-kotapink"
            />
          )
        )}
      </div>
    </div>
  );
}
