"use client";

// app/components/ceyhun/DonateWidget.tsx
// "İstediğin miktarda bağış" — hazır tutar butonları + serbest tutar. Stripe Checkout'a yönlendirir.
// campaign: general | course | prayer. Her yerde (bağış sayfası, kurs, dua) kullanılabilir.

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useClientLocale } from "@/app/lib/useLocale";

const COPY = {
  tr: { pick: "Tutar seç", custom: "Diğer", name: "Adınız (opsiyonel)", email: "E-posta (opsiyonel)", msg: "Mesajınız (opsiyonel)", give: "Kartla bağış", paypal: "PayPal ile bağış", processing: "Yönlendiriliyor…", err: "Bir hata oluştu.", secure: "Stripe & PayPal ile güvenli ödeme", or: "veya" },
  en: { pick: "Choose amount", custom: "Other", name: "Your name (optional)", email: "Email (optional)", msg: "Your message (optional)", give: "Donate by card", paypal: "Donate with PayPal", processing: "Redirecting…", err: "Something went wrong.", secure: "Secure payment via Stripe & PayPal", or: "or" },
  de: { pick: "Betrag wählen", custom: "Andere", name: "Ihr Name (optional)", email: "E-Mail (optional)", msg: "Ihre Nachricht (optional)", give: "Mit Karte spenden", paypal: "Mit PayPal spenden", processing: "Weiterleitung…", err: "Etwas ist schiefgelaufen.", secure: "Sichere Zahlung über Stripe & PayPal", or: "oder" },
} as const;

const PRESETS = [10, 25, 50, 100, 250];
const SYMBOL: Record<string, string> = { EUR: "€", USD: "$", TRY: "₺", GBP: "£" };

export default function DonateWidget({
  campaign = "general",
  currency = "EUR",
  compact = false,
}: {
  campaign?: "general" | "course" | "prayer";
  currency?: string;
  compact?: boolean;
}) {
  const locale = useClientLocale();
  const c = COPY[locale] ?? COPY.tr;
  const sym = SYMBOL[currency] ?? "€";

  const [amount, setAmount] = useState<number>(25);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<null | "stripe" | "paypal">(null);
  const [error, setError] = useState<string | null>(null);

  const effective = custom ? Number(custom) : amount;
  const paypalOn = process.env.NEXT_PUBLIC_PAYPAL_ENABLED !== "false";

  async function donate(provider: "stripe" | "paypal") {
    setError(null);
    if (!Number.isFinite(effective) || effective < 1) { setError(c.err); return; }
    setBusy(provider);
    try {
      const endpoint = provider === "paypal" ? "/api/ceyhun/donate/paypal/create" : "/api/ceyhun/donate";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: effective, currency, campaign, name, email, message }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data?.error || c.err);
      window.location.href = data.url as string;
    } catch (e) {
      setError(e instanceof Error ? e.message : c.err);
      setBusy(null);
    }
  }

  const inp = "w-full rounded-lg border border-ceyhun-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ceyhun-gold";

  return (
    <div className={`rounded-2xl border border-ceyhun-ink/10 bg-white p-5 shadow-sm ${compact ? "" : "sm:p-6"}`}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ceyhun-gold-deep">{c.pick}</p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p} type="button"
            onClick={() => { setAmount(p); setCustom(""); }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${!custom && amount === p ? "border-ceyhun-gold bg-ceyhun-gold text-ceyhun-ink" : "border-ceyhun-ink/15 text-ceyhun-ink/70 hover:border-ceyhun-gold"}`}>
            {sym}{p}
          </button>
        ))}
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ceyhun-ink/50">{sym}</span>
          <input type="number" min={1} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder={c.custom}
            className="w-28 rounded-full border border-ceyhun-ink/15 py-2 pl-7 pr-3 text-sm outline-none focus:border-ceyhun-gold" />
        </div>
      </div>

      {!compact && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={c.name} className={inp} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={c.email} className={inp} />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={c.msg} rows={2} className={`${inp} resize-y sm:col-span-2`} />
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button onClick={() => donate("stripe")} disabled={busy !== null}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ceyhun-gold px-6 py-3 text-sm font-bold text-ceyhun-ink transition-colors hover:bg-ceyhun-gold-deep hover:text-white disabled:opacity-60">
        {busy === "stripe" ? <><Loader2 className="h-4 w-4 animate-spin" /> {c.processing}</> : <><Heart className="h-4 w-4" /> {c.give} · {sym}{effective || 0}</>}
      </button>

      {paypalOn && (
        <>
          <div className="my-3 flex items-center gap-3 text-[11px] uppercase tracking-wide text-ceyhun-ink/30">
            <span className="h-px flex-1 bg-ceyhun-ink/10" /> {c.or} <span className="h-px flex-1 bg-ceyhun-ink/10" />
          </div>
          <button onClick={() => donate("paypal")} disabled={busy !== null}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#003087] bg-[#ffc439] px-6 py-3 text-sm font-bold text-[#003087] transition-colors hover:brightness-95 disabled:opacity-60">
            {busy === "paypal" ? <><Loader2 className="h-4 w-4 animate-spin" /> {c.processing}</> : <><span className="font-extrabold italic">PayPal</span> · {sym}{effective || 0}</>}
          </button>
        </>
      )}
      <p className="mt-3 text-center text-[11px] text-ceyhun-ink/40">🔒 {c.secure}</p>
    </div>
  );
}
