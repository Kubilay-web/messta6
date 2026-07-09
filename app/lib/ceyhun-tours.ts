// app/lib/ceyhun-tours.ts
// Statik tur kataloğu (CMS yok). Başvuru formundaki seçenekler bu listeden gelir.
// Çok dilli alanlar Locale → string sözlüğü olarak tutulur.

import type { Locale } from "./ceyhun";

export type TourDef = {
  slug: "istanbul" | "seven-churches" | "cappadocia" | "custom";
  emoji: string;
  duration: Record<Locale, string>;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  highlights: Record<Locale, string[]>;
};

export const TOURS: TourDef[] = [
  {
    slug: "istanbul",
    emoji: "🕌",
    duration: { tr: "2–3 gün", en: "2–3 days", de: "2–3 Tage" },
    title: { tr: "İstanbul Turu", en: "Istanbul Tour", de: "Istanbul-Tour" },
    summary: {
      tr: "İki kıtanın buluştuğu şehirde erken kilise tarihi, Ayasofya, Kariye ve Konstantinopolis mirası.",
      en: "Early church history where two continents meet — Hagia Sophia, Chora, and the legacy of Constantinople.",
      de: "Frühe Kirchengeschichte, wo zwei Kontinente sich treffen — Hagia Sophia, Chora und das Erbe Konstantinopels.",
    },
    highlights: {
      tr: ["Ayasofya & Kariye (Chora) Müzesi", "Konstantinopolis'in erken kilise mirası", "Ekümenik Patrikhane ziyareti", "Boğaz'da rehberli tefekkür turu"],
      en: ["Hagia Sophia & Chora Museum", "Early church heritage of Constantinople", "Ecumenical Patriarchate visit", "Guided reflection cruise on the Bosphorus"],
      de: ["Hagia Sophia & Chora-Museum", "Frühchristliches Erbe Konstantinopels", "Besuch des Ökumenischen Patriarchats", "Geführte Besinnungsfahrt am Bosporus"],
    },
  },
  {
    slug: "seven-churches",
    emoji: "✝️",
    duration: { tr: "4–6 gün", en: "4–6 days", de: "4–6 Tage" },
    title: { tr: "7 Kilise Turu", en: "Seven Churches Tour", de: "Sieben-Kirchen-Tour" },
    summary: {
      tr: "Vahiy kitabındaki yedi kilise: Efes, İzmir, Bergama, Tiyatira, Sardis, Filadelfya ve Laodikya.",
      en: "The seven churches of Revelation: Ephesus, Smyrna, Pergamon, Thyatira, Sardis, Philadelphia and Laodicea.",
      de: "Die sieben Kirchen der Offenbarung: Ephesus, Smyrna, Pergamon, Thyatira, Sardis, Philadelphia und Laodizea.",
    },
    highlights: {
      tr: ["Vahiy 2–3'teki yedi kilisenin tamamı", "Efes antik kenti & Meryem Ana Evi", "Her durakta yerinde vaaz ve dua", "Pamukkale & Laodikya"],
      en: ["All seven churches of Revelation 2–3", "Ancient Ephesus & House of the Virgin Mary", "On-site preaching and prayer at each stop", "Pamukkale & Laodicea"],
      de: ["Alle sieben Kirchen der Offenbarung 2–3", "Antikes Ephesus & Haus der Jungfrau Maria", "Predigt und Gebet vor Ort an jeder Station", "Pamukkale & Laodizea"],
    },
  },
  {
    slug: "cappadocia",
    emoji: "⛪",
    duration: { tr: "3–4 gün", en: "3–4 days", de: "3–4 Tage" },
    title: { tr: "Kapadokya Turu", en: "Cappadocia Tour", de: "Kappadokien-Tour" },
    summary: {
      tr: "Kaya kiliseleri, yeraltı şehirleri ve ilk Hristiyan topluluklarının izinde peri bacaları.",
      en: "Rock-cut churches, underground cities and fairy chimneys in the footsteps of the first Christian communities.",
      de: "Felsenkirchen, unterirdische Städte und Feenkamine auf den Spuren der ersten christlichen Gemeinden.",
    },
    highlights: {
      tr: ["Göreme açık hava müzesi kaya kiliseleri", "Derinkuyu yeraltı şehri", "Kayseri & Kapadokya'nın kilise babaları", "Gün doğumunda balon (opsiyonel)"],
      en: ["Rock churches of Göreme open-air museum", "Derinkuyu underground city", "Kayseri & the Cappadocian Church Fathers", "Sunrise balloon (optional)"],
      de: ["Felsenkirchen des Freilichtmuseums Göreme", "Unterirdische Stadt Derinkuyu", "Kayseri & die kappadokischen Kirchenväter", "Ballonfahrt bei Sonnenaufgang (optional)"],
    },
  },
];

export const TOUR_SLUGS = TOURS.map((t) => t.slug);

export function tourLabel(slug: string, locale: Locale): string {
  const t = TOURS.find((x) => x.slug === slug);
  if (!t) return slug === "custom" ? ({ tr: "Özel Tur", en: "Custom Tour", de: "Individuelle Tour" }[locale]) : slug;
  return t.title[locale];
}
