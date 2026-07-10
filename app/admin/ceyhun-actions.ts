"use server";

// app/admin/ceyhun-actions.ts
// Ceyhun içeriğinin admin mutasyonları. Hepsi EDITOR+ yetkisi ister.
// İçerik: profil · yazılar · videolar · galeri (albüm + foto).

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import prisma from "@/app/lib/prisma";
import { requireCeyhunCap } from "@/app/lib/ceyhun-auth";
import { isCeyhunRole, type CeyhunRole } from "@/app/lib/ceyhun-roles";
import { packLangFromForm, estimateReadMinutes, unpackLang } from "@/app/lib/ceyhun";
import { destroyByUrl } from "@/app/lib/cloudinary";
import { isMediaServerUrl, deleteFromMediaServer } from "@/app/lib/media-server";
import { deleteMuxByRef } from "@/app/lib/ceyhun-mux";

// Bir medya URL'sini kaynağına göre temizler: kendi medya sunucumuz / Cloudinary / yerel (/uploads/..).
// Hepsi best-effort — silme başarısız olsa da DB işlemi engellenmez.
async function purgeMedia(url: string | null | undefined) {
  if (!url) return;
  if (isMediaServerUrl(url)) {
    await deleteFromMediaServer(url);
    return;
  }
  if (url.startsWith("/uploads/")) {
    try {
      const { unlink } = await import("fs/promises");
      const path = await import("path");
      await unlink(path.join(process.cwd(), "public", url));
    } catch {
      /* dosya yoksa/erişilemezse geç */
    }
    return;
  }
  await destroyByUrl(url);
}

// Bir görsel/video alanı GÜNCELLENİRKEN: eski URL yenisinden farklıysa (değiştirildi veya kaldırıldı)
// eskisini kaynağından temizle. Aynıysa (değişmediyse) dokunma. purgeMedia zaten Cloudinary/yerel dışını yutar.
async function purgeIfReplaced(oldUrl: string | null | undefined, newUrl: string | null | undefined) {
  if (oldUrl && oldUrl !== newUrl) await purgeMedia(oldUrl);
}

export type AdminResult = { ok: boolean; message?: string; id?: string };

// Yetenek-bazlı guard'lar: içerik / tur / dua bölümleri ayrı yetki ister.
const requireContent = () => requireCeyhunCap("content");
const requireTours = () => requireCeyhunCap("tours");
const requirePrayer = () => requireCeyhunCap("prayer");
// Geriye dönük ad: içerik mutasyonlarının çoğu bunu kullanır.
const requireEditor = requireContent;

function num(v: FormDataEntryValue | null, def = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function makeSlug(input: string, fallback: string): string {
  const base = (input || fallback || "").trim();
  const s = slugify(base, { lower: true, strict: true, locale: "tr" });
  return s || `icerik-${Date.now().toString(36)}`;
}

// Aynı slug varsa sonuna sayı ekleyerek benzersizleştir.
async function uniqueSlug(
  model: "article" | "album" | "course" | "meeting",
  slug: string,
  ignoreId?: string
): Promise<string> {
  const find = (s: string) => {
    if (model === "article") return prisma.ceyhunArticle.findUnique({ where: { slug: s } });
    if (model === "album") return prisma.ceyhunAlbum.findUnique({ where: { slug: s } });
    if (model === "course") return prisma.ceyhunCourse.findUnique({ where: { slug: s } });
    return prisma.ceyhunPrayerMeeting.findUnique({ where: { slug: s } });
  };
  let candidate = slug;
  let i = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const found = await find(candidate);
    if (!found || found.id === ignoreId) return candidate;
    candidate = `${slug}-${i++}`;
  }
}

function revalidateAll(path?: string) {
  revalidatePath("/admin");
  if (path) revalidatePath(path);
  revalidatePath("/");
}

// ─────────────────────────── PROFİL ───────────────────────────

