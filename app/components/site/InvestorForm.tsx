"use client";

// app/components/site/InvestorForm.tsx
// Yatırımcı eşleştirme başvuru formu. Yumuşak kapı: giriş yoksa "Gönder"de taslak
// saklanıp /login'e yönlendirir; dönüşte taslak geri gelir. Girişlide ad/e-posta dolu.

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CheckCircle2, Lock } from "lucide-react";
import {
  submitInvestorApplication,
  type ActionResult,
} from "@/app/lib/invenimus-actions";
import type { InvenimusCopy } from "@/app/components/site-i18n/invenimus-content";

const initial: ActionResult = { ok: false };
const DRAFT_KEY = "invenimus:investorDraft";

export default function InvestorForm({
  copy,
  isLoggedIn,
  defaultName = "",
  defaultEmail = "",
  redirectTo = "/#investors",
  gateHint,
}: {
  copy: InvenimusCopy["investors"];
  isLoggedIn: boolean;
  defaultName?: string;
  defaultEmail?: string;
  redirectTo?: string;
  gateHint: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitInvestorApplication, initial);
  const [audience, setAudience] = useState<"founder" | "investor">("founder");
  const [f, setF] = useState({
    name: defaultName,
    email: defaultEmail,
    company: "",
    stage: "",
    ticket: "",
    message: "",
  });
  const restored = useRef(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.audience === "founder" || d.audience === "investor") setAudience(d.audience);
        setF((p) => ({ ...p, ...d.fields }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (state.requireAuth) {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ audience, fields: f }));
      } catch {}
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
    }
    if (state.ok) {
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
    }
  }, [state, audience, f, redirectTo, router]);

  if (state.ok) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-6 py-5 backdrop-blur">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-acid" />
        <p className="text-sm font-medium text-paper">{copy.success}</p>
      </div>
    );
  }

  const fieldClass =
    "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-paper outline-none transition-colors placeholder:text-paper/30 focus:border-acid";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="audience" value={audience} />

      {/* Kitle seçimi: kurucu / yatırımcı — radio göstergeli, net seçili durumu */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {(["founder", "investor"] as const).map((a) => {
          const selected = audience === a;
          return (
            <button
              key={a}
              type="button"
              onClick={() => setAudience(a)}
              aria-pressed={selected}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                selected
                  ? "border-acid bg-acid text-ink"
                  : "border-white/15 bg-white/5 text-paper/70 hover:border-white/40"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  selected ? "border-ink" : "border-paper/40"
                }`}
              >
                {selected && <span className="h-2.5 w-2.5 rounded-full bg-ink" />}
              </span>
              {copy.audience[a]}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input name="name" required minLength={2} value={f.name} onChange={set("name")} placeholder={copy.fields.name} className={fieldClass} />
        <input name="email" type="email" required value={f.email} onChange={set("email")} placeholder={copy.fields.email} className={fieldClass} />
      </div>

      <input name="company" value={f.company} onChange={set("company")} placeholder={copy.fields.company} className={fieldClass} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input name="stage" value={f.stage} onChange={set("stage")} placeholder={copy.fields.stage} className={fieldClass} />
        <input name="ticket" value={f.ticket} onChange={set("ticket")} placeholder={copy.fields.ticket} className={fieldClass} />
      </div>

      <textarea
        name="message"
        rows={3}
        value={f.message}
        onChange={set("message")}
        placeholder={copy.fields.messagePlaceholder}
        className={`${fieldClass} resize-none`}
      />

      {state.message && !state.ok && <p className="text-sm text-acid">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="group mt-1 inline-flex items-center justify-center gap-3 rounded-full bg-acid px-7 py-4 font-medium text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? copy.submitting : copy.submit}
        <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
      </button>

      {!isLoggedIn && (
        <p className="inline-flex items-center gap-1.5 text-xs text-paper/50">
          <Lock className="h-3.5 w-3.5" />
          {gateHint}
        </p>
      )}
    </form>
  );
}
