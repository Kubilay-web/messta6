// app/admin/leads/page.tsx
// "Fikrini anlat" başvuruları — durum filtreli liste. EDITOR+ düzenleyebilir.

import prisma from "@/app/lib/prisma";
import Link from "next/link";
import { validateRequest } from "@/app/auth";
import { hasInvenimusRole } from "@/app/lib/invenimus-auth";
import { PageHeader, Card, EmptyState, formatDate } from "../_ui";
import LeadRow, { type LeadDTO } from "./LeadRow";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "ALL", label: "Tümü" },
  { key: "NEW", label: "Yeni" },
  { key: "READ", label: "Okundu" },
  { key: "CONTACTED", label: "İletişime geçildi" },
  { key: "ARCHIVED", label: "Arşiv" },
];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = status && status !== "ALL" ? status : "ALL";

  const { user } = await validateRequest();
  const canEdit = hasInvenimusRole(user?.invenimusRole, "EDITOR");

  const leads = await prisma.invenimusLead.findMany({
    where: active === "ALL" ? {} : { status: active },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const rows: LeadDTO[] = leads.map((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    idea: l.idea,
    status: l.status,
    locale: l.locale,
    source: l.source,
    notes: l.notes,
    createdAt: formatDate(l.createdAt),
  }));

  return (
    <div>
      <PageHeader
        title="Başvurular"
        subtitle="Landing iletişim formundan gelen fikirler"
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "ALL" ? "/admin/leads" : `/admin/leads?status=${f.key}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active === f.key
                ? "bg-ink text-paper"
                : "bg-white text-ink/60 ring-1 ring-black/10 hover:bg-gray-100"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState text="Bu filtrede başvuru yok." />
      ) : (
        <Card className="!p-0">
          {rows.map((lead) => (
            <LeadRow key={lead.id} lead={lead} canEdit={canEdit} />
          ))}
        </Card>
      )}
    </div>
  );
}
