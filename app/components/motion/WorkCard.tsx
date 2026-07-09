"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// Proje kartı (KOTA tarzı düz renk bloğu): hover'da imlece göre hafif 3D tilt
// + iç etiket parallax'ı. reduced-motion / dokunmatikte statik kalır.
export default function WorkCard({
  name,
  tag,
  year,
  color,
  ink = "#0a0a0a",
  image,
}: {
  name: string;
  tag: string;
  year: string;
  color: string;
  ink?: string;
  image?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), {
    stiffness: 150,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), {
    stiffness: 150,
    damping: 18,
  });
  const labelX = useSpring(useTransform(mx, [-0.5, 0.5], [-16, 16]), {
    stiffness: 150,
    damping: 18,
  });
  const labelY = useSpring(useTransform(my, [-0.5, 0.5], [-12, 12]), {
    stiffness: 150,
    damping: 18,
  });

  function handleMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function handleLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href="#contact"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className="group block [transform-style:preserve-3d]"
    >
      <div
        className="relative flex aspect-[4/3] items-end overflow-hidden rounded-[1.25rem] p-7"
        style={{ backgroundColor: color }}
      >
        {image && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </>
        )}
        <motion.span
          style={{ x: labelX, y: labelY, color: image ? "#ffffff" : ink }}
          className="relative font-syne text-3xl font-extrabold lowercase tracking-tight"
        >
          {name}
        </motion.span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-neutral-600">{tag}</span>
        <span className="flex items-center gap-2 text-xs text-neutral-500">
          {year}
          <ArrowUpRight className="h-4 w-4 text-neutral-900 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </motion.a>
  );
}
