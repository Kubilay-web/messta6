"use client";

// app/admin/tours/TourInbox.tsx
// Tur başvuruları kutusu: durum değiştir, iç not, sil. Satır tıklayınca detay açılır.

import { useState, useTransition } from "react";
import { ChevronDown, Trash2, Mail, Phone, Globe, Users, Calendar, Hotel, Wallet } from "lucide-react";
import { StatusBadge, formatDate } from "../_ui";
import { updateTourStatus, updateTourNotes, deleteTourApplication } from "../ceyhun-actions";

const STATUSES = ["NEW", "REVIEWING", "QUOTED", "CONFIRMED", "REJECTED", "ARCHIVED"];
const TOUR_LABEL: Record<string, string> = {
  istanbul: "İstanbul Turu",
  "seven-churches": "7 Kilise Turu",
  cappadocia: "Kapadokya Turu",
  custom: "Özel Tur",
};

export type TourAppDTO = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  tourType: string;
  groupSize: number;
  startDate: string | null;
  endDate: string | null;
  budget: string | null;
  needHotel: boolean;
  message: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
};

export default function TourInbox({ items }: { items: TourAppDTO[] }) {
  if (items.length === 0) {
    return <div className="rounded-2xl border border-dashed border-black/10 bg-white/50 px-6 py-16 text-center text-sm text-ink/40">Henüz tur başvurusu yok.</div>;
  }
  return (
    <div className="space-y-3">
      {items.map((it) => <Row key={it.id} it={it} />)}
    </div>
  );
}

function Row({ it }: { it: TourAppDTO }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(it.status);
  const [notes, setNotes] = useState(it.notes ?? "");
  const [savedNote, setSavedNote] = useState(false);
  const [pending, start] = useTransition();

  const changeStatus = (s: string) => { setStatus(s); start(() => void updateTourStatus(it.id, s)); };
  const saveNotes = () => start(() => updateTourNotes(it.id, notes).then(() => { setSavedNote(true); setTimeout(() => setSavedNote(false), 2000); }));

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-5">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 truncate text-sm font-medium">
            {it.name}
            <span className="rounded bg-ceyhun-gold/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ceyhun-gold-deep">{TOUR_LABEL[it.tourType] ?? it.tourType}</span>
          </p>
          <p className="truncate text-xs text-ink/40">{it.country ? `${it.country} · ` : ""}{it.email} · {it.groupSize} kişi</p>
        </div>
        <StatusBadge status={status} />
        <span className="hidden text-xs text-ink/40 sm:block">{formatDate(it.createdAt)}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-black/5 bg-gray-50/60 px-4 py-4 sm:px-5">
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <Info icon={Mail}><a href={`mailto:${it.email}`} className="text-ceyhun-gold-deep hover:underline">{it.email}</a></Info>
            {it.phone && <Info icon={Phone}><a href={`tel:${it.phone}`} className="hover:underline">{it.phone}</a></Info>}
            {it.country && <Info icon={Globe}>{it.country}</Info>}
            <Info icon={Users}>{it.groupSize} kişi</Info>
            {(it.startDate || it.endDate) && <Info icon={Calendar}>{it.startDate ? formatDate(it.startDate) : "?"}{it.endDate ? ` → ${formatDate(it.endDate)}` : ""}</Info>}
            {it.budget && <Info icon={Wallet}>{it.budget}</Info>}
            <Info icon={Hotel}>{it.needHotel ? "Konaklama isteniyor" : "Konaklama istenmiyor"}</Info>
          </div>

          {it.message && <p className="mt-3 rounded-lg bg-white p-3 text-sm text-ink/70">{it.message}</p>}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink/50">Durum</label>
              <select value={status} onChange={(e) => changeStatus(e.target.value)} disabled={pending}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceyhun-gold">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink/50">İç not {savedNote && <span className="text-green-600">· kaydedildi</span>}</label>
              <div className="flex gap-2">
                <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Sadece admin görür…"
                  className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceyhun-gold" />
                <button onClick={saveNotes} disabled={pending} className="rounded-lg bg-ceyhun-ink px-3 py-2 text-xs font-medium text-white hover:bg-ceyhun-gold-deep">Kaydet</button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button onClick={() => { if (confirm("Başvuru silinsin mi?")) start(() => void deleteTourApplication(it.id)); }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50">
              <Trash2 className="h-3.5 w-3.5" /> Sil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return <p className="flex items-center gap-2 text-ink/70"><Icon className="h-4 w-4 shrink-0 text-ink/40" /> {children}</p>;
}