export async function saveProfile(_prev: AdminResult, fd: FormData): Promise<AdminResult> {
  await requireEditor();
  const socials = JSON.stringify({
    youtube: String(fd.get("social_youtube") ?? "").trim(),
    instagram: String(fd.get("social_instagram") ?? "").trim(),
    facebook: String(fd.get("social_facebook") ?? "").trim(),
    x: String(fd.get("social_x") ?? "").trim(),
  });

  const data = {
    name: String(fd.get("name") ?? "").trim() || "Avrupa Uyanış Hizmetleri",
    title: packLangFromForm(fd, "title"),
    tagline: packLangFromForm(fd, "tagline"),
    bio: packLangFromForm(fd, "bio"),
    avatarUrl: String(fd.get("avatarUrl") ?? "").trim() || null,
    coverUrl: String(fd.get("coverUrl") ?? "").trim() || null,
    email: String(fd.get("email") ?? "").trim() || null,
    phone: String(fd.get("phone") ?? "").trim() || null,
    whatsapp: String(fd.get("whatsapp") ?? "").trim() || null,
    location: String(fd.get("location") ?? "").trim() || null,
    socials,
  };

  const existing = await prisma.ceyhunProfile.findUnique({ where: { key: "main" } });
  await prisma.ceyhunProfile.upsert({
    where: { key: "main" },
    create: { key: "main", ...data },
    update: data,
  });
  // Avatar/kapak değiştirildiyse eski görselleri Cloudinary'den temizle.
  await purgeIfReplaced(existing?.avatarUrl, data.avatarUrl);
  await purgeIfReplaced(existing?.coverUrl, data.coverUrl);
  revalidateAll("/admin/profile");
  return { ok: true };
}

// Hakkımızda sayfası (çok dilli zengin HTML, resim gömülebilir).
export async function saveAbout(_prev: AdminResult, fd: FormData): Promise<AdminResult> {
  await requireEditor();
  const about = packLangFromForm(fd, "about");
  await prisma.ceyhunProfile.upsert({
    where: { key: "main" },
    create: { key: "main", about },
    update: { about },
  });
  revalidateAll("/admin/about");
  revalidatePath("/about");
  return { ok: true };
}

// ─────────────────────────── YAZILAR ───────────────────────────

export async function saveArticle(_prev: AdminResult, fd: FormData): Promise<AdminResult> {
  await requireEditor();
  const id = String(fd.get("id") ?? "");
  const title = packLangFromForm(fd, "title");
  const titleTr = unpackLang(title).tr || unpackLang(title).en;
  if (!titleTr) return { ok: false, message: "Başlık zorunlu (en az bir dilde)." };

  const slugInput = String(fd.get("slug") ?? "").trim();
  const slug = await uniqueSlug("article", makeSlug(slugInput, titleTr), id || undefined);

  const body = packLangFromForm(fd, "body");
  const bodyForRead = unpackLang(body);
  const published = fd.get("published") === "on";

  const tagsRaw = String(fd.get("tags") ?? "").trim();
  const tags = JSON.stringify(
    tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : []
  );

  const data = {
    slug,
    title,
    excerpt: packLangFromForm(fd, "excerpt"),
    body,
    coverUrl: String(fd.get("coverUrl") ?? "").trim() || null,
    category: String(fd.get("category") ?? "").trim() || null,
    tags,
    readMinutes: estimateReadMinutes(bodyForRead.tr || bodyForRead.en || bodyForRead.de),
    featured: fd.get("featured") === "on",
    published,
    order: num(fd.get("order")),
    publishedAt: published ? new Date() : null,
  };

  try {
    if (id) {
      // Yayına ilk kez alınıyorsa publishedAt'i koru/ata
      const existing = await prisma.ceyhunArticle.findUnique({ where: { id } });
      const publishedAt = published
        ? existing?.publishedAt ?? new Date()
        : null;
      await prisma.ceyhunArticle.update({ where: { id }, data: { ...data, publishedAt } });
      await purgeIfReplaced(existing?.coverUrl, data.coverUrl); // kapak değiştiyse eskisini sil
      revalidateAll(`/articles/${slug}`);
      return { ok: true, id };
    }
    const created = await prisma.ceyhunArticle.create({ data });
    revalidateAll("/articles");
    return { ok: true, id: created.id };
  } catch (e) {
    console.error("saveArticle", e);
    return { ok: false, message: "Kaydedilemedi." };
  }
}

