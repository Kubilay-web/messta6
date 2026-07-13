// app/(site)/donate/paypal/return/page.tsx
// PayPal onayından dönüş — siparişi tahsil eder (capture) ve bağışı PAID işaretler.
// Güvenlik: donationId'nin providerRef'i, PayPal'ın döndürdüğü order token'ı ile eşleşmeli;
// ayrıca capture yalnızca payer onayladıysa COMPLETED döner.

import Link from "next/link";
import { Check, Heart } from "lucide-react";
import prisma from "@/app/lib/prisma";
import { isPaypalConfigured, capturePaypalOrder } from "@/app/lib/ceyhun-paypal";
import { getCeyhunT } from "@/app/lib/ceyhunT";
import { localizedHref } from "@/app/lib/i18n-routing";
import { formatMoney } from "@/app/lib/ceyhun";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// İşlemsel dönüş sayfası — arama motorlarında indekslenmemeli.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PaypalReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; donationId?: string }>;
}) {
  const { token, donationId } = await searchParams;
  const { t, locale } = await getCeyhunT();

  let paid = false;
  let amountCents = 0;
  let currency = "EUR";

  if (token && donationId && isPaypalConfigured()) {
    try {
      const donation = await prisma.ceyhunDonation.findUnique({ where: { id: donationId } });
      // Sipariş kimliği eşleşmeli — sahte donationId ile PAID işaretlemeyi engeller.
      if (donation && donation.providerRef === token) {
        if (donation.status === "PAID") {
          paid = true; // idempotent — tekrar açılırsa yeniden capture etme
        } else {
          const { status, captureId } = await capturePaypalOrder(token);
          if (status === "COMPLETED") {
            paid = true;
            await prisma.ceyhunDonation
              .update({
                where: { id: donation.id },
                data: { status: "PAID", ...(captureId ? { providerRef: captureId } : {}) },
              })
              .catch(() => {});
          } else {
            await prisma.ceyhunDonation
              .update({ where: { id: donation.id }, data: { status: "FAILED" } })
              .catch(() => {});
          }
        }
        amountCents = donation.amountCents;
        currency = donation.currency;
      }
    } catch (e) {
      console.error("paypal return capture", e);
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
