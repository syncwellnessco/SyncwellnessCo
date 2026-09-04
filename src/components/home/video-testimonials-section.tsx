"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, X, Loader2, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { useRef } from "react";
import { InteractiveLink } from "@/components/ui/interactive-link";
import { cn } from "@/lib/utils";
import { VideoCardSkeleton, VideoCardSkeletonGrid } from "@/components/ui/skeleton";

interface VideoTestimonial {
  id: string;
  video_url: string;
  caption: string;
  name: string;
  program_id: string;
  featured_on_home: boolean;
  created_at: string;
}

interface HomeVideoCardProps {
  video: VideoTestimonial;
  programName?: string;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent, callback: () => void) => void;
  onSelect: () => void;
}

function HomeVideoCard({ video, programName, onPointerDown, onPointerUp, onSelect }: HomeVideoCardProps) {
  const optimizedUrl = video.video_url.includes("#t=")
    ? video.video_url
    : `${video.video_url}#t=0.001`;

  return (
    <article
      className="group cursor-pointer overflow-hidden rounded-2xl border border-beige-200 bg-[#1A1F21] shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1 relative aspect-[9/16]"
      onPointerDown={onPointerDown}
      onPointerUp={(e) => onPointerUp(e, onSelect)}
      role="button"
      tabIndex={0}
    >
      <video 
        src={optimizedUrl} 
        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 pointer-events-none opacity-90 group-hover:opacity-100"
        preload="metadata"
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300 group-hover:scale-110">
        <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md shadow-lg border border-white/30">
          <Play className="ml-0.5 sm:ml-1 h-4 w-4 sm:h-6 sm:w-6 fill-white text-white" />
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-3 sm:p-5 z-10 pointer-events-none">
        <div className="mb-1 sm:mb-1.5">
          <h4 className="text-white font-bold text-xs sm:text-base mb-0.5 leading-tight drop-shadow-md">{video.name}</h4>
          {programName && (
            <span className="text-[#D4AF37] text-[8px] sm:text-[9px] font-bold uppercase tracking-widest block drop-shadow-md">
              {programName}
            </span>
          )}
        </div>
        <p className="text-white/90 font-medium text-[10px] sm:text-xs line-clamp-2 leading-relaxed drop-shadow-md">
          {video.caption}
        </p>
      </div>
    </article>
  );
}

