import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// componentsMainpage şablonu "@/lib/utils" yolundan cn bekliyor. Projedeki
// asıl @/app/lib/utils Prisma/ColorThief gibi sunucu bağımlılıkları taşıdığı
// için istemci bileşenlerinde kullanılamaz; bu hafif shim onun yerine geçer.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
