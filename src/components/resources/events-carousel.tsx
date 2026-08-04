"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

export type EventItem = {
  id: string;
  title: string;
  image?: string | null;
  excerpt?: string | null;
  createdAt?: string;
};

type EventsCarouselProps = {
  items: EventItem[];
};

export function EventsCarousel({ items }: EventsCarouselProps) {
  const rawItems = items ? items.filter(i => !!i.image) : [];
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (rawItems.length === 0) return null;

  // Threshold: >5 on PC, >2 on Mobile
  const minRequired = isMobile ? 2 : 5;
  const shouldAnimate = rawItems.length > minRequired;

  // Duplicate items for continuous seamless infinite loop
  const marqueeList = shouldAnimate
    ? [...rawItems, ...rawItems, ...rawItems, ...rawItems]
    : rawItems;

  return (
    <section className="py-10 md:py-14 bg-[#FAF8F5] border-y border-[#EBE3DB] relative overflow-hidden">
      {/* Inline Keyframes for 60fps Infinite Marquee */}
      <style>{`
        @keyframes eventInfiniteMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle,rgba(140,109,64,0.06),transparent_70%)] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-[#8C6D40] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-1.5">
            <span>Events & Gatherings</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-light text-charcoal leading-tight">
            Featured in <span className="italic font-normal text-[#8C6D40]">Events & Workshops</span>
          </h2>
        </div>

        {/* Continuous Infinite Marquee Container */}
        <div
          className="relative overflow-hidden w-full select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div 
            className="flex w-max gap-3 sm:gap-4 transition-all"
            style={{
              animation: shouldAnimate ? "eventInfiniteMarquee 35s linear infinite" : "none",
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {marqueeList.map((item, idx) => (
              <div
                key={`${item.id || idx}-${idx}`}
                className="shrink-0 w-[calc(50vw-28px)] sm:w-[calc(33.33vw-28px)] md:w-[calc(25vw-28px)] lg:w-[calc(20vw-30px)] max-w-[240px]"
              >
                <div className="group relative bg-white border border-[#EBE3DB] overflow-hidden shadow-sm rounded-sm pointer-events-none">
                  <div className="relative aspect-[9/16] overflow-hidden bg-charcoal pointer-events-auto">
                    <img
                      src={item.image || ""}
                      alt={item.title}
                      className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent opacity-85 transition-opacity" />

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-cream z-10">
                      <span className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em] text-[#d4b896] mb-0.5">
                        <Calendar className="w-2.5 h-2.5" /> Event
                      </span>
                      <h3 className="font-display text-xs sm:text-sm font-medium leading-tight drop-shadow-sm text-white line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
