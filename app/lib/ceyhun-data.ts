// app/lib/ceyhun-data.ts
// Ceyhun içeriği için SUNUCU tarafı veri erişimi (okuma). Sayfalar bunları çağırır.

import "server-only";
import prisma from "./prisma";

export type CeyhunProfileData = {
  id: string;
  name: string;
  title: string;
  tagline: string;
  bio: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  socials: string;
  verses: string;
};

const DEFAULT_PROFILE: CeyhunProfileData = {
  id: "",
  name: "Sözün İzinde",
  title: JSON.stringify({
    tr: "Kilise Vaizi & Biblical Tur Rehberi",
    en: "Church Preacher & Biblical Tour Guide",
    de: "Kirchenprediger & Biblischer Reiseführer",
  }),
  tagline: JSON.stringify({
    tr: "Kutsal Kitap'ın izinde Türkiye — vaaz, öğreti ve rehberlik.",
    en: "Turkey in the footsteps of the Scriptures — preaching, teaching and guidance.",
    de: "Die Türkei auf den Spuren der Schrift — Predigt, Lehre und Führung.",
  }),
  bio: "{}",
  avatarUrl: null,
  coverUrl: null,
  email: null,
  phone: null,
  whatsapp: null,
  location: "İstanbul, Türkiye",
  socials: "{}",
  verses: "[]",
};

// Tekil profil (key="main"). Kayıt yoksa mantıklı varsayılana düşer.
export async function getCeyhunProfile(): Promise<CeyhunProfileData> {
  try {
    const p = await prisma.ceyhunProfile.findUnique({ where: { key: "main" } });
    if (!p) return DEFAULT_PROFILE;
    return {
      id: p.id,
      name: p.name,
      title: p.title,
      tagline: p.tagline,
      bio: p.bio,
      avatarUrl: p.avatarUrl,
      coverUrl: p.coverUrl,
      email: p.email,
      phone: p.phone,
      whatsapp: p.whatsapp,
      location: p.location,
      socials: p.socials,
      verses: p.verses,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

// ─────────────────────────── Yazılar ───────────────────────────

export async function getPublishedArticles(take?: number) {
  return prisma.ceyhunArticle.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    take,
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.ceyhunArticle.findUnique({ where: { slug } });
}

export async function getFeaturedArticles(take = 3) {
  return prisma.ceyhunArticle.findMany({
    where: { published: true, featured: true },
    orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
    take,
  });
}

// ─────────────────────────── Galeri ───────────────────────────

export async function getPublishedAlbums() {
  return prisma.ceyhunAlbum.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: { photos: { where: { published: true }, orderBy: { order: "asc" } } },
  });
}

export async function getPublishedPhotos(take?: number) {
  return prisma.ceyhunPhoto.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    take,
  });
}

// ─────────────────────────── Videolar ───────────────────────────

export async function getPublishedVideos(take?: number) {
  return prisma.ceyhunVideo.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    take,
  });
}

export async function getFeaturedVideos(take = 3) {
  return prisma.ceyhunVideo.findMany({
    where: { published: true, featured: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    take,
  });
}

// ─────────────────────────── Eğitimler ───────────────────────────

export async function getPublishedCourses(take?: number) {
  return prisma.ceyhunCourse.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { lessons: true } } },
    take,
  });
}

export async function getCourseBySlug(slug: string) {
  return prisma.ceyhunCourse.findUnique({
    where: { slug },
    include: { lessons: { orderBy: { order: "asc" } } },
  });
}

// ─────────────────────────── Online Dua ───────────────────────────

export async function getPublishedMeetings() {
  return prisma.ceyhunPrayerMeeting.findMany({
    where: { published: true, status: { in: ["SCHEDULED", "LIVE"] } },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getMeetingBySlug(slug: string) {
  return prisma.ceyhunPrayerMeeting.findUnique({ where: { slug } });
}
