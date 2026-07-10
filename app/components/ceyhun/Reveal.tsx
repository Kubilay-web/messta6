"use client";

// app/components/ceyhun/Reveal.tsx
// Görünüme girince içeriği yumuşakça yukarı kaydırıp belirginleştirir (IntersectionObserver).
// prefers-reduced-motion açıksa animasyon yapmadan hemen gösterir. Sunucu sayfalarında da
// çocuk (children) sarmalayıcısı olarak güvenle kullanılır.

import { useEffect, useRef, useState } from "react";

export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"} ${className}`}
      style={{ transitionDelay: shown ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
