// app/lib/ceyhun-live.ts
// Online dua yayını (WebRTC + socket.io) için SUNUCU yardımcıları.
// Host (Ceyhun) yayın açma yetkisini HMAC imzalı kısa ömürlü token ile kanıtlar;
// live-server aynı LIVE_HOST_SECRET ile doğrular. TURN kimlik bilgileri istemciye
// yalnız bu sunucu üzerinden verilir (bundle'a gömülmez).

import "server-only";
import crypto from "crypto";

const SECRET = process.env.LIVE_HOST_SECRET || "";

export function isLiveConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_LIVE_URL);
}

export function liveSocketUrl(): string {
  return (process.env.NEXT_PUBLIC_LIVE_URL || "").replace(/\/+$/, "");
}

// Host token: "<meetingId>.<exp>.<hmac>" — varsayılan 2 saat geçerli.
export function signLiveHostToken(meetingId: string, ttlSec = 7200): string {
  if (!SECRET) return "";
  const exp = Math.round(Date.now() / 1000) + ttlSec;
  const sig = crypto.createHmac("sha256", SECRET).update(`${meetingId}.${exp}`).digest("hex");
  return `${meetingId}.${exp}.${sig}`;
}

export type IceServer = { urls: string | string[]; username?: string; credential?: string };

// ICE sunucuları: varsayılan ücretsiz Google STUN + opsiyonel TURN (env ile).
export function getIceServers(): IceServer[] {
  const servers: IceServer[] = [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
  ];
  const turnUrl = process.env.LIVE_TURN_URL;
  if (turnUrl) {
    servers.push({
      urls: turnUrl.split(",").map((s) => s.trim()),
      username: process.env.LIVE_TURN_USER || "",
      credential: process.env.LIVE_TURN_CRED || "",
    });
  }
  return servers;
}
