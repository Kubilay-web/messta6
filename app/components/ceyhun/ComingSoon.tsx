// app/components/ceyhun/ComingSoon.tsx
// Genel site için markalı "yakında" bölümü (Faz 2-4 devreye alınana dek).

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ComingSoon({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-ceyhun-gold-deep">{eyebrow}</span>
      <h1 className="mt-4 font-syne text-4xl font-extrabold tracking-tight text-ceyhun-ink sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-lg text-ceyhun-slate">{text}</p>
      <span className="mt-6 inline-flex items-center rounded-full bg-ceyhun-gold/15 px-4 py-1.5 text-sm font-semibold text-ceyhun-gold-deep">
        Çok yakında
      </span>
      <Link href="/" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-ceyhun-ink/60 hover:text-ceyhun-ink">
        <ArrowLeft className="h-4 w-4" /> Ana sayfa
      </Link>
    </div>
  );
}
