// app/lib/ceyhun-roles.ts
// SAF rol/yetenek mantığı — next/headers importu YOK. Hem sunucu hem istemci
// bileşenlerinden güvenle import edilir. Sunucu guard'ları (validateRequest gerektiren)
// ceyhun-auth.ts içindedir.
//
// İKİ ROL:
//   OWNER  → tam yetki (admin paneli + her şey)
//   VIEWER → sıradan üye (yalnızca admin olmayan sayfalar; panele giremez)

export type CeyhunRole = "OWNER" | "VIEWER";

export const CEYHUN_ROLES: CeyhunRole[] = ["OWNER", "VIEWER"];

export const CEYHUN_ROLE_LABEL: Record<CeyhunRole, string> = {
  OWNER: "Sahip (tam yetki)",
  VIEWER: "Üye",
};

export const CEYHUN_ROLE_DESC: Record<CeyhunRole, string> = {
  OWNER: "Admin paneli + içerik, tur, dua, bağış ve kullanıcı yönetimi",
  VIEWER: "Sıradan üye — yalnızca herkese açık sayfalar",
};

export type Capability = "content" | "tours" | "prayer" | "donations" | "users" | "upload";

// İki rol modelinde tüm yönetim yetenekleri yalnızca OWNER'a aittir; VIEWER'da hiçbiri yoktur.
const CAP_ROLES: Record<Capability, CeyhunRole[]> = {
  content: ["OWNER"],
  tours: ["OWNER"],
  prayer: ["OWNER"],
  donations: ["OWNER"],
  users: ["OWNER"],
  upload: ["OWNER"],
};

// Admin yolları → gerekli yetenek (sidebar & sayfa guard'ları için).
export const SECTION_CAP: Record<string, Capability> = {
  "/admin/profile": "content",
  "/admin/articles": "content",
  "/admin/gallery": "content",
  "/admin/videos": "content",
  "/admin/courses": "content",
  "/admin/tours": "tours",
  "/admin/prayer": "prayer",
  "/admin/donations": "donations",
  "/admin/users": "users",
};

// Admin panelini görebilen roller. VIEWER giremez.
export const PANEL_ROLES: CeyhunRole[] = ["OWNER"];

export function isCeyhunRole(v: unknown): v is CeyhunRole {
  return typeof v === "string" && (CEYHUN_ROLES as string[]).includes(v);
}

// Eski invenimusRole → CeyhunRole eşlemesi. ADMIN → OWNER, diğer her şey → VIEWER (üye tabanı).
export function fromInvenimusRole(r: string | null | undefined): CeyhunRole {
  return r === "ADMIN" ? "OWNER" : "VIEWER";
}

type RoleBearer = { ceyhunRole?: string | null; invenimusRole?: string | null } | null | undefined;

// Kullanıcının etkin Ceyhun rolü: ceyhunRole öncelikli, yoksa invenimusRole'den türetilir.
// Hiçbir sinyal yoksa taban rol VIEWER'dır (her kullanıcı en az üyedir).
export function resolveCeyhunRole(user: RoleBearer): CeyhunRole {
  if (isCeyhunRole(user?.ceyhunRole)) return user!.ceyhunRole as CeyhunRole;
  return fromInvenimusRole(user?.invenimusRole);
}

// Rol, verilen yeteneğe sahip mi? (Pratikte: OWNER → her şey, VIEWER → hiçbir şey.)
export function can(role: CeyhunRole | null, cap: Capability): boolean {
  return !!role && CAP_ROLES[cap].includes(role);
}

// Rol admin paneline erişebilir mi? (VIEWER / null → hayır)
export function canAccessPanel(role: CeyhunRole | null): boolean {
  return !!role && PANEL_ROLES.includes(role);
}

// Panelde görünmesi gereken bölümler (sidebar filtresi).
export function visibleSections(role: CeyhunRole | null): string[] {
  if (!role) return [];
  return Object.entries(SECTION_CAP)
    .filter(([, cap]) => can(role, cap))
    .map(([href]) => href);
}
