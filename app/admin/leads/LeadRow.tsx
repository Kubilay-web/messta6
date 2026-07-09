"use client";

// app/admin/leads/LeadRow.tsx
// Tek bir "Fikrini anlat" başvurusu: açılır detay, durum değiştirme, iç not, silme.

import { useState, useTransition } from "react";
import { ChevronDown, Trash2, Save, Mail } from "lucide-react";
import { StatusBadge } from "../_ui";
import { updateLeadStatus, updateLeadNotes, deleteLead } from "../actions";

const STATUSES = ["NEW", "READ", "CONTACTED", "ARCHIVED"];

export type LeadDTO = {
  id: string;
  name: string;
  email: string;
  idea: string;
  status: string;
  locale: string;
  source: string;
  notes: string | null;
  createdAt: string;
};

export default function LeadRow({ lead, canEdit }: { lead: LeadDTO; canEdit: boolean }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [pending, start] = useTransition();

  const onStatus = (s: string) => {
    setStatus(s);
    start(() => {
      void updateLeadStatus(lead.id, s);
    });
  };

  return (
    <div className="border-b border-black/5 last:border-0">
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-ink/30 transition-transform ${open ? "rotate-180" : ""}`}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{lead.name}</p>
            <p className="truncate text-xs text-ink/40">{lead.email}</p>
          </div>
        </button>
        <span className="hidden shrink-0 text-xs text-ink/40 md:block">{lead.createdAt}</span>
        <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ink/40">
          {lead.locale}
        </span>
        <StatusBadge status={status} />
      </div>

      {open && (
        <div className="bg-gray-50/70 px-4 pb-5 pt-1 sm:px-12">
          <p className="whitespace-pre-wrap rounded-xl border border-black/5 bg-white p-4 text-sm text-ink/70">
            {lead.idea}
          </p>

          {canEdit ? (
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink/50">Durum</label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      disabled={pending}
                      onClick={() => onStatus(s)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        status === s
                          ? "bg-ink text-paper"
                          : "bg-white text-ink/60 ring-1 ring-black/10 hover:bg-gray-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink/50">İç not</label>
                <div className="flex gap-2">
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Yalnızca ekip görür…"
                    className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-kotapink"
                  />
                  <button
                    disabled={pending}
                    onClick={() => start(() => void updateLeadNotes(lead.id, notes))}
                    className="inline-flex items-center gap-1 rounded-lg bg-ink px-3 py-2 text-xs font-medium text-paper hover:bg-kotapink"
                  >
                    <Save className="h-3.5 w-3.5" /> Kaydet
                  </button>
                </div>
              </div>
            </div>
          ) : (
            lead.notes && <p className="mt-3 text-xs text-ink/50">Not: {lead.notes}</p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <a
              href={`mailto:${lead.email}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-medium hover:bg-gray-100"
            >
              <Mail className="h-3.5 w-3.5" /> Yanıtla
            </a>
            {canEdit && (
              <button
                disabled={pending}
                onClick={() => {
                  if (confirm("Bu başvuru silinsin mi?")) {
                    start(() => {
                      void deleteLead(lead.id);
                    });
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Sil
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
