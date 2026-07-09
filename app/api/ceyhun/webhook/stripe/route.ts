// app/api/ceyhun/webhook/stripe/route.ts
// Stripe webhook — bağışın kesin sonucu. Kullanıcı /donate/success'e dönmese bile
// ödeme tamamlanınca bağış PAID (veya iade/başarısızsa uygun durum) işaretlenir.
// Stripe Dashboard → Developers → Webhooks: bu URL'yi ekle, "checkout.session.completed"
// (+ istenirse "checkout.session.async_payment_failed") olayını dinlet, secret'ı
// STRIPE_WEBHOOK_SECRET olarak .env'e koy.

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import prisma from "@/app/lib/prisma";
import { stripe, isStripeConfigured } from "@/app/lib/ceyhun-stripe";

export const runtime = "nodejs";
// İmza doğrulaması ham gövde ister — Next'in gövdeyi işlememesi için dinamik tut.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeConfigured() || !stripe || !webhookSecret) {
    return NextResponse.json({ error: "Webhook yapılandırılmamış." }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "İmza yok." }, { status: 400 });

  let event: Stripe.Event;
  try {
    const raw = await req.text(); // HAM gövde şart
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (e) {
    console.error("stripe webhook signature", e);
    return NextResponse.json({ error: "Geçersiz imza." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const donationId = (session.metadata?.donationId as string) || null;
        // Yalnızca ödemesi tamamlanmışsa PAID.
        if (donationId && session.payment_status === "paid") {
          await markDonation(donationId, "PAID", session.payment_intent);
        }
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const donationId = (session.metadata?.donationId as string) || null;
        if (donationId) await markDonation(donationId, "PAID", session.payment_intent);
        break;
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const donationId = (session.metadata?.donationId as string) || null;
        if (donationId) await markDonation(donationId, "FAILED", null);
        break;
      }
      default:
        break; // ilgilenmediğimiz olaylar sessizce onaylanır
    }
  } catch (e) {
    // İşleme hatası → 500 döndürürsek Stripe yeniden dener (idempotent olduğumuz için güvenli).
    console.error("stripe webhook handle", e);
    return NextResponse.json({ error: "İşlenemedi." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function markDonation(
  id: string,
  status: "PAID" | "FAILED",
  paymentIntent: string | Stripe.PaymentIntent | null | undefined
) {
  const providerRef =
    typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id ?? undefined;
  await prisma.ceyhunDonation
    .update({
      where: { id },
      data: { status, ...(providerRef ? { providerRef } : {}) },
    })
    .catch((e) => console.error("markDonation", id, e));
}
