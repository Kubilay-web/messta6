// app/admin/prayer/live/[id]/page.tsx — Host (Ceyhun) yayın konsolu.
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import prisma from "@/app/lib/prisma";
import { pick } from "@/app/lib/ceyhun";
import { getCeyhunT } from "@/app/lib/ceyhunT";
import { getCeyhunViewer } from "@/app/lib/ceyhun-auth";
import { can } from "@/app/lib/ceyhun-roles";
import { AdminForbidden } from "../../../_ui";
import LiveRoom from "@/app/components/ceyhun/live/LiveRoom";

export const dynamic = "force-dynamic";

export default async function AdminPrayerLivePage({ params }: { params: Promise<{ id: string }> }) {
  const gate = await getCeyhunViewer();
  if (!gate || !can(gate.role, "prayer")) return <AdminForbidden />;

  const { id } = await params;
  const m = await prisma.ceyhunPrayerMeeting.findUnique({ where: { id } });
  if (!m) notFound();

  const { locale } = await getCeyhunT();
  const title = pick(m.title, locale);

  return (
    <div>
      <Link href="/admin/prayer" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ceyhun-gold-deep">
        <ArrowLeft className="h-4 w-4" /> Online Dua
      </Link>
      <h1 className="mb-1 font-syne text-2xl font-bold">{title || "Dua yayını"}</h1>
      <p className="mb-6 text-sm text-ink/50">
        Kameranı aç, <b>CANLI Yayına Geç</b>'e bas. İzleyiciler el kaldırınca onaylayıp canlı bağlayabilirsin.
      </p>
      <LiveRoom meetingId={m.id} title={title} asHost />
    </div>
  );
}
