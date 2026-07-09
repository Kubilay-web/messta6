"use client";

// app/components/ceyhun/live/useLiveRoom.ts
// Online dua yayını çekirdeği: socket.io sinyalleşme + WebRTC mesh (perfect negotiation).
// Roller: host (Ceyhun, yayıncı) · speaker (onaylı, yayıncı) · viewer (izleyici, yalnız alıcı).
// Yayıncı olan herkes kendi ses/görüntüsünü tüm katılımcılara gönderir; izleyiciler alır.

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

export type Role = "host" | "speaker" | "viewer";
export type RemotePeer = { id: string; name: string; role: Role; stream: MediaStream | null };
export type ChatMsg = { id: string; from: string; role: Role; text: string; ts: number };
export type Presence = { total: number; viewers: number; speakers: number; hostOnline: boolean };
export type Hand = { id: string; name: string };
export type PrayerNote = { id: string; from: string; text: string; ts: number };

type SignalData = { description?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit };

export type UseLiveRoom = {
  connected: boolean;
  error: string | null;
  live: boolean;
  selfId: string;
  selfRole: Role;
  peers: RemotePeer[];
  messages: ChatMsg[];
  presence: Presence;
  hands: Hand[];
  prayerNotes: PrayerNote[];
  localStream: MediaStream | null;
  camOn: boolean;
  micOn: boolean;
  handRaised: boolean;
  publishing: boolean;
  // eylemler
  sendChat: (text: string) => void;
  sendPrayerNote: (text: string) => void;
  raiseHand: () => void;
  lowerHand: () => void;
  goLive: () => Promise<void>;
  endLive: () => void;
  approve: (id: string) => void;
  revoke: (id: string) => void;
  toggleCam: () => void;
  toggleMic: () => void;
  startSpeaking: () => Promise<void>;
};

