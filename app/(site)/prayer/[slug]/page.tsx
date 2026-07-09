// app/(site)/prayer/[slug]/page.tsx — Online dua odası (canlı yayın + sohbet + dua + bağış).
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { getMeetingBySlug } from "@/app/lib/ceyhun-data";
import { getCeyhunT } from "@/app/lib/ceyhunT";
import { pick, safeObject } from "@/app/lib/ceyhun";
import PrayerRoom from "@/app/components/ceyhun/PrayerRoom";
import LiveRoom from "@/app/components/ceyhun/live/LiveRoom";

export const dynamic = "force-dynamic";

export default async function PrayerRoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { t, locale } = await getCeyhunT();
  const m = await getMeetingBySlug(slug);
  if (!m || !m.published) notFound();

  const joinInfo = safeObject<{ embedUrl?: string | null; mode?: string }>(m.joinInfo);
  // Varsayılan: yerleşik WebRTC canlı yayın. Yalnız mode="youtube" + embedUrl ise eski gömülü oynatıcı.
  const useYoutube = joinInfo.mode === "youtube" && Boolean(joinInfo.embedUrl);
  const fmt = new Intl.DateTimeFormat(locale === "en" ? "en-US" : locale === "de" ? "de-DE" : "tr-TR", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  }).format(m.scheduledAt);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/prayer" className="inline-flex items-center gap-1.5 text-sm font-medium text-ceyhun-ink/60 hover:text-ceyhun-gold-deep">
        <ArrowLeft className="h-4 w-4" /> {t.nav.prayer}
      </Link>
      <div className="mb-6 mt-4">
        <h1 className="font-syne text-3xl font-extrabold tracking-tight text-ceyhun-ink sm:text-4xl">{pick(m.title, locale)}</h1>
        <p className="mt-2 inline-flex items-center gap-1.5 text-ceyhun-slate"><Calendar className="h-4 w-4" /> {fmt}</p>
        {pick(m.description, locale) && <p className="mt-3 max-w-2xl text-ceyhun-slate">{pick(m.description, locale)}</p>}
      </div>

      {useYoutube ? (
        <PrayerRoom
          meetingId={m.id}
          title={pick(m.title, locale)}
          embedUrl={joinInfo.embedUrl ?? null}
          isLive={m.status === "LIVE"}
        />
      ) : (
        <LiveRoom meetingId={m.id} title={pick(m.title, locale)} />
      )}
    </div>
  );
}
