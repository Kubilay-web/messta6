"use client";

// app/components/ceyhun/live/LiveRoom.tsx
// Online dua yayını — tek bileşen hem HOST konsolu hem İZLEYİCİ deneyimi.
// WebRTC video/ses (useLiveRoom) + canlı sohbet + el kaldır→onayla (canlı bağlan) +
// dua isteği (kalıcı + e-posta) + istediğin miktarda bağış.

import { useActionState, useEffect, useRef, useState } from "react";
import {
  Radio, Send, Loader2, Hand, Video, VideoOff, Mic, MicOff, Heart, Check, X, Users, PhoneCall, MessageCircleHeart,
} from "lucide-react";
import { useClientLocale } from "@/app/lib/useLocale";
import type { Locale } from "@/app/lib/ceyhun";
import { submitPrayerRequest, type PublicResult } from "@/app/lib/ceyhun-public-actions";
import DonateWidget from "../DonateWidget";
import VideoTile from "./VideoTile";
import { useLiveRoom } from "./useLiveRoom";

type Config = {
  socketUrl: string;
  iceServers: RTCIceServer[];
  hostToken?: string;
  selfName: string | null;
  userId: string | null;
};

const COPY: Record<Locale, Record<string, string>> = {
  tr: {
    live: "CANLI", offline: "Yayın henüz başlamadı", waiting: "Yayın başlayınca burada görünecek.",
    join: "Yayına katıl", yourName: "Adınız", enter: "Katıl", chat: "Canlı sohbet", say: "Mesaj yaz…",
    connecting: "Bağlanıyor…", support: "Bu hizmete destek ol", raise: "Dua için canlı bağlan",
    lower: "Bağlantı isteğini geri al", requests: "Bağlanma istekleri", approve: "Kabul et", speakers: "Yayındakiler",
    remove: "Yayından çıkar", goLive: "CANLI Yayına Geç", endLive: "Yayını Bitir", console: "Yayın Konsolu",
    enterConsole: "Konsola gir", prayer: "Dua isteği gönder", prayerText: "Dua edilmesini istediğiniz konuyu iletin.",
    request: "Dua konunuz", send: "Gönder", thanks: "Dua isteğiniz alındı. 🙏", watching: "izliyor",
    prayerNotes: "Canlı dua notları", camMic: "Kamera/mikrofon", handHint: "Ceyhun Ağabey onaylayınca canlı bağlanırsınız.",
  },
  en: {
    live: "LIVE", offline: "Stream hasn't started yet", waiting: "It will appear here once live.",
    join: "Join the stream", yourName: "Your name", enter: "Join", chat: "Live chat", say: "Type a message…",
    connecting: "Connecting…", support: "Support this ministry", raise: "Connect live for prayer",
    lower: "Cancel connect request", requests: "Connect requests", approve: "Accept", speakers: "On air",
    remove: "Remove", goLive: "Go LIVE", endLive: "End stream", console: "Broadcast Console",
    enterConsole: "Enter console", prayer: "Send a prayer request", prayerText: "Share what you'd like prayer for.",
    request: "Your prayer request", send: "Send", thanks: "Your prayer request was received. 🙏", watching: "watching",
    prayerNotes: "Live prayer notes", camMic: "Camera/mic", handHint: "You'll go live once approved.",
  },
  de: {
    live: "LIVE", offline: "Stream hat noch nicht begonnen", waiting: "Erscheint hier, sobald live.",
    join: "Stream beitreten", yourName: "Ihr Name", enter: "Beitreten", chat: "Live-Chat", say: "Nachricht…",
    connecting: "Verbindung…", support: "Diesen Dienst unterstützen", raise: "Für Gebet live verbinden",
    lower: "Anfrage zurückziehen", requests: "Verbindungsanfragen", approve: "Annehmen", speakers: "Live",
    remove: "Entfernen", goLive: "LIVE gehen", endLive: "Stream beenden", console: "Broadcast-Konsole",
    enterConsole: "Konsole öffnen", prayer: "Gebetsanliegen senden", prayerText: "Teilen Sie Ihr Anliegen.",
    request: "Ihr Anliegen", send: "Senden", thanks: "Ihr Anliegen wurde empfangen. 🙏", watching: "sehen zu",
    prayerNotes: "Live-Gebetsnotizen", camMic: "Kamera/Mikro", handHint: "Sie gehen nach Freigabe live.",
  },
};

