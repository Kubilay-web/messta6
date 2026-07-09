// app/admin/tours/page.tsx — Tur başvuruları yönetimi.
import prisma from "@/app/lib/prisma";
import { getCeyhunViewer } from "@/app/lib/ceyhun-auth";
import { can } from "@/app/lib/ceyhun-roles";
import { PageHeader, AdminForbidden } from "../_ui";
import TourInbox, { type TourAppDTO } from "./TourInbox";

export const dynamic = "force-dynamic";

export default async function AdminToursPage() {
  const gate = await getCeyhunViewer();
  if (!gate || !can(gate.role, "tours")) return <AdminForbidden />;
  const [rows, newCount] = await Promise.all([
    prisma.ceyhunTourApplication.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.ceyhunTourApplication.count({ where: { status: "NEW" } }),
  ]);

  const items: TourAppDTO[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    country: r.country,
    tourType: r.tourType,
    groupSize: r.groupSize,
    startDate: r.startDate ? r.startDate.toISOString() : null,
    endDate: r.endDate ? r.endDate.toISOString() : null,
    budget: r.budget,
    needHotel: r.needHotel,
    message: r.message,
    status: r.status,
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div>
      <PageHeader title="Tur Başvuruları" subtitle={`${rows.length} başvuru · ${newCount} yeni`} />
      <TourInbox items={items} />
    </div>
  );
}
