// app/admin/layout.tsx
// Ceyhun admin paneli kök layout'u — yetki guard'ı burada (CeyhunRole).
// Giriş yoksa /login'e; Ceyhun rolü olmayan kullanıcıda 403 ekranı.
// Bölümlere erişim yetenek (capability) tabanlıdır — sidebar rolün gördüğü bölümleri filtreler.

import { redirect } from "next/navigation";
import Link from "next/link";
import { validateRequest } from "@/app/auth";
import { resolveCeyhunRole, canAccessPanel, CEYHUN_ROLE_LABEL, visibleSections } from "@/app/lib/ceyhun-roles";
import AdminSidebar from "./AdminSidebar";

export const metadata = {
  title: "Admin · Sözün İzinde",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const role = resolveCeyhunRole(user);

  if (!canAccessPanel(role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ceyhun-cream px-6 text-center font-sans text-ceyhun-ink">
        <span className="rounded-full bg-ceyhun-gold/15 px-4 py-1.5 text-sm font-semibold text-ceyhun-gold-deep">
          403 · Yetkisiz
        </span>
        <h1 className="mt-6 font-syne text-3xl font-extrabold tracking-tight">Bu alana erişimin yok</h1>
        <p className="mt-3 max-w-md text-ceyhun-ink/60">
          Yönetim paneli yalnızca OWNER (sahip) yetkisine sahip hesaplara açıktır.
          Üye (VIEWER) hesaplar yalnızca herkese açık sayfaları görüntüler. Yetki için site sahibiyle görüş.
        </p>
        <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-ceyhun-ink px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-ceyhun-gold-deep">
          ← Ana sayfaya dön
        </Link>
      </div>
    );
  }

  const userName = user.displayName || user.username || user.email || "Kullanıcı";
  const panelRole = role!; // canAccessPanel guard'ı null olmadığını garanti eder

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-ink lg:flex">
      <AdminSidebar
        userName={userName}
        role={panelRole}
        roleLabel={CEYHUN_ROLE_LABEL[panelRole]}
        allowed={visibleSections(panelRole)}
      />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
