"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-beige-200 text-beige-200",
          )}
        />
      ))}
    </div>
  );
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
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

  const shouldTruncate = (message: string) => message.length > 145;

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
                  className="w-[300px] sm:w-[360px] shrink-0 h-full"
                >
                  <article className="overflow-hidden rounded-2xl border border-beige-200 bg-cream shadow-sm flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer">
                    {(r.after_image || r.before_image) && (
                      <div className="relative flex aspect-[16/10] bg-charcoal overflow-hidden group/img">
                        {r.before_image && (
                          <img
                            src={r.before_image}
                            alt={`${r.name} before`}
                            className={cn("object-cover h-full", r.after_image ? "w-1/2 border-r border-black/20" : "w-full")}
                          />
                        )}
                        {r.after_image && (
                          <img
                            src={r.after_image}
                            alt={`${r.name} after`}
                            className={cn("object-cover h-full", r.before_image ? "w-1/2" : "w-full")}
                          />
                        )}
                        <span className="absolute left-3 top-3 rounded-full bg-charcoal/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cream backdrop-blur-sm shadow-sm border border-white/10">
                          {getProgramName(r.program_id)}
                        </span>
                        {r.before_image && r.after_image && (
                          <div className="absolute inset-x-0 bottom-0 p-2 flex gap-1 justify-center bg-gradient-to-t from-black/60 to-transparent">
                            <span className="bg-black/50 text-white text-[9px] px-3 py-0.5 rounded backdrop-blur">BEFORE & AFTER</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-[#8C6D40]/20 flex items-center justify-center font-display font-semibold text-[#8C6D40] text-lg shrink-0">
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-charcoal truncate max-w-[200px]">
                            {r.name}
                          </p>
                          <StarRating rating={r.rating || 5} />
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-charcoal mb-2">
                          Client Experience
                        </p>
                        <p className="text-[13px] leading-relaxed text-charcoal sm:text-sm italic line-clamp-5">
                          "{r.testimonial}"
                        </p>
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
    </section>
  );
}
