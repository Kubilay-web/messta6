"use client";

// app/admin/profile/ProfileForm.tsx
// Tekil site profili düzenleme — ana sayfa hero, hakkında ve iletişim.

import { useActionState, useEffect, useState } from "react";
import { Save, Check } from "lucide-react";
import { saveProfile, type AdminResult } from "../ceyhun-actions";
import MultiLangField from "../_components/MultiLangField";
import RichTextField from "../_components/RichTextField";
import ImageUpload from "../_components/ImageUpload";

type Lang = { tr: string; en: string; de: string };
export type ProfileDTO = {
  name: string;
  title: Lang;
  tagline: Lang;
  bio: Lang;
  avatarUrl: string | null;
  coverUrl: string | null;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  socials: { youtube?: string; instagram?: string; facebook?: string; x?: string };
};

const initial: AdminResult = { ok: false };

export default function ProfileForm({ profile }: { profile: ProfileDTO }) {
  const [state, formAction, pending] = useActionState(saveProfile, initial);
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (state.ok) { setSaved(true); const t = setTimeout(() => setSaved(false), 2500); return () => clearTimeout(t); } }, [state]);

  const inp = "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold";

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="mb-1 font-syne text-lg font-bold">Kimlik</h2>
        <label className="mt-3 block"><span className="mb-1 block text-xs font-medium text-ink/50">Ad</span>
          <input name="name" defaultValue={profile.name} className={inp} /></label>
        <MultiLangField base="title" label="Ünvan (hero altında)" value={profile.title} />
        <MultiLangField base="tagline" label="Slogan (hero)" value={profile.tagline} textarea rows={2} />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ImageUpload name="avatarUrl" defaultValue={profile.avatarUrl ?? ""} label="Portre / avatar" folder="profile" />
          <ImageUpload name="coverUrl" defaultValue={profile.coverUrl ?? ""} label="Kapak görseli (hero arka plan)" folder="profile" />
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="mb-1 font-syne text-lg font-bold">Hakkında</h2>
        <RichTextField base="bio" label="Biyografi" value={profile.bio} />
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-syne text-lg font-bold">İletişim & Sosyal</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">E-posta</span><input name="email" defaultValue={profile.email} className={inp} /></label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">Telefon</span><input name="phone" defaultValue={profile.phone} className={inp} /></label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">WhatsApp</span><input name="whatsapp" defaultValue={profile.whatsapp} placeholder="+90…" className={inp} /></label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">Konum</span><input name="location" defaultValue={profile.location} className={inp} /></label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">YouTube</span><input name="social_youtube" defaultValue={profile.socials.youtube ?? ""} className={inp} /></label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">Instagram</span><input name="social_instagram" defaultValue={profile.socials.instagram ?? ""} className={inp} /></label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">Facebook</span><input name="social_facebook" defaultValue={profile.socials.facebook ?? ""} className={inp} /></label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">X / Twitter</span><input name="social_x" defaultValue={profile.socials.x ?? ""} className={inp} /></label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-ceyhun-ink px-6 py-3 text-sm font-medium text-white hover:bg-ceyhun-gold-deep disabled:opacity-60">
          <Save className="h-4 w-4" /> {pending ? "Kaydediliyor…" : "Kaydet"}
        </button>
        {saved && <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600"><Check className="h-4 w-4" /> Kaydedildi</span>}
        {state.message && !state.ok && <span className="text-sm text-red-600">{state.message}</span>}
      </div>
    </form>
  );
}
