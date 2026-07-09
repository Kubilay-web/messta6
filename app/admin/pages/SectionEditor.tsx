"use client";

// app/admin/pages/SectionEditor.tsx
// Şema-güdümlü çok dilli bölüm editörü. Bölüm listesi + modal form.
// i18n alanlar TR/EN/DE, görsel alanlar Cloudinary yükleyici, listeler ekle/sil/sırala.
// Kayıt → saveSection (JSON), sıfırla → resetSection.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  X,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
} from "lucide-react";
import ImageUpload from "../_components/ImageUpload";
import { saveSection, resetSection } from "./actions";
import {
  type SectionSchema,
  type ScalarField,
  type ListField,
  isList,
} from "./section-schema";

export type SectionBundle = {
  key: string;
  label: string;
  description: string;
  schema: SectionSchema;
  data: Record<string, any>;
  customized: boolean; // DB'de kayıt var mı (statikten farklı mı)
};

const LANGS: { code: "tr" | "en" | "de"; flag: string }[] = [
  { code: "tr", flag: "🇹🇷" },
  { code: "en", flag: "🇬🇧" },
  { code: "de", flag: "🇩🇪" },
];

export default function SectionEditor({
  sections,
  canEdit,
}: {
  sections: SectionBundle[];
  canEdit: boolean;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const open = sections.find((s) => s.key === openKey) || null;

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <div
            key={s.key}
            className="flex flex-col rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-syne text-base font-bold tracking-tight">{s.label}</h3>
              {s.customized ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-acid/70 px-2 py-0.5 text-[10px] font-bold text-ink">
                  <Check className="h-3 w-3" /> Özel
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-ink/40">
                  Statik
                </span>
              )}
            </div>
            <p className="mt-1 flex-1 text-xs text-ink/50">{s.description}</p>
            <button
              onClick={() => setOpenKey(s.key)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-kotapink"
            >
              <Pencil className="h-3.5 w-3.5" /> {canEdit ? "Düzenle" : "Görüntüle"}
            </button>
          </div>
        ))}
      </div>

      {open && (
        <SectionForm key={open.key} section={open} canEdit={canEdit} onClose={() => setOpenKey(null)} />
      )}
    </div>
  );
}

function SectionForm({
  section,
  canEdit,
  onClose,
}: {
  section: SectionBundle;
  canEdit: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [data, setData] = useState<Record<string, any>>(() =>
    structuredClone(section.data ?? {})
  );
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const setField = (key: string, value: any) =>
    setData((d) => ({ ...d, [key]: value }));

  const onSave = () => {
    if (!canEdit) return;
    setError(null);
    start(async () => {
      const res = await saveSection(section.key, JSON.stringify(data));
      if (res.ok) {
        onClose();
        router.refresh();
      } else {
        setError(res.message ?? "Kaydedilemedi.");
      }
    });
  };

  const onReset = () => {
    if (!canEdit) return;
    if (!confirm("Bu bölüm statik içeriğe döndürülsün mü? Özel düzenlemeler silinir.")) return;
    start(async () => {
      await resetSection(section.key);
      onClose();
      router.refresh();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        {/* Başlık */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-black/5 bg-white/95 px-6 py-4 backdrop-blur">
          <div>
            <h3 className="font-syne text-xl font-bold">{section.label}</h3>
            <p className="text-xs text-ink/40">{section.description}</p>
          </div>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alanlar */}
        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
          <fieldset disabled={!canEdit} className="space-y-5">
            {section.schema.fields.map((f) =>
              isList(f) ? (
                <ListControl
                  key={f.key}
                  field={f}
                  items={Array.isArray(data[f.key]) ? data[f.key] : []}
                  onChange={(items) => setField(f.key, items)}
                  folder={section.key}
                />
              ) : (
                <ScalarControl
                  key={f.key}
                  field={f}
                  value={data[f.key]}
                  onChange={(v) => setField(f.key, v)}
                  folder={section.key}
                />
              )
            )}
          </fieldset>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>

        {/* Aksiyonlar */}
        <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t border-black/5 px-6 py-4">
          <button
            type="button"
            onClick={onReset}
            disabled={!canEdit || pending || !section.customized}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-ink/50 hover:bg-gray-100 disabled:opacity-40"
            title={section.customized ? "Statiğe döndür" : "Zaten statik"}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Statiğe döndür
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-ink/60 hover:bg-gray-100"
            >
              Kapat
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={onSave}
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-kotapink disabled:opacity-60"
              >
                <Save className="h-4 w-4" /> {pending ? "Kaydediliyor…" : "Kaydet"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// —————————————————— Alan kontrolleri ——————————————————

function ScalarControl({
  field,
  value,
  onChange,
  folder,
}: {
  field: ScalarField;
  value: any;
  onChange: (v: any) => void;
  folder: string;
}) {
  if (field.type === "image") {
    return (
      <ImageUpload
        label={field.label}
        value={typeof value === "string" ? value : ""}
        folder={folder}
        onChange={onChange}
      />
    );
  }

  const labelEl = (
    <span className="mb-1 block text-xs font-medium text-ink/50">
      {field.label}
      {field.hint && <span className="ml-1 font-normal text-ink/30">· {field.hint}</span>}
    </span>
  );

  if (field.i18n) {
    const v = (value && typeof value === "object" ? value : {}) as Record<string, string>;
    return (
      <div>
        {labelEl}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {LANGS.map((l) => {
            const common = {
              value: v[l.code] ?? "",
              onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onChange({ ...v, [l.code]: e.target.value }),
              placeholder: l.flag,
              className:
                "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-kotapink",
            };
            return field.type === "textarea" ? (
              <textarea key={l.code} rows={3} {...common} className={`${common.className} resize-none`} />
            ) : (
              <input key={l.code} {...common} />
            );
          })}
        </div>
      </div>
    );
  }

  // dilden bağımsız tek alan
  const str = typeof value === "string" ? value : "";
  return (
    <label className="block">
      {labelEl}
      {field.type === "textarea" ? (
        <textarea
          rows={2}
          value={str}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-kotapink"
        />
      ) : (
        <input
          value={str}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-kotapink"
        />
      )}
    </label>
  );
}

function ListControl({
  field,
  items,
  onChange,
  folder,
}: {
  field: ListField;
  items: any[];
  onChange: (items: any[]) => void;
  folder: string;
}) {
  const emptyItem = () => {
    const o: Record<string, any> = {};
    for (const f of field.fields) o[f.key] = f.i18n ? { tr: "", en: "", de: "" } : "";
    return o;
  };

  const update = (i: number, key: string, val: any) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it));
    onChange(next);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, emptyItem()]);

  return (
    <div className="rounded-xl border border-black/10 bg-gray-50/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink/70">
          {field.label}{" "}
          <span className="text-xs font-normal text-ink/40">({items.length})</span>
        </span>
        {(!field.max || items.length < field.max) && (
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-kotapink"
          >
            <Plus className="h-3.5 w-3.5" /> {field.itemLabel} ekle
          </button>
        )}
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-black/10 bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wide text-ink/40">
                {field.itemLabel} {i + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="rounded p-1 text-ink/40 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  className="rounded p-1 text-ink/40 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="rounded p-1 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {field.fields.map((sf) => (
                <ScalarControl
                  key={sf.key}
                  field={sf}
                  value={item[sf.key]}
                  onChange={(v) => update(i, sf.key, v)}
                  folder={folder}
                />
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-4 text-center text-xs text-ink/40">Henüz öğe yok.</p>
        )}
      </div>
    </div>
  );
}
