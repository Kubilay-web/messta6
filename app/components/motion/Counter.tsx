"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

// Sayaç: "67.6%", "83.14%", "104.9%" gibi değerleri görünür olunca 0'dan hedefe
// doğru sayar (GSAP counter davranışının karşılığı). reduced-motion'da anında gösterir.
export default function Counter({
  value,
  className,
  style,
  duration = 1600,
}: {
  value: string;
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();

  const m = value.match(/([\d.,]+)(.*)/);
  const numStr = (m?.[1] ?? "0").replace(/,/g, "");
  const suffix = m?.[2] ?? "";
  const target = parseFloat(numStr) || 0;
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;

  const [display, setDisplay] = useState(reduce ? target : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(target);
      return;
    }
    if (!inView) return;
    let raf = 0;
    let startTs = 0;
    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const p = Math.min(1, (ts - startTs) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setDisplay(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration, reduce]);

  return (
    <span ref={ref} className={className} style={style}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
