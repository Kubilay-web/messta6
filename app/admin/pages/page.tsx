// app/admin/pages/page.tsx
// Landing bölüm CMS'i. Tüm bölümleri (şema) + saklı verilerini yükler, SectionEditor'a verir.
// VIEWER görüntüler, EDITOR+ düzenler.

import prisma from "@/app/lib/prisma";
import { validateRequest } from "@/app/auth";
import { hasInvenimusRole } from "@/app/lib/invenimus-auth";
import { getAllSectionData } from "@/app/lib/invenimus-page-content";
import { SECTION_SCHEMAS, getSectionSchema } from "./section-schema";
import { PageHeader } from "../_ui";
import SectionEditor, { type SectionBundle } from "./SectionEditor";

export const dynamic = "force-dynamic";

export default async function AdminPagesCMS() {
  const { user } = await validateRequest();
  const canEdit = hasInvenimusRole(user?.invenimusRole, "EDITOR");

  const [dataMap, customizedRows] = await Promise.all([
    getAllSectionData(),
    prisma.invenimusSection.findMany({ select: { key: true } }).catch(() => []),
  ]);
  const customized = new Set(customizedRows.map((r) => r.key));

  const sections: SectionBundle[] = SECTION_SCHEMAS.map((schema) => ({
    key: schema.key,
    label: schema.label,
    description: schema.description,
    schema: getSectionSchema(schema.key)!,
    data: dataMap[schema.key] ?? {},
    customized: customized.has(schema.key),
  }));

  return (
    <div>
      <PageHeader
        title="Sayfa İçeriği (CMS)"
        subtitle="Landing sayfasının tüm bölümlerini 3 dilde düzenle. Kaydetmezsen statik içerik gösterilir."
      />
      <SectionEditor sections={sections} canEdit={canEdit} />
    </div>
  );
}
