// app/lib/ceyhun-cache.ts
// ────────────────────────────────────────────────────────────────────────────
// GELİŞMİŞ VERİ ÇEKME KATMANI (Advanced Data-Fetching Layer)
//
// Bu katman, herkese açık (public) içerik okumalarını iki katmanlı önbellekle
// sarar ve Next.js'in en gelişmiş veri çekme desenlerini uygular:
//
//   1) React `cache()`  → İSTEK-İÇİ (per-request) memoizasyon / dedup.
//        Aynı render ağacında aynı fonksiyon defalarca çağrılsa bile Prisma'ya
//        yalnızca bir kez gidilir (ör. profil hem layout hem sayfada okunur).
//
//   2) `unstable_cache` → İSTEKLER-ARASI (cross-request) kalıcı Data Cache.
//        Sonuç, TAG'lerle etiketlenip diskte/bellekte saklanır. Böylece her
//        ziyaretçi için Postgres'e gidilmez; içerik değişince admin tarafındaki
//        `revalidateTag(...)` çağrısı ilgili etiketi anında geçersiz kılar.
//
// Genel akış:  Sayfa → getX() → reactCache(unstable_cache(prismaRead))
//              Admin mutasyonu → revalidateTag(CEYHUN_TAGS.x) → cache temizlenir
//
// NOT: Bu fonksiyonlar SADECE public okumalar içindir. Auth/oturum okuyan
// fonksiyonlar (getCeyhunViewer) burada YER ALMAZ — onlar cookie okur ve
// önbelleğe alınamaz.
// ────────────────────────────────────────────────────────────────────────────

import "server-only";
import { unstable_cache } from "next/cache";
import { cache as reactCache } from "react";
import * as data from "./ceyhun-data";

// ── Cache etiketleri (revalidateTag için tek kaynak) ────────────────────────
export const CEYHUN_TAGS = {
  profile: "ceyhun:profile",
  articles: "ceyhun:articles",
  videos: "ceyhun:videos",
  gallery: "ceyhun:gallery",
  courses: "ceyhun:courses",
  prayer: "ceyhun:prayer",
} as const;

export type CeyhunTag = (typeof CEYHUN_TAGS)[keyof typeof CEYHUN_TAGS];

// ── Yeniden doğrulama ufukları (saniye) ─────────────────────────────────────
// İçerik esas olarak TAG ile anında tazelenir; bu süreler yalnızca "güvenlik
// ağı" (etiket çağrısı kaçırılırsa yine de bayat kalmasın) olarak durur.
const HORIZON = {
  static: 60 * 60 * 24, // 1 gün  → nadiren değişen içerik (profil, yazılar, galeri)
  live: 30, // 30 sn → canlı/planlı içerik (dua buluşmaları)
} as const;

/**
 * Bir Prisma okuma fonksiyonunu iki katmanlı önbellekle sarar.
 * reactCache(unstable_cache(fn)) → hem istek-içi dedup hem kalıcı Data Cache.
 */
function cached<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  keyParts: string[],
  tags: CeyhunTag[],
  revalidate: number = HORIZON.static
) {
  const persistent = unstable_cache(fn, keyParts, { tags, revalidate });
  // reactCache: aynı istekte aynı argümanlarla yapılan çağrıları tekilleştirir.
  return reactCache(persistent);
}

// ─────────────────────────── Profil ───────────────────────────
export const getCeyhunProfile = cached(
  data.getCeyhunProfile,
  ["ceyhun-profile"],
  [CEYHUN_TAGS.profile]
);

// ─────────────────────────── Yazılar ───────────────────────────
export const getPublishedArticles = cached(
  data.getPublishedArticles,
  ["ceyhun-articles-published"],
  [CEYHUN_TAGS.articles]
);

export const getFeaturedArticles = cached(
  data.getFeaturedArticles,
  ["ceyhun-articles-featured"],
  [CEYHUN_TAGS.articles]
);

export const getArticleBySlug = cached(
  data.getArticleBySlug,
  ["ceyhun-article-by-slug"],
  [CEYHUN_TAGS.articles]
);

// ─────────────────────────── Galeri ───────────────────────────
export const getPublishedAlbums = cached(
  data.getPublishedAlbums,
  ["ceyhun-albums-published"],
  [CEYHUN_TAGS.gallery]
);

export const getPublishedPhotos = cached(
  data.getPublishedPhotos,
  ["ceyhun-photos-published"],
  [CEYHUN_TAGS.gallery]
);

// ─────────────────────────── Videolar ───────────────────────────
export const getPublishedVideos = cached(
  data.getPublishedVideos,
  ["ceyhun-videos-published"],
  [CEYHUN_TAGS.videos]
);

export const getFeaturedVideos = cached(
  data.getFeaturedVideos,
  ["ceyhun-videos-featured"],
  [CEYHUN_TAGS.videos]
);

// ─────────────────────────── Eğitimler ───────────────────────────
export const getPublishedCourses = cached(
  data.getPublishedCourses,
  ["ceyhun-courses-published"],
  [CEYHUN_TAGS.courses]
);

export const getCourseBySlug = cached(
  data.getCourseBySlug,
  ["ceyhun-course-by-slug"],
  [CEYHUN_TAGS.courses]
);

// ─────────────────────────── Online Dua ───────────────────────────
// Canlı/planlı içerik: kısa ufuk + tag. Durum (SCHEDULED→LIVE) hızlı yansısın.
export const getPublishedMeetings = cached(
  data.getPublishedMeetings,
  ["ceyhun-meetings-published"],
  [CEYHUN_TAGS.prayer],
  HORIZON.live
);

export const getMeetingBySlug = cached(
  data.getMeetingBySlug,
  ["ceyhun-meeting-by-slug"],
  [CEYHUN_TAGS.prayer],
  HORIZON.live
);

// ── Tekrar-dışa aktarım: tipler değişmeden kalsın ───────────────────────────
export type { CeyhunProfileData } from "./ceyhun-data";
