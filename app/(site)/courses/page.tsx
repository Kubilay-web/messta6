// app/(site)/courses/page.tsx — Eğitim kataloğu (ücretsiz izlenir, bağışla desteklenir).
import Link from "next/link";
import Image from "next/image";
import { PlayCircle, Layers } from "lucide-react";
import { getCeyhunT } from "@/app/lib/ceyhunT";
import { getPublishedCourses } from "@/app/lib/ceyhun-data";
import { pick } from "@/app/lib/ceyhun";

export const dynamic = "force-dynamic";

const COPY = {
  tr: { title: "Online Eğitimler", subtitle: "Vaaz ve öğreti eğitimleri — hepsi ücretsiz. İzleyin, dilerseniz istediğiniz miktarda bağış yapın.", free: "Ücretsiz", lessons: "ders" },
  en: { title: "Online Courses", subtitle: "Preaching and teaching courses — all free. Watch, and support with any amount you wish.", free: "Free", lessons: "lessons" },
  de: { title: "Online-Kurse", subtitle: "Predigt- und Lehrkurse — alle kostenlos. Ansehen und mit einem Betrag Ihrer Wahl unterstützen.", free: "Kostenlos", lessons: "Lektionen" },
} as const;

export default async function CoursesPage() {
  const { locale, t } = await getCeyhunT();
  const c = COPY[locale] ?? COPY.tr;
  const courses = await getPublishedCourses();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="mb-10">
        <h1 className="font-syne text-4xl font-extrabold tracking-tight text-ceyhun-ink sm:text-5xl">{c.title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-ceyhun-slate">{c.subtitle}</p>
      </header>

      {courses.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ceyhun-ink/15 py-20 text-center text-ceyhun-ink/40">{t.common.empty}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-ceyhun-ink/10 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <div className="relative aspect-[16/10] overflow-hidden bg-ceyhun-ink">
                {course.coverUrl ? (
                  <Image src={course.coverUrl} alt="" fill className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />
                ) : (
                  <div className="flex h-full items-center justify-center text-ceyhun-gold/50"><PlayCircle className="h-12 w-12" /></div>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-ceyhun-gold px-2.5 py-1 text-[11px] font-bold uppercase text-ceyhun-ink">{c.free}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-syne text-lg font-bold text-ceyhun-ink group-hover:text-ceyhun-gold-deep">{pick(course.title, locale)}</h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-ceyhun-slate">{pick(course.description, locale)}</p>
                <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-ceyhun-ink/40">
                  <Layers className="h-3.5 w-3.5" /> {course._count.lessons} {c.lessons}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
