// app/admin/profile/page.tsx
import { getCeyhunProfile } from "@/app/lib/ceyhun-data";
import { unpackLang, safeObject } from "@/app/lib/ceyhun";
import { getCeyhunViewer } from "@/app/lib/ceyhun-auth";
import { can } from "@/app/lib/ceyhun-roles";
import { PageHeader, AdminForbidden } from "../_ui";
import ProfileForm, { type ProfileDTO } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const gate = await getCeyhunViewer();
  if (!gate || !can(gate.role, "content")) return <AdminForbidden />;
  const p = await getCeyhunProfile();
  const socials = safeObject<{ youtube?: string; instagram?: string; facebook?: string; x?: string }>(p.socials);
  const profile: ProfileDTO = {
    name: p.name,
    title: unpackLang(p.title),
    tagline: unpackLang(p.tagline),
    bio: unpackLang(p.bio),
    avatarUrl: p.avatarUrl,
    coverUrl: p.coverUrl,
    email: p.email ?? "",
    phone: p.phone ?? "",
    whatsapp: p.whatsapp ?? "",
    location: p.location ?? "",
    socials,
  };

  return (
    <div>
      <PageHeader title="Profil" subtitle="Ana sayfa hero, hakkında ve iletişim bilgileri." />
      <ProfileForm profile={profile} />
    </div>
  );
}
