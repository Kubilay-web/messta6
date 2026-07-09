// app/admin/pages/section-schema.ts
// Landing bölümlerinin BİLDİRİMSEL alan şeması. Hem admin form motoru (SectionEditor)
// hem de içerik çözümleyici (app/lib/invenimus-page-content.ts) bunu kullanır.
// Sunucu + istemci güvenli (saf veri; prisma/DB importu YOK).

export type FieldType = "text" | "textarea" | "image";

export type ScalarField = {
  key: string;
  label: string;
  type: FieldType;
  i18n?: boolean; // true → {tr,en,de} olarak saklanır ve 3 dilde düzenlenir
  hint?: string;
};

export type ListField = {
  key: string;
  label: string;
  type: "list";
  itemLabel: string; // "Kart", "Adım"...
  fields: ScalarField[];
  max?: number;
};

export type AnyField = ScalarField | ListField;

export type SectionSchema = {
  key: string;
  label: string;
  description: string;
  fields: AnyField[];
};

export function isList(f: AnyField): f is ListField {
  return f.type === "list";
}

// i18n metin/textarea kısayolları
const t = (key: string, label: string, hint?: string): ScalarField => ({
  key,
  label,
  type: "text",
  i18n: true,
  hint,
});
const ta = (key: string, label: string, hint?: string): ScalarField => ({
  key,
  label,
  type: "textarea",
  i18n: true,
  hint,
});
// dilden bağımsız (renk, sayı, metrik, href, e-posta)
const plain = (key: string, label: string, hint?: string): ScalarField => ({
  key,
  label,
  type: "text",
  hint,
});
const img = (key: string, label: string): ScalarField => ({ key, label, type: "image" });

