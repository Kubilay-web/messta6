// app/(site)/tours/page.tsx — Biblical tur kataloğu + rezervasyon başvurusu.
import type { Metadata } from "next";
import { getCeyhunT } from "@/app/lib/ceyhunT";
import ToursView from "@/app/components/ceyhun/ToursView";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getCeyhunT();
  return { title: t.tours.title, description: t.tours.subtitle };
}

export default function ToursPage() {
  return <ToursView />;
}
