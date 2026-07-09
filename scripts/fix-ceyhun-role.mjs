// scripts/fix-ceyhun-role.mjs
// Geçersiz ceyhunRole değerlerini onarır. MongoDB'de "users" koleksiyonundaki bazı
// kayıtların ceyhunRole alanı enum'da olmayan bir değer (ör. "ADMIN") tutuyorsa,
// Prisma findMany bu satırları okurken çöker. Bu script raw komutla düzeltir:
//   "ADMIN" → "OWNER" (eski süper-admin karşılığı)
//   diğer geçersiz değerler → alan kaldırılır (null = normal kullanıcı)

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const VALID = ["OWNER", "VIEWER"];

try {
  // 1) ADMIN → OWNER
  const admin = await prisma.$runCommandRaw({
    update: "users",
    updates: [{ q: { ceyhunRole: "ADMIN" }, u: { $set: { ceyhunRole: "OWNER" } }, multi: true }],
  });
  console.log(`ADMIN → OWNER  : eşleşen ${admin.n ?? 0}, güncellenen ${admin.nModified ?? 0}`);

  // 2) Geçerli olmayan + null olmayan diğer tüm değerler → alanı kaldır
  const others = await prisma.$runCommandRaw({
    update: "users",
    updates: [
      {
        q: { ceyhunRole: { $nin: [...VALID, null] } },
        u: { $unset: { ceyhunRole: "" } },
        multi: true,
      },
    ],
  });
  console.log(`Diğer geçersiz → kaldırıldı: eşleşen ${others.n ?? 0}, güncellenen ${others.nModified ?? 0}`);

  // 3) Doğrulama: artık geçersiz kayıt kalmadı mı?
  const bad = await prisma.$runCommandRaw({
    count: "users",
    query: { ceyhunRole: { $nin: [...VALID, null] } },
  });
  console.log(`Kalan geçersiz kayıt: ${bad.n ?? 0}`);
  console.log(bad.n ? "✗ Hâlâ geçersiz kayıt var!" : "✓ Temiz — Prisma artık okuyabilir.");
} catch (e) {
  console.error("Hata:", e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
