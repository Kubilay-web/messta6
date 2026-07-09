"use client";

// app/components/LocaleLink.tsx
// Locale ARTIK URL'de taşınmadığı için bu bileşen next/link'e ince bir sarmalayıcıdır:
// href'e önek eklemez. Mevcut importlar bozulmasın diye korunur.
//   import Link from "@/app/components/LocaleLink";  // = next/link davranışı

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { type Locale } from "@/app/lib/i18n-routing";
import { useClientLocale } from "@/app/lib/useLocale";

// Geçerli dili çerezden türet (URL öneki yok).
export function useCurrentLocale(): Locale {
  return useClientLocale();
}

type LinkProps = React.ComponentProps<typeof Link>;

const LocaleLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function LocaleLink({ href, ...rest }, ref) {
    return <Link ref={ref} href={href} {...rest} />;
  }
);

export default LocaleLink;

// Geriye dönük uyumluluk: router.push/replace artık öneksiz çalışır.
export function useLocaleRouter() {
  return useRouter();
}
