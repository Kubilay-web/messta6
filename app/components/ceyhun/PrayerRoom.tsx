"use client";

// app/components/ceyhun/PrayerRoom.tsx
// Online dua odası (Twitch benzeri): canlı yayın embed + gerçek canlı sohbet (Stream) +
// dua isteği formu + istediğin miktarda bağış. Ekstra UI paketi kullanmadan stream-chat
// tarayıcı client'ı ile.

import { useActionState, useEffect, useRef, useState } from "react";
import { StreamChat, type Channel, type Event } from "stream-chat";
import { Send, Loader2, Radio, Heart, MessageCircleHeart, Check } from "lucide-react";
import { useClientLocale } from "@/app/lib/useLocale";
import { videoEmbedUrl, type Locale } from "@/app/lib/ceyhun";
import { submitPrayerRequest, type PublicResult } from "@/app/lib/ceyhun-public-actions";
import DonateWidget from "./DonateWidget";

type Msg = { id: string; text: string; user: string; own: boolean };

const COPY: Record<Locale, Record<string, string>> = {
  tr: { live: "CANLI", offline: "Yayın henüz başlamadı", waiting: "Yayın başladığında burada görünecek.", join: "Sohbete katıl", yourName: "Adınız", enter: "Katıl", chat: "Canlı sohbet", placeholder: "Mesaj yaz…", connecting: "Bağlanıyor…", prayer: "Dua isteği gönder", prayerText: "Dua edilmesini istediğiniz konuyu bize iletin; dualarımızda anılacak.", request: "Dua konunuz", send: "Gönder", thanks: "Dua isteğiniz alındı. 🙏", support: "Bu hizmete destek ol", errConnect: "Bağlanılamadı.", errSend: "Mesaj gönderilemedi.", email: "E-posta" },
  en: { live: "LIVE", offline: "Stream hasn't started yet", waiting: "It will appear here when the stream goes live.", join: "Join the chat", yourName: "Your name", enter: "Join", chat: "Live chat", placeholder: "Type a message…", connecting: "Connecting…", prayer: "Send a prayer request", prayerText: "Share what you'd like prayer for; it will be lifted up.", request: "Your prayer request", send: "Send", thanks: "Your prayer request was received. 🙏", support: "Support this ministry", errConnect: "Could not connect.", errSend: "Message could not be sent.", email: "Email" },
  de: { live: "LIVE", offline: "Stream hat noch nicht begonnen", waiting: "Es erscheint hier, sobald der Stream live geht.", join: "Chat beitreten", yourName: "Ihr Name", enter: "Beitreten", chat: "Live-Chat", placeholder: "Nachricht schreiben…", connecting: "Verbindung…", prayer: "Gebetsanliegen senden", prayerText: "Teilen Sie, wofür gebetet werden soll.", request: "Ihr Gebetsanliegen", send: "Senden", thanks: "Ihr Gebetsanliegen wurde empfangen. 🙏", support: "Diesen Dienst unterstützen", errConnect: "Verbindung fehlgeschlagen.", errSend: "Nachricht konnte nicht gesendet werden.", email: "E-Mail" },
};

const prayerInitial: PublicResult = { ok: false };