export async function deleteArticle(id: string): Promise<AdminResult> {
  await requireEditor();
  const row = await prisma.ceyhunArticle.findUnique({ where: { id }, select: { coverUrl: true } });
  await prisma.ceyhunArticle.delete({ where: { id } });
  await purgeMedia(row?.coverUrl); // kapak görselini de temizle
  revalidateAll("/articles");
  return { ok: true };
}

// ─────────────────────────── VİDEOLAR ───────────────────────────

export async function saveVideo(_prev: AdminResult, fd: FormData): Promise<AdminResult> {
  await requireEditor();
  const id = String(fd.get("id") ?? "");
  const title = packLangFromForm(fd, "title");
  if (!unpackLang(title).tr && !unpackLang(title).en)
    return { ok: false, message: "Başlık zorunlu." };
  const videoRef = String(fd.get("videoRef") ?? "").trim();
  if (!videoRef) return { ok: false, message: "Önce videoyu Mux'a yükleyin." };

  const data = {
    title,
    description: packLangFromForm(fd, "description"),
    provider: "mux",
    videoRef,
    thumbUrl: String(fd.get("thumbUrl") ?? "").trim() || null,
    category: String(fd.get("category") ?? "").trim() || null,
    durationSec: num(fd.get("durationSec")),
    featured: fd.get("featured") === "on",
    published: fd.get("published") === "on",
    order: num(fd.get("order")),
  };

  if (id) {
    const existing = await prisma.ceyhunVideo.findUnique({
      where: { id },
      select: { provider: true, videoRef: true, thumbUrl: true },
    });
    await prisma.ceyhunVideo.update({ where: { id }, data });
    // Video dosyası veya poster değiştirildiyse eskisini kaynağından temizle.
    if (existing?.provider === "mux") {
      if (existing.videoRef !== data.videoRef) await deleteMuxByRef(existing.videoRef);
    } else {
      await purgeIfReplaced(existing?.videoRef, data.videoRef); // purgeMedia YouTube/Vimeo'yu yutar
    }
    await purgeIfReplaced(existing?.thumbUrl, data.thumbUrl); // Mux thumb URL'i Cloudinary'de yoktur → sessizce geçer
  } else {
    await prisma.ceyhunVideo.create({ data });
  }
  revalidateAll("/videos");
  return { ok: true };
}

export async function deleteVideo(id: string): Promise<AdminResult> {
  await requireEditor();
  const row = await prisma.ceyhunVideo.findUnique({
    where: { id },
    select: { provider: true, videoRef: true, thumbUrl: true },
  });
  await prisma.ceyhunVideo.delete({ where: { id } });
  // Kendi yüklediğimiz videoları (mux/mediaserver/cloudinary/local) + posterlerini temizle.
  // YouTube/Vimeo'da videoRef bir bağlantıdır, purgeMedia sessizce geçer.
  if (row?.provider === "mux") await deleteMuxByRef(row.videoRef);
  else if (row?.provider === "mediaserver" || row?.provider === "cloudinary" || row?.provider === "local")
    await purgeMedia(row.videoRef);
  await purgeMedia(row?.thumbUrl);
  revalidateAll("/videos");
  return { ok: true };
}

// ─────────────────────────── GALERİ (albüm + foto) ───────────────────────────

export async function saveAlbum(_prev: AdminResult, fd: FormData): Promise<AdminResult> {
  await requireEditor();
  const id = String(fd.get("id") ?? "");
  const title = packLangFromForm(fd, "title");
  const titleTr = unpackLang(title).tr || unpackLang(title).en;
  if (!titleTr) return { ok: false, message: "Albüm adı zorunlu." };
  const slug = await uniqueSlug("album", makeSlug(String(fd.get("slug") ?? ""), titleTr), id || undefined);

  const data = {
    slug,
    title,
    note: packLangFromForm(fd, "note"),
    coverUrl: String(fd.get("coverUrl") ?? "").trim() || null,
    order: num(fd.get("order")),
    published: fd.get("published") === "on",
  };

  if (id) {
    const existing = await prisma.ceyhunAlbum.findUnique({ where: { id }, select: { coverUrl: true } });
    await prisma.ceyhunAlbum.update({ where: { id }, data });
    await purgeIfReplaced(existing?.coverUrl, data.coverUrl); // albüm kapağı değiştiyse eskisini sil
  } else {
    await prisma.ceyhunAlbum.create({ data });
  }
  revalidateAll("/gallery");
  return { ok: true };
}

