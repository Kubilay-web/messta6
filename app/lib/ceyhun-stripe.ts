// app/lib/ceyhun-stripe.ts
// SUNUCU tarafı Stripe yardımcısı — "istediğin miktarda bağış" için Checkout oturumu.
// Webhook gerektirmez: başarı sayfası oturumu Stripe'tan çekip PAID işaretler.

import "server-only";
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key ? new Stripe(key) : null;

export function isStripeConfigured() {
  return Boolean(key);
}

export const DONATION_CURRENCY = (process.env.CEYHUN_CURRENCY || "eur").toLowerCase();

// Desteklenen para birimleri için minimum tutar (Stripe alt sınırı, ~0.50).
export const MIN_DONATION_MAJOR = 1; // 1 birim (₺/€/$)
export const MAX_DONATION_MAJOR = 100000;
