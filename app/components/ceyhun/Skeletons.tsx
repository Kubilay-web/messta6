// app/components/ceyhun/Skeletons.tsx
// Yeniden kullanılabilir iskelet (skeleton) bileşenleri.
// Hem `loading.tsx` streaming fallback'lerinde hem de dinamik import `loading`
// seçeneğinde kullanılır. Saf markup → sunucu bileşeni (JS maliyeti yok).

export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block animate-pulse rounded-xl bg-ceyhun-ink/10 ${className}`}
      aria-hidden
    />
  );
}

/** Kart ızgarası iskeleti (yazılar/videolar/galeri listeleri için). */
export function CardGridSkeleton({
  count = 6,
  columns = 3,
}: {
  count?: number;
  columns?: 2 | 3 | 4;
}) {
  const cols =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={`grid grid-cols-1 gap-6 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-ceyhun-ink/10 bg-white/40"
        >
          <Shimmer className="aspect-[16/10] rounded-none" />
          <div className="space-y-3 p-4">
            <Shimmer className="h-3 w-20" />
            <Shimmer className="h-5 w-3/4" />
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Sayfa başlığı (hero) iskeleti. */
export function PageHeroSkeleton() {
  return (
    <div className="bg-ceyhun-ink/95 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl space-y-4">
        <Shimmer className="h-3 w-24 bg-white/15" />
        <Shimmer className="h-10 w-2/3 bg-white/15" />
        <Shimmer className="h-4 w-1/2 bg-white/10" />
      </div>
    </div>
  );
}

/** Genel içerik listesi iskeleti (hero + kart ızgarası). */
export function ListPageSkeleton({
  count = 6,
  columns = 3,
}: {
  count?: number;
  columns?: 2 | 3 | 4;
}) {
  return (
    <>
      <PageHeroSkeleton />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <CardGridSkeleton count={count} columns={columns} />
      </div>
    </>
  );
}