export async function deleteAlbum(id: string): Promise<AdminResult> {
  await requireEditor();
  // Albüme bağlı fotoların albnumId'sini boşalt (SetNull ilişkisi zaten var), sonra sil.
  const row = await prisma.ceyhunAlbum.findUnique({ where: { id }, select: { coverUrl: true } });
  await prisma.ceyhunAlbum.delete({ where: { id } });
  await purgeMedia(row?.coverUrl); // fotolar kalır, yalnızca albüm kapağını temizle
  revalidateAll("/gallery");
  return { ok: true };
}

// Tek foto ekle (ImageUpload sonrası URL ile) — form-data veya doğrudan çağrı.
export async function addPhoto(fd: FormData): Promise<AdminResult> {
  await requireEditor();
  const url = String(fd.get("url") ?? "").trim();
  if (!url) return { ok: false, message: "Görsel gerekli." };
  await prisma.ceyhunPhoto.create({
    data: {
      url,
      caption: packLangFromForm(fd, "caption"),
      albumId: String(fd.get("albumId") ?? "").trim() || null,
      order: num(fd.get("order")),
      published: true,
    },
  });
  revalidateAll("/gallery");
  return { ok: true };
}

// Toplu foto ekleme (JSON url dizisi) — çoklu yükleme için.
export async function addPhotos(albumId: string | null, urls: string[]): Promise<AdminResult> {
  await requireEditor();
  if (!urls.length) return { ok: false, message: "Görsel yok." };
  await prisma.ceyhunPhoto.createMany({
    data: urls.map((url, i) => ({ url, albumId: albumId || null, order: i })),
  });
  revalidateAll("/gallery");
  return { ok: true };
}

export async function deletePhoto(id: string): Promise<AdminResult> {
  await requireEditor();
  const row = await prisma.ceyhunPhoto.findUnique({ where: { id }, select: { url: true } });
  await prisma.ceyhunPhoto.delete({ where: { id } });
  await purgeMedia(row?.url); // görseli Cloudinary'den / diskten de sil
  revalidateAll("/gallery");
  return { ok: true };
}

// Mevcut bir fotoğrafı bir albüme taşır (veya albumId=null → albümsüz yapar).
export async function setPhotoAlbum(photoId: string, albumId: string | null): Promise<AdminResult> {
  await requireEditor();
  await prisma.ceyhunPhoto.update({ where: { id: photoId }, data: { albumId: albumId || null } });
  revalidateAll("/gallery");
  return { ok: true };
}

// ─────────────────────────── TUR BAŞVURULARI ───────────────────────────

const TOUR_STATUSES = ["NEW", "REVIEWING", "QUOTED", "CONFIRMED", "REJECTED", "ARCHIVED"];

export async function updateTourStatus(id: string, status: string): Promise<AdminResult> {
  await requireTours();
  if (!TOUR_STATUSES.includes(status)) return { ok: false, message: "Geçersiz durum." };
  await prisma.ceyhunTourApplication.update({ where: { id }, data: { status } });
  revalidatePath("/admin/tours");
  return { ok: true };
}

export async function updateTourNotes(id: string, notes: string): Promise<AdminResult> {
  await requireTours();
  await prisma.ceyhunTourApplication.update({ where: { id }, data: { notes: notes || null } });
  revalidatePath("/admin/tours");
  return { ok: true };
}

export async function deleteTourApplication(id: string): Promise<AdminResult> {
  await requireTours();
  await prisma.ceyhunTourApplication.delete({ where: { id } });
  revalidatePath("/admin/tours");
  return { ok: true };
}

// ─────────────────────────── EĞİTİMLER (kurs + ders) ───────────────────────────

