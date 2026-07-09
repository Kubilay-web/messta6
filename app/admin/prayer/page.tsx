// app/admin/prayer/page.tsx — Online dua toplantıları yönetimi.
import prisma from "@/app/lib/prisma";
import { unpackLang, safeObject } from "@/app/lib/ceyhun";
import { getCeyhunViewer } from "@/app/lib/ceyhun-auth";
import { can } from "@/app/lib/ceyhun-roles";
import { PageHeader, AdminForbidden } from "../_ui";
import PrayerManager, { type MeetingDTO } from "./PrayerManager";

export const dynamic = "force-dynamic";

export default async function AdminPrayerPage() {
  const gate = await getCeyhunViewer();
  if (!gate || !can(gate.role, "prayer")) return <AdminForbidden />;
  const rows = await prisma.ceyhunPrayerMeeting.findMany({
    orderBy: { scheduledAt: "desc" },
    include: { registrations: { orderBy: { createdAt: "desc" } } },
  });

  const label = (d: Date) =>
    new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);

  const items: MeetingDTO[] = rows.map((m) => ({
    id: m.id,
    slug: m.slug,
    title: unpackLang(m.title),
    description: unpackLang(m.description),
    coverUrl: m.coverUrl,
    scheduledAtLocal: m.scheduledAt.toISOString().slice(0, 16),
    scheduledAtLabel: label(m.scheduledAt),
    durationMin: m.durationMin,
    capacity: m.capacity,
    embedUrl: safeObject<{ embedUrl?: string }>(m.joinInfo).embedUrl ?? "",
    status: m.status,
    published: m.published,
    registrations: m.registrations.map((r) => ({
      id: r.id, name: r.name, email: r.email, prayerRequest: r.prayerRequest,
      createdAt: r.createdAt.toISOString(),
    })),
  }));

  return (
    <div>
      <PageHeader title="Online Dua" subtitle="Canlı dua toplantıları, kayıtlar ve dua istekleri." />
      <PrayerManager items={items} />
    </div>
  );
}
