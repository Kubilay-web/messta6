// scripts/grant-ceyhun-admin.mjs
// Bir kullanıcıya Ceyhun yönetim rolü atar (varsayılan: OWNER = tam yetki).
//
// Kullanım (önce Google ile bir kez giriş yapıp kullanıcı kaydını oluşturun):
//   node scripts/grant-ceyhun-admin.mjs e-posta@ornek.com            → OWNER yapar
//   node scripts/grant-ceyhun-admin.mjs e-posta@ornek.com EDITOR     → belirli rol
//   node scripts/grant-ceyhun-admin.mjs                              → kullanıcıları listeler
//
// Roller: OWNER (tam yetki) | VIEWER (üye)

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const ROLES = ["OWNER", "VIEWER"];
const email = process.argv[2];
const role = (process.argv[3] || "OWNER").toUpperCase();

try {
  if (!email) {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, username: true, ceyhunRole: true },
      take: 50,
    });
    console.log("Kullanıcılar:");
    for (const u of users) {
      console.log(`  ${u.email ?? u.username ?? u.id}  →  ceyhunRole: ${u.ceyhunRole ?? "—"}`);
    }
    console.log("\nYetki vermek için: node scripts/grant-ceyhun-admin.mjs <email> [ROL]");
    console.log("Roller:", ROLES.join(" | "));
  } else if (!ROLES.includes(role)) {
    console.error(`✗ Geçersiz rol "${role}". Geçerli: ${ROLES.join(", ")}`);
    process.exit(1);
  } else {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      console.error(`✗ "${email}" bulunamadı. Önce siteye Google ile bir kez giriş yapın.`);
      process.exit(1);
    }
    await prisma.user.update({ where: { id: user.id }, data: { ceyhunRole: role } });
    console.log(`✓ ${email} artık ${role}. /admin paneline erişebilir.`);
  }
} catch (e) {
  console.error("Hata:", e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
