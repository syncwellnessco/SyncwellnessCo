"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, X, ChevronLeft, ChevronRight, ZoomIn, Maximize2 } from "lucide-react";

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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Touch Swipe Gesture State
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! === 0 ? rawItems.length - 1 : prev! - 1));
  }, [selectedIndex, rawItems.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! === rawItems.length - 1 ? 0 : prev! + 1));
  }, [selectedIndex, rawItems.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 40; // minimum threshold in px

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next item
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Previous item
      handlePrev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, handlePrev, handleNext]);

  if (rawItems.length === 0) return null;

  // Threshold: >5 on PC, >2 on Mobile
  const minRequired = isMobile ? 2 : 5;
  const shouldAnimate = rawItems.length > minRequired;

  // Duplicate items for continuous seamless infinite loop
  const marqueeList = shouldAnimate
    ? [...rawItems, ...rawItems, ...rawItems, ...rawItems]
    : rawItems;

  const selectedEvent = selectedIndex !== null ? rawItems[selectedIndex] : null;

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
          className="relative overflow-hidden w-full"
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
            {marqueeList.map((item, idx) => {
              const realIndex = idx % rawItems.length;
              return (
                <div
                  key={`${item.id || idx}-${idx}`}
                  className="shrink-0 w-[calc(50vw-28px)] sm:w-[calc(33.33vw-28px)] md:w-[calc(25vw-28px)] lg:w-[calc(20vw-30px)] max-w-[240px]"
                >
                  <div 
                    onClick={() => setSelectedIndex(realIndex)}
                    className="group relative bg-white border border-[#EBE3DB] overflow-hidden shadow-sm rounded-sm cursor-pointer select-none"
                  >
                    <div className="relative aspect-[9/16] overflow-hidden bg-charcoal">
                      <img
                        src={item.image || ""}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      {/* Top-Right 'Expand' Badge */}
                      <div className="absolute top-2 right-2 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white border border-white/20 shadow-sm">
                          <Maximize2 className="w-2.5 h-2.5 text-[#e5caaa]" /> Expand
                        </span>
                      </div>

                      {/* Black Fade Inset From Bottom */}
                      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/95 via-black/65 to-transparent pointer-events-none" />

                      {/* Hover Zoom Pill Button Indicator */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-20">
                        <div className="px-3.5 py-2 rounded-full bg-white/25 backdrop-blur-md text-white border border-white/40 shadow-lg transform scale-90 group-hover:scale-100 transition-transform flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                          <ZoomIn className="w-4 h-4 text-[#e5caaa]" /> Click to view
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-cream z-10">
                        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#e5caaa] mb-1 drop-shadow">
                          <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Event
                        </span>
                        <h3 className="font-display text-xs sm:text-sm font-bold leading-snug drop-shadow-md text-white group-hover:text-[#e5caaa] transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox Pop-Open Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 transition-all animate-in fade-in duration-300"
          onClick={() => setSelectedIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Mobile Swipe Hint Badge */}
          {rawItems.length > 1 && (
            <div className="sm:hidden absolute top-4 left-4 z-50 pointer-events-none">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/70 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold text-[#e5caaa] uppercase tracking-wider shadow-lg animate-pulse">
                <span>← Swipe to next →</span>
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            type="button"
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white bg-black/80 hover:bg-black border border-white/20 p-2.5 rounded-full shadow-lg transition-all z-50 focus:outline-none hover:scale-105 active:scale-95"
            aria-label="Close image popup"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Button (Desktop / Tablet only) */}
          {rawItems.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="hidden sm:flex absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 p-3 rounded-full transition-all z-50 focus:outline-none hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Button (Desktop / Tablet only) */}
          {rawItems.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="hidden sm:flex absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 p-3 rounded-full transition-all z-50 focus:outline-none hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Main Image Container */}
          <div 
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[78vh] w-full flex items-center justify-center overflow-hidden">
              <img
                src={selectedEvent.image || ""}
                alt={selectedEvent.title}
                className="max-h-[78vh] max-w-full object-contain rounded-t-lg shadow-2xl select-none"
              />
            </div>

            {/* Info Bar at Bottom of Modal */}
            {selectedEvent.title && (
              <div className="w-full bg-[#1c1917]/95 border-t border-white/10 p-4 text-center text-white rounded-b-lg max-w-2xl">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4b896] mb-1">
                  <Calendar className="w-3 h-3" /> Event Highlight
                </span>
                <h3 className="font-display text-base sm:text-lg font-semibold text-white leading-snug">
                  {selectedEvent.title}
                </h3>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
