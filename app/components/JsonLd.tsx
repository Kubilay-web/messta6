// app/components/JsonLd.tsx
// Yapısal veriyi (schema.org) <script type="application/ld+json"> olarak gömer.
import { jsonLdScript } from "@/app/lib/seo";

export default function JsonLd({ data }: { data: unknown | unknown[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(d) }}
        />
      ))}
    </>
  );
}
