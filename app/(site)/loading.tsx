// Ana sayfa streaming fallback (hero + kart ızgarası iskeleti).
import { PageHeroSkeleton, CardGridSkeleton } from "@/app/components/ceyhun/Skeletons";
export default function Loading() {
  return (
    <>
      <PageHeroSkeleton />
      <div className="mx-auto max-w-6xl space-y-16 px-4 py-16 sm:px-6 sm:py-20">
        <CardGridSkeleton count={3} columns={3} />
        <CardGridSkeleton count={3} columns={3} />
      </div>
    </>
  );
}