export default function PrayerRoom({
  meetingId,
  title,
  embedUrl,
  isLive,
}: {
  meetingId: string;
  title: string;
  embedUrl: string | null;
  isLive: boolean;
}) {
  const locale = useClientLocale();
  const c = COPY[locale] ?? COPY.tr;

  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const channelRef = useRef<Channel | null>(null);
  const clientRef = useRef<StreamChat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [prayerState, prayerAction, prayerPending] = useActionState(submitPrayerRequest, prayerInitial);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  // Temizlik
  useEffect(() => {
    return () => {
      channelRef.current?.stopWatching().catch(() => {});
      clientRef.current?.disconnectUser().catch(() => {});
    };
  }, []);

  async function join() {
    setError(null);
    setConnecting(true);
    try {
      const res = await fetch("/api/ceyhun/prayer/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || c.errConnect);

      const client = StreamChat.getInstance(data.apiKey);
      if (client.userID && client.userID !== data.userId) await client.disconnectUser();
      if (!client.userID) {
        await client.connectUser({ id: data.userId, name: data.userName }, data.token);
      }
      clientRef.current = client;

      const channel = client.channel(data.channelType, data.channelId);
      await channel.watch();
      channelRef.current = channel;

      const mapMsg = (m: { id: string; text?: string; user?: { id?: string; name?: string } }): Msg => ({
        id: m.id,
        text: m.text ?? "",
        user: m.user?.name || m.user?.id || "—",
        own: m.user?.id === data.userId,
      });

      setMessages(channel.state.messages.filter((m) => m.text).map((m) => mapMsg(m as never)));
      channel.on("message.new", (ev: Event) => {
        if (ev.message) setMessages((prev) => [...prev, mapMsg(ev.message as never)]);
      });

      setJoined(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : c.errConnect);
    } finally {
      setConnecting(false);
    }
  }

  async function send() {
    const t = text.trim();
    if (!t || !channelRef.current) return;
    setText("");
    try {
      await channelRef.current.sendMessage({ text: t });
    } catch {
      setError(c.errSend);
    }
  }

  const playable = embedUrl ? (embedUrl.includes("http") && !embedUrl.includes("youtu") ? embedUrl : videoEmbedUrl("youtube", embedUrl) || embedUrl) : "";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Yayın + bağış */}
      <div className="space-y-6 lg:col-span-2">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-lg">
          {isLive && playable ? (
            <iframe src={playable} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-white/50">
              <Radio className="h-10 w-10" />
              <p className="font-syne text-lg font-semibold">{c.offline}</p>
              <p className="max-w-xs text-center text-sm text-white/40">{c.waiting}</p>
            </div>
          )}
          {isLive && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> {c.live}
            </span>
          )}
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-2 font-syne text-lg font-bold text-ceyhun-ink"><Heart className="h-5 w-5 text-ceyhun-gold" /> {c.support}</h3>
          <DonateWidget campaign="prayer" compact />
        </div>
      </div>

      {/* Sağ: canlı sohbet + dua isteği */}
      <aside className="space-y-6">
        <div className="flex h-[28rem] flex-col overflow-hidden rounded-2xl border border-ceyhun-ink/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-ceyhun-ink/10 px-4 py-3">
            <MessageCircleHeart className="h-4 w-4 text-ceyhun-gold-deep" />
            <h3 className="font-syne text-sm font-bold uppercase tracking-wide text-ceyhun-ink/60">{c.chat}</h3>
          </div>

          {!joined ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-ceyhun-slate">{c.join}</p>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={c.yourName}
                className="w-full rounded-lg border border-ceyhun-ink/15 px-3 py-2.5 text-sm outline-none focus:border-ceyhun-gold" />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button onClick={join} disabled={connecting || name.trim().length < 2}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ceyhun-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ceyhun-gold-deep disabled:opacity-50">
                {connecting ? <><Loader2 className="h-4 w-4 animate-spin" /> {c.connecting}</> : c.enter}
              </button>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
                {messages.map((m) => (
                  <div key={m.id} className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-sm ${m.own ? "ml-auto bg-ceyhun-gold/20 text-ceyhun-ink" : "bg-ceyhun-cream-deep/60 text-ceyhun-ink"}`}>
                    {!m.own && <span className="mr-1 text-xs font-semibold text-ceyhun-gold-deep">{m.user}</span>}
                    {m.text}
                  </div>
                ))}
                {messages.length === 0 && <p className="mt-6 text-center text-xs text-ceyhun-ink/30">—</p>}
              </div>
              <div className="flex items-center gap-2 border-t border-ceyhun-ink/10 p-3">
                <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                  placeholder={c.placeholder} className="min-w-0 flex-1 rounded-full border border-ceyhun-ink/15 px-4 py-2 text-sm outline-none focus:border-ceyhun-gold" />
                <button onClick={send} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ceyhun-gold text-ceyhun-ink hover:bg-ceyhun-gold-deep hover:text-white"><Send className="h-4 w-4" /></button>
              </div>
            </>
          )}
        </div>

        {/* Dua isteği */}
        <div className="rounded-2xl border border-ceyhun-ink/10 bg-white p-5 shadow-sm">
          <h3 className="font-syne text-base font-bold text-ceyhun-ink">{c.prayer}</h3>
          <p className="mt-1 text-sm text-ceyhun-slate">{c.prayerText}</p>
          {prayerState.ok ? (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700"><Check className="h-4 w-4" /> {c.thanks}</div>
          ) : (
            <form action={prayerAction} className="mt-3 space-y-2">
              <input type="hidden" name="meetingId" value={meetingId} />
              <input type="text" name="company" tabIndex={-1} autoComplete="off" className="absolute left-[-9999px]" aria-hidden />
              <input name="name" required placeholder={c.yourName} className="w-full rounded-lg border border-ceyhun-ink/15 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold" />
              <input name="email" type="email" required placeholder={c.email} className="w-full rounded-lg border border-ceyhun-ink/15 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold" />
              <textarea name="prayerRequest" rows={3} placeholder={c.request} className="w-full resize-y rounded-lg border border-ceyhun-ink/15 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold" />
              {prayerState.message && !prayerState.ok && <p className="text-xs text-red-600">{prayerState.message}</p>}
              <button type="submit" disabled={prayerPending} className="inline-flex items-center gap-2 rounded-full bg-ceyhun-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ceyhun-gold-deep disabled:opacity-60">
                {prayerPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {c.send}
              </button>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}