export function useLiveRoom(opts: {
  meetingId: string;
  socketUrl: string;
  iceServers: RTCIceServer[];
  name: string;
  hostToken?: string;
  userId?: string | null;
  enabled?: boolean;
}): UseLiveRoom {
  const { meetingId, socketUrl, iceServers, name, hostToken, userId, enabled = true } = opts;

  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [selfId, setSelfId] = useState("");
  const [selfRole, setSelfRole] = useState<Role>(hostToken ? "host" : "viewer");
  const [peers, setPeers] = useState<Record<string, RemotePeer>>({});
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [presence, setPresence] = useState<Presence>({ total: 0, viewers: 0, speakers: 0, hostOnline: false });
  const [hands, setHands] = useState<Hand[]>([]);
  const [prayerNotes, setPrayerNotes] = useState<PrayerNote[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [camOn, setCamOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const metaRef = useRef<Map<string, { makingOffer: boolean; ignoreOffer: boolean; polite: boolean }>>(new Map());
  const peersRef = useRef<Map<string, { name: string; role: Role }>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const publishingRef = useRef(false);
  const selfIdRef = useRef("");
  const iceRef = useRef(iceServers);
  iceRef.current = iceServers;

  // ─── yardımcılar ───
  const emitSignal = useCallback((to: string, data: SignalData) => {
    socketRef.current?.emit("signal", { to, data });
  }, []);

  const syncPeers = useCallback(() => {
    setPeers((prev) => {
      const next: Record<string, RemotePeer> = {};
      for (const [id, info] of peersRef.current) {
        next[id] = { id, name: info.name, role: info.role, stream: prev[id]?.stream ?? null };
      }
      return next;
    });
  }, []);

  const setPeerStream = useCallback((id: string, stream: MediaStream) => {
    setPeers((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], stream } } : prev));
  }, []);

  const addLocalTracks = useCallback((pc: RTCPeerConnection) => {
    const s = localStreamRef.current;
    if (!s) return;
    const have = new Set(pc.getSenders().map((x) => x.track));
    for (const t of s.getTracks()) if (!have.has(t)) pc.addTrack(t, s);
  }, []);

  const createPC = useCallback(
    (peerId: string): RTCPeerConnection => {
      const existing = pcsRef.current.get(peerId);
      if (existing) return existing;
      const pc = new RTCPeerConnection({ iceServers: iceRef.current });
      const meta = { makingOffer: false, ignoreOffer: false, polite: selfIdRef.current > peerId };
      metaRef.current.set(peerId, meta);

      pc.onnegotiationneeded = async () => {
        try {
          meta.makingOffer = true;
          const offer = await pc.createOffer();
          if (pc.signalingState !== "stable") return;
          await pc.setLocalDescription(offer);
          emitSignal(peerId, { description: pc.localDescription ?? undefined });
        } catch (e) {
          console.error("[live] negotiation", e);
        } finally {
          meta.makingOffer = false;
        }
      };
      pc.onicecandidate = (e) => {
        if (e.candidate) emitSignal(peerId, { candidate: e.candidate.toJSON() });
      };
      pc.ontrack = (e) => {
        if (e.streams[0]) setPeerStream(peerId, e.streams[0]);
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed") {
          try {
            pc.restartIce();
          } catch {
            /* yut */
          }
        }
      };

      pcsRef.current.set(peerId, pc);
      if (publishingRef.current) addLocalTracks(pc);
      return pc;
    },
    [emitSignal, setPeerStream, addLocalTracks]
  );

  const closePC = useCallback((peerId: string) => {
    const pc = pcsRef.current.get(peerId);
    if (pc) {
      pc.onnegotiationneeded = null;
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      try {
        pc.close();
      } catch {
        /* yut */
      }
    }
    pcsRef.current.delete(peerId);
    metaRef.current.delete(peerId);
  }, []);

  const ensureMedia = useCallback(async (withVideo = true) => {
    if (localStreamRef.current) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: withVideo ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      audio: true,
    });
    localStreamRef.current = stream;
    publishingRef.current = true;
    setLocalStream(stream);
    setPublishing(true);
    setCamOn(withVideo);
    setMicOn(true);
  }, []);

  // Yayına başla: medyayı al + tüm katılımcılara bağlan / mevcut PC'lere track ekle.
  const startPublishing = useCallback(async () => {
    await ensureMedia(true);
    for (const [id] of peersRef.current) {
      const pc = pcsRef.current.get(id);
      if (!pc) createPC(id); // yeni PC → track'leri ekler + teklif üretir
      else addLocalTracks(pc); // mevcut PC → renegotiation
    }
  }, [ensureMedia, createPC, addLocalTracks]);

  const stopPublishing = useCallback(() => {
    for (const pc of pcsRef.current.values()) {
      pc.getSenders().forEach((s) => {
        if (s.track) {
          try {
            pc.removeTrack(s);
          } catch {
            /* yut */
          }
        }
      });
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    publishingRef.current = false;
    setLocalStream(null);
    setPublishing(false);
    setCamOn(false);
    setMicOn(false);
  }, []);

  // ─── bağlantı ───
  useEffect(() => {
    if (!enabled || !socketUrl || !meetingId) return;

    const socket = io(socketUrl, { transports: ["websocket"], reconnection: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit(
        "join",
        { meetingId, name, role: hostToken ? "host" : "viewer", hostToken, userId },
        (ack: { error?: string; selfId?: string; role?: Role; live?: boolean; peers?: { id: string; name: string; role: Role }[] }) => {
          if (ack?.error) {
            setError(ack.error);
            return;
          }
          selfIdRef.current = ack.selfId || "";
          setSelfId(ack.selfId || "");
          if (ack.role) setSelfRole(ack.role);
          setLive(Boolean(ack.live));
          peersRef.current.clear();
          for (const p of ack.peers || []) peersRef.current.set(p.id, { name: p.name, role: p.role });
          syncPeers();
          setConnected(true);
          setError(null);
        }
      );
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setError("Yayın sunucusuna bağlanılamadı."));

    socket.on("peer-joined", ({ id, name: pname, role }: { id: string; name: string; role: Role }) => {
      peersRef.current.set(id, { name: pname, role });
      syncPeers();
      if (publishingRef.current) createPC(id); // yayıncıysam yeni katılımcıya bağlan
    });

    socket.on("peer-left", ({ id }: { id: string }) => {
      closePC(id);
      peersRef.current.delete(id);
      setPeers((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
      setHands((prev) => prev.filter((h) => h.id !== id));
    });

    socket.on("signal", async ({ from, data }: { from: string; data: SignalData }) => {
      let pc = pcsRef.current.get(from);
      if (!pc) pc = createPC(from);
      const meta = metaRef.current.get(from)!;
      try {
        if (data.description) {
          const offerCollision =
            data.description.type === "offer" && (meta.makingOffer || pc.signalingState !== "stable");
          meta.ignoreOffer = !meta.polite && offerCollision;
          if (meta.ignoreOffer) return;
          await pc.setRemoteDescription(data.description);
          if (data.description.type === "offer") {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            emitSignal(from, { description: pc.localDescription ?? undefined });
          }
        } else if (data.candidate) {
          try {
            await pc.addIceCandidate(data.candidate);
          } catch (e) {
            if (!meta.ignoreOffer) console.error("[live] ice", e);
          }
        }
      } catch (e) {
        console.error("[live] signal", e);
      }
    });

    socket.on("chat", (msg: ChatMsg) => setMessages((prev) => [...prev.slice(-299), msg]));
    socket.on("presence", (p: Presence) => setPresence(p));
    socket.on("live-state", ({ live: l }: { live: boolean }) => setLive(l));
    socket.on("hand-raised", (h: Hand) => setHands((prev) => (prev.some((x) => x.id === h.id) ? prev : [...prev, h])));
    socket.on("hand-lowered", ({ id }: { id: string }) => setHands((prev) => prev.filter((h) => h.id !== id)));
    socket.on("prayer-note", (n: PrayerNote) => setPrayerNotes((prev) => [...prev.slice(-99), n]));
    socket.on("host-left", () => setLive(false));
    socket.on("host-replaced", () => setError("Bu yayın başka bir yerden yönetilmeye başlandı."));

    socket.on("role-changed", async ({ id, role }: { id: string; role: Role }) => {
      if (id === selfIdRef.current) {
        setSelfRole(role);
        if (role === "speaker") {
          setHandRaised(false);
          try {
            await startPublishing();
          } catch {
            setError("Kamera/mikrofon erişimi verilmedi.");
          }
        } else if (role === "viewer") {
          stopPublishing();
        }
      } else {
        const info = peersRef.current.get(id);
        if (info) {
          info.role = role;
          peersRef.current.set(id, info);
          syncPeers();
        }
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      for (const id of Array.from(pcsRef.current.keys())) closePC(id);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      publishingRef.current = false;
    };
    // Bir kez kur; kimlik alanları değişmez varsayılır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, socketUrl, meetingId]);

  // ─── dışa açılan eylemler ───
  const sendChat = useCallback((text: string) => {
    const t = text.trim();
    if (t) socketRef.current?.emit("chat", { text: t });
  }, []);
  const sendPrayerNote = useCallback((text: string) => {
    const t = text.trim();
    if (t) socketRef.current?.emit("prayer-note", { text: t });
  }, []);
  const raiseHand = useCallback(() => {
    socketRef.current?.emit("raise-hand");
    setHandRaised(true);
  }, []);
  const lowerHand = useCallback(() => {
    socketRef.current?.emit("lower-hand");
    setHandRaised(false);
  }, []);
  const goLive = useCallback(async () => {
    try {
      await startPublishing();
      socketRef.current?.emit("go-live");
      setLive(true);
    } catch {
      setError("Kamera/mikrofon erişimi verilmedi.");
    }
  }, [startPublishing]);
  const endLive = useCallback(() => {
    socketRef.current?.emit("end-live");
    stopPublishing();
    setLive(false);
  }, [stopPublishing]);
  const approve = useCallback((id: string) => {
    socketRef.current?.emit("set-role", { targetId: id, role: "speaker" });
    setHands((prev) => prev.filter((h) => h.id !== id));
  }, []);
  const revoke = useCallback((id: string) => {
    socketRef.current?.emit("set-role", { targetId: id, role: "viewer" });
  }, []);
  const startSpeaking = useCallback(async () => {
    // speaker rolüne geçmiş biri medyasını henüz açmadıysa elle başlatabilir
    await startPublishing();
  }, [startPublishing]);
  const toggleCam = useCallback(() => {
    const t = localStreamRef.current?.getVideoTracks()[0];
    if (t) {
      t.enabled = !t.enabled;
      setCamOn(t.enabled);
    }
  }, []);
  const toggleMic = useCallback(() => {
    const t = localStreamRef.current?.getAudioTracks()[0];
    if (t) {
      t.enabled = !t.enabled;
      setMicOn(t.enabled);
    }
  }, []);

  return {
    connected, error, live, selfId, selfRole,
    peers: Object.values(peers),
    messages, presence, hands, prayerNotes,
    localStream, camOn, micOn, handRaised, publishing,
    sendChat, sendPrayerNote, raiseHand, lowerHand,
    goLive, endLive, approve, revoke, toggleCam, toggleMic, startSpeaking,
  };
}
