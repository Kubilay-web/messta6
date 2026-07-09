// app/(site)/prayer/page.tsx — Online dua toplantıları listesi.
import Link from "next/link";
import { Radio, Calendar, ArrowRight } from "lucide-react";
import { getCeyhunT } from "@/app/lib/ceyhunT";
import { getPublishedMeetings } from "@/app/lib/ceyhun-data";
import { pick } from "@/app/lib/ceyhun";

export const dynamic = "force-dynamic";

const COPY = {
  tr: { title: "Online Dua Toplantıları", subtitle: "Canlı yayına katılın, sohbette dua isteklerinizi paylaşın, birlikte dua edelim.", join: "Katıl", live: "CANLI", soon: "Yaklaşan", empty: "Şu an planlanmış toplantı yok. Yakında yeni tarihler paylaşılacak." },
  en: { title: "Online Prayer Meetings", subtitle: "Join the live stream, share your prayer requests in chat, and pray together.", join: "Join", live: "LIVE", soon: "Upcoming", empty: "No meetings scheduled right now. New dates coming soon." },
  de: { title: "Online-Gebetstreffen", subtitle: "Nehmen Sie am Livestream teil, teilen Sie Ihre Anliegen im Chat und beten Sie mit.", join: "Beitreten", live: "LIVE", soon: "Demnächst", empty: "Derzeit keine Treffen geplant. Neue Termine folgen bald." },
} as const;

export default async function PrayerListPage() {
  const { locale } = await getCeyhunT();
  const c = COPY[locale] ?? COPY.tr;
  const meetings = await getPublishedMeetings();

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-US" : locale === "de" ? "de-DE" : "tr-TR", {
      weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
    }).format(d);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="mb-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-600"><Radio className="h-3.5 w-3.5" /> {c.title}</span>
        <h1 className="mt-4 font-syne text-4xl font-extrabold tracking-tight text-ceyhun-ink sm:text-5xl">{c.title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-ceyhun-slate">{c.subtitle}</p>
      </header>

      {meetings.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ceyhun-ink/15 py-20 text-center text-ceyhun-ink/40">{c.empty}</p>
      ) : (
        <div className="space-y-4">
          {meetings.map((m) => {
            const live = m.status === "LIVE";
            return (
              <Link key={m.id} href={`/prayer/${m.slug}`}
                className={`flex items-center gap-4 rounded-2xl border-2 bg-white p-5 shadow-sm transition-all hover:shadow-md ${live ? "border-red-300" : "border-ceyhun-ink/10 hover:border-ceyhun-gold/50"}`}>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${live ? "bg-red-600 text-white" : "bg-ceyhun-ink text-ceyhun-gold"}`}>
                  <Radio className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-syne text-lg font-bold text-ceyhun-ink">{pick(m.title, locale)}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${live ? "bg-red-100 text-red-600" : "bg-ceyhun-gold/15 text-ceyhun-gold-deep"}`}>{live ? c.live : c.soon}</span>
                  </div>
                  <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-ceyhun-slate"><Calendar className="h-3.5 w-3.5" /> {fmt(m.scheduledAt)}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ceyhun-gold px-4 py-2 text-sm font-semibold text-ceyhun-ink">{c.join} <ArrowRight className="h-4 w-4" /></span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
