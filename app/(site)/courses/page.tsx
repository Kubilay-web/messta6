// app/(site)/courses/page.tsx — Eğitim kataloğu (ücretsiz izlenir, bağışla desteklenir).
import Link from "next/link";
import Image from "next/image";
import { PlayCircle, Layers, ArrowRight } from "lucide-react";
import { getCeyhunT } from "@/app/lib/ceyhunT";
import { localizedHref } from "@/app/lib/i18n-routing";
import { getPublishedCourses } from "@/app/lib/ceyhun-cache";
import { pick } from "@/app/lib/ceyhun";
import { PageHero } from "@/app/components/ceyhun/ui";

export const dynamic = "force-dynamic";

const COPY = {
  tr: { eyebrow: "Öğren", title: "Online Eğitimler", subtitle: "Vaaz ve öğreti eğitimleri — hepsi ücretsiz. İzleyin, dilerseniz istediğiniz miktarda bağış yapın.", free: "Ücretsiz", lessons: "ders" },
  en: { eyebrow: "Learn", title: "Online Courses", subtitle: "Preaching and teaching courses — all free. Watch, and support with any amount you wish.", free: "Free", lessons: "lessons" },
  de: { eyebrow: "Lernen", title: "Online-Kurse", subtitle: "Predigt- und Lehrkurse — alle kostenlos. Ansehen und mit einem Betrag Ihrer Wahl unterstützen.", free: "Kostenlos", lessons: "Lektionen" },
} as const;

export async function generateMetadata(): Promise<import("next").Metadata> {
  const { locale } = await getCeyhunT();
  const c = COPY[locale] ?? COPY.tr;
  return { title: c.title, description: c.subtitle };
}

export default async function CoursesPage() {
  const { locale, t } = await getCeyhunT();
  const c = COPY[locale] ?? COPY.tr;
  const courses = await getPublishedCourses();

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      {courses.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ceyhun-ink/15 py-20 text-center text-ceyhun-ink/40">{t.common.empty}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={localizedHref(locale, `/courses/${course.slug}`)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-ceyhun-ink/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-ceyhun-gold/40 hover:shadow-xl hover:shadow-ceyhun-ink/10">
              <div className="relative aspect-[16/10] overflow-hidden bg-ceyhun-ink">
                {course.coverUrl ? (
                  <Image src={course.coverUrl} alt="" fill className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-110" sizes="(max-width:768px) 100vw, 33vw" />
                ) : (
                  <div className="flex h-full items-center justify-center text-ceyhun-gold/50"><PlayCircle className="h-12 w-12" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ceyhun-ink/55 via-transparent to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-ceyhun-gold px-2.5 py-1 text-[11px] font-bold uppercase text-ceyhun-ink shadow">{c.free}</span>
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-ceyhun-ink/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                  <Layers className="h-3 w-3" /> {course._count.lessons} {c.lessons}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="flex items-start justify-between gap-2 font-syne text-lg font-bold text-ceyhun-ink group-hover:text-ceyhun-gold-deep">
                  <span>{pick(course.title, locale)}</span>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 -translate-x-1 text-ceyhun-gold-deep opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-ceyhun-slate">{pick(course.description, locale)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
    </>
  );
}
