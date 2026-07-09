// app/admin/donations/page.tsx — Bağış listesi + özet.
import prisma from "@/app/lib/prisma";
import { getCeyhunViewer } from "@/app/lib/ceyhun-auth";
import { can } from "@/app/lib/ceyhun-roles";
import { PageHeader, Card, StatusBadge, formatDate, EmptyState, AdminForbidden } from "../_ui";

export const dynamic = "force-dynamic";

const CAMPAIGN_LABEL: Record<string, string> = { general: "Genel", course: "Eğitim", prayer: "Dua" };

export default async function AdminDonationsPage() {
  const gate = await getCeyhunViewer();
  if (!gate || !can(gate.role, "donations")) return <AdminForbidden />;
  const [rows, paidAgg, paidCount] = await Promise.all([
    prisma.ceyhunDonation.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.ceyhunDonation.aggregate({ where: { status: "PAID" }, _sum: { amountCents: true } }),
    prisma.ceyhunDonation.count({ where: { status: "PAID" } }),
  ]);
  const total = (paidAgg._sum.amountCents ?? 0) / 100;

  return (
    <div>
      <PageHeader title="Bağışlar" subtitle={`${paidCount} ödenen bağış · toplam ≈ €${total.toFixed(0)}`} />

      {rows.length === 0 ? (
        <EmptyState text="Henüz bağış yok." />
      ) : (
        <Card className="!p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 text-left text-xs uppercase text-ink/40">
                  <th className="px-4 py-3 font-semibold">Bağışçı</th>
                  <th className="px-4 py-3 font-semibold">Tutar</th>
                  <th className="px-4 py-3 font-semibold">Kampanya</th>
                  <th className="px-4 py-3 font-semibold">Durum</th>
                  <th className="px-4 py-3 font-semibold">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {rows.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{d.name || "Anonim"}</p>
                      {d.email && <p className="text-xs text-ink/40">{d.email}</p>}
                    </td>
                    <td className="px-4 py-3 font-semibold">{(d.amountCents / 100).toFixed(0)} {d.currency}</td>
                    <td className="px-4 py-3 text-ink/60">{CAMPAIGN_LABEL[d.campaign] ?? d.campaign}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-3 text-xs text-ink/40">{formatDate(d.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
