// app/api/ceyhun/live/token/route.ts
// Online dua yayını için istemci yapılandırması döner:
//   { socketUrl, iceServers, hostToken?, selfName, userId }
// hostToken YALNIZ "prayer" yetkisi olan (OWNER) kullanıcı asHost:true isterse verilir.

import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { validateRequest } from "@/app/auth";
import { requireCeyhunCap } from "@/app/lib/ceyhun-auth";
import { isLiveConfigured, liveSocketUrl, getIceServers, signLiveHostToken } from "@/app/lib/ceyhun-live";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isLiveConfigured()) {
    return NextResponse.json(
      { error: "Canlı yayın sunucusu yapılandırılmamış (NEXT_PUBLIC_LIVE_URL eksik)." },
      { status: 500 }
    );
  }

  let body: { meetingId?: string; asHost?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const meetingId = String(body.meetingId ?? "");
  const meeting = await prisma.ceyhunPrayerMeeting.findUnique({
    where: { id: meetingId },
    select: { id: true },
  });
  if (!meeting) return NextResponse.json({ error: "Toplantı bulunamadı." }, { status: 404 });

  const { user } = await validateRequest();

  let hostToken: string | undefined;
  if (body.asHost) {
    try {
      await requireCeyhunCap("prayer"); // yalnız OWNER yayın açabilir
    } catch {
      return NextResponse.json({ error: "Yayın açma yetkiniz yok." }, { status: 403 });
    }
    hostToken = signLiveHostToken(meetingId);
  }

  return NextResponse.json({
    socketUrl: liveSocketUrl(),
    iceServers: getIceServers(),
    hostToken,
    selfName: user?.displayName || user?.username || null,
    userId: user?.id || null,
  });
}
