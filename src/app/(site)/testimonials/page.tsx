"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Star, Play, Pause, Volume2, VolumeX, X, ChevronDown, Sparkles, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { IMAGES } from "@/data/media";
import { useReviewStore, Review } from "@/store/review-store";
import {
  VideoCardSkeleton,
  VideoCardSkeletonGrid,
  ReviewCardSkeleton,
  ReviewCardSkeletonGrid,
} from "@/components/ui/skeleton";

interface VideoTestimonial {
  id: string;
  video_url: string;
  caption: string;
  name: string;
  program_id: string;
}

export default function TestimonialsPage() {
  const { submittedReviews } = useReviewStore();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);

  const [videos, setVideos] = useState<VideoTestimonial[]>([]);
  const [totalVideos, setTotalVideos] = useState(0);
  const [hasMoreVideos, setHasMoreVideos] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [loadingMoreVideos, setLoadingMoreVideos] = useState(false);

  const [programs, setPrograms] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);
  const [activeReview, setActiveReview] = useState<Review | null>(null);
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

  const videoSectionRef = useRef<HTMLDivElement>(null);
  const reviewSectionRef = useRef<HTMLDivElement>(null);

  // Initial Limits: 2 rows of videos (8) and 2 rows of reviews (6)
  const INITIAL_VIDEO_LIMIT = 8;
  const VIDEO_BATCH_SIZE = 4;
  const INITIAL_REVIEW_LIMIT = 6;
  const REVIEW_BATCH_SIZE = 6;

  // Combine fetched reviews with Zustand submittedReviews
  const allReviews: Review[] = [
    ...submittedReviews,
    ...reviews.filter((r) => !submittedReviews.some((sr) => sr.id === r.id)),
  ];

  useEffect(() => {
    // Initial fetch: 2 rows of videos (8) and 2 rows of reviews (6)
    Promise.all([
      fetch(`/api/videos?limit=${INITIAL_VIDEO_LIMIT}&offset=0`).then((res) => res.json()),
      fetch(`/api/reviews?status=published&limit=${INITIAL_REVIEW_LIMIT}&offset=0`).then((res) => res.json()),
      fetch("/api/programs").then((res) => res.json()),
    ]).then(([vidRes, revRes, progData]) => {
      if (vidRes && typeof vidRes === "object" && "data" in vidRes) {
        setVideos(vidRes.data || []);
        setTotalVideos(vidRes.total || 0);
        setHasMoreVideos(vidRes.hasMore ?? false);
      } else {
        setVideos(Array.isArray(vidRes) ? vidRes : []);
        setTotalVideos(Array.isArray(vidRes) ? vidRes.length : 0);
        setHasMoreVideos(false);
      }
      setVideoLoading(false);

      if (revRes && typeof revRes === "object" && "data" in revRes) {
        setReviews(revRes.data || []);
        setTotalReviews(revRes.total || 0);
        setHasMoreReviews(revRes.hasMore ?? false);
      } else {
        setReviews(Array.isArray(revRes) ? revRes : []);
        setTotalReviews(Array.isArray(revRes) ? revRes.length : 0);
        setHasMoreReviews(false);
      }
      setReviewLoading(false);

      setPrograms(Array.isArray(progData) ? progData : []);
    });
  }, []);

  useEffect(() => {
    if (activeVideo || activeReview) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeVideo, activeReview]);

  const getProgramName = (id: string) => {
    const p = programs.find((x) => x.id === id);
    return p ? p.title : "Program";
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleLoadMoreVideos = async () => {
    if (loadingMoreVideos) return;
    setLoadingMoreVideos(true);
    try {
      const currentOffset = videos.length;
      const res = await fetch(`/api/videos?limit=${VIDEO_BATCH_SIZE}&offset=${currentOffset}`).then((r) => r.json());
      if (res && res.data) {
        setVideos((prev) => [...prev, ...res.data]);
        setTotalVideos(res.total || totalVideos);
        setHasMoreVideos(res.hasMore ?? false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMoreVideos(false);
    }
  };

  const handleLoadMoreReviews = async () => {
    if (loadingMoreReviews) return;
    setLoadingMoreReviews(true);
    try {
      const currentOffset = reviews.length;
      const res = await fetch(`/api/reviews?status=published&limit=${REVIEW_BATCH_SIZE}&offset=${currentOffset}`).then((r) => r.json());
      if (res && res.data) {
        setReviews((prev) => [...prev, ...res.data]);
        setTotalReviews(res.total || totalReviews);
        setHasMoreReviews(res.hasMore ?? false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMoreReviews(false);
    }
  };

  return (
    <PageShell noPadding>
      {/* 1. TOP ANNOUNCEMENT BAR (Brand Charcoal & Gold Accent) */}
      <div className="bg-charcoal text-cream py-2.5 px-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] border-b border-beige-200/20">
        <div className="mx-auto max-w-7xl flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#b38c50]" />
          <span>GLOBAL IMPACT • PROVEN RESULTS</span>
          <Sparkles className="w-3.5 h-3.5 text-[#b38c50] hidden sm:inline" />
        </div>
      </div>

      {/* 2. HERO WIDE BANNER (Brand Aesthetic with Dark Faded Bottom Gradient) */}
      <section className="relative w-full bg-background overflow-hidden border-b border-beige-200">
        {/* Landscape Hero Image Frame */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[21/7] lg:aspect-[21/6] min-h-[380px] max-h-[500px] bg-charcoal overflow-hidden">
          <img
            src={IMAGES.testimonialsPageHero}
            alt="Syncwellness transformations and client journeys"
            className="w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
          />

          {/* Dark Faded Color Gradient Emerging From Bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/65 via-45% to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-transparent to-transparent pointer-events-none" />
          
          {/* Banner Text Content Layer */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto w-full z-10">
            <div className="max-w-2xl">
              <span className="inline-block text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#d4b896] mb-2 drop-shadow-sm">
                Syncwellness Client Showcase
              </span>
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-normal text-[#f2ece4] leading-tight drop-shadow-md mb-3">
                Real Transformations, <br />
                <span className="italic text-[#d4b896]">Real Results.</span>
              </h1>
              <p className="text-[#efe8df]/85 font-sans text-xs sm:text-base font-normal max-w-xl leading-relaxed drop-shadow-sm hidden sm:block">
                Discover authentic video stories and verified client reviews from women who restored their balance, energy, and overall health with our protocols.
              </p>
            </div>
          </div>
        </div>

        {/* Brand Stats Bar (All 4 in 1 row on mobile & desktop) */}
        <div className="bg-beige-100/70 border-t border-b border-beige-200 py-4 sm:py-8">
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="grid grid-cols-4 gap-1 sm:gap-6 text-center divide-x divide-beige-200">
              <div className="px-1 sm:px-2">
                <h3 className="font-display text-lg sm:text-3xl lg:text-4xl text-charcoal font-normal">98%</h3>
                <p className="text-[8px] sm:text-[11px] uppercase tracking-wider text-charcoal/70 font-semibold mt-0.5 sm:mt-1 leading-tight">Report Higher Energy</p>
              </div>
              <div className="px-1 sm:px-2">
                <h3 className="font-display text-lg sm:text-3xl lg:text-4xl text-charcoal font-normal">500+</h3>
                <p className="text-[8px] sm:text-[11px] uppercase tracking-wider text-charcoal/70 font-semibold mt-0.5 sm:mt-1 leading-tight">Women Transformed</p>
              </div>
              <div className="px-1 sm:px-2">
                <h3 className="font-display text-lg sm:text-3xl lg:text-4xl text-charcoal font-normal">4.9 / 5</h3>
                <p className="text-[8px] sm:text-[11px] uppercase tracking-wider text-charcoal/70 font-semibold mt-0.5 sm:mt-1 leading-tight">Average Satisfaction</p>
              </div>
              <div className="px-1 sm:px-2">
                <h3 className="font-display text-lg sm:text-3xl lg:text-4xl text-charcoal font-normal">100%</h3>
                <p className="text-[8px] sm:text-[11px] uppercase tracking-wider text-charcoal/70 font-semibold mt-0.5 sm:mt-1 leading-tight">Verified Client Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT AREA */}
      <div className="bg-background py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-0">
            {/* VIDEO TESTIMONIALS SECTION */}
            <section ref={videoSectionRef}>
              <div className="mb-6 sm:mb-8">
                <h3 className="font-display text-2xl sm:text-3xl font-normal text-charcoal">Video Stories</h3>
                <p className="mt-1 text-xs sm:text-sm text-charcoal/60">Watch their journeys unfold in their own words.</p>
              </div>

              {videoLoading ? (
                /* Video Skeleton Grid Loader */
                <VideoCardSkeletonGrid count={8} />
              ) : videos.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {videos.map((video) => (
                      <article
                        key={video.id}
                        className="group cursor-pointer overflow-hidden rounded-2xl border border-beige-200 bg-cream shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative aspect-[9/16] bg-black"
                        onClick={() => setActiveVideo(video)}
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
                            {getProgramName(video.program_id) && (
                              <span className="text-[#D4AF37] text-[8px] sm:text-[9px] font-bold uppercase tracking-widest block drop-shadow-md">
                                {getProgramName(video.program_id)}
                              </span>
                            )}
                          </div>
                          <p className="text-white/90 font-medium text-[10px] sm:text-xs line-clamp-2 leading-relaxed drop-shadow-md">
                            {video.caption}
                          </p>
                        </div>
                      </article>
                    ))}

                    {/* Next Row Skeleton Cards while loading more videos */}
                    {loadingMoreVideos &&
                      [...Array(4)].map((_, i) => (
                        <VideoCardSkeleton key={`video-skel-${i}`} />
                      ))}
                  </div>

                  {/* LOAD MORE BUTTON FOR VIDEOS */}
                  {hasMoreVideos && (
                    <div className="flex flex-col items-center justify-center pt-8 sm:pt-12 pb-8 sm:pb-12 gap-2 text-center">
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
              ) : null}
            </section>

            {/* WRITTEN REVIEWS SECTION */}
            <section ref={reviewSectionRef} className="pt-8 sm:pt-12 border-t border-beige-200">
              <div className="mb-6 sm:mb-8">
                <h3 className="font-display text-2xl sm:text-3xl font-normal text-charcoal">Written Reviews & Results</h3>
                <p className="mt-1 text-xs sm:text-sm text-charcoal/60">Read client feedback and verified transformation experiences.</p>
              </div>

              {reviewLoading ? (
                /* Written Reviews Skeleton Grid Loader */
                <ReviewCardSkeletonGrid count={6} />
              ) : allReviews.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {allReviews.map((r) => (
                      <article
                        key={r.id}
                        className="bg-white rounded-md border border-beige-200 shadow-sm cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#8C6D40]/30 group/card flex flex-col h-full overflow-hidden"
                        onClick={() => setActiveReview(r)}
                      >
                        {/* Images Top Half */}
                        <div className="relative w-full aspect-[16/10] bg-charcoal/5 flex overflow-hidden border-b border-beige-100 shrink-0">
                          {r.before_image || r.after_image ? (
                            <>
                              {r.before_image && (
                                <div className={`relative h-full ${r.after_image ? "w-1/2" : "w-full"}`}>
                                  <img
                                    src={r.before_image}
                                    alt="Before"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                                  />
                                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[8px] sm:text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded-sm backdrop-blur-sm z-10">
                                    Before
                                  </span>
                                </div>
                              )}
                              {r.after_image && (
                                <div className={`relative h-full ${r.before_image ? "w-1/2" : "w-full"}`}>
                                  <img
                                    src={r.after_image}
                                    alt="After"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                                  />
                                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[8px] sm:text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded-sm backdrop-blur-sm z-10">
                                    After
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF8F5]">
                              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#8C6D40]/10 flex items-center justify-center mb-2">
                                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-[#8C6D40] opacity-50" />
                              </div>
                              <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8C6D40] opacity-60">
                                Verified Experience
                              </span>
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
                              <h4 className="font-semibold text-charcoal text-xs sm:text-[13px] truncate max-w-[120px] sm:max-w-[160px]">
                                {r.name}
                              </h4>
                              <div className="flex text-[#8C6D40] mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-2.5 w-2.5 ${
                                      i < (r.rating || 5) ? "fill-current" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}

                    {/* Next Rows Skeleton Cards while loading more reviews */}
                    {loadingMoreReviews &&
                      [...Array(6)].map((_, i) => (
                        <ReviewCardSkeleton key={`review-skel-${i}`} />
                      ))}
                  </div>

                  {/* LOAD MORE BUTTON FOR REVIEWS */}
                  {hasMoreReviews && (
                    <div className="flex flex-col items-center justify-center pt-8 sm:pt-12 pb-4 sm:pb-8 gap-2 text-center">
                      <button
                        onClick={handleLoadMoreReviews}
                        disabled={loadingMoreReviews}
                        className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-sm bg-charcoal text-cream text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#8C6D40] disabled:opacity-60 transition-all shadow-sm hover:shadow-md active:scale-95"
                      >
                        <span>{loadingMoreReviews ? "Loading Reviews..." : "Load More Reviews"}</span>
                        <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5 text-gold-light" />
                      </button>
                      <p className="text-[11px] text-charcoal/50">
                        Showing {allReviews.length} of {totalReviews || allReviews.length} written reviews
                      </p>
                    </div>
                  )}
                </>
              ) : null}
            </section>
          </div>
        </div>
      </div>


      {/* Video Modal */}
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
                
                {/* Desktop controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none hidden md:block" />
                <div className="absolute bottom-6 left-6 gap-3 z-10 hidden md:flex">
                  <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/20 transition-colors shadow-lg">
                    {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/20 transition-colors shadow-lg">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                {/* Mobile Overlay Content (Auto disappears after 1 sec of playing, visible on pause or hover) */}
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
                    <div className="overflow-y-auto pr-2" style={{ maxHeight: '100px' }}>
                      <p className="text-white/90 text-xs drop-shadow-md leading-relaxed">{activeVideo.caption}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Content (Desktop) */}
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
      
      {/* Review Read Modal */}
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
                    {getProgramName(activeReview.program_id) && (
                      <div className="mb-4">
                        <span className="inline-block bg-[#8C6D40]/10 text-[#8C6D40] border border-[#8C6D40]/20 text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider">
                          {getProgramName(activeReview.program_id)}
                        </span>
                      </div>
                    )}

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

                    <div className="relative mb-6">
                      <span className="absolute -top-4 -left-3 font-serif text-5xl text-[#8C6D40]/10 pointer-events-none select-none">
                        “
                      </span>
                      <p className="text-charcoal/90 text-sm sm:text-base leading-relaxed italic relative z-10 font-serif whitespace-pre-wrap">
                        "{activeReview.testimonial}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-5 border-t border-beige-200/60 mt-auto">
                    <div className="h-10 w-10 rounded-full bg-[#8C6D40]/10 flex items-center justify-center font-display font-semibold text-[#8C6D40] text-sm shrink-0">
                      {activeReview.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-charcoal text-sm">
                        {activeReview.name}
                      </h4>
                      <span className="text-[10px] text-charcoal/50 uppercase tracking-widest font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#8C6D40]" />
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
    </PageShell>
  );
}
