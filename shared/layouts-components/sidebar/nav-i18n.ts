// shared/layouts-components/sidebar/nav-i18n.ts
// Sidebar menü başlıkları için TR/EN/DE çeviri haritası.
// Kaynak (anahtar) Türkçe başlıktır; tr için olduğu gibi döner, en/de için
// karşılığı yoksa yine kaynağı döndürür (zarif geri dönüş).

import { ClientLocale } from "@/app/lib/useLocale";

const NAV_DICT: Record<"en" | "de", Record<string, string>> = {
  en: {
    // Bölüm başlıkları (menutitle)
    "MAĞAZA": "STORE",
    // Menü öğeleri (title)
    Shop: "Shop",
    Anasayfa: "Home",
    Mağaza: "Store",
    Blog: "Blog",
    Siparişlerim: "My Orders",
    Sepetim: "My Cart",
    "İstek Listem": "My Wishlist",
    Hesabım: "My Account",
    "Bize Ulaşın": "Contact Us",
    "Admin Paneli": "Admin Panel",
  },
  de: {
    "MAĞAZA": "SHOP",
    Shop: "Shop",
    Anasayfa: "Startseite",
    Mağaza: "Shop",
    Blog: "Blog",
    Siparişlerim: "Meine Bestellungen",
    Sepetim: "Mein Warenkorb",
    "İstek Listem": "Meine Wunschliste",
    Hesabım: "Mein Konto",
    "Bize Ulaşın": "Kontakt",
    "Admin Paneli": "Admin-Panel",
  },
};

export function translateNav(
  text: string | undefined | null,
  lang: ClientLocale
): string {
  if (!text) return text ?? "";
  if (lang === "tr") return text;
  return NAV_DICT[lang]?.[text] ?? text;
}
