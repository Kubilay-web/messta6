// app/(site)/courses/[slug]/page.tsx — Eğitim detayı + oynatıcı.
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getCourseBySlug } from "@/app/lib/ceyhun-cache";
import { getCeyhunT } from "@/app/lib/ceyhunT";
import { localizedHref, siteUrl } from "@/app/lib/i18n-routing";
import { pick } from "@/app/lib/ceyhun";
import CoursePlayer from "@/app/components/ceyhun/CoursePlayer";
import JsonLd from "@/app/components/JsonLd";
import { breadcrumbLd, BRAND_NAME } from "@/app/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { t, locale } = await getCeyhunT();
  const course = await getCourseBySlug(slug);
  if (!course) return { title: t.common.notFound };
  return { title: pick(course.title, locale), description: pick(course.description, locale) };
}

export default async function CourseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { t, locale } = await getCeyhunT();
  const course = await getCourseBySlug(slug);
  if (!course || !course.published) notFound();

  const cTitle = pick(course.title, locale);
  const cDesc = pick(course.description, locale);

  // Yapısal veri: Course + kırıntı navigasyonu (rich result).
  const base = siteUrl((await headers()).get("x-hostname"));
  const url = `${base}${localizedHref(locale, `/courses/${slug}`)}`;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: cTitle,
      description: cDesc || undefined,
      inLanguage: locale,
      url,
      provider: { "@type": "Organization", name: BRAND_NAME, sameAs: base },
    },
    breadcrumbLd([
      { name: t.nav.home, url: `${base}${localizedHref(locale, "/")}` },
      { name: t.nav.courses, url: `${base}${localizedHref(locale, "/courses")}` },
      { name: cTitle, url },
    ]),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <JsonLd data={ld} />
      <Link href={localizedHref(locale, "/courses")} className="inline-flex items-center gap-1.5 text-sm font-medium text-ceyhun-ink/60 hover:text-ceyhun-gold-deep">
        <ArrowLeft className="h-4 w-4" /> {t.nav.courses}
      </Link>
      <h1 className="mt-5 font-syne text-3xl font-extrabold tracking-tight text-ceyhun-ink sm:text-4xl">{cTitle}</h1>
      {cDesc && <p className="mt-3 max-w-3xl text-lg text-ceyhun-slate">{cDesc}</p>}

      <div className="mt-8">
        <CoursePlayer
          title={cTitle}
          body={pick(course.body, locale)}
          currency={course.currency}
          locale={locale}
          lessons={course.lessons.map((l) => ({
            id: l.id, title: l.title, description: l.description,
            provider: l.provider, videoRef: l.videoRef, durationSec: l.durationSec,
          }))}
        />
      </div>
    </div>
  );
}
