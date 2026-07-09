// app/admin/articles/page.tsx
// Yazı yönetimi (server): kayıtları çekip çok dilli alanları DTO'ya çözer.

import prisma from "@/app/lib/prisma";
import { unpackLang, safeArray } from "@/app/lib/ceyhun";
import { getCeyhunViewer } from "@/app/lib/ceyhun-auth";
import { can } from "@/app/lib/ceyhun-roles";
import { PageHeader, AdminForbidden } from "../_ui";
import ArticleManager, { type ArticleDTO } from "./ArticleManager";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const gate = await getCeyhunViewer();
  if (!gate || !can(gate.role, "content")) return <AdminForbidden />;
  const rows = await prisma.ceyhunArticle.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  const items: ArticleDTO[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: unpackLang(r.title),
    excerpt: unpackLang(r.excerpt),
    body: unpackLang(r.body),
    coverUrl: r.coverUrl,
    category: r.category ?? "",
    tags: safeArray<string>(r.tags),
    featured: r.featured,
    published: r.published,
    order: r.order,
    readMinutes: r.readMinutes,
    views: r.views,
  }));

  return (
    <div>
      <PageHeader title="Yazılar & Makaleler" subtitle="Vaazlar, tanıklıklar ve makaleler — çok dilli." />
      <ArticleManager items={items} />
    </div>
  );
}
