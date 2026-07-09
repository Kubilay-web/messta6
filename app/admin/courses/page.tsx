// app/admin/courses/page.tsx — Eğitim yönetimi.
import prisma from "@/app/lib/prisma";
import { unpackLang } from "@/app/lib/ceyhun";
import { getCeyhunViewer } from "@/app/lib/ceyhun-auth";
import { can } from "@/app/lib/ceyhun-roles";
import { PageHeader, AdminForbidden } from "../_ui";
import CourseManager, { type CourseDTO } from "./CourseManager";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const gate = await getCeyhunViewer();
  if (!gate || !can(gate.role, "content")) return <AdminForbidden />;
  const rows = await prisma.ceyhunCourse.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { lessons: { orderBy: { order: "asc" } } },
  });

  const items: CourseDTO[] = rows.map((r) => ({
    id: r.id, slug: r.slug, title: unpackLang(r.title), description: unpackLang(r.description),
    body: unpackLang(r.body), coverUrl: r.coverUrl, priceCents: r.priceCents, currency: r.currency,
    level: r.level ?? "", featured: r.featured, published: r.published, order: r.order,
    lessons: r.lessons.map((l) => ({
      id: l.id, title: unpackLang(l.title), description: unpackLang(l.description),
      provider: l.provider, videoRef: l.videoRef, durationSec: l.durationSec, isFreePreview: l.isFreePreview, order: l.order,
    })),
  }));

  return (
    <div>
      <PageHeader title="Eğitimler" subtitle="Online eğitim paketleri ve dersler — ücretsiz + bağış." />
      <CourseManager items={items} />
    </div>
  );
}
