// app/admin/content/page.tsx
// Site içeriği (CMS): portföy / hizmet / referans / SSS — tür filtreli liste + CRUD.

import prisma from "@/app/lib/prisma";
import Link from "next/link";
import { validateRequest } from "@/app/auth";
import { hasInvenimusRole } from "@/app/lib/invenimus-auth";
import { PageHeader, unpackLang } from "../_ui";
import ContentManager, { type ContentDTO } from "./ContentManager";
import { KINDS } from "./kinds";

export const dynamic = "force-dynamic";

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const validKind = KINDS.some((k) => k.key === kind);
  const active = validKind ? (kind as string) : "ALL";

  const { user } = await validateRequest();
  const canEdit = hasInvenimusRole(user?.invenimusRole, "EDITOR");

  const items = await prisma.invenimusContentItem.findMany({
    where: active === "ALL" ? {} : { kind: active },
    orderBy: [{ kind: "asc" }, { order: "asc" }],
    take: 300,
  });

  const rows: ContentDTO[] = items.map((it) => ({
    id: it.id,
    kind: it.kind,
    title: unpackLang(it.title),
    body: unpackLang(it.body),
    meta: it.meta,
    order: it.order,
    published: it.published,
  }));

  const tabs = [{ key: "ALL", label: "Tümü" }, ...KINDS];

  return (
    <div>
      <PageHeader
        title="İçerik (CMS)"
        subtitle="Portföy, hizmetler, referanslar ve SSS içeriklerini yönet"
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key === "ALL" ? "/admin/content" : `/admin/content?kind=${t.key}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active === t.key
                ? "bg-ink text-paper"
                : "bg-white text-ink/60 ring-1 ring-black/10 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <ContentManager items={rows} canEdit={canEdit} activeKind={active} />
    </div>
  );
}
