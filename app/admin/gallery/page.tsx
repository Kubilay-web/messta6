// app/admin/gallery/page.tsx
import prisma from "@/app/lib/prisma";
import { unpackLang } from "@/app/lib/ceyhun";
import { getCeyhunViewer } from "@/app/lib/ceyhun-auth";
import { can } from "@/app/lib/ceyhun-roles";
import { PageHeader, AdminForbidden } from "../_ui";
import GalleryManager, { type AlbumDTO, type PhotoDTO } from "./GalleryManager";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const gate = await getCeyhunViewer();
  if (!gate || !can(gate.role, "content")) return <AdminForbidden />;
  const [albums, photos] = await Promise.all([
    prisma.ceyhunAlbum.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { photos: true } } },
    }),
    prisma.ceyhunPhoto.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
  ]);

  const albumDTO: AlbumDTO[] = albums.map((a) => ({
    id: a.id, slug: a.slug, title: unpackLang(a.title), note: unpackLang(a.note),
    coverUrl: a.coverUrl, order: a.order, published: a.published, count: a._count.photos,
  }));
  const photoDTO: PhotoDTO[] = photos.map((p) => ({
    id: p.id, url: p.url, albumId: p.albumId, caption: unpackLang(p.caption),
  }));

  return (
    <div>
      <PageHeader title="Galeri" subtitle="Albümler ve fotoğraflar." />
      <GalleryManager albums={albumDTO} photos={photoDTO} />
    </div>
  );
}
