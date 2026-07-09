// app/admin/investors/page.tsx
// Yatırımcı eşleştirme başvuruları — durum + kitle filtreli liste.

import prisma from "@/app/lib/prisma";
import Link from "next/link";
import { validateRequest } from "@/app/auth";
import { hasInvenimusRole } from "@/app/lib/invenimus-auth";
import { PageHeader, Card, EmptyState, formatDate } from "../_ui";
import InvestorRow, { type InvestorDTO } from "./InvestorRow";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = [
  { key: "ALL", label: "Tümü" },
  { key: "NEW", label: "Yeni" },
  { key: "REVIEWING", label: "İncelemede" },
  { key: "MATCHED", label: "Eşleşti" },
  { key: "REJECTED", label: "Reddedildi" },
  { key: "ARCHIVED", label: "Arşiv" },
];

export default async function InvestorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; audience?: string }>;
}) {
  const { status, audience } = await searchParams;
  const activeStatus = status && status !== "ALL" ? status : "ALL";
  const activeAudience = audience === "founder" || audience === "investor" ? audience : "ALL";

  const { user } = await validateRequest();
  const canEdit = hasInvenimusRole(user?.invenimusRole, "EDITOR");

  const where: Record<string, string> = {};
  if (activeStatus !== "ALL") where.status = activeStatus;
  if (activeAudience !== "ALL") where.audience = activeAudience;

  const apps = await prisma.invenimusInvestorApplication.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const rows: InvestorDTO[] = apps.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    company: a.company,
    audience: a.audience,
    stage: a.stage,
    ticket: a.ticket,
    message: a.message,
    status: a.status,
    locale: a.locale,
    notes: a.notes,
    createdAt: formatDate(a.createdAt),
  }));

  const audienceHref = (aud: string) => {
    const p = new URLSearchParams();
    if (activeStatus !== "ALL") p.set("status", activeStatus);
    if (aud !== "ALL") p.set("audience", aud);
    const qs = p.toString();
    return qs ? `/admin/investors?${qs}` : "/admin/investors";
  };

  return (
    <div>
      <PageHeader
        title="Yatırımcı başvuruları"
        subtitle="Kurucu ve yatırımcı eşleştirme talepleri"
      />

      <div className="mb-3 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const p = new URLSearchParams();
          if (f.key !== "ALL") p.set("status", f.key);
          if (activeAudience !== "ALL") p.set("audience", activeAudience);
          const qs = p.toString();
          return (
            <Link
              key={f.key}
              href={qs ? `/admin/investors?${qs}` : "/admin/investors"}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                activeStatus === f.key
                  ? "bg-ink text-paper"
                  : "bg-white text-ink/60 ring-1 ring-black/10 hover:bg-gray-100"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          { key: "ALL", label: "Herkes" },
          { key: "founder", label: "Kurucular" },
          { key: "investor", label: "Yatırımcılar" },
        ].map((a) => (
          <Link
            key={a.key}
            href={audienceHref(a.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeAudience === a.key
                ? "bg-kotapink text-paper"
                : "bg-white text-ink/50 ring-1 ring-black/10 hover:bg-gray-100"
            }`}
          >
            {a.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState text="Bu filtrede başvuru yok." />
      ) : (
        <Card className="!p-0">
          {rows.map((app) => (
            <InvestorRow key={app.id} app={app} canEdit={canEdit} />
          ))}
        </Card>
      )}
    </div>
  );
}