export const SECTION_SCHEMAS: SectionSchema[] = [
  {
    key: "hero",
    label: "Hero (giriş)",
    description: "Sayfa açılışı: rozet, ana başlık, açıklama ve butonlar.",
    fields: [
      t("badge", "Rozet metni"),
      t("titleLead", "Başlık (ilk kısım)"),
      t("titleAccent", "Başlık (vurgulu kısım)"),
      ta("descA", "Açıklama — başlangıç"),
      t("descStrong", "Açıklama — kalın vurgu"),
      t("descB", "Açıklama — bitiş"),
      t("ctaPrimary", "Birincil buton"),
      t("ctaSecondary", "İkincil buton"),
      t("techLabel", "Teknoloji şeridi etiketi"),
    ],
  },
  {
    key: "stats",
    label: "İstatistikler",
    description: "Hero altındaki 4 sayaç.",
    fields: [
      {
        key: "items",
        label: "Sayaçlar",
        type: "list",
        itemLabel: "Sayaç",
        fields: [plain("value", "Değer", "örn. 120+ / 48M / 98%"), t("label", "Etiket")],
      },
    ],
  },
  {
    key: "services",
    label: "Hizmetler (Yetenekler)",
    description: "Ne yaptığımız — bento kart ızgarası.",
    fields: [
      t("eyebrow", "Üst etiket"),
      t("titleA", "Başlık — 1. satır"),
      t("titleB", "Başlık — 2. satır"),
      ta("sub", "Alt açıklama"),
      {
        key: "items",
        label: "Hizmet kartları",
        type: "list",
        itemLabel: "Kart",
        fields: [t("title", "Başlık"), ta("body", "Metin"), t("tag", "Etiket")],
      },
    ],
  },
  {
    key: "process",
    label: "Süreç (Nasıl çalışıyoruz)",
    description: "Adımlar + her adımın görseli.",
    fields: [
      t("eyebrow", "Üst etiket"),
      t("titleA", "Başlık"),
      t("titleAccent", "Başlık vurgusu"),
      {
        key: "items",
        label: "Adımlar",
        type: "list",
        itemLabel: "Adım",
        fields: [
          t("title", "Başlık"),
          ta("body", "Metin"),
          img("image", "Görsel"),
          plain("tint", "Vurgu rengi (hex)", "örn. #f74ea1"),
        ],
      },
    ],
  },
  {
    key: "marketing",
    label: "Dijital Pazarlama",
    description: "Metrikli pazarlama kartları.",
    fields: [
      t("eyebrow", "Üst etiket"),
      t("titleA", "Başlık"),
      t("titleAccent", "Başlık vurgusu"),
      ta("sub", "Alt açıklama"),
      {
        key: "items",
        label: "Kartlar",
        type: "list",
        itemLabel: "Kart",
        fields: [
          t("title", "Başlık"),
          ta("body", "Metin"),
          plain("metric", "Metrik", "örn. 4.2x"),
          t("metricLabel", "Metrik etiketi"),
        ],
      },
      t("cta", "Buton metni"),
    ],
  },
  {
    key: "investors",
    label: "Yatırımcılar",
    description: "Yatırımcı eşleştirme: adımlar, istatistik, form başlıkları.",
    fields: [
      t("eyebrow", "Üst etiket"),
      t("titleA", "Başlık"),
      t("titleAccent", "Başlık vurgusu"),
      ta("sub", "Alt açıklama"),
      {
        key: "steps",
        label: "Adımlar",
        type: "list",
        itemLabel: "Adım",
        fields: [t("title", "Başlık"), ta("body", "Metin")],
      },
      {
        key: "stats",
        label: "İstatistikler",
        type: "list",
        itemLabel: "İstatistik",
        fields: [plain("value", "Değer"), t("label", "Etiket")],
      },
      t("formTitle", "Form başlığı"),
      ta("formSub", "Form açıklaması"),
    ],
  },
  {
    key: "features",
    label: "Öne çıkanlar (Feature şeridi)",
    description: "Koyu şeritteki 3 özellik.",
    fields: [
      {
        key: "items",
        label: "Özellikler",
        type: "list",
        itemLabel: "Özellik",
        fields: [t("title", "Başlık"), ta("body", "Metin")],
      },
    ],
  },
  {
    key: "ventures",
    label: "Portföy (Ventures)",
    description: "Girişim kartları — isim, yıl, renk, görsel.",
    fields: [
      t("eyebrow", "Üst etiket"),
      t("titleA", "Başlık — 1. satır"),
      t("titleB", "Başlık — 2. satır"),
      t("link", "Bağlantı metni"),
      {
        key: "items",
        label: "Girişimler",
        type: "list",
        itemLabel: "Girişim",
        fields: [
          plain("name", "İsim"),
          plain("year", "Yıl"),
          t("tag", "Etiket / sektör"),
          plain("color", "Kart rengi (hex)", "örn. #d8f34e"),
          plain("ink", "Yazı rengi (hex, opsiyonel)"),
          img("image", "Görsel / logo (opsiyonel)"),
        ],
      },
    ],
  },
  {
    key: "testimonials",
    label: "Referanslar",
    description: "Kurucu yorumları slider'ı.",
    fields: [
      t("eyebrow", "Üst etiket"),
      t("titleA", "Başlık — 1. satır"),
      t("titleB", "Başlık — 2. satır"),
      {
        key: "items",
        label: "Yorumlar",
        type: "list",
        itemLabel: "Yorum",
        fields: [ta("quote", "Alıntı"), plain("name", "İsim"), t("role", "Rol / şirket")],
      },
    ],
  },
  {
    key: "faq",
    label: "SSS",
    description: "Sık sorulan sorular.",
    fields: [
      t("eyebrow", "Üst etiket"),
      t("titleA", "Başlık — 1. satır"),
      t("titleB", "Başlık — 2. satır"),
      ta("desc", "Açıklama"),
      {
        key: "items",
        label: "Sorular",
        type: "list",
        itemLabel: "Soru",
        fields: [t("q", "Soru"), ta("a", "Cevap")],
      },
    ],
  },
  {
    key: "contact",
    label: "İletişim (CTA)",
    description: "Kapanış çağrısı ve iletişim e-postası.",
    fields: [
      t("badge", "Rozet"),
      t("title", "Başlık"),
      ta("desc", "Açıklama"),
      plain("email", "İletişim e-postası"),
      t("backToTop", "Başa dön metni"),
    ],
  },
  {
    key: "footer",
    label: "Footer",
    description: "Alt bilgi: slogan, linkler, konum.",
    fields: [
      ta("tagline", "Slogan"),
      {
        key: "links",
        label: "Linkler",
        type: "list",
        itemLabel: "Link",
        fields: [t("label", "Etiket"), plain("href", "Bağlantı (href)", "örn. #services")],
      },
      plain("rights", "Telif metni"),
      plain("location", "Konum"),
    ],
  },
  {
    key: "seo",
    label: "SEO & Paylaşım",
    description: "Sayfa başlığı, açıklaması ve sosyal paylaşım görseli.",
    fields: [
      t("title", "Sayfa başlığı (title)"),
      ta("description", "Meta açıklama"),
      img("ogImage", "Paylaşım görseli (OG image)"),
    ],
  },
];

export function getSectionSchema(key: string): SectionSchema | undefined {
  return SECTION_SCHEMAS.find((s) => s.key === key);
}

export const SECTION_KEYS = SECTION_SCHEMAS.map((s) => s.key);
