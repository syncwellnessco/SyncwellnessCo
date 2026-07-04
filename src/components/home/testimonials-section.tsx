"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { testimonials, testimonialStats } from "@/data/testimonials";
import { cn } from "@/lib/utils";

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

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const getMessage = (item: (typeof testimonials)[number]) =>
    `${item.feedback} ${item.highlight}`;

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

                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-sage-700 sm:text-sm">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative mt-6 sm:mt-8">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="min-w-0 flex-[0_0_90%] px-2 sm:flex-[0_0_65%] lg:flex-[0_0_42%]"
                >
                  <article className="mx-auto max-w-md overflow-hidden rounded-2xl border border-beige-200 bg-cream shadow-sm">
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={t.afterImage}
                        alt={`${t.name} transformation`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 40vw"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-charcoal/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cream">
                        {t.program}
                      </span>
                    </div>

                    <div className="p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-sage-200">
                          <Image
                            src={t.image}
                            alt={t.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-sage-900">
                            {t.name}
                          </p>
                          <p className="text-xs text-sage-500">{t.location}</p>
                          <StarRating rating={t.rating} />
                        </div>
                      </div>

                      <div className="mt-2.5 sm:mt-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sage-500">
                          Client Feedback on Programme
                        </p>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-sage-700 sm:mt-2 sm:text-sm">
                          {(() => {
                            const message = getMessage(t);
                            const expanded = expandedId === t.id;
                            if (expanded || !shouldTruncate(message))
                              return message;
                            return `${message.slice(0, 145).trim()}...`;
                          })()}
                        </p>
                        {shouldTruncate(getMessage(t)) && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId((prev) =>
                                prev === t.id ? null : t.id,
                              )
                            }
                            className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-sage-700 hover:text-charcoal"
                          >
                            {expandedId === t.id ? "View Less" : "View More"}
                          </button>
                        )}
                      </div>

                      <div className="mt-2.5 inline-flex rounded-full bg-sage-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-sage-800 sm:mt-3">
                        {t.duration}
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:mt-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={scrollPrev}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-beige-300 bg-cream text-sage-700 transition-colors hover:bg-sage-100"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => emblaApi?.scrollTo(i)}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i === selectedIndex
                        ? "w-8 bg-sage-600"
                        : "w-2 bg-beige-300 hover:bg-sage-300",
                    )}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={scrollNext}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-beige-300 bg-cream text-sage-700 transition-colors hover:bg-sage-100"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="mt-12 flex justify-center">
            <a 
              href="/testimonials" 
              className="inline-flex h-12 items-center justify-center rounded-sm bg-[#B38A58] px-8 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#967246]"
            >
              Show More Testimonials
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
