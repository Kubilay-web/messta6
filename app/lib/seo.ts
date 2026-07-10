// app/lib/seo.ts
// Site geneli SEO içerikleri (locale bazlı başlık/açıklama/anahtar kelime) ve
// yapısal veri (JSON-LD) üreticileri. Root layout ve sitemap buradan besler.

import { LOCALES, type Locale } from "./i18n-routing";

export const SITE_NAME = "E-Commerce";
export const TWITTER_HANDLE = "@ecommerce";

export type Brand = {
  name: string;
  title: string;
  description: string;
  keywords: string[];
};

// Varsayılan e-ticaret markası — locale bazlı.
const ECOM: Record<Locale, Brand> = {
  tr: {
    name: SITE_NAME,
    title: "invenimus",
    description:
      "Özenle seçilmiş ürünleri keşfedin. Hızlı kargo, 256-bit SSL güvenli ödeme ve 14 gün koşulsuz iade. Türkçe, İngilizce ve Almanca alışveriş deneyimi.",
    keywords: ["online alışveriş", "e-ticaret", "hızlı kargo", "güvenli ödeme", "mağaza"],
  },
  en: {
    name: SITE_NAME,
    title: "E-Commerce — Curated Products, Fast Shipping",
    description:
      "Discover carefully curated products. Fast shipping, 256-bit SSL secure checkout and 14-day free returns. Shop in English, Turkish and German.",
    keywords: ["online shopping", "ecommerce", "fast shipping", "secure payment", "store"],
  },
  de: {
    name: SITE_NAME,
    title: "E-Commerce — Sorgfältig ausgewählte Produkte, schneller Versand",
    description:
      "Entdecken Sie sorgfältig ausgewählte Produkte. Schneller Versand, sichere 256-Bit-SSL-Zahlung und 14 Tage kostenlose Rückgabe. Einkaufen auf Deutsch, Englisch und Türkisch.",
    keywords: ["online einkaufen", "e-commerce", "schneller versand", "sichere zahlung", "shop"],
  },
};

// Avrupa Uyanış Hizmetleri markası — vaaz / biblical turizm platformu (varsayılan site markası).
const CEYHUN: Record<Locale, Brand> = {
  tr: {
    name: "Avrupa Uyanış Hizmetleri",
    title: "Avrupa Uyanış Hizmetleri — Vaaz, Biblical Tur & Online Dua",
    description:
      "Avrupa Uyanış Hizmetleri: Kutsal Kitap'ın izinde vaazlar, yazılar ve videolar; İstanbul, 7 Kilise ve Kapadokya için biblical tur başvurusu; online eğitim, dua toplantıları ve yapay zekâ destekli asistan.",
    keywords: ["Avrupa Uyanış Hizmetleri", "kilise vaizi", "biblical turizm", "7 kilise turu", "İstanbul turu", "Kapadokya turu", "hristiyan vaaz", "online dua"],
  },
  en: {
    name: "Avrupa Uyanış Hizmetleri",
    title: "Avrupa Uyanış Hizmetleri — European Awakening Services",
    description:
      "Avrupa Uyanış Hizmetleri (European Awakening Services): sermons, writings and videos in the footsteps of the Scriptures; apply for Istanbul, Seven Churches and Cappadocia biblical tours; online courses, prayer meetings and an AI assistant.",
    keywords: ["Avrupa Uyanış Hizmetleri", "European Awakening Services", "church preacher", "biblical tourism", "seven churches tour", "Istanbul tour", "Cappadocia tour", "online prayer"],
  },
  de: {
    name: "Avrupa Uyanış Hizmetleri",
    title: "Avrupa Uyanış Hizmetleri — Europäische Erweckungsdienste",
    description:
      "Avrupa Uyanış Hizmetleri (Europäische Erweckungsdienste): Predigten, Schriften und Videos auf den Spuren der Schrift; Bewerbung für Istanbul-, Sieben-Kirchen- und Kappadokien-Touren; Online-Kurse, Gebetstreffen und ein KI-Assistent.",
    keywords: ["Avrupa Uyanış Hizmetleri", "Europäische Erweckungsdienste", "Kirchenprediger", "biblischer Tourismus", "Sieben-Kirchen-Tour", "Istanbul-Tour", "Kappadokien-Tour", "Online-Gebet"],
  },
};

// Çok-alan markaları (cleververwaltet.de/.at — Almanca emlak yönetimi).
export function resolveBrand(host: string | null | undefined, locale: Locale): Brand {
  if (host?.includes("cleververwaltet.de")) {
    return {
      name: "Cleververwaltet Deutschland",
      title: "Cleververwaltet Deutschland — Immobilienverwaltung",
      description:
        "Professionelle und transparente Immobilienverwaltung in Deutschland — digital, effizient und zuverlässig.",
      keywords: ["Immobilienverwaltung", "Hausverwaltung", "Deutschland", "Immobilien"],
    };
  }
  if (host?.includes("cleververwaltet.at")) {
    return {
      name: "Cleververwaltet Österreich",
      title: "Cleververwaltet Österreich — Immobilienverwaltung",
      description:
        "Professionelle und transparente Immobilienverwaltung in Österreich — digital, effizient und zuverlässig.",
      keywords: ["Immobilienverwaltung", "Hausverwaltung", "Österreich", "Immobilien"],
    };
  }
  return CEYHUN[locale];
}

