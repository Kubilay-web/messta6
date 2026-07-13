"use client";

// app/components/LocaleLink.tsx
// next/link sarmalayıcı: string href'leri geçerli dil önekiyle üretir
// (/register → /tr/register). Harici/relatif/hash/query ve zaten önekli
// yollara dokunmaz (bkz. localizedHref). Object href'ler değiştirilmez.
//   import Link from "@/app/components/LocaleLink";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { localizedHref, type Locale } from "@/app/lib/i18n-routing";
import { useClientLocale } from "@/app/lib/useLocale";

export function useCurrentLocale(): Locale {
  return useClientLocale() as Locale;
}

type LinkProps = React.ComponentProps<typeof Link>;

const LocaleLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function LocaleLink({ href, ...rest }, ref) {
    const locale = useClientLocale() as Locale;
    const finalHref =
      typeof href === "string" ? localizedHref(locale, href) : href;
    return <Link ref={ref} href={finalHref} {...rest} />;
  }
);

export default LocaleLink;

// Geriye dönük uyumluluk.
export function useLocaleRouter() {
  return useRouter();
}