export async function saveCourse(_prev: AdminResult, fd: FormData): Promise<AdminResult> {
  await requireEditor();
  const id = String(fd.get("id") ?? "");
  const title = packLangFromForm(fd, "title");
  const titleTr = unpackLang(title).tr || unpackLang(title).en;
  if (!titleTr) return { ok: false, message: "Başlık zorunlu." };
  const slug = await uniqueSlug("course", makeSlug(String(fd.get("slug") ?? ""), titleTr), id || undefined);

  const data = {
    slug,
    title,
    description: packLangFromForm(fd, "description"),
    body: packLangFromForm(fd, "body"),
    coverUrl: String(fd.get("coverUrl") ?? "").trim() || null,
    priceCents: Math.round(num(fd.get("price")) * 100), // 0 = ücretsiz (bağışla destek)
    currency: String(fd.get("currency") ?? "EUR").trim() || "EUR",
    level: String(fd.get("level") ?? "").trim() || null,
    featured: fd.get("featured") === "on",
    published: fd.get("published") === "on",
    order: num(fd.get("order")),
  };

  if (id) {
    const existing = await prisma.ceyhunCourse.findUnique({ where: { id }, select: { coverUrl: true } });
    await prisma.ceyhunCourse.update({ where: { id }, data });
    await purgeIfReplaced(existing?.coverUrl, data.coverUrl); // kurs kapağı değiştiyse eskisini sil
  } else {
    await prisma.ceyhunCourse.create({ data });
  }
  revalidateAll("/courses");
  return { ok: true };
}

export async function deleteCourse(id: string): Promise<AdminResult> {
  await requireEditor();
  // Kapak + derslerin (cloudinary/local) videolarını da temizle.
  const course = await prisma.ceyhunCourse.findUnique({ where: { id }, select: { coverUrl: true } });
  const lessons = await prisma.ceyhunLesson.findMany({ where: { courseId: id }, select: { provider: true, videoRef: true } });
  await prisma.ceyhunCourse.delete({ where: { id } }); // dersler Cascade ile silinir
  await purgeMedia(course?.coverUrl);
  for (const l of lessons) {
    if (l.provider === "mux") await deleteMuxByRef(l.videoRef);
    else if (l.provider === "mediaserver" || l.provider === "cloudinary" || l.provider === "local")
      await purgeMedia(l.videoRef);
  }
  revalidateAll("/courses");
  return { ok: true };
}

export async function saveLesson(_prev: AdminResult, fd: FormData): Promise<AdminResult> {
  await requireEditor();
  const id = String(fd.get("id") ?? "");
  const courseId = String(fd.get("courseId") ?? "");
  if (!courseId) return { ok: false, message: "Kurs gerekli." };
  const title = packLangFromForm(fd, "title");
  if (!unpackLang(title).tr && !unpackLang(title).en) return { ok: false, message: "Ders başlığı zorunlu." };
  const provider = ["mux", "youtube", "vimeo"].includes(String(fd.get("provider") ?? ""))
    ? String(fd.get("provider"))
    : "mux";
  const videoRef = String(fd.get("videoRef") ?? "").trim();
  if (!videoRef) {
    return { ok: false, message: provider === "mux" ? "Önce videoyu Mux'a yükleyin." : "Video linki gerekli." };
  }

  const data = {
    courseId,
    title,
    description: packLangFromForm(fd, "description"),
    provider,
    videoRef,
    durationSec: num(fd.get("durationSec")),
    isFreePreview: fd.get("isFreePreview") === "on",
    order: num(fd.get("order")),
  };

  if (id) {
    const existing = await prisma.ceyhunLesson.findUnique({ where: { id }, select: { provider: true, videoRef: true } });
    await prisma.ceyhunLesson.update({ where: { id }, data });
    // Ders videosu değiştiyse eskisini kaynağından sil.
    if (existing?.provider === "mux") {
      if (existing.videoRef !== data.videoRef) await deleteMuxByRef(existing.videoRef);
    } else {
      await purgeIfReplaced(existing?.videoRef, data.videoRef);
    }
  } else {
    await prisma.ceyhunLesson.create({ data });
  }
  revalidateAll("/courses");
  return { ok: true };
}

export async function deleteLesson(id: string): Promise<AdminResult> {
  await requireEditor();
  const row = await prisma.ceyhunLesson.findUnique({ where: { id }, select: { provider: true, videoRef: true } });
  await prisma.ceyhunLesson.delete({ where: { id } });
  if (row?.provider === "mux") await deleteMuxByRef(row.videoRef);
  else if (row?.provider === "mediaserver" || row?.provider === "cloudinary" || row?.provider === "local")
    await purgeMedia(row.videoRef);
  revalidateAll("/courses");
  return { ok: true };
}

