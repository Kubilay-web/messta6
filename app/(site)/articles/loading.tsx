// Streaming fallback — Next, sunucu verisi hazırlanırken bu iskeleti anında gösterir.
import { ListPageSkeleton } from "@/app/components/ceyhun/Skeletons";
export default function Loading() {
  return <ListPageSkeleton count={6} columns={3} />;
}
