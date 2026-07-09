"use client";

// app/admin/investors/InvestorRow.tsx
// Tek bir yatırımcı eşleştirme başvurusu: detay + durum + iç not + silme.

import { useState, useTransition } from "react";
import { ChevronDown, Trash2, Save, Mail } from "lucide-react";
import { StatusBadge } from "../_ui";
import { updateInvestorStatus, updateInvestorNotes, deleteInvestor } from "../actions";

const STATUSES = ["NEW", "REVIEWING", "MATCHED", "REJECTED", "ARCHIVED"];

export type InvestorDTO = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  audience: string;
  stage: string | null;
  ticket: string | null;
  message: string | null;
  status: string;
  locale: string;
  notes: string | null;
  createdAt: string;
};

export default function InvestorRow({
  app,
  canEdit,
}: {
  app: InvestorDTO;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(app.status);
  const [notes, setNotes] = useState(app.notes ?? "");
  const [pending, start] = useTransition();

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
            <p className="truncate text-sm font-medium">
              {app.name}
              <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ink/50">
                {app.audience === "investor" ? "Yatırımcı" : "Kurucu"}
              </span>
            </p>
            <p className="truncate text-xs text-ink/40">{app.company || app.email}</p>
          </div>
        </button>
        <span className="hidden shrink-0 text-xs text-ink/40 md:block">{app.createdAt}</span>
        <StatusBadge status={status} />
      </div>

      {open && (
        <div className="bg-gray-50/70 px-4 pb-5 pt-2 sm:px-12">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            <Field label="E-posta" value={app.email} />
            <Field label="Şirket / Fon" value={app.company} />
            <Field label="Evre" value={app.stage} />
            <Field label="Bilet" value={app.ticket} />
          </dl>
          {app.message && (
            <p className="mt-3 whitespace-pre-wrap rounded-xl border border-black/5 bg-white p-4 text-sm text-ink/70">
              {app.message}
            </p>
          )}

          {canEdit ? (
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink/50">Durum</label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      disabled={pending}
                      onClick={() => {
                        setStatus(s);
                        start(() => {
                          void updateInvestorStatus(app.id, s);
                        });
                      }}
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
                    className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-kotapink"
                  />
                  <button
                    disabled={pending}
                    onClick={() => start(() => void updateInvestorNotes(app.id, notes))}
                    className="inline-flex items-center gap-1 rounded-lg bg-ink px-3 py-2 text-xs font-medium text-paper hover:bg-kotapink"
                  >
                    <Save className="h-3.5 w-3.5" /> Kaydet
                  </button>
                </div>
              </div>
            </div>
          ) : (
            app.notes && <p className="mt-3 text-xs text-ink/50">Not: {app.notes}</p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <a
              href={`mailto:${app.email}`}
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
                      void deleteInvestor(app.id);
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

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-ink/40">{label}</dt>
      <dd className="truncate text-ink/80">{value || "—"}</dd>
    </div>
  );
}
