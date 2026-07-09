// app/admin/team/page.tsx
// Kadromuz yönetimi — çok dilli ekip üyeleri. EDITOR+ düzenleyebilir.

import prisma from "@/app/lib/prisma";
import { validateRequest } from "@/app/auth";
import { hasInvenimusRole } from "@/app/lib/invenimus-auth";
import { PageHeader, EmptyState, unpackLang } from "../_ui";
import TeamManager, { type TeamDTO } from "./TeamManager";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const { user } = await validateRequest();
  const canEdit = hasInvenimusRole(user?.invenimusRole, "EDITOR");

  const members = await prisma.invenimusTeamMember.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const rows: TeamDTO[] = members.map((m) => ({
    id: m.id,
    name: m.name,
    role: unpackLang(m.role),
    bio: unpackLang(m.bio),
    avatarUrl: m.avatarUrl,
    linkedin: m.linkedin,
    twitter: m.twitter,
    order: m.order,
    published: m.published,
  }));

  return (
    <div>
      <PageHeader
        title="Kadromuz"
        subtitle="Landing 'Kadromuz' bölümünde görünen ekip üyeleri"
      />
      {rows.length === 0 && !canEdit ? (
        <EmptyState text="Henüz kadro üyesi eklenmemiş." />
      ) : (
        <TeamManager members={rows} canEdit={canEdit} />
      )}
    </div>
  );
}
