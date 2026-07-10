// app/(site)/asistan/page.tsx — Asistan (ElevenLabs sesli AI) tanıtım sayfası.
// Sesli widget (VoiceAssistant) global olarak sağ altta mount edilir; bu sayfa onu tanıtır.
import type { Metadata } from "next";
import { Sparkles, Mic, MessageCircleHeart, BookOpen, ArrowDownRight } from "lucide-react";
import { getCeyhunT } from "@/app/lib/ceyhunT";

export const dynamic = "force-dynamic";

const COPY = {
  tr: {
    badge: "Yapay Zekâ · Asistan",
    title: "Asistan ile konuşun",
    lead: "Avrupa Uyanış Hizmetleri'nin sesli yapay zekâ asistanı. Kutsal Kitap, dua, iman ve hizmetlerimiz hakkında merak ettiklerinizi sesli olarak sorabilirsiniz — gündüz ya da gece.",
    ctaTitle: "Nasıl başlarım?",
    ctaText: "Sağ alttaki asistan düğmesine dokunun, mikrofon izni verin ve konuşmaya başlayın.",
    cards: [
      { icon: "mic", title: "Sesli konuşma", text: "Yazmadan, doğal konuşarak sorun; asistan sesle yanıtlasın." },
      { icon: "book", title: "İman & Kutsal Kitap", text: "Ayetler, dua ve iman soruları için nazik, açıklayıcı yanıtlar." },
      { icon: "heart", title: "Her zaman burada", text: "7/24 ulaşılabilir; dua ve yönlendirme için ilk adımınız." },
    ],
    hint: "Asistan düğmesi sağ altta",
  },
  en: {
    badge: "AI · Assistant",
    title: "Talk to the Assistant",
    lead: "The voice AI assistant of Avrupa Uyanış Hizmetleri. Ask anything about the Scriptures, prayer, faith and our ministry — out loud, day or night.",
    ctaTitle: "How do I start?",
    ctaText: "Tap the assistant button at the bottom-right, allow microphone access and start speaking.",
    cards: [
      { icon: "mic", title: "Voice conversation", text: "No typing — ask naturally by speaking and hear a spoken reply." },
      { icon: "book", title: "Faith & Scripture", text: "Gentle, clear answers for verses, prayer and questions of faith." },
      { icon: "heart", title: "Always here", text: "Available 24/7 — your first step for prayer and guidance." },
    ],
    hint: "The assistant button is at the bottom-right",
  },
  de: {
    badge: "KI · Assistent",
    title: "Sprechen Sie mit dem Assistenten",
    lead: "Der KI-Sprachassistent von Avrupa Uyanış Hizmetleri. Fragen Sie alles über die Schrift, Gebet, Glauben und unseren Dienst — laut, Tag und Nacht.",
    ctaTitle: "Wie fange ich an?",
    ctaText: "Tippen Sie unten rechts auf die Assistenten-Schaltfläche, erlauben Sie den Mikrofonzugriff und sprechen Sie.",
    cards: [
      { icon: "mic", title: "Sprachgespräch", text: "Kein Tippen — fragen Sie natürlich per Sprache und hören Sie eine gesprochene Antwort." },
      { icon: "book", title: "Glaube & Schrift", text: "Sanfte, klare Antworten zu Versen, Gebet und Glaubensfragen." },
      { icon: "heart", title: "Immer da", text: "Rund um die Uhr verfügbar — Ihr erster Schritt für Gebet und Führung." },
    ],
    hint: "Die Assistenten-Schaltfläche ist unten rechts",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getCeyhunT();
  const c = COPY[locale as keyof typeof COPY] ?? COPY.tr;
  return { title: c.title, description: c.lead };
}

const ICONS = { mic: Mic, book: BookOpen, heart: MessageCircleHeart } as const;

export default async function AsistanPage() {
  const { locale } = await getCeyhunT();
  const c = COPY[locale as keyof typeof COPY] ?? COPY.tr;

  return (
    <div className="bg-ceyhun-cream">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ceyhun-ink text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-ceyhun-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-ceyhun-gold/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ceyhun-gold/40 bg-ceyhun-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ceyhun-gold">
            <Sparkles className="h-3.5 w-3.5" /> {c.badge}
          </span>
          <h1 className="mt-5 font-syne text-4xl font-extrabold tracking-tight sm:text-5xl">{c.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/70">{c.lead}</p>
          <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80">
            <ArrowDownRight className="h-4 w-4 text-ceyhun-gold" /> {c.hint}
          </p>
        </div>
      </section>

      {/* Özellik kartları */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {c.cards.map((card) => {
            const Icon = ICONS[card.icon as keyof typeof ICONS];
            return (
              <div key={card.title} className="rounded-2xl border border-ceyhun-ink/10 bg-white p-6 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ceyhun-gold/15 text-ceyhun-gold-deep">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-syne text-lg font-bold text-ceyhun-ink">{card.title}</h3>
                <p className="mt-2 text-sm text-ceyhun-slate">{card.text}</p>
              </div>
            );
          })}
        </div>

        {/* Başlangıç kutusu */}
        <div className="mt-10 rounded-2xl bg-ceyhun-ink p-8 text-center text-white sm:p-10">
          <h2 className="font-syne text-2xl font-bold">{c.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">{c.ctaText}</p>
        </div>

      </section>
    </div>
  );
}
