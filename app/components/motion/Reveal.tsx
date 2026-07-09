"use client";

import { motion, useReducedMotion } from "framer-motion";

// Scroll ile ekrana girince fade + yukarı kayma reveal'i.
// once: true → bir kez oynar. reduced-motion'da anında görünür.
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      style={style}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
