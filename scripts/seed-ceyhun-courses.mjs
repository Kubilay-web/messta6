// scripts/seed-ceyhun-courses.mjs
// İkinci örnek video serisi ("Kutsal Kitap'a Giriş") — çok dersli YouTube kursu.
// Udemy bölümünün çok-kurslu bir öğrenme alanı olduğunu netleştirmek için.
// Kullanım:  node --env-file=.env scripts/seed-ceyhun-courses.mjs
//   geri al:  node --env-file=.env scripts/seed-ceyhun-courses.mjs --undo
// Idempotent: slug'a göre upsert eder, dersleri baştan kurar.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const UNDO = process.argv.includes("--undo");
const SLUG = "kutsal-kitaba-giris";
const L = (tr, en, de) => JSON.stringify({ tr, en, de });
const yt = (id) => `https://www.youtube.com/watch?v=${id}`;

// Doğrulanmış (oEmbed 200) BibleProject genel bakış videoları — tematik yer tutucu içerik.
const LESSONS = [
  { id: "7_CGP-12AE0", dur: 360, t: L("Kutsal Kitap'ın Hikâyesi", "The Story of the Bible", "Die Geschichte der Bibel"),
    d: L("Baştan sona Kutsal Kitap'ın ana hikâyesine genel bir bakış.", "An overview of the Bible's central story from beginning to end.", "Ein Überblick über die zentrale Geschichte der Bibel von Anfang bis Ende.") },
  { id: "GQI72THyO5I", dur: 540, t: L("Yaratılış — 1. Bölüm", "Genesis — Part 1", "Genesis — Teil 1"),
    d: L("Yaratılış kitabının ilk bölümlerine animasyonlu genel bakış.", "Animated overview of the opening chapters of Genesis.", "Animierter Überblick über die ersten Kapitel der Genesis.") },
  { id: "F4isSyennFo", dur: 540, t: L("Yaratılış — 2. Bölüm", "Genesis — Part 2", "Genesis — Teil 2"),
    d: L("İbrahim, İshak, Yakup ve Yusuf'un öyküsü.", "The story of Abraham, Isaac, Jacob and Joseph.", "Die Geschichte von Abraham, Isaak, Jakob und Josef.") },
  { id: "jH_aojNJM3E", dur: 510, t: L("Çıkış — 1. Bölüm", "Exodus — Part 1", "Exodus — Teil 1"),
    d: L("Halkın Mısır'dan kurtuluşu ve özgürlüğe yürüyüş.", "The people's deliverance from Egypt and the road to freedom.", "Die Befreiung des Volkes aus Ägypten und der Weg in die Freiheit.") },
  { id: "b0GhR-2kPKI", dur: 510, t: L("Çıkış — 2. Bölüm", "Exodus — Part 2", "Exodus — Teil 2"),
    d: L("Antlaşma, buluşma çadırı ve Tanrı'nın halkıyla varlığı.", "The covenant, the tabernacle, and God's presence with His people.", "Der Bund, die Stiftshütte und Gottes Gegenwart bei seinem Volk.") },
  { id: "IJ-FekWUZzE", dur: 450, t: L("Levililer", "Leviticus", "Levitikus"),
    d: L("Kutsallık, kurban ve Tanrı'ya yaklaşma temaları.", "Themes of holiness, sacrifice, and drawing near to God.", "Themen von Heiligkeit, Opfer und der Nähe zu Gott.") },
];

async function undo() {
  const c = await prisma.ceyhunCourse.findUnique({ where: { slug: SLUG } });
  if (!c) { console.log("Kurs zaten yok:", SLUG); return; }
  await prisma.ceyhunLesson.deleteMany({ where: { courseId: c.id } });
  await prisma.ceyhunCourse.delete({ where: { id: c.id } });
  console.log("Silindi:", SLUG);
}

async function seed() {
  const data = {
    slug: SLUG,
    title: L("Kutsal Kitap'a Giriş", "Introduction to the Bible", "Einführung in die Bibel"),
    description: L(
      "Kutsal Kitap'ın büyük hikâyesini bölüm bölüm tanıtan ücretsiz video serisi.",
      "A free video series introducing the grand story of the Bible, book by book.",
      "Eine kostenlose Videoreihe, die die große Geschichte der Bibel Buch für Buch vorstellt."
    ),
    body: L(
      "<p>Bu ücretsiz seri, Kutsal Kitap'ın ana hatlarını sade ve akıcı bir dille tanıtır. Yaratılış'tan başlayarak Tanrı'nın halkıyla olan hikâyesini adım adım keşfedin. Dilerseniz seriyi ücretsiz izleyebilir, dilerseniz belirlediğiniz miktarda bağış yapabilirsiniz.</p>",
      "<p>This free series introduces the outline of the Bible in clear, flowing language. Starting from Genesis, discover God's story with His people step by step. Watch the whole series for free, or give any amount you choose as a donation.</p>",
      "<p>Diese kostenlose Reihe stellt die Grundzüge der Bibel in klarer Sprache vor. Beginnend mit der Genesis entdecken Sie Schritt für Schritt Gottes Geschichte mit seinem Volk. Sehen Sie die ganze Reihe kostenlos oder spenden Sie einen Betrag Ihrer Wahl.</p>"
    ),
    coverUrl: `https://i.ytimg.com/vi/${LESSONS[0].id}/hqdefault.jpg`,
    priceCents: 0,
    currency: "EUR",
    level: "Giriş",
    featured: false,
    published: true,
    order: 1,
  };

  const course = await prisma.ceyhunCourse.upsert({
    where: { slug: SLUG },
    update: data,
    create: data,
  });

  // Dersleri baştan kur (idempotent)
  await prisma.ceyhunLesson.deleteMany({ where: { courseId: course.id } });
  let order = 0;
  for (const l of LESSONS) {
    await prisma.ceyhunLesson.create({
      data: {
        courseId: course.id,
        title: l.t,
        description: l.d,
        provider: "youtube",
        videoRef: yt(l.id),
        durationSec: l.dur,
        isFreePreview: order === 0,
        order: order++,
      },
    });
  }
  console.log(`✓ Kurs '${SLUG}' ${LESSONS.length} dersle hazır (published).`);
}

try {
  await (UNDO ? undo() : seed());
} catch (e) {
  console.error("HATA:", e.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
