"use client";

// app/components/ceyhun/Defer.tsx
// ────────────────────────────────────────────────────────────────────────────
// GELİŞMİŞ ERTELEME (Deferred hydration / lazy mount)
//
// Children'ı hemen render etmez; şu tetikleyicilerden biriyle mount eder:
//   • strategy="idle"    → requestIdleCallback (tarayıcı boşa çıkınca)
//   • strategy="visible" → IntersectionObserver (kaydırıp görünür olunca)
//   • strategy="interaction" → ilk kullanıcı etkileşiminde (scroll/tap/mouse/key)
//
// Amaç: ana içerik ve LCP boyanana kadar ağır/3. taraf bileşenleri (sesli asistan,
// analitik, alt-katlanma widget'ları) YÜK dışında tutmak → daha hızlı TTI/INP.
//
// SSR-güvenli: sunucuda hiçbir şey render etmez (placeholder opsiyonel).
// ────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, type ReactNode } from "react";

type Strategy = "idle" | "visible" | "interaction";

export default function Defer({
  children,
  strategy = "idle",
  rootMargin = "200px",
  timeout = 2500,
  placeholder = null,
}: {
  children: ReactNode;
  strategy?: Strategy;
  /** visible stratejisi için önden yükleme payı. */
  rootMargin?: string;
  /** idle stratejisi için üst sınır (ms). */
  timeout?: number;
  placeholder?: ReactNode;
}) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (show) return;

    // ── idle ──
    if (strategy === "idle") {
      const w = window as typeof window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };
      if (typeof w.requestIdleCallback === "function") {
        const id = w.requestIdleCallback(() => setShow(true), { timeout });
        return () => w.cancelIdleCallback?.(id);
      }
      const t = window.setTimeout(() => setShow(true), 200);
      return () => window.clearTimeout(t);
    }

    // ── visible ──
    if (strategy === "visible") {
      const el = ref.current;
      if (!el || typeof IntersectionObserver === "undefined") {
        setShow(true);
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setShow(true);
            io.disconnect();
          }
        },
        { rootMargin }
      );
      io.observe(el);
      return () => io.disconnect();
    }

    // ── interaction ──
    const events: (keyof WindowEventMap)[] = [
      "scroll",
      "pointerdown",
      "keydown",
      "touchstart",
      "mousemove",
    ];
    const onFirst = () => setShow(true);
    events.forEach((ev) =>
      window.addEventListener(ev, onFirst, { once: true, passive: true })
    );
    return () =>
      events.forEach((ev) => window.removeEventListener(ev, onFirst));
  }, [show, strategy, rootMargin, timeout]);

  if (show) return <>{children}</>;
  // visible stratejisinde gözlemlenecek bir çapa gerekir.
  if (strategy === "visible") return <span ref={ref}>{placeholder}</span>;
  return <>{placeholder}</>;
}
