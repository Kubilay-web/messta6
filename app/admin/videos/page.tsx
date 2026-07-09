// app/admin/videos/page.tsx
import prisma from "@/app/lib/prisma";
import { unpackLang } from "@/app/lib/ceyhun";
import { getCeyhunViewer } from "@/app/lib/ceyhun-auth";
import { can } from "@/app/lib/ceyhun-roles";
import { PageHeader, AdminForbidden } from "../_ui";
import VideoManager, { type VideoDTO } from "./VideoManager";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const gate = await getCeyhunViewer();
  if (!gate || !can(gate.role, "content")) return <AdminForbidden />;
  const rows = await prisma.ceyhunVideo.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  const items: VideoDTO[] = rows.map((r) => ({
    id: r.id,
    title: unpackLang(r.title),
    description: unpackLang(r.description),
    provider: r.provider,
    videoRef: r.videoRef,
    thumbUrl: r.thumbUrl,
    category: r.category ?? "",
    featured: r.featured,
    published: r.published,
    order: r.order,
    views: r.views,
  }));

  return (
    <div>
      <PageHeader title="Videolar" subtitle="Vaaz kayıtları ve öğretiler." />
      <VideoManager items={items} />
    </div>
  );
}