export default function LiveRoom({
  meetingId,
  asHost = false,
}: {
  meetingId: string;
  title: string;
  asHost?: boolean;
}) {
  const locale = useClientLocale();
  const c = COPY[locale] ?? COPY.tr;
  const [config, setConfig] = useState<Config | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/ceyhun/live/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meetingId, asHost }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Bağlanılamadı.");
        if (!alive) return;
        setConfig(data);
        if (data.selfName) setName(data.selfName);
      } catch (e) {
        if (alive) setLoadErr(e instanceof Error ? e.message : "Bağlanılamadı.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [meetingId, asHost]);

  if (loadErr) {
    return <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-600">{loadErr}</div>;
  }
  if (!config) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-ceyhun-ink/10 bg-white py-20 text-ceyhun-slate">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {c.connecting}
      </div>
    );
  }

  // Katılım kapısı
  if (!joined) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-ceyhun-ink/10 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ceyhun-gold/15 text-ceyhun-gold-deep">
          {asHost ? <Radio className="h-7 w-7" /> : <Users className="h-7 w-7" />}
        </div>
        <h3 className="font-syne text-lg font-bold text-ceyhun-ink">{asHost ? c.console : c.join}</h3>
        {!asHost && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={c.yourName}
            className="mt-4 w-full rounded-lg border border-ceyhun-ink/15 px-3 py-2.5 text-sm outline-none focus:border-ceyhun-gold"
          />
        )}
        <button
          onClick={() => setJoined(true)}
          disabled={!asHost && name.trim().length < 2}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ceyhun-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ceyhun-gold-deep disabled:opacity-50"
        >
          {asHost ? c.enterConsole : c.enter}
        </button>
      </div>
    );
  }

  return (
    <LiveRoomInner
      meetingId={meetingId}
      asHost={asHost}
      config={config}
      name={name || config.selfName || "Misafir"}
      c={c}
    />
  );
}

const prayerInitial: PublicResult = { ok: false };

