"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

// Hero başlığı: her kelime bir mask'ın altından yukarı doğru sırayla yükselir.
// accent kelimeleri vurgu rengiyle gelir. reduced-motion'da düz görünür.
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
};

const word: Variants = {
  hidden: { y: "110%" },
  show: {
    y: "0%",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

function Words({
  text,
  color,
}: {
  text: string;
  color?: string;
}) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="inline-block overflow-hidden pb-[0.06em] align-bottom"
        >
          <motion.span
            variants={word}
            className="inline-block"
            style={color ? { color } : undefined}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </>
  );
}

export default function HeroTitle({
  text,
  accent,
  accentColor,
  className,
}: {
  text: string;
  accent: string;
  accentColor: string;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.h1
      className={className}
      variants={container}
      initial={reduce ? false : "hidden"}
      animate="show"
    >
      <Words text={text} />
      <Words text={accent} color={accentColor} />
    </motion.h1>
  );
}
