// app/register/concept.ts
// Giriş/kayıt marka panelleri için "Avrupa Uyanış Hizmetleri" konsept metinleri (çok dilli).
// Fonksiyonel form etiketleri useInvenimusCopy'den gelir; burada yalnızca konsept anlatısı.

export type ConceptLocale = "tr" | "en" | "de";

type Side = { eyebrow: string; brandTitle: string; brandDesc: string; perks: string[] };
type Verse = { text: string; ref: string };
type ConceptEntry = { login: Side; register: Side; verse: Verse };

export const CONCEPT: Record<ConceptLocale, ConceptEntry> = {
  tr: {
    login: {
      eyebrow: "TEKRAR HOŞ GELDİNİZ",
      brandTitle: "Avrupa'da uyanışa, birlikte yürüyelim.",
      brandDesc:
        "Vaazlar, eğitimler, dua buluşmaları ve kutsal topraklara yolculuk — hepsi tek bir çatı altında.",
      perks: [
        "Yazı, video ve galeriye tam erişim",
        "Eğitimleri izleyin, dua buluşmalarına katılın",
        "Biblical tur başvurularınızı takip edin",
      ],
    },
    register: {
      eyebrow: "ARAMIZA KATILIN",
      brandTitle: "Topluluğun bir parçası olun.",
      brandDesc:
        "Ücretsiz bir hesapla eğitimleri izleyin, dua buluşmalarına bağlanın ve kutsal topraklara yolculuğunuzu planlayın.",
      perks: [
        "Dakikalar içinde ücretsiz hesap",
        "Canlı dua buluşmalarına katılın",
        "Tur ve konaklama başvurusu yapın",
      ],
    },
    verse: {
      text: "Sözün adımlarıma çıra, yoluma ışıktır.",
      ref: "Mezmur 119:105",
    },
  },
  en: {
    login: {
      eyebrow: "WELCOME BACK",
      brandTitle: "Walking together, in the footsteps of the Word.",
      brandDesc:
        "Sermons, teachings, prayer gatherings and journeys to the holy lands — all under one roof.",
      perks: [
        "Full access to articles, videos and gallery",
        "Watch teachings and join prayer gatherings",
        "Track your biblical tour applications",
      ],
    },
    register: {
      eyebrow: "JOIN US",
      brandTitle: "Become part of the community.",
      brandDesc:
        "Create a free account to watch teachings, connect to prayer gatherings and plan your journey to the holy lands.",
      perks: [
        "A free account in minutes",
        "Join live prayer gatherings",
        "Apply for tours and accommodation",
      ],
    },
    verse: {
      text: "Your word is a lamp to my feet and a light to my path.",
      ref: "Psalm 119:105",
    },
  },
  de: {
    login: {
      eyebrow: "WILLKOMMEN ZURÜCK",
      brandTitle: "Gemeinsam auf den Spuren des Wortes.",
      brandDesc:
        "Predigten, Lehren, Gebetstreffen und Reisen ins Heilige Land — alles unter einem Dach.",
      perks: [
        "Voller Zugang zu Artikeln, Videos und Galerie",
        "Lehren ansehen und an Gebetstreffen teilnehmen",
        "Ihre Reiseanfragen verfolgen",
      ],
    },
    register: {
      eyebrow: "TRETEN SIE BEI",
      brandTitle: "Werden Sie Teil der Gemeinschaft.",
      brandDesc:
        "Erstellen Sie ein kostenloses Konto, um Lehren anzusehen, an Gebetstreffen teilzunehmen und Ihre Reise ins Heilige Land zu planen.",
      perks: [
        "Kostenloses Konto in Minuten",
        "An Live-Gebetstreffen teilnehmen",
        "Touren und Unterkunft anfragen",
      ],
    },
    verse: {
      text: "Dein Wort ist meines Fußes Leuchte und ein Licht auf meinem Weg.",
      ref: "Psalm 119:105",
    },
  },
};
