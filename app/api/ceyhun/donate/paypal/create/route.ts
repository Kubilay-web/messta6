// app/api/ceyhun/donate/paypal/create/route.ts
// PayPal ile "istediğin miktarda bağış" — sipariş oluşturur, PENDING bağış kaydeder,
// istemciye onay (approve) URL'sini döner. İstemci oraya yönlenir; dönüşte capture edilir.

import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { validateRequest } from "@/app/auth";
import { getServerLocale } from "@/app/lib/locale";
import { DONATION_CURRENCY, MIN_DONATION_MAJOR, MAX_DONATION_MAJOR } from "@/app/lib/ceyhun-stripe";
import { isPaypalConfigured, createPaypalOrder } from "@/app/lib/ceyhun-paypal";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isPaypalConfigured()) {
    return NextResponse.json({ error: "PayPal yapılandırılmamış." }, { status: 500 });
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
  const currency = (typeof body.currency === "string" ? body.currency : DONATION_CURRENCY).toUpperCase();
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
    const donation = await prisma.ceyhunDonation.create({
      data: {
        name, email, userId: user?.id ?? null,
        amountCents: Math.round(amountMajor * 100),
        currency, provider: "paypal", campaign, message,
        status: "PENDING", locale,
      },
    });

    const order = await createPaypalOrder({
      amountMajor,
      currency,
      description: labels[campaign] ?? "Bağış",
      returnUrl: `${origin}/donate/paypal/return?donationId=${donation.id}`,
      cancelUrl: `${origin}/donate?canceled=1`,
    });

    // Sipariş kimliğini kaydet (dönüşte doğrulama için).
    await prisma.ceyhunDonation.update({
      where: { id: donation.id },
      data: { providerRef: order.id },
    });

    if (!order.approveUrl) {
      return NextResponse.json({ error: "Onay bağlantısı alınamadı." }, { status: 502 });
    }
    return NextResponse.json({ url: order.approveUrl });
  } catch (e) {
    console.error("paypal create", e);
    return NextResponse.json({ error: "PayPal oturumu oluşturulamadı." }, { status: 502 });
  }
}