function LiveRoomInner({
  meetingId,
  asHost,
  config,
  name,
  c,
}: {
  meetingId: string;
  asHost: boolean;
  config: Config;
  name: string;
  c: Record<string, string>;
}) {
  const room = useLiveRoom({
    meetingId,
    socketUrl: config.socketUrl,
    iceServers: config.iceServers,
    name,
    hostToken: asHost ? config.hostToken : undefined,
    userId: config.userId,
  });

  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [prayerState, prayerAction, prayerPending] = useActionState(submitPrayerRequest, prayerInitial);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [room.messages]);

  const isPublisher = room.selfRole === "host" || room.selfRole === "speaker";
  const publisherPeers = room.peers.filter((p) => p.role === "host" || p.role === "speaker");
  const tileCount = publisherPeers.length + (room.publishing ? 1 : 0);
  const gridCols = tileCount <= 1 ? "grid-cols-1" : "grid-cols-2";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Sahne + kontroller + bağış */}
      <div className="space-y-5 lg:col-span-2">
        <div className="relative overflow-hidden rounded-2xl bg-black p-2 shadow-lg">
          {tileCount === 0 ? (
            <div className="flex aspect-video flex-col items-center justify-center gap-3 text-white/50">
              <Radio className="h-10 w-10" />
              <p className="font-syne text-lg font-semibold">{c.offline}</p>
              <p className="max-w-xs text-center text-sm text-white/40">{c.waiting}</p>
            </div>
          ) : (
            <div className={`grid gap-2 ${gridCols}`}>
              {room.publishing && (
                <VideoTile stream={room.localStream} name={`${name} (siz)`} role={room.selfRole} muted mirror camOn={room.camOn} />
              )}
              {publisherPeers.map((p) => (
                <VideoTile key={p.id} stream={p.stream} name={p.name} role={p.role} />
              ))}
            </div>
          )}
          {room.live && (
            <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> {c.live}
            </span>
          )}
          <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white">
            <Users className="h-3.5 w-3.5" /> {room.presence.total} {c.watching}
          </span>
        </div>

        {/* Kontrol çubuğu */}
        <div className="flex flex-wrap items-center gap-3">
          {asHost ? (
            <>
              {room.live ? (
                <button onClick={room.endLive} className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black">
                  <X className="h-4 w-4" /> {c.endLive}
                </button>
              ) : (
                <button onClick={room.goLive} className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
                  <Radio className="h-4 w-4" /> {c.goLive}
                </button>
              )}
            </>
          ) : room.selfRole === "viewer" ? (
            room.handRaised ? (
              <button onClick={room.lowerHand} className="inline-flex items-center gap-2 rounded-full bg-ceyhun-gold/20 px-5 py-2.5 text-sm font-semibold text-ceyhun-gold-deep hover:bg-ceyhun-gold/30">
                <Hand className="h-4 w-4" /> {c.lower}
              </button>
            ) : (
              <button onClick={room.raiseHand} className="inline-flex items-center gap-2 rounded-full bg-ceyhun-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ceyhun-gold-deep">
                <PhoneCall className="h-4 w-4" /> {c.raise}
              </button>
            )
          ) : null}

          {/* Yayıncı: kamera/mikrofon */}
          {isPublisher && room.publishing && (
            <>
              <button onClick={room.toggleCam} title={c.camMic}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${room.camOn ? "bg-white text-ceyhun-ink shadow" : "bg-gray-800 text-white"}`}>
                {room.camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </button>
              <button onClick={room.toggleMic}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${room.micOn ? "bg-white text-ceyhun-ink shadow" : "bg-gray-800 text-white"}`}>
                {room.micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>
            </>
          )}
          {!room.connected && <span className="inline-flex items-center gap-1.5 text-xs text-ceyhun-ink/40"><Loader2 className="h-3.5 w-3.5 animate-spin" /> {c.connecting}</span>}
          {room.error && <span className="text-xs text-red-600">{room.error}</span>}
          {room.selfRole === "viewer" && !room.handRaised && <span className="text-xs text-ceyhun-ink/40">{c.handHint}</span>}
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-2 font-syne text-lg font-bold text-ceyhun-ink"><Heart className="h-5 w-5 text-ceyhun-gold" /> {c.support}</h3>
          <DonateWidget campaign="prayer" compact />
        </div>
      </div>

      {/* Yan panel */}
      <aside className="space-y-6">
        {/* Host: bağlanma istekleri */}
        {asHost && (
          <div className="rounded-2xl border border-ceyhun-ink/10 bg-white p-4 shadow-sm">
            <h3 className="mb-2 flex items-center gap-1.5 font-syne text-sm font-bold uppercase tracking-wide text-ceyhun-ink/60"><Hand className="h-4 w-4 text-ceyhun-gold-deep" /> {c.requests}</h3>
            {room.hands.length === 0 ? (
              <p className="py-2 text-center text-xs text-ceyhun-ink/30">—</p>
            ) : (
              <ul className="space-y-1.5">
                {room.hands.map((h) => (
                  <li key={h.id} className="flex items-center justify-between rounded-lg bg-ceyhun-cream-deep/40 px-3 py-1.5 text-sm">
                    <span className="truncate">{h.name}</span>
                    <button onClick={() => room.approve(h.id)} className="inline-flex items-center gap-1 rounded-full bg-ceyhun-ink px-3 py-1 text-xs font-semibold text-white hover:bg-ceyhun-gold-deep"><Check className="h-3 w-3" /> {c.approve}</button>
                  </li>
                ))}
              </ul>
            )}
            {publisherPeers.some((p) => p.role === "speaker") && (
              <>
                <h4 className="mb-1.5 mt-3 text-xs font-semibold text-ceyhun-ink/50">{c.speakers}</h4>
                <ul className="space-y-1.5">
                  {publisherPeers.filter((p) => p.role === "speaker").map((p) => (
                    <li key={p.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5 text-sm">
                      <span className="truncate">{p.name}</span>
                      <button onClick={() => room.revoke(p.id)} className="rounded-full p-1 text-red-500 hover:bg-red-50"><X className="h-4 w-4" /></button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {/* Canlı sohbet */}
        <div className="flex h-[26rem] flex-col overflow-hidden rounded-2xl border border-ceyhun-ink/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-ceyhun-ink/10 px-4 py-3">
            <MessageCircleHeart className="h-4 w-4 text-ceyhun-gold-deep" />
            <h3 className="font-syne text-sm font-bold uppercase tracking-wide text-ceyhun-ink/60">{c.chat}</h3>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
            {room.messages.map((m) => (
              <div key={m.id} className="text-sm">
                <span className={`mr-1 font-semibold ${m.role === "host" ? "text-ceyhun-gold-deep" : "text-ceyhun-ink/70"}`}>{m.role === "host" ? "★ " : ""}{m.from}:</span>
                <span className="text-ceyhun-ink/80">{m.text}</span>
              </div>
            ))}
            {room.messages.length === 0 && <p className="mt-6 text-center text-xs text-ceyhun-ink/30">—</p>}
          </div>
          <div className="flex items-center gap-2 border-t border-ceyhun-ink/10 p-3">
            <input value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) { room.sendChat(text); setText(""); } }}
              placeholder={c.say} className="min-w-0 flex-1 rounded-full border border-ceyhun-ink/15 px-4 py-2 text-sm outline-none focus:border-ceyhun-gold" />
            <button onClick={() => { if (text.trim()) { room.sendChat(text); setText(""); } }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ceyhun-gold text-ceyhun-ink hover:bg-ceyhun-gold-deep hover:text-white"><Send className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Host: canlı dua notları */}
        {asHost && room.prayerNotes.length > 0 && (
          <div className="rounded-2xl border border-ceyhun-ink/10 bg-white p-4 shadow-sm">
            <h3 className="mb-2 font-syne text-sm font-bold uppercase tracking-wide text-ceyhun-ink/60">{c.prayerNotes}</h3>
            <ul className="max-h-40 space-y-1.5 overflow-y-auto">
              {room.prayerNotes.map((n) => (
                <li key={n.id} className="rounded-lg bg-ceyhun-cream-deep/40 p-2 text-sm"><span className="font-medium">{n.from}:</span> 🙏 {n.text}</li>
              ))}
            </ul>
          </div>
        )}

        {/* İzleyici: dua isteği (kalıcı + e-posta) */}
        {!asHost && (
          <div className="rounded-2xl border border-ceyhun-ink/10 bg-white p-5 shadow-sm">
            <h3 className="font-syne text-base font-bold text-ceyhun-ink">{c.prayer}</h3>
            <p className="mt-1 text-sm text-ceyhun-slate">{c.prayerText}</p>
            {prayerState.ok ? (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700"><Check className="h-4 w-4" /> {c.thanks}</div>
            ) : (
              <form action={prayerAction} className="mt-3 space-y-2">
                <input type="hidden" name="meetingId" value={meetingId} />
                <input type="text" name="company" tabIndex={-1} autoComplete="off" className="absolute left-[-9999px]" aria-hidden />
                <input name="name" required defaultValue={name} placeholder={c.yourName} className="w-full rounded-lg border border-ceyhun-ink/15 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold" />
                <input name="email" type="email" required placeholder="E-posta" className="w-full rounded-lg border border-ceyhun-ink/15 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold" />
                <textarea name="prayerRequest" rows={3} placeholder={c.request} className="w-full resize-y rounded-lg border border-ceyhun-ink/15 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold" />
                {prayerState.message && !prayerState.ok && <p className="text-xs text-red-600">{prayerState.message}</p>}
                <button type="submit" disabled={prayerPending} className="inline-flex items-center gap-2 rounded-full bg-ceyhun-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ceyhun-gold-deep disabled:opacity-60">
                  {prayerPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {c.send}
                </button>
              </form>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
