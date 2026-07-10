"use client";

// app/components/ceyhun/CoursePlayer.tsx
// Eğitim oynatıcı: seçili dersi oynatır + ders listesi + bağış widget'ı. Tüm dersler ücretsiz.

import { useState } from "react";
import { PlayCircle, CheckCircle2, Clock } from "lucide-react";
import { pick, parseMuxRef, type Locale } from "@/app/lib/ceyhun";
import { useCeyhunT } from "@/app/lib/useCeyhunT";
import DonateWidget from "./DonateWidget";
import MuxVideo from "./MuxVideo";
import { Prose } from "./ui";

export type PlayerLesson = {
  id: string;
  title: string; // JSON
  description: string; // JSON
  provider: string;
  videoRef: string;
  durationSec: number;
};

const COPY = {
  tr: { content: "Ders içeriği", about: "Bu eğitim hakkında", support: "Bu eğitime destek ol", supportText: "Eğitim ücretsiz. Beğendiyseniz istediğiniz miktarda bağış yapabilirsiniz." },
  en: { content: "Course content", about: "About this course", support: "Support this course", supportText: "This course is free. If it blessed you, donate any amount you wish." },
  de: { content: "Kursinhalt", about: "Über diesen Kurs", support: "Diesen Kurs unterstützen", supportText: "Dieser Kurs ist kostenlos. Spenden Sie gerne einen Betrag Ihrer Wahl." },
} as const;

function fmtDur(sec: number) {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function CoursePlayer({
  title,
  body,
  lessons,
  locale,
  currency,
}: {
  title: string;
  body: string;
  lessons: PlayerLesson[];
  locale: Locale;
  currency: string;
}) {
  const { t } = useCeyhunT();
  const c = COPY[locale] ?? COPY.tr;
  const [active, setActive] = useState(0);
  const current = lessons[active];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {/* Oynatıcı */}
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-lg">
          {current ? (
            <MuxVideo key={current.id} playbackId={parseMuxRef(current.videoRef).playbackId} title={pick(current.title, locale)} />
          ) : (
            <div className="flex h-full items-center justify-center text-white/40"><PlayCircle className="h-12 w-12" /></div>
          )}
        </div>

        {current && (
          <div className="mt-4">
            <h2 className="font-syne text-xl font-bold text-ceyhun-ink">{pick(current.title, locale)}</h2>
            {pick(current.description, locale) && <p className="mt-1 text-sm text-ceyhun-slate">{pick(current.description, locale)}</p>}
          </div>
        )}

        {body && (
          <div className="mt-8">
            <h3 className="font-syne text-lg font-bold text-ceyhun-ink">{c.about}</h3>
            <Prose html={body} className="mt-3" />
          </div>
        )}
      </div>

      {/* Yan panel: ders listesi + bağış */}
      <aside className="space-y-6">
        <div className="overflow-hidden rounded-2xl border border-ceyhun-ink/10 bg-white shadow-sm">
          <div className="border-b border-ceyhun-ink/10 px-4 py-3">
            <h3 className="font-syne text-sm font-bold uppercase tracking-wide text-ceyhun-ink/60">{c.content}</h3>
            <p className="text-xs text-ceyhun-ink/40">{lessons.length} {t.nav.videos.toLowerCase()}</p>
          </div>
          <ol className="max-h-[60vh] divide-y divide-ceyhun-ink/5 overflow-y-auto">
            {lessons.map((l, i) => (
              <li key={l.id}>
                <button onClick={() => setActive(i)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${i === active ? "bg-ceyhun-gold/10" : "hover:bg-ceyhun-cream-deep/40"}`}>
                  {i === active ? <PlayCircle className="h-5 w-5 shrink-0 text-ceyhun-gold-deep" /> : <CheckCircle2 className="h-5 w-5 shrink-0 text-ceyhun-ink/20" />}
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm ${i === active ? "font-semibold text-ceyhun-ink" : "text-ceyhun-ink/80"}`}>{i + 1}. {pick(l.title, locale)}</span>
                    {l.durationSec > 0 && <span className="inline-flex items-center gap-1 text-[11px] text-ceyhun-ink/40"><Clock className="h-3 w-3" /> {fmtDur(l.durationSec)}</span>}
                  </span>
                </button>
              </li>
            ))}
            {lessons.length === 0 && <li className="px-4 py-8 text-center text-sm text-ceyhun-ink/40">—</li>}
          </ol>
        </div>

        <div>
          <h3 className="mb-2 font-syne text-base font-bold text-ceyhun-ink">{c.support}</h3>
          <p className="mb-3 text-sm text-ceyhun-slate">{c.supportText}</p>
          <DonateWidget campaign="course" currency={currency} compact />
        </div>
      </aside>
    </div>
  );
}
