// app/(site)/prayer/page.tsx — Online dua toplantıları listesi.
import Link from "next/link";
import { Radio, Calendar, ArrowRight } from "lucide-react";
import { getCeyhunT } from "@/app/lib/ceyhunT";
import { localizedHref } from "@/app/lib/i18n-routing";
import { getPublishedMeetings } from "@/app/lib/ceyhun-cache";
import { pick } from "@/app/lib/ceyhun";
import { PageHero } from "@/app/components/ceyhun/ui";

export const dynamic = "force-dynamic";

const COPY = {
  tr: { eyebrow: "Birlikte Dua", title: "Online Dua Toplantıları", subtitle: "Canlı yayına katılın, sohbette dua isteklerinizi paylaşın, birlikte dua edelim.", join: "Katıl", live: "CANLI", soon: "Yaklaşan", empty: "Şu an planlanmış toplantı yok. Yakında yeni tarihler paylaşılacak." },
  en: { eyebrow: "Pray Together", title: "Online Prayer Meetings", subtitle: "Join the live stream, share your prayer requests in chat, and pray together.", join: "Join", live: "LIVE", soon: "Upcoming", empty: "No meetings scheduled right now. New dates coming soon." },
  de: { eyebrow: "Gemeinsam beten", title: "Online-Gebetstreffen", subtitle: "Nehmen Sie am Livestream teil, teilen Sie Ihre Anliegen im Chat und beten Sie mit.", join: "Beitreten", live: "LIVE", soon: "Demnächst", empty: "Derzeit keine Treffen geplant. Neue Termine folgen bald." },
} as const;

export async function generateMetadata(): Promise<import("next").Metadata> {
  const { locale } = await getCeyhunT();
  const c = COPY[locale] ?? COPY.tr;
  return { title: c.title, description: c.subtitle };
}

export default async function PrayerListPage() {
  const { locale } = await getCeyhunT();
  const c = COPY[locale] ?? COPY.tr;
  const meetings = await getPublishedMeetings();

  // NOT: getPublishedMeetings unstable_cache ile sarılı → Date alanları cache'ten string döner.
  // new Date(...) hem Date hem ISO string'i güvenle kabul eder (aksi halde Intl format NaN→RangeError).
  const fmt = (d: Date | string) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-US" : locale === "de" ? "de-DE" : "tr-TR", {
      weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
    }).format(new Date(d));

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} />
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
      {meetings.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ceyhun-ink/15 py-20 text-center text-ceyhun-ink/40">{c.empty}</p>
      ) : (
        <div className="space-y-4">
          {meetings.map((m) => {
            const live = m.status === "LIVE";
            return (
              <Link key={m.id} href={localizedHref(locale, `/prayer/${m.slug}`)}
                className={`group flex items-center gap-4 rounded-2xl border-2 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${live ? "border-red-300" : "border-ceyhun-ink/10 hover:border-ceyhun-gold/50"}`}>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${live ? "bg-red-600 text-white" : "bg-ceyhun-ink text-ceyhun-gold"}`}>
                  <Radio className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-syne text-lg font-bold text-ceyhun-ink">{pick(m.title, locale)}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${live ? "bg-red-100 text-red-600" : "bg-ceyhun-gold/15 text-ceyhun-gold-deep"}`}>{live ? c.live : c.soon}</span>
                  </div>
                  <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-ceyhun-slate"><Calendar className="h-3.5 w-3.5" /> {fmt(m.scheduledAt)}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ceyhun-gold px-4 py-2 text-sm font-semibold text-ceyhun-ink transition-colors group-hover:bg-ceyhun-gold-deep group-hover:text-white">{c.join} <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" /></span>
              </Link>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
}
