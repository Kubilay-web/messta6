// app/(site)/donate/success/page.tsx
// Bağış sonrası dönüş — Stripe oturumunu doğrular ve bağışı PAID işaretler (webhook'suz).

import Link from "next/link";
import { Check, Heart } from "lucide-react";
import prisma from "@/app/lib/prisma";
import { stripe, isStripeConfigured } from "@/app/lib/ceyhun-stripe";
import { getCeyhunT } from "@/app/lib/ceyhunT";
import { localizedHref } from "@/app/lib/i18n-routing";
import { formatMoney } from "@/app/lib/ceyhun";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// İşlemsel dönüş sayfası — arama motorlarında indekslenmemeli.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DonateSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const { t, locale } = await getCeyhunT();

  let paid = false;
  let amountCents = 0;
  let currency = "EUR";

  if (session_id && isStripeConfigured() && stripe) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const donationId = (session.metadata?.donationId as string) || null;
      if (session.payment_status === "paid") {
        paid = true;
        amountCents = session.amount_total ?? 0;
        currency = (session.currency ?? "eur").toUpperCase();
        if (donationId) {
          await prisma.ceyhunDonation
            .update({ where: { id: donationId }, data: { status: "PAID" } })
            .catch(() => {});
        }
      }
    } catch (e) {
      console.error("donate success verify", e);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <div className={`flex h-16 w-16 items-center justify-center rounded-full ${paid ? "bg-green-100 text-green-600" : "bg-ceyhun-gold/20 text-ceyhun-gold-deep"}`}>
        {paid ? <Check className="h-8 w-8" /> : <Heart className="h-8 w-8" />}
      </div>
      <h1 className="mt-6 font-syne text-3xl font-extrabold text-ceyhun-ink">
        {paid
          ? locale === "en" ? "Thank you for your gift!" : locale === "de" ? "Danke für Ihre Gabe!" : "Bağışınız için teşekkürler!"
          : locale === "en" ? "Processing…" : locale === "de" ? "Wird verarbeitet…" : "İşleniyor…"}
      </h1>
      {paid && amountCents > 0 && (
        <p className="mt-3 text-lg text-ceyhun-slate">
          <span className="font-bold text-ceyhun-ink">{formatMoney(amountCents, currency, locale)}</span>{" "}
          {locale === "en" ? "received with gratitude." : locale === "de" ? "mit Dankbarkeit erhalten." : "şükranla alındı."}
        </p>
      )}
      <Link href={localizedHref(locale, "/")} className="mt-8 inline-flex rounded-full bg-ceyhun-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ceyhun-gold-deep">
        {t.nav.home}
      </Link>
    </div>
  );
}
