"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

type Item = { q: string; a: string };

// KOTA SSS listesi: tek seferde bir açık, yumuşak yükseklik animasyonu.
export default function Faq({ items }: { items: Item[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="divide-y divide-ink/15 border-y border-ink/15">
      {items.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-6 py-7 text-left"
            >
              <span className="font-syne text-xl font-bold tracking-tight sm:text-2xl">
                {item.q}
              </span>
              <span className="shrink-0">
                <Plus
                  className={`h-6 w-6 transition-transform duration-300 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-8 text-lg leading-relaxed text-ink/70">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
