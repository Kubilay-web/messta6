// app/api/ceyhun/donate/route.ts
// "İstediğin miktarda bağış" — Stripe Checkout oturumu oluşturur.
// Body: { amount:number(major), currency?, campaign?, name?, email?, message?, courseId?, meetingId? }
// Dönen: { url } → istemci yönlendirir.

import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { validateRequest } from "@/app/auth";
import { getServerLocale } from "@/app/lib/locale";
import {
  stripe,
  isStripeConfigured,
  DONATION_CURRENCY,
  MIN_DONATION_MAJOR,
  MAX_DONATION_MAJOR,
} from "@/app/lib/ceyhun-stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json({ error: "Ödeme sistemi yapılandırılmamış." }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const amountMajor = Number(body.amount);
  if (!Number.isFinite(amountMajor) || amountMajor < MIN_DONATION_MAJOR || amountMajor > MAX_DONATION_MAJOR) {
    return NextResponse.json({ error: "Geçersiz tutar." }, { status: 400 });
  }
  const amountCents = Math.round(amountMajor * 100);
  const currency = (typeof body.currency === "string" ? body.currency : DONATION_CURRENCY).toLowerCase();
  const campaign = typeof body.campaign === "string" ? body.campaign : "general";
  const name = typeof body.name === "string" ? body.name.slice(0, 120) : null;
  const email = typeof body.email === "string" ? body.email.slice(0, 160) : null;
  const message = typeof body.message === "string" ? body.message.slice(0, 1000) : null;

  const { user } = await validateRequest();
  const locale = await getServerLocale();
  const origin = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;

  const labels: Record<string, string> = {
    general: "Hizmete Bağış",
    course: "Eğitime Destek Bağışı",
    prayer: "Dua Buluşması Bağışı",
  };

  try {
    // Önce PENDING bağış kaydı — providerRef sonradan doldurulur.
    const donation = await prisma.ceyhunDonation.create({
      data: {
        name, email, userId: user?.id ?? null,
        amountCents, currency: currency.toUpperCase(),
        provider: "stripe", campaign, message,
        status: "PENDING", locale,
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "donate",
      customer_email: email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amountCents,
            product_data: { name: labels[campaign] ?? "Bağış" },
          },
        },
      ],
      metadata: { donationId: donation.id, campaign },
      success_url: `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/donate?canceled=1`,
    });

    await prisma.ceyhunDonation.update({ where: { id: donation.id }, data: { providerRef: session.id } });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("donate", e);
    return NextResponse.json({ error: "Ödeme oturumu oluşturulamadı." }, { status: 502 });
  }
}