// Sayfa bazlı SEO başlık/açıklamaları (locale × sayfa anahtarı).
export type PageKey =
  | "shop"
  | "blog"
  | "contact"
  | "cart"
  | "wishlist"
  | "account"
  | "orders"
  | "admin"
  | "login"
  | "register";

export const PAGE_SEO: Record<Locale, Record<PageKey, { title: string; description: string }>> = {
  tr: {
    shop: { title: "Mağaza", description: "Tüm ürünleri keşfedin — hızlı kargo ve güvenli ödeme." },
    blog: { title: "Blog", description: "Güncel yazılar, rehberler ve ürün haberleri." },
    contact: { title: "İletişim", description: "Bize ulaşın — sorularınız için buradayız." },
    cart: { title: "Sepetim", description: "Sepetinizdeki ürünler." },
    wishlist: { title: "İstek Listem", description: "Beğendiğiniz ürünler." },
    account: { title: "Hesabım", description: "Hesap bilgileriniz." },
    orders: { title: "Siparişlerim", description: "Sipariş geçmişiniz ve takip." },
    admin: { title: "Yönetim", description: "Mağaza yönetim paneli." },
    login: { title: "Giriş Yap", description: "Hesabınıza giriş yapın." },
    register: { title: "Üye Ol", description: "Ücretsiz hesabınızı oluşturun." },
  },
  en: {
    shop: { title: "Store", description: "Explore all products — fast shipping and secure checkout." },
    blog: { title: "Blog", description: "Latest articles, guides and product news." },
    contact: { title: "Contact", description: "Get in touch — we're here for your questions." },
    cart: { title: "Cart", description: "Items in your cart." },
    wishlist: { title: "Wishlist", description: "Products you love." },
    account: { title: "My Account", description: "Your account details." },
    orders: { title: "My Orders", description: "Your order history and tracking." },
    admin: { title: "Admin", description: "Store management panel." },
    login: { title: "Sign In", description: "Sign in to your account." },
    register: { title: "Sign Up", description: "Create your free account." },
  },
  de: {
    shop: { title: "Shop", description: "Alle Produkte entdecken — schneller Versand und sichere Zahlung." },
    blog: { title: "Blog", description: "Aktuelle Artikel, Ratgeber und Produktneuheiten." },
    contact: { title: "Kontakt", description: "Kontaktieren Sie uns — wir sind für Ihre Fragen da." },
    cart: { title: "Warenkorb", description: "Artikel in Ihrem Warenkorb." },
    wishlist: { title: "Wunschliste", description: "Ihre Lieblingsprodukte." },
    account: { title: "Mein Konto", description: "Ihre Kontodaten." },
    orders: { title: "Meine Bestellungen", description: "Ihr Bestellverlauf und Sendungsverfolgung." },
    admin: { title: "Verwaltung", description: "Shop-Verwaltungsbereich." },
    login: { title: "Anmelden", description: "Melden Sie sich bei Ihrem Konto an." },
    register: { title: "Registrieren", description: "Erstellen Sie Ihr kostenloses Konto." },
  },
};

export function pageMeta(locale: Locale, key: PageKey) {
  return PAGE_SEO[locale]?.[key] ?? PAGE_SEO.tr[key];
}

// --- JSON-LD üreticileri ---

export function organizationLd(base: string, brand: Brand) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    url: base,
    logo: `${base}/icon.png`,
    sameAs: [] as string[],
  };
}

export function websiteLd(base: string, locale: Locale, brand: Brand) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brand.name,
    url: base,
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// Ürün detay sayfası için Product + Offer.
export function productLd(opts: {
  base: string;
  locale: Locale;
  url: string;
  name: string;
  description: string;
  image?: string | string[];
  price?: number | string;
  currency?: string;
  sku?: string;
  brand?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  ratingValue?: number;
  reviewCount?: number;
}) {
  const availability = `https://schema.org/${opts.availability ?? "InStock"}`;
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description,
    inLanguage: opts.locale,
    ...(opts.image ? { image: opts.image } : {}),
    ...(opts.sku ? { sku: opts.sku } : {}),
    ...(opts.brand ? { brand: { "@type": "Brand", name: opts.brand } } : {}),
  };
  if (opts.price != null) {
    ld.offers = {
      "@type": "Offer",
      url: opts.url,
      price: String(opts.price),
      priceCurrency: opts.currency ?? "USD",
      availability,
    };
  }
  if (opts.ratingValue != null && opts.reviewCount) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: opts.ratingValue,
      reviewCount: opts.reviewCount,
    };
  }
  return ld;
}

// Kırıntı navigasyonu (breadcrumb) JSON-LD.
export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

// Blog yazısı için Article/BlogPosting.
export function articleLd(opts: {
  locale: Locale;
  url: string;
  headline: string;
  description?: string;
  image?: string | string[];
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  publisher: string;
  base: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: opts.url,
    headline: opts.headline,
    inLanguage: opts.locale,
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.image ? { image: opts.image } : {}),
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    ...(opts.authorName
      ? { author: { "@type": "Person", name: opts.authorName } }
      : {}),
    publisher: {
      "@type": "Organization",
      name: opts.publisher,
      logo: { "@type": "ImageObject", url: `${opts.base}/icon.png` },
    },
  };
}

// <script type="application/ld+json"> gömme yardımcısı için güvenli JSON.
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export { LOCALES };
