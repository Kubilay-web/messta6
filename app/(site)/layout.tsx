// app/(site)/layout.tsx
// Genel (herkese açık) Ceyhun sitesi düzeni — üst menü + alt bilgi.
// Admin ve auth sayfaları bu grubun dışında olduğundan bu chrome onları etkilemez.

import { getCeyhunProfile } from "@/app/lib/ceyhun-data";
import { safeObject } from "@/app/lib/ceyhun";
import SiteHeader from "@/app/components/ceyhun/SiteHeader";
import SiteFooter from "@/app/components/ceyhun/SiteFooter";
import VoiceAssistant from "@/app/components/ceyhun/VoiceAssistant";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const p = await getCeyhunProfile();
  const socials = safeObject<{ youtube?: string; instagram?: string; facebook?: string; x?: string }>(p.socials);

  return (
    <div className="flex min-h-screen flex-col bg-ceyhun-cream font-sans text-ceyhun-ink">
      <SiteHeader name={p.name} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        name={p.name}
        email={p.email}
        phone={p.phone}
        location={p.location}
        socials={socials}
      />
      <VoiceAssistant />
    </div>
  );
}
