// app/admin/about/page.tsx — Hakkımızda sayfası yönetimi.
import { getCeyhunProfile } from "@/app/lib/ceyhun-data";
import { unpackLang } from "@/app/lib/ceyhun";
import { getCeyhunViewer } from "@/app/lib/ceyhun-auth";
import { can } from "@/app/lib/ceyhun-roles";
import { PageHeader, AdminForbidden } from "../_ui";
import AboutForm from "./AboutForm";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const gate = await getCeyhunViewer();
  if (!gate || !can(gate.role, "content")) return <AdminForbidden />;
  const p = await getCeyhunProfile();
  const about = unpackLang(p.about);

  return (
    <div>
      <PageHeader title="Hakkımızda" subtitle="Public /about sayfasının içeriğini düzenleyin (resim eklenebilir)." />
      <AboutForm about={{ tr: about.tr ?? "", en: about.en ?? "", de: about.de ?? "" }} />
    </div>
  );
}