export function VideoTestimonialsSection() {
  const [videos, setVideos] = useState<VideoTestimonial[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaption, setShowCaption] = useState(true);
  const [userExpanded, setUserExpanded] = useState(false);
  const [isModalVideoReady, setIsModalVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideCaptionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeVideo) {
      setIsModalVideoReady(false);
      setShowCaption(true);
      setIsPlaying(true);
    }
  }, [activeVideo?.id]);

  useEffect(() => {
    if (activeVideo && isPlaying) {
      hideCaptionTimerRef.current = setTimeout(() => {
        setShowCaption(false);
      }, 1200);
    } else {
      setShowCaption(true);
    }
    return () => {
      if (hideCaptionTimerRef.current) {
        clearTimeout(hideCaptionTimerRef.current);
      }
    };
  }, [activeVideo, isPlaying]);

  const isExpanded = !isPlaying || userExpanded;
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

  useEffect(() => {
    Promise.allSettled([
      fetch("/api/videos?featured=true&limit=10").then(res => res.json()),
      fetch("/api/programs").then(res => res.json())
    ]).then(([vidSettled, progSettled]) => {
      if (vidSettled.status === "fulfilled") {
        const vidData = vidSettled.value;
        const items = Array.isArray(vidData) ? vidData : (Array.isArray(vidData?.data) ? vidData.data : []);
        setVideos(items);
      }
      if (progSettled.status === "fulfilled") {
        const progData = progSettled.value;
        setPrograms(Array.isArray(progData) ? progData : []);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (activeVideo) {
      document.body.style.overflow = "hidden";
      setIsPlaying(true);
      setUserExpanded(false);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeVideo]);

  const getProgramName = (id: string) => {
    const p = programs.find(x => x.id === id);
    return p ? p.title : "";
  };

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

  if (loading) {
    return (
      <section className="bg-sage-100/40 pt-7 pb-1 sm:pt-12 sm:pb-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Video Stories" title="Watch Their Transformations Unfold" description="Hear directly from our clients about their journey in their own words." />
          <div className="mt-8">
            <VideoCardSkeletonGrid count={4} />
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null; // Don't show section if no featured videos
  }

  return (
    <section className="bg-sage-100/40 pt-6 pb-7 sm:pt-10 sm:pb-9 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
        <SectionHeading
          eyebrow="Video Stories"
          title="Watch Their Transformations Unfold"
          description="Hear directly from our clients about their journey in their own words."
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative w-full">
          <MarqueeCarousel speed={1.5} reverse>
            {Array.from({ length: Math.max(12, videos.length * 4) }).map((_, i) => {
              const video = videos[i % videos.length];
              return (
                <div
                  key={`${video.id}-${i}`}
                  className="w-[calc(50vw-1.25rem)] sm:w-[280px] shrink-0 select-none"
                >
                  <HomeVideoCard
                    video={video}
                    programName={getProgramName(video.program_id)}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onSelect={() => setActiveVideo(video)}
                  />
                </div>
              );
            })}
          </MarqueeCarousel>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <InteractiveLink
            href="/testimonials"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal transition-colors hover:text-[#8C6D40]"
          >
            Show More Testimonials
            <ArrowRight className="h-4 w-4" />
          </InteractiveLink>
        </div>
      </div>

      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 sm:p-4 md:p-8 backdrop-blur-md"
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
                aria-label="Close video"
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
                  src={activeVideo.video_url.includes("#t=") ? activeVideo.video_url : `${activeVideo.video_url}#t=0.001`} 
                  autoPlay 
                  playsInline
                  preload="auto"
                  onLoadedMetadata={() => setIsModalVideoReady(true)}
                  onLoadedData={() => setIsModalVideoReady(true)}
                  onCanPlay={() => setIsModalVideoReady(true)}
                  onPlaying={() => {
                    setIsModalVideoReady(true);
                    setIsPlaying(true);
                  }}
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)}
                  className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                />
                
                {/* Desktop controls (Hidden on mobile) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none hidden md:block" />
                <div className="absolute bottom-6 left-6 gap-3 z-10 hidden md:flex">
                  <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/20 transition-colors shadow-lg" aria-label={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/20 transition-colors shadow-lg" aria-label={isMuted ? "Unmute" : "Mute"}>
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                {/* Mobile Overlay Content (Hidden on Desktop) */}
                <div 
                  className={cn(
                    "absolute inset-x-0 bottom-0 pt-16 pb-5 px-5 bg-gradient-to-t from-black via-black/80 to-transparent md:hidden z-10 flex flex-col justify-end rounded-b-2xl transition-opacity duration-500",
                    showCaption || !isPlaying ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none group-hover:opacity-100"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex gap-3 mb-3 pointer-events-auto">
                    <button onClick={togglePlay} className="p-2.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-lg">
                      {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                    </button>
                    <button onClick={toggleMute} className="p-2.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-lg">
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="pointer-events-auto flex flex-col overflow-hidden">
                    {getProgramName(activeVideo.program_id) && (
                      <div className="mb-1.5 shrink-0">
                        <span className="inline-block bg-[#8C6D40]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest shadow-sm">
                          {getProgramName(activeVideo.program_id)}
                        </span>
                      </div>
                    )}
                    <h4 className="text-white font-display font-semibold text-lg drop-shadow-md leading-tight shrink-0 mb-1">{activeVideo.name}</h4>
                    <div 
                      className="cursor-pointer mt-1 pointer-events-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserExpanded(!userExpanded);
                      }}
                    >
                      <div className={cn(
                        "transition-all duration-300",
                        isExpanded ? "max-h-[120px] overflow-y-auto pr-2" : "line-clamp-2"
                      )}>
                        <p className="text-white/90 text-xs drop-shadow-md leading-relaxed">
                          {activeVideo.caption}
                        </p>
                      </div>
                      
                      {activeVideo.caption.length > 80 && (
                        <span className="mt-2 inline-flex items-center text-[10px] font-bold text-white uppercase tracking-[0.12em] bg-white/10 hover:bg-white/20 px-2 py-1 rounded-sm border border-white/20 transition-colors">
                          {isExpanded ? "Read Less" : "Read More"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Content (Desktop Only) */}
              <div className="hidden w-full md:flex-1 p-8 md:p-12 lg:p-16 md:flex flex-col justify-center bg-[#1A1A1A] text-white overflow-y-auto">
                {getProgramName(activeVideo.program_id) && (
                  <div className="mb-6">
                    <span className="inline-block bg-[#8C6D40]/20 text-[#D4AF37] border border-[#8C6D40]/30 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest">
                      {getProgramName(activeVideo.program_id)}
                    </span>
                  </div>
                )}
                
                <h4 className="font-display font-semibold text-3xl md:text-4xl text-white mb-6 leading-tight">
                  {activeVideo.name}
                </h4>
                
                <div className="relative">
                  <svg className="absolute -top-6 -left-6 w-12 h-12 text-white/5 transform -scale-x-100" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
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

interface MarqueeCarouselProps {
  children: React.ReactNode;
  speed?: number;
  reverse?: boolean;
}

function MarqueeCarousel({ children, speed = 1, reverse = false }: MarqueeCarouselProps) {
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
      } else if (!isHoveredRef.current) {
        if (reverse) {
          scrollPosRef.current -= speed;
        } else {
          scrollPosRef.current += speed;
        }
        
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
  }, [speed, reverse]);

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
      className="overflow-x-auto scrollbar-none flex select-none w-full gap-4 sm:gap-6 pt-3 pb-1 cursor-grab active:cursor-grabbing"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {children}
    </div>
  );
}
