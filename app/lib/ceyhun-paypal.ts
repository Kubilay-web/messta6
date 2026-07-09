// app/lib/ceyhun-paypal.ts
// SUNUCU tarafı PayPal (Orders v2) yardımcısı — Stripe ile aynı "yönlendir & dön" deseni.
// Create → onay linkine yönlendir → dönüşte capture → bağış PAID.
// .env: PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_MODE=sandbox|live (varsayılan sandbox).

import "server-only";
// @ts-ignore — paket tip tanımı sağlamayabilir
import checkout from "@paypal/checkout-server-sdk";

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_SECRET;

export function isPaypalConfigured() {
  return Boolean(clientId && clientSecret);
}

function paypalClient(): any {
  const Env =
    process.env.PAYPAL_MODE === "live"
      ? (checkout as any).core.LiveEnvironment
      : (checkout as any).core.SandboxEnvironment;
  return new (checkout as any).core.PayPalHttpClient(new Env(clientId, clientSecret));
}

export type PaypalOrder = { id: string; approveUrl: string | null };

// Bağış siparişi oluşturur; kullanıcının yönlendirileceği onay (approve) linkini döner.
export async function createPaypalOrder(opts: {
  amountMajor: number;
  currency: string; // ISO, ör. "EUR"
  description: string;
  returnUrl: string;
  cancelUrl: string;
  brandName?: string;
}): Promise<PaypalOrder> {
  const req = new (checkout as any).orders.OrdersCreateRequest();
  req.prefer("return=representation");
  req.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: opts.currency.toUpperCase(),
          value: opts.amountMajor.toFixed(2),
        },
        description: opts.description.slice(0, 127),
      },
    ],
    application_context: {
      brand_name: (opts.brandName || "Sözün İzinde").slice(0, 127),
      shipping_preference: "NO_SHIPPING",
      user_action: "PAY_NOW",
      return_url: opts.returnUrl,
      cancel_url: opts.cancelUrl,
    },
  });

  const res = await paypalClient().execute(req);
  const order = res.result;
  const approve =
    (order.links || []).find((l: any) => l.rel === "approve")?.href ?? null;
  return { id: order.id, approveUrl: approve };
}

// Onaylanan siparişi tahsil eder. status "COMPLETED" ise ödeme alınmıştır.
export async function capturePaypalOrder(
  orderId: string
): Promise<{ status: string; captureId: string | null }> {
  const req = new (checkout as any).orders.OrdersCaptureRequest(orderId);
  req.requestBody({});
  const res = await paypalClient().execute(req);
  const result = res.result;
  const captureId =
    result?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
  return { status: result?.status ?? "UNKNOWN", captureId };
}
