// app/admin/content/kinds.ts
// İçerik türleri — hem sunucu (page) hem istemci (ContentManager) tarafından
// kullanılır. "use client" modülünden dışa aktarılmadığı için sunucu bileşenlerinde
// gerçek dizi olarak okunabilir.

export const KINDS = [
  { key: "venture", label: "Portföy", metaHint: '{"year":"2025","tag":"Fintech","color":"#d8f34e"}' },
  { key: "service", label: "Hizmet", metaHint: '{"tag":"Full-stack"}' },
  { key: "testimonial", label: "Referans", metaHint: '{"name":"Elif Demir","role":"Kurucu, Fintra"}' },
  { key: "faq", label: "SSS", metaHint: "{}" },
] as const;

export const kindLabel = (k: string) =>
  KINDS.find((x) => x.key === k)?.label ?? k;
