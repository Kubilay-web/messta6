import type { Metadata } from "next";
import { Syne, Inter } from "next/font/google";
import "./globals.scss";
import ClientProviders from "./ClientProviders";

// KOTA tarzı tipografi: Syne (display başlıklar) + neutral grotesk gövde.
const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
import { validateRequest } from "./auth";
import SessionProvider from "./SessionProvider";
import { headers } from "next/headers";
import { getServerLocale } from "./lib/locale";
import {
  buildAlternates,
  siteUrl,
  OG_LOCALE,
  LOCALES,
  type Locale,
} from "./lib/i18n-routing";
import { resolveBrand, organizationLd, websiteLd } from "./lib/seo";
import JsonLd from "./components/JsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = h.get("x-hostname");
  const internalPath = h.get("x-internal-path") || "/";
  const locale = (await getServerLocale()) as Locale;

  const base = siteUrl(host);
  const brand = resolveBrand(host, locale);
  const alternates = buildAlternates(locale, internalPath, base);

  return {
    metadataBase: new URL(base),
    title: {
      default: brand.title,
      template: `%s | ${brand.name}`,
    },
    description: brand.description,
    applicationName: brand.name,
    keywords: brand.keywords,
    authors: [{ name: brand.name }],
    creator: brand.name,
    publisher: brand.name,
    formatDetection: { email: false, address: false, telephone: false },
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      type: "website",
      siteName: brand.name,
      title: brand.title,
      description: brand.description,
      url: alternates.canonical,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    twitter: {
      card: "summary_large_image",
      title: brand.title,
      description: brand.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
    manifest: "/manifest.webmanifest",
  };
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();
  const h = await headers();
  const host = h.get("x-hostname");
  const lang = (await getServerLocale()) as Locale;

  const base = siteUrl(host);
  const brand = resolveBrand(host, lang);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${syne.variable} ${inter.variable}`}
    >
      <head>
        <JsonLd
          data={[organizationLd(base, brand), websiteLd(base, lang, brand)]}
        />
      </head>

      <body>
        <SessionProvider value={session}>
          <ClientProviders>{children}</ClientProviders>
        </SessionProvider>
      </body>
    </html>
  );
}
