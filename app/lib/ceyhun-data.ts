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
  about: string;
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
  name: "Avrupa Uyanış Hizmetleri",
  title: JSON.stringify({
    tr: "Vaaz, Biblical Tur & Online Dua",
    en: "European Awakening Services",
    de: "Europäische Erweckungsdienste",
  }),
  tagline: JSON.stringify({
    tr: "Avrupa'da uyanış: Kutsal Kitap'ın izinde vaaz, öğreti, rehberlik ve dua.",
    en: "Awakening in Europe — preaching, teaching, guidance and prayer in the footsteps of the Scriptures.",
    de: "Erweckung in Europa — Predigt, Lehre, Führung und Gebet auf den Spuren der Schrift.",
  }),
  bio: "{}",
  about: JSON.stringify({
    tr: "<h2>Avrupa Uyanış Hizmetleri</h2><p><strong>Avrupa Uyanış Hizmetleri</strong>, Avrupa'da yaşayan Türkçe konuşan topluluklar başta olmak üzere herkese Kutsal Kitap'ın müjdesini ulaştırmak için kurulmuş bir hizmet platformudur. Amacımız; vaaz, öğreti, dua ve rehberlik yoluyla kalplerde bir uyanış görmek ve insanları imanda yüreklendirmektir.</p><h3>Ne yapıyoruz?</h3><ul><li><strong>Vaaz ve yazılar</strong> — Kutsal Kitap merkezli öğretiler, tanıklıklar ve düşünceler.</li><li><strong>Biblical turlar</strong> — İstanbul, 7 Kilise ve Kapadokya gibi kutsal izleri birlikte gezmek.</li><li><strong>Online dua</strong> — Canlı yayınla birlikte dua ettiğimiz buluşmalar.</li><li><strong>Eğitimler</strong> — Ücretsiz izlenebilen öğreti serileri.</li><li><strong>Asistan</strong> — Sorularınızı yanıtlayan yapay zekâ destekli asistan.</li></ul><h3>Vizyonumuz</h3><p>Avrupa'nın her köşesinde, dilinden ve geçmişinden bağımsız olarak insanların Tanrı'nın sevgisiyle tanışması ve toplulukların yeniden canlanması.</p>",
    en: "<h2>Avrupa Uyanış Hizmetleri</h2><p><strong>Avrupa Uyanış Hizmetleri (European Awakening Services)</strong> is a ministry platform founded to bring the good news of the Scriptures to everyone — especially Turkish-speaking communities living across Europe. Our aim is to see an awakening in hearts through preaching, teaching, prayer and guidance, and to encourage people in their faith.</p><h3>What we do</h3><ul><li><strong>Sermons & writings</strong> — Scripture-centred teachings, testimonies and reflections.</li><li><strong>Biblical tours</strong> — Walking the holy footsteps together in Istanbul, the Seven Churches and Cappadocia.</li><li><strong>Online prayer</strong> — Live gatherings where we pray together.</li><li><strong>Courses</strong> — Teaching series free to watch.</li><li><strong>Assistant</strong> — An AI-powered assistant that answers your questions.</li></ul><h3>Our vision</h3><p>That people in every corner of Europe — regardless of language or background — would come to know the love of God, and that communities would be revived.</p>",
    de: "<h2>Avrupa Uyanış Hizmetleri</h2><p><strong>Avrupa Uyanış Hizmetleri (Europäische Erweckungsdienste)</strong> ist eine Dienst-Plattform, gegründet, um die frohe Botschaft der Schrift allen zu bringen — besonders den türkischsprachigen Gemeinschaften in ganz Europa. Unser Ziel ist es, durch Predigt, Lehre, Gebet und Führung eine Erweckung in den Herzen zu sehen und Menschen im Glauben zu ermutigen.</p><h3>Was wir tun</h3><ul><li><strong>Predigten & Schriften</strong> — schriftzentrierte Lehren, Zeugnisse und Gedanken.</li><li><strong>Biblische Touren</strong> — gemeinsam auf den heiligen Spuren in Istanbul, den Sieben Kirchen und Kappadokien.</li><li><strong>Online-Gebet</strong> — Live-Treffen, bei denen wir gemeinsam beten.</li><li><strong>Kurse</strong> — kostenlos ansehbare Lehrreihen.</li><li><strong>Assistent</strong> — ein KI-gestützter Assistent, der Ihre Fragen beantwortet.</li></ul><h3>Unsere Vision</h3><p>Dass Menschen in jedem Winkel Europas — unabhängig von Sprache oder Herkunft — die Liebe Gottes kennenlernen und Gemeinschaften neu belebt werden.</p>",
  }),
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
      about: p.about || DEFAULT_PROFILE.about,
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
