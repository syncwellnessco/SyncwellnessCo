"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import { useReviewStore, Review } from "@/store/review-store";

export function TestimonialsSection() {
  const { submittedReviews } = useReviewStore();
  const [activeReview, setActiveReview] = useState<Review | null>(null);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Combine featured database reviews with featured Zustand submittedReviews
  const displayReviews: Review[] = [
    ...submittedReviews.filter((sr) => sr.featured_on_home === true),
    ...reviews.filter((r) => !submittedReviews.some((sr) => sr.id === r.id)),
  ];

  useEffect(() => {
    Promise.all([
      fetch("/api/reviews?featured=true").then(res => res.json()),
      fetch("/api/programs").then(res => res.json())
    ]).then(([revData, progData]) => {
      setReviews(Array.isArray(revData) ? revData : []);
      setPrograms(Array.isArray(progData) ? progData : []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (activeReview) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeReview]);

  const getProgramName = (id: string) => {
    const p = programs.find(x => x.id === id);
    return p ? p.title : "Program";
  };

  const dragStartRef = useRef<{ x: number, y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent, callback: () => void) => {
    if (!dragStartRef.current) return;
    const diffX = Math.abs(e.clientX - dragStartRef.current.x);
    const diffY = Math.abs(e.clientY - dragStartRef.current.y);
    if (diffX < 5 && diffY < 5) {
      callback();
    }
    dragStartRef.current = null;
  };

  return (
    <section
      className="bg-background pt-6 pb-2 sm:pt-10 sm:pb-4"
      id="testimonials"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Client Stories"
          title="Real Women, Real Transformations"
          description="Hear from women who've walked this path and discovered what's possible when you work with your body, not against it."
        />

        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-6">
          {[
            { value: "500+", label: "Women Helped" },
            { value: "95%", label: "Happy Clients" },
            { value: "5★", label: "Average Rating" },
          ].map((item, index) => (
            <div
              key={index}
              className="relative overflow-hidden bg-beige-100/70 px-4 py-8 text-center"
            >
              <div className="relative">
                <h3 className="font-display text-3xl text-charcoal sm:text-5xl">
                  {item.value}
                </h3>

                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal sm:text-sm">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#8C6D40]" /></div>
        ) : displayReviews.length === 0 ? (
          <div className="text-center py-20 text-charcoal/60">No featured reviews yet.</div>
        ) : (
          <div className="relative mt-10 sm:mt-12 w-full py-4">
            <MarqueeCarousel speed={1.5}>
              {[...displayReviews, ...displayReviews, ...displayReviews].map((r, index) => (
                <div
                  key={`${r.id}-${index}`}
                  className="w-[85vw] sm:w-[360px] shrink-0 h-full select-none"
                >
                  <article 
                    className="bg-white rounded-md border border-beige-200 shadow-sm cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#8C6D40]/30 group/card flex flex-col h-full overflow-hidden"
                    onPointerDown={handlePointerDown}
                    onPointerUp={(e) => handlePointerUp(e, () => setActiveReview(r))}
                  >
                    {/* Images Top Half */}
                    <div className="relative w-full aspect-[16/10] bg-charcoal/5 flex overflow-hidden border-b border-beige-100 shrink-0 pointer-events-none">
                      {r.before_image || r.after_image ? (
                        <>
                          {r.before_image && (
                            <div className={`relative h-full ${r.after_image ? "w-1/2" : "w-full"}`}>
                              <img src={r.before_image} alt="Before" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" />
                              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[8px] sm:text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded-sm backdrop-blur-sm z-10">Before</span>
                            </div>
                          )}
                          {r.after_image && (
                            <div className={`relative h-full ${r.before_image ? "w-1/2" : "w-full"}`}>
                              <img src={r.after_image} alt="After" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" />
                              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[8px] sm:text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded-sm backdrop-blur-sm z-10">After</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF8F5]">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#8C6D40]/10 flex items-center justify-center mb-2">
                            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-[#8C6D40] opacity-50" />
                          </div>
                          <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8C6D40] opacity-60">Verified Experience</span>
                        </div>
                      )}
                      
                      {getProgramName(r.program_id) && (
                        <span className="absolute top-3 left-3 bg-white/90 text-charcoal text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm backdrop-blur-md shadow-sm z-10">
                          {getProgramName(r.program_id)}
                        </span>
                      )}
                    </div>
                    
                    {/* Content Bottom Half */}
                    <div className="p-4 sm:p-6 flex flex-col flex-1 bg-white pointer-events-none">
                      <div className="flex-1 mb-4 sm:mb-5">
                        <p className="text-charcoal/80 text-xs sm:text-[13px] leading-relaxed italic line-clamp-4 relative z-10">
                          "{r.testimonial}"
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-beige-100 mt-auto font-sans">
                        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#8C6D40]/10 flex items-center justify-center font-display font-semibold text-[#8C6D40] text-sm shrink-0">
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-charcoal text-xs sm:text-[13px] truncate max-w-[120px] sm:max-w-[160px]">{r.name}</h4>
                          <div className="flex text-[#8C6D40] mt-0.5">
                            {[...Array(5)].map((_, i) => <Star key={i} className={`h-2.5 w-2.5 ${i < (r.rating || 5) ? 'fill-current' : 'text-gray-300'}`} />)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </MarqueeCarousel>
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeReview && (() => {
          const hasBefore = !!activeReview.before_image;
          const hasAfter = !!activeReview.after_image;
          const hasImages = hasBefore || hasAfter;
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm overflow-y-auto"
              onClick={() => setActiveReview(null)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 15 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "relative w-full overflow-hidden rounded-md bg-[#FAF9F7] shadow-2xl border border-beige-200 flex flex-col md:flex-row my-8",
                  hasImages ? "max-w-4xl" : "max-w-xl"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setActiveReview(null)}
                  className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-charcoal/10 text-charcoal hover:bg-charcoal/20 transition-colors shadow-sm"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Left Side: Images */}
                {hasImages && (
                  <div className="relative w-full h-[300px] md:h-auto md:w-[460px] lg:w-[500px] bg-beige-100 flex overflow-hidden md:min-h-[460px] shrink-0 border-b md:border-b-0 md:border-r border-beige-200">
                    {hasBefore && (
                      <div className={cn("relative h-full", hasAfter ? "w-1/2 border-r border-beige-200/50" : "w-full")}>
                        <img
                          src={activeReview.before_image!}
                          alt="Before"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <span className="absolute bottom-4 left-4 bg-black/75 text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1.5 rounded-sm backdrop-blur-md z-10 shadow-sm">
                          Before
                        </span>
                      </div>
                    )}
                    {hasAfter && (
                      <div className={cn("relative h-full", hasBefore ? "w-1/2" : "w-full")}>
                        <img
                          src={activeReview.after_image!}
                          alt="After"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <span className="absolute bottom-4 right-4 bg-black/75 text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1.5 rounded-sm backdrop-blur-md z-10 shadow-sm">
                          After
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Right Side: Content */}
                <div className="w-full md:flex-1 p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-[#FAF9F7] text-charcoal">
                  <div className="flex-1 flex flex-col justify-center">
                    {/* Program Tag */}
                    {getProgramName(activeReview.program_id) && (
                      <div className="mb-4">
                        <span className="inline-block bg-[#8C6D40]/10 text-[#8C6D40] border border-[#8C6D40]/20 text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider">
                          {getProgramName(activeReview.program_id)}
                        </span>
                      </div>
                    )}

                    {/* Star Rating */}
                    <div className="flex text-[#8C6D40] mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4.5 w-4.5 ${
                            i < (activeReview.rating || 5) ? "fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Testimonial Quote */}
                    <div className="relative mb-6">
                      <span className="absolute -top-4 -left-3 font-serif text-5xl text-[#8C6D40]/10 pointer-events-none select-none">
                        “
                      </span>
                      <p className="text-charcoal/90 text-sm sm:text-base leading-relaxed italic relative z-10 font-serif whitespace-pre-wrap">
                        "{activeReview.testimonial}"
                      </p>
                    </div>
                  </div>

                  {/* Client Profile */}
                  <div className="flex items-center gap-3 pt-5 border-t border-beige-200/60 mt-auto">
                    <div className="h-10 w-10 rounded-full bg-[#8C6D40]/10 flex items-center justify-center font-display font-semibold text-[#8C6D40] text-sm shrink-0">
                      {activeReview.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-charcoal text-sm">
                        {activeReview.name}
                      </h4>
                      <span className="text-[10px] text-charcoal/50 uppercase tracking-widest font-semibold">
                        Verified Client
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
}

interface MarqueeCarouselProps {
  children: React.ReactNode;
  speed?: number;
}

function MarqueeCarousel({ children, speed = 1 }: MarqueeCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const isHoveredRef = useRef(false);
  const scrollPosRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let initialized = false;

    const scroll = () => {
      if (container.scrollWidth === 0) {
        animationFrameId = requestAnimationFrame(scroll);
        return;
      }

      if (!initialized) {
        scrollPosRef.current = container.scrollWidth / 3;
        container.scrollLeft = scrollPosRef.current;
        initialized = true;
      }

      if (isDownRef.current) {
        scrollPosRef.current = container.scrollLeft;
      } else {
        scrollPosRef.current += speed;
        
        const oneThird = container.scrollWidth / 3;
        if (scrollPosRef.current >= oneThird * 2) {
          scrollPosRef.current -= oneThird;
        } else if (scrollPosRef.current <= oneThird) {
          scrollPosRef.current += oneThird;
        }
        
        container.scrollLeft = scrollPosRef.current;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    isDownRef.current = true;
    startXRef.current = e.pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDownRef.current = false;
    isHoveredRef.current = false;
  };

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
  };

  const handleMouseUp = () => {
    isDownRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDownRef.current) return;
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    container.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;
    isDownRef.current = true;
    startXRef.current = e.touches[0].pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDownRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    container.scrollLeft = scrollLeftRef.current - walk;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleMouseUp}
      onTouchMove={handleTouchMove}
      className="overflow-x-auto scrollbar-none flex select-none w-full gap-4 sm:gap-5 py-4 cursor-grab active:cursor-grabbing"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {children}
    </div>
  );
}
