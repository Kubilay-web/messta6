"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Item = { quote: string; name: string; role: string };

// Swiper karşılığı: yatay sürüklenebilir/kaydırılabilir testimonial slider.
// Dokunmatik cihazda native scroll, masaüstünde fare ile sürükleme + ok butonları.
export default function TestimonialSlider({
  items,
  accent = "#f74ea1",
}: {
  items: Item[];
  accent?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: false });
  const [grabbing, setGrabbing] = useState(false);

  const by = (dir: number) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const onDown = (e: React.PointerEvent) => {
    const el = track.current;
    if (!el) return;
    drag.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
    setGrabbing(true);
  };
  const onMove = (e: React.PointerEvent) => {
    const el = track.current;
    if (!el || !drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startLeft - dx;
  };
  const onUp = () => {
    drag.current.down = false;
    setGrabbing(false);
  };

  return (
    <div>
      <div
        ref={track}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        className={`flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          grabbing ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
      >
        {items.map((t) => (
          <figure
            key={t.name}
            data-card
            className="flex min-h-full shrink-0 basis-[86%] snap-start flex-col rounded-[1.6rem] border border-black/10 bg-white p-8 sm:basis-[47%] lg:basis-[31.5%]"
          >
            {/* sürükleme sırasında link/tıklama kazalarını önlemek için görsel yok, düz metin */}
            <blockquote className="flex-1 text-[0.95rem] leading-relaxed text-neutral-800">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 border-t border-black/10 pt-5">
              <p className="font-syne text-sm font-bold">{t.name}</p>
              <p className="text-xs text-neutral-500">{t.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => by(-1)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/20 transition hover:bg-black hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => by(1)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/20 transition hover:bg-black hover:text-white"
          style={{ borderColor: accent }}
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
