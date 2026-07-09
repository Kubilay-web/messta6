import type { Metadata } from "next";
import { redirect as nav } from "next/navigation";
import { validateRequest } from "@/app/auth";
import { getServerLocale } from "@/app/lib/locale";
import { localizedHref, type Locale } from "@/app/lib/i18n-routing";
import { pageMeta } from "@/app/lib/seo";
import { getCeyhunProfile } from "@/app/lib/ceyhun-data";
import RegisterForm from "./register-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getServerLocale()) as Locale;
  const m = pageMeta(locale, "register");
  return { title: m.title, description: m.description, robots: { index: false, follow: true } };
}

export default async function Register({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const initialLang = await getServerLocale();
  const target =
    redirect && redirect.startsWith("/")
      ? redirect
      : localizedHref(initialLang as Locale, "/");

  const { user } = await validateRequest();
  if (user) nav(target);

  const profile = await getCeyhunProfile();
  return <RegisterForm redirect={target} brand={profile.name} />;
}
