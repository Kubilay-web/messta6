"use client";

// app/components/site/ContactForm.tsx
// CTA bölümündeki "Fikrini anlat" formu. Yumuşak kapı: form herkese görünür,
// "Gönder"e basınca giriş yoksa taslak saklanıp /login'e yönlendirilir; dönüşte
// taslak geri yüklenir. Girişliyken ad/e-posta oturumdan otomatik dolar.

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CheckCircle2, Lock } from "lucide-react";
import { submitLead, type ActionResult } from "@/app/lib/invenimus-actions";
import type { InvenimusCopy } from "@/app/components/site-i18n/invenimus-content";

const initial: ActionResult = { ok: false };
const DRAFT_KEY = "invenimus:leadDraft";

export default function ContactForm({
  copy,
  isLoggedIn,
  defaultName = "",
  defaultEmail = "",
  redirectTo = "/#contact",
  gateHint,
}: {
  copy: InvenimusCopy["contact"];
  isLoggedIn: boolean;
  defaultName?: string;
  defaultEmail?: string;
  redirectTo?: string;
  gateHint: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitLead, initial);
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [idea, setIdea] = useState("");
  const restored = useRef(false);

  // Login dönüşünde taslağı geri yükle (bir kez).
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.name) setName(d.name);
        if (d.email) setEmail(d.email);
        if (d.idea) setIdea(d.idea);
      }
    } catch {}
  }, []);

  // Sonuç: giriş gerekiyorsa taslağı sakla + login'e yönlendir; başarıda taslağı temizle.
  useEffect(() => {
    if (state.requireAuth) {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ name, email, idea }));
      } catch {}
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
    }
    if (state.ok) {
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
    }
  }, [state, name, email, idea, redirectTo, router]);

  if (state.ok) {
    return (
      <div className="mx-auto mt-12 flex max-w-md items-center gap-3 rounded-2xl border border-ink/15 bg-white px-6 py-5 text-left">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-kotapink" />
        <p className="text-sm font-medium text-ink">{copy.formSuccess}</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="mx-auto mt-12 grid max-w-xl grid-cols-1 gap-4 text-left sm:grid-cols-2"
    >
      <input type="hidden" name="source" value="contact" />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-name" className="text-xs font-medium text-ink/50">
          {copy.formName}
        </label>
        <input
          id="cf-name"
          name="name"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink outline-none transition-colors focus:border-kotapink"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-email" className="text-xs font-medium text-ink/50">
          {copy.formEmail}
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink outline-none transition-colors focus:border-kotapink"
        />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label htmlFor="cf-idea" className="text-xs font-medium text-ink/50">
          {copy.formIdea}
        </label>
        <textarea
          id="cf-idea"
          name="idea"
          required
          minLength={5}
          rows={4}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder={copy.formIdeaPlaceholder}
          className="resize-none rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-kotapink"
        />
      </div>

      {state.message && !state.ok && (
        <p className="text-sm text-kotapink sm:col-span-2">{state.message}</p>
      )}

      <div className="flex flex-col items-start gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-ink px-8 py-4 text-lg font-medium text-paper transition-colors hover:bg-kotapink disabled:opacity-60 sm:w-auto"
        >
          {pending ? copy.formSubmitting : copy.formSubmit}
          <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
        </button>
        {!isLoggedIn && (
          <p className="inline-flex items-center gap-1.5 text-xs text-ink/45">
            <Lock className="h-3.5 w-3.5" />
            {gateHint}
          </p>
        )}
      </div>
    </form>
  );
}
