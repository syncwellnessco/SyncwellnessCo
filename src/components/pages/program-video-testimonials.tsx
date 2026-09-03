"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, X, ChevronDown, Loader2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { VideoCardSkeleton, VideoCardSkeletonGrid } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface VideoTestimonial {
  id: string;
  video_url: string;
  caption: string;
  name: string;
  program_id: string;
  program_ids?: string[];
  featured_on_home?: boolean;
  created_at?: string;
}

interface ProgramVideoTestimonialsProps {
  programId: string;
  programTitle: string;
}

function ProgramVideoCard({
  video,
  programTitle,
  onClick,
}: {
  video: VideoTestimonial;
  programTitle: string;
  onClick: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const optimizedUrl = video.video_url.includes("#t=")
    ? video.video_url
    : `${video.video_url}#t=0.001`;

  return (
    <article
      className="group cursor-pointer overflow-hidden rounded-2xl border border-beige-200 bg-[#1A1F21] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative aspect-[9/16]"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {/* Boneyard Skeleton Overlay while video is loading/buffering */}
      <div
        className={cn(
          "absolute inset-0 z-10 transition-opacity duration-500",
          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <VideoCardSkeleton className="h-full w-full rounded-none border-0 shadow-none" />
      </div>

      <video
        ref={videoRef}
        src={optimizedUrl}
        preload="auto"
        muted
        playsInline
        onLoadedData={() => setIsLoaded(true)}
        onCanPlay={() => setIsLoaded(true)}
        className={cn(
          "w-full h-full object-cover transition-all duration-500 group-hover:scale-105",
          isLoaded ? "opacity-80 group-hover:opacity-100" : "opacity-0"
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
          !isLoaded && "opacity-0"
        )}
      >
        <div className="flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md shadow-lg transition-transform group-hover:scale-110 border border-white/30">
          <Play className="ml-0.5 sm:ml-1 h-4 w-4 sm:h-6 sm:w-6 fill-white text-white" />
        </div>
      </div>

      <div
        className={cn(
          "absolute bottom-0 inset-x-0 p-3 sm:p-5 z-10 transition-opacity duration-300",
          !isLoaded && "opacity-0"
        )}
      >
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
  );
}

export function ProgramVideoTestimonials({ programId, programTitle }: ProgramVideoTestimonialsProps) {
  const [videos, setVideos] = useState<VideoTestimonial[]>([]);
  const [totalVideos, setTotalVideos] = useState(0);
  const [hasMoreVideos, setHasMoreVideos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMoreVideos, setLoadingMoreVideos] = useState(false);

  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaption, setShowCaption] = useState(true);
  const [isModalVideoReady, setIsModalVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideCaptionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const INITIAL_VIDEO_LIMIT = 8; // 2 rows of 4 videos
  const VIDEO_BATCH_SIZE = 4;     // 1 row of 4 videos

  useEffect(() => {
    if (activeVideo) {
      setIsModalVideoReady(false);
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

  useEffect(() => {
    setLoading(true);
    fetch(`/api/videos?program_id=${programId}&limit=${INITIAL_VIDEO_LIMIT}&offset=0`)
      .then((res) => res.json())
      .then((res) => {
        if (res && typeof res === "object" && "data" in res) {
          setVideos(res.data || []);
          setTotalVideos(res.total || 0);
          setHasMoreVideos(res.hasMore ?? false);
        } else {
          setVideos(Array.isArray(res) ? res : []);
          setTotalVideos(Array.isArray(res) ? res.length : 0);
          setHasMoreVideos(false);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching program video testimonials:", err);
        setLoading(false);
      });
  }, [programId]);

  const handleLoadMoreVideos = async () => {
    if (loadingMoreVideos) return;
    setLoadingMoreVideos(true);
    try {
      const currentOffset = videos.length;
      const res = await fetch(`/api/videos?program_id=${programId}&limit=${VIDEO_BATCH_SIZE}&offset=${currentOffset}`).then((r) => r.json());
      if (res && res.data) {
        setVideos((prev) => [...prev, ...res.data]);
        setTotalVideos(res.total || totalVideos);
        setHasMoreVideos(res.hasMore ?? false);
      }
    } catch (e) {
      console.error("Error loading more videos:", e);
    } finally {
      setLoadingMoreVideos(false);
    }
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

  if (!loading && videos.length === 0) {
    return null; // No videos, no section at all
  }

  return (
    <section className="bg-sage-100/40 py-10 sm:py-16 border-t border-[#EBE3DB] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <SectionHeading
          eyebrow="Video Stories"
          title="What People Say"
          description={`Hear directly from clients who completed ${programTitle} in their own words.`}
          align="center"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {loading ? (
          /* Video Skeleton Grid Loader (8 count = 2 rows of 4) */
          <VideoCardSkeletonGrid count={INITIAL_VIDEO_LIMIT} />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {videos.map((video) => (
                <ProgramVideoCard
                  key={video.id}
                  video={video}
                  programTitle={programTitle}
                  onClick={() => setActiveVideo(video)}
                />
              ))}

              {/* Skeleton Cards while loading more videos */}
              {loadingMoreVideos &&
                [...Array(VIDEO_BATCH_SIZE)].map((_, i) => (
                  <VideoCardSkeleton key={`video-skel-${i}`} />
                ))}
            </div>

            {/* LOAD MORE BUTTON FOR VIDEOS */}
            {hasMoreVideos && (
              <div className="flex flex-col items-center justify-center pt-8 sm:pt-12 pb-4 sm:pb-8 gap-2 text-center">
                <button
                  onClick={handleLoadMoreVideos}
                  disabled={loadingMoreVideos}
                  className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-sm bg-charcoal text-cream text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#8C6D40] disabled:opacity-60 transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                  <span>{loadingMoreVideos ? "Loading Videos..." : "Load More Videos"}</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5 text-gold-light" />
                </button>
                <p className="text-[11px] text-charcoal/50">
                  Showing {videos.length} of {totalVideos || videos.length} video testimonials
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox / Video Player Modal */}
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
                <div
                  className={cn(
                    "absolute inset-0 z-10 transition-opacity duration-500",
                    isModalVideoReady ? "opacity-0 pointer-events-none" : "opacity-100"
                  )}
                >
                  <VideoCardSkeleton className="h-full w-full rounded-none border-0 shadow-none" />
                </div>

                <video
                  ref={videoRef}
                  src={activeVideo.video_url.includes("#t=") ? activeVideo.video_url : `${activeVideo.video_url}#t=0.001`}
                  autoPlay
                  playsInline
                  preload="auto"
                  onLoadedData={() => setIsModalVideoReady(true)}
                  onCanPlay={() => setIsModalVideoReady(true)}
                  onPlaying={() => {
                    setIsModalVideoReady(true);
                    setIsPlaying(true);
                  }}
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)}
                  className={cn(
                    "absolute inset-0 w-full h-full object-cover cursor-pointer transition-opacity duration-300",
                    isModalVideoReady ? "opacity-100" : "opacity-0"
                  )}
                />

                {/* Desktop controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none hidden md:block" />
                <div className="absolute bottom-6 left-6 gap-3 z-10 hidden md:flex">
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/20 transition-colors shadow-lg"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                    className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/20 transition-colors shadow-lg"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                {/* Mobile Overlay Content */}
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
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="p-2.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-lg"
                      aria-label={isMuted ? "Unmute" : "Mute"}
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
