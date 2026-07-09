// app/admin/_components/ComingSoon.tsx
// Henüz devreye alınmamış admin bölümü için nazik yer tutucu.

import { PageHeader } from "../_ui";

export default function ComingSoon({ title, phase, note }: { title: string; phase: string; note: string }) {
  return (
    <div>
      <PageHeader title={title} subtitle={phase} />
      <div className="rounded-2xl border border-dashed border-ceyhun-gold/40 bg-ceyhun-cream/60 px-6 py-16 text-center">
        <span className="inline-flex items-center rounded-full bg-ceyhun-gold/20 px-3 py-1 text-xs font-semibold text-ceyhun-gold-deep">
          Yapım aşamasında
        </span>
        <p className="mx-auto mt-4 max-w-md text-sm text-ink/60">{note}</p>
      </div>
    </div>
  );
}
