"use client";

// app/components/ceyhun/LocaleProvider.tsx
// Geçerli dili tüm istemci bileşenlerine (useClientLocale/useCeyhunT) aktarır.
//
// Kaynak: URL öneki (usePathname → "/en/..."). Böylece dil değiştirici
// router.push('/en/...') yapınca URL değişir → bu provider ANINDA yeni dili
// yayınlar → tüm client içerik senkron çevrilir (sayfa yenilemeye GEREK YOK).
// Kök layout paylaşıldığı ve client geçişte yeniden çalışmadığı için sunucudan
// gelen `locale` yalnızca SSR/ilk yük yedeği olarak kullanılır (flash olmaz).

import { usePathname } from "next/navigation";
import { LocaleContext, type ClientLocale } from "@/app/lib/useLocale";
import { isLocale } from "@/app/lib/i18n-routing";

export default function LocaleProvider({
  locale: initial,
  children,
}: {
  locale: ClientLocale;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const seg = (pathname ?? "").split("/")[1];
  // URL öneki geçerli bir dilse onu kullan (client'ta canlı güncellenir);
  // değilse (SSR'de rewrite sonrası öneksiz olabilir) sunucu değerine düş.
  const locale: ClientLocale = isLocale(seg) ? (seg as ClientLocale) : initial;

  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}
