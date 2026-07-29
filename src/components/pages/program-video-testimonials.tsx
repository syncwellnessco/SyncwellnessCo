"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

interface VideoTestimonial {
  id: string;
  video_url: string;
  caption: string;
  name: string;
  program_id: string;
  featured_on_home: boolean;
  created_at: string;
}

interface ProgramVideoTestimonialsProps {
  programId: string;
  programTitle: string;
}

export function ProgramVideoTestimonials({ programId, programTitle }: ProgramVideoTestimonialsProps) {
  const [videos, setVideos] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaption, setShowCaption] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideCaptionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeVideo) {
      setShowCaption(true);
      if (isPlaying) {
        hideCaptionTimerRef.current = setTimeout(() => {
          setShowCaption(false);
        }, 1000);
      }
    }
    return () => {
      if (hideCaptionTimerRef.current) {
        clearTimeout(hideCaptionTimerRef.current);
      }
    };
  }, [activeVideo, isPlaying]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollButtons = useCallback((api: any) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    updateScrollButtons(emblaApi);
    emblaApi.on("select", () => updateScrollButtons(emblaApi));
    emblaApi.on("reInit", () => updateScrollButtons(emblaApi));
  }, [emblaApi, updateScrollButtons]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/videos?program_id=${programId}`)
      .then((res) => res.json())
      .then((data) => {
        setVideos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching program video testimonials:", err);
        setLoading(false);
      });
  }, [programId]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  if (loading) {
    return (
      <section className="bg-sage-100/40 py-6 sm:py-8 border-t border-[#EBE3DB]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Video Stories"
            title="What People Say"
            description={`Hear directly from clients who completed ${programTitle}.`}
          />
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#8C6D40]" />
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null; // No videos, no section at all
  }

  return (
    <section className="bg-sage-100/40 py-6 sm:py-8 border-t border-[#EBE3DB] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <SectionHeading
          eyebrow="Video Stories"
          title="What People Say"
          description={`Hear directly from clients who completed ${programTitle} in their own words.`}
          align="center"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {videos.length <= 2 ? (
          // Statically center 1 or 2 videos on mobile and desktop
          <div className="flex justify-center gap-4 sm:gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="w-[calc(50vw-1.25rem)] sm:w-[280px] shrink-0"
              >
                <article
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-beige-200 bg-cream shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1 relative aspect-[9/16] bg-black"
                  onClick={() => setActiveVideo(video)}
                  role="button"
                  tabIndex={0}
                >
                  <video
                    src={video.video_url}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
                    preload="metadata"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md shadow-lg transition-transform group-hover:scale-110 border border-white/30">
                      <Play className="ml-0.5 sm:ml-1 h-4 w-4 sm:h-6 sm:w-6 fill-white text-white" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-3 sm:p-5 z-10">
                    <div className="mb-1 sm:mb-1.5">
                      <h4 className="text-white font-bold text-xs sm:text-base mb-0.5 leading-tight drop-shadow-md">
                        {video.name}
                      </h4>
                      <span className="text-[#D4AF37] text-[8px] sm:text-[9px] font-bold uppercase tracking-widest block drop-shadow-md">
                        {programTitle}
                      </span>
                    </div>
                    <p className="text-white/90 font-medium text-[10px] sm:text-xs line-clamp-2 leading-relaxed drop-shadow-md">
                      {video.caption}
                    </p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        ) : (
          // More than 2 videos: Render swipeable/draggable carousel without infinite loop
          <div className="relative group/carousel">
            <div className="overflow-hidden cursor-grab active:cursor-grabbing py-2" ref={emblaRef}>
              <div className="flex gap-4 sm:gap-6">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="flex-[0_0_calc(50vw-1.25rem)] sm:flex-[0_0_280px] shrink-0"
                  >
                    <article
                      className="group cursor-pointer overflow-hidden rounded-2xl border border-beige-200 bg-cream shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1 relative aspect-[9/16] bg-black"
                      onClick={() => setActiveVideo(video)}
                      role="button"
                      tabIndex={0}
                    >
                      <video
                        src={video.video_url}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
                        preload="metadata"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md shadow-lg transition-transform group-hover:scale-110 border border-white/30">
                          <Play className="ml-0.5 sm:ml-1 h-4 w-4 sm:h-6 sm:w-6 fill-white text-white" />
                        </div>
                      </div>

                      <div className="absolute bottom-0 inset-x-0 p-3 sm:p-5 z-10">
                        <div className="mb-1 sm:mb-1.5">
                          <h4 className="text-white font-bold text-xs sm:text-base mb-0.5 leading-tight drop-shadow-md">
                            {video.name}
                          </h4>
                          <span className="text-[#D4AF37] text-[8px] sm:text-[9px] font-bold uppercase tracking-widest block drop-shadow-md">
                            {programTitle}
                          </span>
                        </div>
                        <p className="text-white/90 font-medium text-[10px] sm:text-xs line-clamp-2 leading-relaxed drop-shadow-md">
                          {video.caption}
                        </p>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Controls (Desktop Only) */}
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-12 w-12 items-center justify-center rounded-full border border-charcoal/10 bg-white/90 backdrop-blur-md text-charcoal shadow-sm transition-all duration-300 ${
                !canScrollPrev
                  ? "opacity-0 pointer-events-none"
                  : "opacity-80 hover:opacity-100 hover:bg-charcoal hover:text-white hover:border-charcoal hover:shadow-md"
              }`}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-12 w-12 items-center justify-center rounded-full border border-charcoal/10 bg-white/90 backdrop-blur-md text-charcoal shadow-sm transition-all duration-300 ${
                !canScrollNext
                  ? "opacity-0 pointer-events-none"
                  : "opacity-80 hover:opacity-100 hover:bg-charcoal hover:text-white hover:border-charcoal hover:shadow-md"
              }`}
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Lightbox / Video Player Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-8 backdrop-blur-md"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#1A1A1A] shadow-2xl flex flex-col md:flex-row border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Left Side: Video */}
              <div 
                className="relative w-full md:w-[320px] lg:w-[360px] bg-black shrink-0 aspect-[9/16] group cursor-pointer"
                onClick={togglePlay}
              >
                <video
                  ref={videoRef}
                  src={activeVideo.video_url}
                  autoPlay
                  playsInline
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                />

                {/* Desktop controls (Hidden on mobile) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none hidden md:block" />
                <div className="absolute bottom-6 left-6 gap-3 z-10 hidden md:flex">
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/20 transition-colors shadow-lg"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                    className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/20 transition-colors shadow-lg"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                {/* Mobile Overlay Content (Auto-disappears after 1 sec playing, visible on pause or hover) */}
                <div 
                  className={cn(
                    "absolute inset-x-0 bottom-0 pt-16 pb-5 px-5 bg-gradient-to-t from-black via-black/80 to-transparent md:hidden z-10 flex flex-col justify-end rounded-b-2xl transition-opacity duration-500",
                    showCaption || !isPlaying ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none group-hover:opacity-100"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex gap-3 mb-3 pointer-events-auto">
                    <button
                      onClick={togglePlay}
                      className="p-2.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-lg"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="p-2.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-lg"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="pointer-events-auto flex flex-col overflow-hidden">
                    <div className="mb-1.5 shrink-0">
                      <span className="inline-block bg-[#8C6D40]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest shadow-sm">
                        {programTitle}
                      </span>
                    </div>
                    <h4 className="text-white font-display font-semibold text-lg drop-shadow-md leading-tight shrink-0 mb-1">
                      {activeVideo.name}
                    </h4>
                    <div className="overflow-y-auto pr-2" style={{ maxHeight: "100px" }}>
                      <p className="text-white/90 text-xs drop-shadow-md leading-relaxed">{activeVideo.caption}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Content (Desktop Only) */}
              <div className="hidden w-full md:flex-1 p-8 md:p-12 lg:p-16 md:flex flex-col justify-center bg-[#1A1A1A] text-white overflow-y-auto">
                <div className="mb-6">
                  <span className="inline-block bg-[#8C6D40]/20 text-[#D4AF37] border border-[#8C6D40]/30 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest">
                    {programTitle}
                  </span>
                </div>

                <h4 className="font-display font-semibold text-3xl md:text-4xl text-white mb-6 leading-tight">
                  {activeVideo.name}
                </h4>

                <div className="relative">
                  <svg
                    className="absolute -top-6 -left-6 w-12 h-12 text-white/5 transform -scale-x-100"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                    aria-hidden="true"
                  >
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                  <p className="text-white/80 leading-relaxed text-lg md:text-xl italic relative z-10 pl-2">
                    "{activeVideo.caption}"
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
