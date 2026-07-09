"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

// KOTA "Ethos" bölümü: numaralı başlık solda sabit dururken, sağdaki görsel
// scroll ile mask'ın altından açılır (image reveal). Alt çizgi sağa doğru dolar.
export default function EthosSection({
  index,
  title,
  body,
  image,
  tint,
}: {
  index: string;
  title: string;
  body: string;
  image: string;
  tint: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const clip = useTransform(
    scrollYProgress,
    [0, 0.4],
    ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
  );
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.25, 1]);
  const lineW = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"]);

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 items-center gap-8 border-t border-ink/15 py-14 md:grid-cols-2 md:gap-16 md:py-24"
    >
      <div>
        <span className="font-syne text-sm font-bold tracking-widest text-ink/40">
          {index} /
        </span>
        <h3 className="mt-4 font-syne text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
          {title}
        </h3>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/70">
          {body}
        </p>
        <div className="mt-8 h-px w-full bg-ink/15">
          <motion.div
            className="h-px bg-acid"
            style={{ width: reduce ? "100%" : lineW }}
          />
        </div>
      </div>

      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
        <motion.div
          className="absolute inset-0"
          style={{
            clipPath: reduce ? undefined : clip,
            backgroundColor: tint,
          }}
        >
          <motion.img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover"
            style={{ scale: reduce ? 1 : scale }}
          />
        </motion.div>
      </div>
    </div>
  );
}
