"use client";

// app/admin/team/TeamManager.tsx
// Kadro CRUD: liste + ekle/düzenle formu (çok dilli role/bio) + sil.

import { useActionState, useEffect, useState, useTransition } from "react";
import { Plus, Pencil, Trash2, X, Save, EyeOff } from "lucide-react";
import { saveTeamMember, deleteTeamMember, type AdminResult } from "../actions";
import ImageUpload from "../_components/ImageUpload";

type Lang = { tr: string; en: string; de: string };
export type TeamDTO = {
  id: string;
  name: string;
  role: Lang;
  bio: Lang;
  avatarUrl: string | null;
  linkedin: string | null;
  twitter: string | null;
  order: number;
  published: boolean;
};

const initial: AdminResult = { ok: false };
const empty: TeamDTO = {
  id: "",
  name: "",
  role: { tr: "", en: "", de: "" },
  bio: { tr: "", en: "", de: "" },
  avatarUrl: "",
  linkedin: "",
  twitter: "",
  order: 0,
  published: true,
};

export default function TeamManager({
  members,
  canEdit,
}: {
  members: TeamDTO[];
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState<TeamDTO | null>(null);
  const [state, formAction, pending] = useActionState(saveTeamMember, initial);
  const [delPending, startDel] = useTransition();

  useEffect(() => {
    if (state.ok) setEditing(null);
  }, [state]);

  return (
    <div>
      {canEdit && (
        <div className="mb-5">
          <button
            onClick={() => setEditing(empty)}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-kotapink"
          >
            <Plus className="h-4 w-4" /> Üye ekle
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex flex-col rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-sm font-bold text-paper">
                  {m.name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-xs text-kotapink">{m.role.tr || m.role.en}</p>
                </div>
              </div>
              {!m.published && (
                <span title="Yayında değil" className="text-ink/30">
                  <EyeOff className="h-4 w-4" />
                </span>
              )}
            </div>
            <p className="mt-3 line-clamp-3 flex-1 text-sm text-ink/50">{m.bio.tr || m.bio.en}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-ink/30">sıra: {m.order}</span>
              {canEdit && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setEditing(m)}
                    className="rounded-lg p-2 text-ink/50 hover:bg-gray-100 hover:text-ink"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    disabled={delPending}
                    onClick={() => {
                      if (confirm(`${m.name} silinsin mi?`)) {
                        startDel(() => {
                          void deleteTeamMember(m.id);
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
          </div>
        ))}
      </div>

      {/* Ekle / düzenle modalı */}
      {editing && canEdit && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <form
            action={formAction}
            className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-syne text-xl font-bold">
                {editing.id ? "Üyeyi düzenle" : "Yeni üye"}
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
              <Field label="Ad Soyad *" name="name" defaultValue={editing.name} required />
              <Field label="Sıra" name="order" type="number" defaultValue={String(editing.order)} />
            </div>

            <MultiLang label="Rol / Başlık" base="role" value={editing.role} />
            <MultiLang label="Kısa biyografi" base="bio" value={editing.bio} textarea />

            <div className="mt-4">
              <ImageUpload
                name="avatarUrl"
                defaultValue={editing.avatarUrl ?? ""}
                label="Avatar"
                folder="team"
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="LinkedIn" name="linkedin" defaultValue={editing.linkedin ?? ""} />
              <Field label="Twitter/X" name="twitter" defaultValue={editing.twitter ?? ""} />
            </div>

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

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink/50">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-kotapink"
      />
    </label>
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
