// app/components/ceyhun/lazy.tsx
// ────────────────────────────────────────────────────────────────────────────
// GELİŞMİŞ KOD BÖLME (Code splitting) — ağır istemci bileşenlerinin tembel
// yüklenen (lazy) sürümleri. Ana sayfa/liste sayfaları bu sürümleri kullanınca
// bileşenin JS'i ayrı bir chunk'a taşınır ve yalnızca gerektiğinde indirilir;
// böylece ilk yük (initial bundle) küçülür.
//
// ssr: true (varsayılan) korunur → içerik yine sunucuda render edilir (SEO/LCP),
// yalnızca istemci JS'i bölünür. Yükleme sırasında iskelet gösterilir.
// ────────────────────────────────────────────────────────────────────────────

import dynamic from "next/dynamic";
import { CardGridSkeleton } from "./Skeletons";

export const LazyVideoGallery = dynamic(() => import("./VideoGallery"), {
  loading: () => <CardGridSkeleton count={3} columns={3} />,
});

export const LazyPhotoGallery = dynamic(() => import("./PhotoGallery"), {
  loading: () => <CardGridSkeleton count={8} columns={4} />,
});
