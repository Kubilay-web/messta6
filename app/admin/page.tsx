// app/admin/page.tsx
// Ceyhun admin özeti (dashboard): içerik sayaçları + son tur başvuruları.

import Link from "next/link";
import { FileText, Images, Video, Plane, ArrowRight, GraduationCap, HandHeart } from "lucide-react";
import prisma from "@/app/lib/prisma";
import { getCeyhunViewer } from "@/app/lib/ceyhun-auth";
import { can } from "@/app/lib/ceyhun-roles";
import { Card, PageHeader, StatusBadge, formatDate, EmptyState, AdminForbidden } from "./_ui";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const gate = await getCeyhunViewer();
  if (!gate) return <AdminForbidden />;
  const { role } = gate;
  const showTours = can(role, "tours");

  const [articles, photos, videos, tourTotal, tourNew, courses, donationsPaid, recentTours] =
    await Promise.all([
      prisma.ceyhunArticle.count(),
      prisma.ceyhunPhoto.count(),
      prisma.ceyhunVideo.count(),
      prisma.ceyhunTourApplication.count(),
      prisma.ceyhunTourApplication.count({ where: { status: "NEW" } }),
      prisma.ceyhunCourse.count(),
      prisma.ceyhunDonation.aggregate({ where: { status: "PAID" }, _sum: { amountCents: true } }),
      showTours
        ? prisma.ceyhunTourApplication.findMany({ orderBy: { createdAt: "desc" }, take: 6 })
        : Promise.resolve([]),
    ]);

  const donationSum = (donationsPaid._sum.amountCents ?? 0) / 100;

  // Her kutu ilgili yeteneğe göre görünür (VIEWER buraya zaten giremez).
  const stats = [
    { label: "Yazılar", value: articles, icon: FileText, href: "/admin/articles", cap: "content" as const },
    { label: "Fotoğraflar", value: photos, icon: Images, href: "/admin/gallery", cap: "content" as const },
    { label: "Videolar", value: videos, icon: Video, href: "/admin/videos", cap: "content" as const },
    { label: "Tur başvurusu", value: tourTotal, badge: tourNew, icon: Plane, href: "/admin/tours", cap: "tours" as const },
    { label: "Eğitimler", value: courses, icon: GraduationCap, href: "/admin/courses", cap: "content" as const },
    { label: "Bağış (€, ödenen)", value: Math.round(donationSum), icon: HandHeart, href: "/admin/donations", cap: "donations" as const },
  ].filter((s) => can(role, s.cap));

  return (
    <div>
      <PageHeader title="Panel" subtitle="Avrupa Uyanış Hizmetleri platformu — yönetim özeti" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="group h-full transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ceyhun-ink text-white">
                  <s.icon className="h-5 w-5" />
                </span>
                {typeof s.badge === "number" && s.badge > 0 && (
                  <span className="rounded-full bg-ceyhun-gold px-2 py-0.5 text-xs font-bold text-ceyhun-ink">{s.badge} yeni</span>
                )}
              </div>
              <div className="mt-4 font-syne text-3xl font-extrabold tracking-tight">{s.value}</div>
              <div className="mt-1 flex items-center gap-1 text-sm text-ink/50">
                {s.label}
                <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {showTours && (
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-syne text-lg font-bold">Son tur başvuruları</h2>
          <Link href="/admin/tours" className="text-sm text-ceyhun-gold-deep hover:underline">Tümü</Link>
        </div>
        {recentTours.length === 0 ? (
          <EmptyState text="Henüz tur başvurusu yok." />
        ) : (
          <Card className="divide-y divide-black/5 !p-0">
            {recentTours.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {t.name}
                    <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ink/50">{t.tourType}</span>
                  </p>
                  <p className="truncate text-xs text-ink/40">{t.country || t.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={t.status} />
                  <span className="hidden text-xs text-ink/40 sm:block">{formatDate(t.createdAt)}</span>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
      )}
    </div>
  );
}
