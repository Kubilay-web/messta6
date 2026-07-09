"use client";

// app/admin/prayer/PrayerManager.tsx
// Online dua toplantıları: planla/düzenle/sil, CANLI yap / bitir, kayıt & dua isteklerini gör.

import { useActionState, useEffect, useState, useTransition } from "react";
import { Plus, Pencil, Trash2, X, Save, EyeOff, ChevronDown, Radio, Square, MessageCircleHeart } from "lucide-react";
import { saveMeeting, deleteMeeting, updateMeetingStatus, type AdminResult } from "../ceyhun-actions";
import { formatDate } from "../_ui";
import MultiLangField from "../_components/MultiLangField";
import ImageUpload from "../_components/ImageUpload";

type Lang = { tr: string; en: string; de: string };
export type RegistrationDTO = { id: string; name: string; email: string; prayerRequest: string | null; createdAt: string };
export type MeetingDTO = { id: string; slug: string; title: Lang; description: Lang; coverUrl: string | null; scheduledAtLocal: string; scheduledAtLabel: string; durationMin: number; capacity: number; embedUrl: string; status: string; published: boolean; registrations: RegistrationDTO[] };

const initial: AdminResult = { ok: false };
const emptyMeeting: MeetingDTO = { id: "", slug: "", title: { tr: "", en: "", de: "" }, description: { tr: "", en: "", de: "" }, coverUrl: null, scheduledAtLocal: "", scheduledAtLabel: "", durationMin: 60, capacity: 0, embedUrl: "", status: "SCHEDULED", published: true, registrations: [] };

export default function PrayerManager({ items }: { items: MeetingDTO[] }) {
  const [editing, setEditing] = useState<MeetingDTO | null>(null);
  const [state, formAction, pending] = useActionState(saveMeeting, initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, start] = useTransition();
  useEffect(() => { if (state.ok) setEditing(null); }, [state]);
  const inp = "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold";

  return (
    <div>
      <div className="mb-5">
        <button onClick={() => setEditing(emptyMeeting)} className="inline-flex items-center gap-2 rounded-full bg-ceyhun-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-ceyhun-gold-deep">
          <Plus className="h-4 w-4" /> Yeni toplantı
        </button>
      </div>

      <div className="space-y-3">
        {items.map((m) => {
          const live = m.status === "LIVE";
          return (
            <div key={m.id} className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
              <div className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${live ? "bg-red-600 text-white" : "bg-ceyhun-ink text-ceyhun-gold"}`}><Radio className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.title.tr || m.title.en || "—"} <span className={`ml-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${live ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>{m.status}</span></p>
                  <p className="truncate text-xs text-ink/40">{m.scheduledAtLabel} · {m.registrations.length} kayıt</p>
                </div>
                {!m.published && <EyeOff className="h-4 w-4 shrink-0 text-ink/30" />}
                {live ? (
                  <button disabled={busy} onClick={() => start(() => void updateMeetingStatus(m.id, "ENDED"))} className="inline-flex items-center gap-1.5 rounded-full bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black"><Square className="h-3 w-3" /> Bitir</button>
                ) : (
                  <button disabled={busy} onClick={() => start(() => void updateMeetingStatus(m.id, "LIVE"))} className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"><Radio className="h-3 w-3" /> CANLI yap</button>
                )}
                <button onClick={() => setExpanded((v) => (v === m.id ? null : m.id))} className="rounded-lg p-2 text-ink/50 hover:bg-gray-100"><ChevronDown className={`h-4 w-4 transition-transform ${expanded === m.id ? "rotate-180" : ""}`} /></button>
                <button onClick={() => setEditing(m)} className="rounded-lg p-2 text-ink/50 hover:bg-gray-100"><Pencil className="h-4 w-4" /></button>
                <button disabled={busy} onClick={() => { if (confirm("Toplantı silinsin mi?")) start(() => void deleteMeeting(m.id)); }} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>

              {expanded === m.id && (
                <div className="border-t border-black/5 bg-gray-50/60 px-4 py-4 sm:px-5">
                  <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink/70"><MessageCircleHeart className="h-4 w-4 text-ceyhun-gold-deep" /> Kayıtlar & dua istekleri</h4>
                  {m.registrations.length === 0 ? <p className="py-3 text-center text-xs text-ink/40">Henüz kayıt yok.</p> : (
                    <div className="space-y-2">
                      {m.registrations.map((r) => (
                        <div key={r.id} className="rounded-lg bg-white p-3 text-sm shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{r.name} <a href={`mailto:${r.email}`} className="ml-1 text-xs text-ceyhun-gold-deep hover:underline">{r.email}</a></span>
                            <span className="text-xs text-ink/40">{formatDate(r.createdAt)}</span>
                          </div>
                          {r.prayerRequest && <p className="mt-1 rounded bg-ceyhun-cream-deep/40 p-2 text-ink/70">🙏 {r.prayerRequest}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {items.length === 0 && <p className="rounded-2xl border border-dashed border-black/10 px-5 py-12 text-center text-sm text-ink/40">Henüz toplantı yok.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <form action={formAction} className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-syne text-xl font-bold">{editing.id ? "Toplantıyı düzenle" : "Yeni toplantı"}</h3>
              <button type="button" onClick={() => setEditing(null)} className="text-ink/40 hover:text-ink"><X className="h-5 w-5" /></button>
            </div>
            {editing.id && <input type="hidden" name="id" value={editing.id} />}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <label className="col-span-2 block"><span className="mb-1 block text-xs font-medium text-ink/50">Tarih & saat *</span><input name="scheduledAt" type="datetime-local" defaultValue={editing.scheduledAtLocal} className={inp} /></label>
              <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">Süre (dk)</span><input name="durationMin" type="number" defaultValue={String(editing.durationMin)} className={inp} /></label>
              <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">Kapasite (0=∞)</span><input name="capacity" type="number" defaultValue={String(editing.capacity)} className={inp} /></label>
            </div>
            <label className="mt-4 block"><span className="mb-1 block text-xs font-medium text-ink/50">Yayın embed URL (YouTube Live / iframe) — CANLI'da gösterilir</span><input name="embedUrl" defaultValue={editing.embedUrl} placeholder="https://youtube.com/watch?v=…" className={inp} /></label>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">Slug (boşsa otomatik)</span><input name="slug" defaultValue={editing.slug} className={inp} /></label>
              <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">Durum</span><select name="status" defaultValue={editing.status} className={inp}><option value="SCHEDULED">SCHEDULED</option><option value="LIVE">LIVE</option><option value="ENDED">ENDED</option><option value="CANCELLED">CANCELLED</option></select></label>
            </div>
            <MultiLangField base="title" label="Başlık" value={editing.title} required />
            <MultiLangField base="description" label="Açıklama" value={editing.description} textarea rows={2} />
            <div className="mt-4"><ImageUpload name="coverUrl" defaultValue={editing.coverUrl ?? ""} label="Kapak" folder="prayer" /></div>
            <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={editing.published} className="h-4 w-4" /> Yayında</label>
            {state.message && !state.ok && <p className="mt-3 text-sm text-red-600">{state.message}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="rounded-full px-5 py-2.5 text-sm font-medium text-ink/60 hover:bg-gray-100">Vazgeç</button>
              <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-ceyhun-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ceyhun-gold-deep disabled:opacity-60"><Save className="h-4 w-4" /> {pending ? "…" : "Kaydet"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
