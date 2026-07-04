"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { videoTestimonials } from "@/data/testimonials";

export function VideoTestimonialsSection() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const active = videoTestimonials.find((v) => v.id === activeVideo);

  return (
    <section className="bg-sage-100/40 pt-7 pb-1 sm:pt-12 sm:pb-2">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Video Stories"
          title="Watch Their Transformations Unfold"
          description="Hear directly from our clients about their journey — in their own words."
        />

        <div className="mt-6 grid gap-5 sm:mt-8 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {videoTestimonials.map((video, index) => (
            <motion.article
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-beige-200 bg-cream shadow-sm transition-shadow hover:shadow-lg"
              onClick={() => setActiveVideo(video.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveVideo(video.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Play video: ${video.title}`}
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-sage-900/20 transition-colors group-hover:bg-sage-900/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream/95 shadow-lg transition-transform group-hover:scale-110">
                    <Play className="ml-1 h-7 w-7 fill-sage-700 text-charcoal" />
                  </div>
                </div>
                <span className="absolute bottom-3 right-3 rounded-md bg-sage-900/80 px-2 py-1 text-xs font-medium text-white">
                  {video.duration}
                </span>
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="font-display text-base font-semibold text-charcoal sm:text-lg">
                  {video.title}
                </h3>
                <p className="mt-1 text-xs text-charcoal sm:text-sm">
                  {video.name}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-sage-900/80 p-4 backdrop-blur-sm"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-sage-900"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-cream/20 text-white hover:bg-cream/30"
                aria-label="Close video"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="relative aspect-video bg-sage-800">
                <Image
                  src={active.thumbnail}
                  alt={active.title}
                  fill
                  className="object-cover opacity-60"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                  <Play className="h-16 w-16 fill-white/90 text-white/90" />
                  <p className="mt-4 font-display text-xl">{active.title}</p>
                  <p className="mt-2 text-sm text-white/70">
                    Video placeholder — embed your testimonial video here
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
