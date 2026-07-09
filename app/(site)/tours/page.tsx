// app/(site)/tours/page.tsx — Biblical tur kataloğu + rezervasyon başvurusu.
import type { Metadata } from "next";
import ToursView from "@/app/components/ceyhun/ToursView";

export const metadata: Metadata = {
  title: "Biblical Turlar — İstanbul, 7 Kilise, Kapadokya",
  description: "Türkiye'de biblical turizm için başvurun: İstanbul, 7 Kilise ve Kapadokya turları; tur ve konaklama ayarlanır.",
};

export default function ToursPage() {
  return <ToursView />;
}