// ─────────────────────────── ONLINE DUA (toplantı) ───────────────────────────

const MEETING_STATUSES = ["SCHEDULED", "LIVE", "ENDED", "CANCELLED"];

export async function saveMeeting(_prev: AdminResult, fd: FormData): Promise<AdminResult> {
  await requirePrayer();
  const id = String(fd.get("id") ?? "");
  const title = packLangFromForm(fd, "title");
  const titleTr = unpackLang(title).tr || unpackLang(title).en;
  if (!titleTr) return { ok: false, message: "Başlık zorunlu." };
  const scheduledRaw = String(fd.get("scheduledAt") ?? "").trim();
  const scheduledAt = scheduledRaw ? new Date(scheduledRaw) : null;
  if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) return { ok: false, message: "Geçerli tarih/saat gerekli." };
  const slug = await uniqueSlug("meeting", makeSlug(String(fd.get("slug") ?? ""), titleTr), id || undefined);

  const embedUrl = String(fd.get("embedUrl") ?? "").trim();
  const joinInfo = JSON.stringify({ embedUrl: embedUrl || null });

  const data = {
    slug,
    title,
    description: packLangFromForm(fd, "description"),
    coverUrl: String(fd.get("coverUrl") ?? "").trim() || null,
    scheduledAt,
    durationMin: num(fd.get("durationMin"), 60) || 60,
    timezone: String(fd.get("timezone") ?? "Europe/Istanbul").trim() || "Europe/Istanbul",
    capacity: num(fd.get("capacity")),
    joinInfo,
    status: MEETING_STATUSES.includes(String(fd.get("status"))) ? String(fd.get("status")) : "SCHEDULED",
    published: fd.get("published") === "on",
  };

  if (id) {
    const existing = await prisma.ceyhunPrayerMeeting.findUnique({ where: { id }, select: { coverUrl: true } });
    await prisma.ceyhunPrayerMeeting.update({ where: { id }, data });
    await purgeIfReplaced(existing?.coverUrl, data.coverUrl); // toplantı kapağı değiştiyse eskisini sil
  } else {
    await prisma.ceyhunPrayerMeeting.create({ data: { ...data, streamCallId: `prayer-${slug}-${Date.now().toString(36)}` } });
  }
  revalidateAll("/prayer");
  return { ok: true };
}

export async function updateMeetingStatus(id: string, status: string): Promise<AdminResult> {
  await requirePrayer();
  if (!MEETING_STATUSES.includes(status)) return { ok: false, message: "Geçersiz durum." };
  await prisma.ceyhunPrayerMeeting.update({ where: { id }, data: { status } });
  revalidateAll("/prayer");
  return { ok: true };
}

export async function deleteMeeting(id: string): Promise<AdminResult> {
  await requirePrayer();
  const row = await prisma.ceyhunPrayerMeeting.findUnique({ where: { id }, select: { coverUrl: true } });
  await prisma.ceyhunPrayerMeeting.delete({ where: { id } });
  await purgeMedia(row?.coverUrl); // toplantı kapağını da temizle
  revalidateAll("/prayer");
  return { ok: true };
}

// ─────────────────────────── KULLANICILAR & ROLLER ───────────────────────────
// Yalnızca OWNER (users yeteneği) kullanabilir. "NONE" → panel erişimi kaldırılır.

export async function updateUserCeyhunRole(
  id: string,
  role: CeyhunRole | "NONE"
): Promise<AdminResult> {
  const { user: me } = await requireCeyhunCap("users");
  if (role !== "NONE" && !isCeyhunRole(role)) return { ok: false, message: "Geçersiz rol." };
  // OWNER kendi yetkisini düşüremez/kaldıramaz (kilitlenmeyi önler).
  if (me.id === id && role !== "OWNER") {
    return { ok: false, message: "Kendi sahip (OWNER) yetkinizi kaldıramazsınız." };
  }
  await prisma.user.update({
    where: { id },
    data: { ceyhunRole: role === "NONE" ? null : role },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}
