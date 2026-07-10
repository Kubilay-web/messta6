// app/api/ceyhun/prayer/token/route.ts
// Online dua odası canlı sohbeti için Stream token'ı üretir.
// Giriş yapan kullanıcı kendi kimliğiyle, yapmayan "misafir" kimliğiyle katılır.
// Kanal tipi "livestream" → herkes okuyabilir, katılanlar yazabilir.

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import prisma from "@/app/lib/prisma";
import { validateRequest } from "@/app/auth";
import streamServerClient from "@/app/lib/stream";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY;
  if (!apiKey || !process.env.STREAM_SECRET) {
    return NextResponse.json({ error: "Canlı sohbet yapılandırılmamış." }, { status: 500 });
  }

  let body: { meetingId?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const meetingId = String(body.meetingId ?? "");
  const meeting = await prisma.ceyhunPrayerMeeting.findUnique({ where: { id: meetingId } });
  if (!meeting) return NextResponse.json({ error: "Toplantı bulunamadı." }, { status: 404 });

  const { user } = await validateRequest();
  const userId = user?.id ?? `guest-${randomUUID().slice(0, 8)}`;
  const userName =
    user?.displayName || user?.username || (body.name ? String(body.name).slice(0, 60) : "Misafir");

  const channelId = `prayer-${meetingId}`.slice(0, 60);

  try {
    await streamServerClient.upsertUser({ id: userId, name: userName });

    // Kanalı sunucuda oluştur/getir (idempotent). Yayıncı: Ceyhun (sabit id).
    const channel = streamServerClient.channel("livestream", channelId, {
      created_by_id: "ceyhun-host",
      // @ts-expect-error özel alanlar Stream tarafından serbestçe kabul edilir
      name: `Dua: ${meeting.slug}`,
    });
    await streamServerClient.upsertUser({ id: "ceyhun-host", name: "Avrupa Uyanış Hizmetleri" });
    await channel.create().catch(() => {}); // zaten varsa yut

    const token = streamServerClient.createToken(userId);

    return NextResponse.json({
      apiKey,
      token,
      userId,
      userName,
      channelType: "livestream",
      channelId,
    });
  } catch (e) {
    console.error("prayer token", e);
    return NextResponse.json({ error: "Sohbete bağlanılamadı." }, { status: 502 });
  }
}
