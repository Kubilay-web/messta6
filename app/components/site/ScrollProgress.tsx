"use client";

import { motion, useScroll, useSpring } from "framer-motion";

// Sayfanın en üstünde kayan ilerleme çubuğu (acid renkli).
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[80] h-[3px] origin-left bg-acid"
    />
  );
}
