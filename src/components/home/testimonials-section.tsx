"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  program_id: string;
  name: string;
  testimonial: string;
  before_image: string | null;
  after_image: string | null;
  rating: number;
}

export function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", dragFree: true },
    [
      Autoplay({
        delay: 6000,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      }),
    ],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeReview, setActiveReview] = useState<Review | null>(null);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const getProgramName = (id: string) => {
    const p = programs.find(x => x.id === id);
    return p ? p.title : "Program";
  };

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section
      className="bg-background pt-1 pb-8 sm:pt-2 sm:pb-14"
      id="testimonials"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Client Stories"
          title="Real Women, Real Transformations"
          description="Hear from women who've walked this path and discovered what's possible when you work with your body — not against it."
        />

        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-6">
          {[
            { value: "100+", label: "Women Helped" },
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
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 text-charcoal/60">No featured reviews yet.</div>
        ) : (
          <div className="relative mt-10 sm:mt-12 overflow-hidden w-full flex items-center group py-4">
            <div className="flex gap-4 sm:gap-5 w-max animate-marquee group-hover:[animation-play-state:paused]">
              {[...reviews, ...reviews, ...reviews].map((r, index) => (
                <div
                  key={`${r.id}-${index}`}
                  className="w-[85vw] sm:w-[360px] shrink-0 h-full"
                >
                  <article 
                    className="bg-white rounded-md border border-beige-200 shadow-sm cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#8C6D40]/30 group/card flex flex-col h-full overflow-hidden"
                    onClick={() => setActiveReview(r)}
                  >
                    {/* Images Top Half */}
                    <div className="relative w-full aspect-[16/10] bg-charcoal/5 flex overflow-hidden border-b border-beige-100 shrink-0">
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
                    <div className="p-4 sm:p-6 flex flex-col flex-1 bg-white">
                      <div className="flex-1 mb-4 sm:mb-5">
                        <p className="text-charcoal/80 text-xs sm:text-[13px] leading-relaxed italic line-clamp-4 relative z-10">
                          "{r.testimonial}"
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-beige-100 mt-auto">
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
            </div>
            <style jsx>{`
              @keyframes marquee {
                0% { transform: translateX(0%); }
                100% { transform: translateX(-33.333333%); }
              }
              .animate-marquee {
                animation: marquee 20s linear infinite;
              }
            `}</style>
          </div>
        )}
          
        <div className="mt-12 flex justify-center">
          <a 
            href="/testimonials" 
            className="inline-flex h-12 items-center justify-center rounded-sm bg-[#8C6D40] px-8 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#B8955F]"
          >
            Show More Testimonials
          </a>
        </div>
      </div>
      
      {/* Review Read Modal */}
      {activeReview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm overflow-y-auto" onClick={() => setActiveReview(null)}>
          <div className="bg-white rounded-md w-full max-w-2xl shadow-2xl relative my-8" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveReview(null)} className="absolute top-4 right-4 text-charcoal/50 hover:text-charcoal z-10 bg-white/80 rounded-full p-1">
              <X className="h-6 w-6" />
            </button>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-[#8C6D40]/20 flex items-center justify-center font-display font-bold text-[#8C6D40] text-xl">
                  {activeReview.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-charcoal">{activeReview.name}</h4>
                  <div className="flex text-[#8C6D40]">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < (activeReview.rating || 5) ? 'fill-current' : 'text-gray-300'}`} />)}
                  </div>
                </div>
              </div>
              <p className="text-charcoal/90 text-base md:text-lg leading-relaxed italic mb-8 whitespace-pre-wrap">"{activeReview.testimonial}"</p>
              
              <div className="relative rounded-sm overflow-hidden w-full aspect-[1.6] flex bg-black/5 ring-1 ring-black/10">
                <div className="relative h-full w-1/2 bg-charcoal/5 flex items-center justify-center">
                  {activeReview.before_image ? (
                    <img src={activeReview.before_image} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Star className="h-8 w-8 text-charcoal/20" />
                      <span className="text-charcoal/40 text-xs font-bold uppercase tracking-widest">No Image</span>
                    </div>
                  )}
                  <span className="absolute bottom-3 left-3 bg-black/70 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-sm backdrop-blur-md z-10">Before</span>
                </div>
                

                
                <div className="relative h-full w-1/2 bg-charcoal/5 flex items-center justify-center">
                  {activeReview.after_image ? (
                    <img src={activeReview.after_image} alt="After" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Star className="h-8 w-8 text-charcoal/20" />
                      <span className="text-charcoal/40 text-xs font-bold uppercase tracking-widest">No Image</span>
                    </div>
                  )}
                  <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-sm backdrop-blur-md z-10">After</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
