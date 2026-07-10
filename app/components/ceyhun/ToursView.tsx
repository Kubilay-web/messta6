"use client";

// app/components/ceyhun/ToursView.tsx
// Tur kataloğu kartları + rezervasyon başvuru formu. Kart tıklaması formu seçili turla doldurur.

import { useActionState, useRef, useState } from "react";
import { Check, Clock, ArrowRight, Loader2, Send } from "lucide-react";
import { TOURS } from "@/app/lib/ceyhun-tours";
import { useCeyhunT } from "@/app/lib/useCeyhunT";
import { submitTourApplication, type PublicResult } from "@/app/lib/ceyhun-public-actions";

const initial: PublicResult = { ok: false };

export default function ToursView() {
  const { t, locale } = useCeyhunT();
  const [selected, setSelected] = useState<string>("istanbul");
  const [state, formAction, pending] = useActionState(submitTourApplication, initial);
  const formRef = useRef<HTMLDivElement>(null);

  const choose = (slug: string) => {
    setSelected(slug);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const inp = "w-full rounded-lg border border-ceyhun-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ceyhun-gold";

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ceyhun-ink text-white">
        <div className="pointer-events-none absolute -left-24 -top-16 h-80 w-80 rounded-full bg-ceyhun-gold/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-ceyhun-wine/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ceyhun-gold sm:text-xs">Biblical Turizm</span>
          <h1 className="mt-3 break-words font-syne text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">{t.tours.title}</h1>
          <p className="mt-4 max-w-2xl text-sm text-white/70 sm:text-base">{t.tours.subtitle}</p>
        </div>
      </section>

      {/* Tur kartları */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TOURS.map((tour) => (
            <div key={tour.slug} className={`flex flex-col rounded-2xl border-2 bg-white p-6 shadow-sm transition-all ${selected === tour.slug ? "border-ceyhun-gold shadow-lg" : "border-ceyhun-ink/10 hover:border-ceyhun-gold/50"}`}>
              <div className="text-4xl">{tour.emoji}</div>
              <h3 className="mt-3 font-syne text-xl font-bold text-ceyhun-ink">{tour.title[locale]}</h3>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-ceyhun-gold-deep">
                <Clock className="h-3.5 w-3.5" /> {tour.duration[locale]}
              </p>
              <p className="mt-3 text-sm text-ceyhun-slate">{tour.summary[locale]}</p>
              <ul className="mt-4 flex-1 space-y-2">
                {tour.highlights[locale].map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-ceyhun-ink/70">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-ceyhun-gold" /> {h}
                  </li>
                ))}
              </ul>
              <button onClick={() => choose(tour.slug)}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-ceyhun-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ceyhun-gold-deep">
                {t.common.apply} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Başvuru formu */}
      <section ref={formRef} className="scroll-mt-20 bg-ceyhun-cream-deep/60">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2 className="font-syne text-3xl font-extrabold text-ceyhun-ink">{t.tours.formTitle}</h2>
          <p className="mt-2 text-ceyhun-slate">{t.tours.formNote}</p>

          {state.ok ? (
            <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600"><Check className="h-7 w-7" /></div>
              <p className="mt-4 font-syne text-lg font-bold text-ceyhun-ink">{t.form.thanks}</p>
            </div>
          ) : (
            <form action={formAction} className="mt-8 space-y-4">
              {/* honeypot */}
              <input type="text" name="company" tabIndex={-1} autoComplete="off" className="absolute left-[-9999px]" aria-hidden />

              <div>
                <label className="mb-1 block text-xs font-medium text-ceyhun-ink/60">{t.tours.chooseTour} *</label>
                <select name="tourType" value={selected} onChange={(e) => setSelected(e.target.value)} className={inp}>
                  {TOURS.map((tour) => <option key={tour.slug} value={tour.slug}>{tour.emoji} {tour.title[locale]}</option>)}
                  <option value="custom">✨ {t.tours.customTour}</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={`${t.form.name} *`}><input name="name" required className={inp} /></Field>
                <Field label={`${t.form.email} *`}><input name="email" type="email" required className={inp} /></Field>
                <Field label={t.tours.phone}><input name="phone" className={inp} /></Field>
                <Field label={t.tours.country}><input name="country" className={inp} /></Field>
                <Field label={t.tours.groupSize}><input name="groupSize" type="number" min={1} defaultValue={1} className={inp} /></Field>
                <Field label={t.tours.budget}><input name="budget" placeholder="€" className={inp} /></Field>
                <Field label={t.tours.startDate}><input name="startDate" type="date" className={inp} /></Field>
                <Field label={t.tours.endDate}><input name="endDate" type="date" className={inp} /></Field>
              </div>

              <Field label={t.form.message}>
                <textarea name="message" rows={4} placeholder={t.tours.messagePlaceholder} className={`${inp} resize-y`} />
              </Field>

              <label className="flex items-center gap-2 text-sm text-ceyhun-ink/80">
                <input type="checkbox" name="needHotel" defaultChecked className="h-4 w-4 rounded border-ceyhun-ink/30" /> {t.tours.hotel}
              </label>

              {state.message && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}

              <button type="submit" disabled={pending}
                className="inline-flex items-center gap-2 rounded-full bg-ceyhun-gold px-6 py-3 text-sm font-semibold text-ceyhun-ink transition-colors hover:bg-ceyhun-gold-deep hover:text-white disabled:opacity-60">
                {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> {t.common.sending}</> : <><Send className="h-4 w-4" /> {t.tours.submit}</>}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ceyhun-ink/60">{label}</label>
      {children}
    </div>
  );
}
