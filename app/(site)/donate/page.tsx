// app/(site)/donate/page.tsx — Bağış sayfası (istediğin miktarda, Stripe).
import { Heart } from "lucide-react";
import { getCeyhunT } from "@/app/lib/ceyhunT";
import DonateWidget from "@/app/components/ceyhun/DonateWidget";

export const dynamic = "force-dynamic";

const COPY = {
  tr: { title: "Bağış Yap", text: "Vaaz, öğreti ve hizmetin devam etmesine istediğiniz miktarda destek olun. Her katkı şükranla karşılanır.", points: ["Online eğitimlerin ücretsiz kalması", "Dua buluşmalarının sürmesi", "Hizmetin daha çok kişiye ulaşması"] },
  en: { title: "Make a Donation", text: "Support the ministry with any amount you choose. Every gift is received with gratitude.", points: ["Keeping online courses free", "Continuing prayer meetings", "Reaching more people"] },
  de: { title: "Spenden", text: "Unterstützen Sie den Dienst mit einem Betrag Ihrer Wahl. Jede Gabe wird mit Dankbarkeit empfangen.", points: ["Online-Kurse bleiben kostenlos", "Gebetstreffen fortführen", "Mehr Menschen erreichen"] },
} as const;

export default async function DonatePage() {
  const { locale } = await getCeyhunT();
  const c = COPY[locale] ?? COPY.tr;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ceyhun-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ceyhun-gold-deep">
            <Heart className="h-3.5 w-3.5" /> {c.title}
          </span>
          <h1 className="mt-4 font-syne text-4xl font-extrabold tracking-tight text-ceyhun-ink sm:text-5xl">{c.title}</h1>
          <p className="mt-4 text-lg text-ceyhun-slate">{c.text}</p>
          <ul className="mt-6 space-y-2">
            {c.points.map((p) => (
              <li key={p} className="flex items-start gap-2 text-ceyhun-ink/75">
                <Heart className="mt-1 h-4 w-4 shrink-0 text-ceyhun-gold" /> {p}
              </li>
            ))}
          </ul>
        </div>
        <DonateWidget campaign="general" />
      </div>
    </div>
  );
}
