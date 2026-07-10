"use client";

// app/components/ceyhun/VoiceAssistant.tsx
// Avrupa Uyanış Hizmetleri "Asistan" — ElevenLabs Conversational AI gömülü widget'ı.
// Sitenin her (herkese açık) sayfasında sağ altta sabit sesli asistan olarak görünür.
// Custom element JSX tipini gerektirmesin diye React.createElement ile render edilir.

import Script from "next/script";
import { createElement } from "react";

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

export default function VoiceAssistant() {
  if (!AGENT_ID) return null;
  return (
    <>
      {createElement("elevenlabs-convai", { "agent-id": AGENT_ID })}
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
      />
    </>
  );
}
