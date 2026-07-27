"use client";

import { useState, useEffect } from "react";
import { Loader2, Star, Play, Pause, Volume2, VolumeX, X } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { PageShell } from "@/components/layout/page-shell";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { IMAGES } from "@/data/images";

interface Review {
  id: string;
  program_id: string;
  name: string;
  testimonial: string;
  before_image: string | null;
  after_image: string | null;
  rating: number;
}

interface VideoTestimonial {
  id: string;
  video_url: string;
  caption: string;
  name: string;
  program_id: string;
}

export default function TestimonialsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [videos, setVideos] = useState<VideoTestimonial[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);
  const [activeReview, setActiveReview] = useState<Review | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPage, setVideoPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const videoSectionRef = useRef<HTMLDivElement>(null);
  const reviewSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/reviews?status=published").then(res => res.json()),
      fetch("/api/videos").then(res => res.json()),
      fetch("/api/programs").then(res => res.json())
    ]).then(([revData, vidData, progData]) => {
      setReviews(Array.isArray(revData) ? revData : []);
      setVideos(Array.isArray(vidData) ? vidData : []);
      setPrograms(Array.isArray(progData) ? progData : []);
      setLoading(false);
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

  const totalVideoPages = Math.ceil(videos.length / ITEMS_PER_PAGE);
  const paginatedVideos = videos.slice(
    (videoPage - 1) * ITEMS_PER_PAGE,
    videoPage * ITEMS_PER_PAGE
  );

  const totalReviewPages = Math.ceil(reviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = reviews.slice(
    (reviewPage - 1) * ITEMS_PER_PAGE,
    reviewPage * ITEMS_PER_PAGE
  );

  const handleVideoPageChange = (page: number) => {
    setVideoPage(page);
    if (videoSectionRef.current) {
      videoSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReviewPageChange = (page: number) => {
    setReviewPage(page);
    if (reviewSectionRef.current) {
      reviewSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <PageShell>
      <article className="bg-cream">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Text Content */}
            <div className="flex flex-col">
              <span className="mb-4 inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C6D40]">
                Success Stories
              </span>
              <h1 className="font-display text-5xl lg:text-6xl font-normal text-charcoal mb-6 leading-tight">
                Real Transformations, <br />
                <span className="italic text-[#8C6D40]">Real Results.</span>
              </h1>
              <p className="text-base lg:text-lg leading-relaxed text-charcoal/80 mb-10 max-w-lg">
                Discover how women just like you have reclaimed their health, balanced their hormones, and achieved sustainable fat loss through our personalized protocols.
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#EBE3DB]">
                <div>
                  <h3 className="font-display text-3xl text-charcoal mb-1">98%</h3>
                  <p className="text-xs uppercase tracking-wider text-charcoal/60">Report higher energy</p>
                </div>
                <div>
                  <h3 className="font-display text-3xl text-charcoal mb-1">500+</h3>
                  <p className="text-xs uppercase tracking-wider text-charcoal/60">Women Transformed</p>
                </div>
              </div>
            </div>

            {/* Image Content */}
            <div className="relative w-full aspect-[4/5] lg:aspect-square rounded-none overflow-hidden shadow-sm border border-[#EBE3DB]">
              <img 
                src={IMAGES.testimonialsPageHero} 
                alt="Happy woman smiling"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-[12px] border-cream/20 mix-blend-overlay"></div>
            </div>
          </div>
        </section>
      </article>

      <div className="bg-[#FAF8F5] py-16 sm:py-24 border-t border-[#EBE3DB]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-[#8C6D40]" /></div>
          ) : (
            <div className="space-y-24">
              
              {/* VIDEO TESTIMONIALS */}
              {videos.length > 0 && (
                <section ref={videoSectionRef}>
                  <div className="text-center mb-12">
                    <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">Video Stories</h2>
                    <p className="mt-3 text-lg text-charcoal/60">Watch their journeys unfold in their own words.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {paginatedVideos.map((video) => (
                      <article
                        key={video.id}
                        className="group cursor-pointer overflow-hidden rounded-2xl border border-beige-200 bg-cream shadow-sm transition-shadow hover:shadow-lg relative aspect-[9/16] bg-black"
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
                            <h4 className="text-white font-bold text-xs sm:text-base mb-0.5 leading-tight drop-shadow-md">{video.name}</h4>
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
                  </div>

                  {totalVideoPages > 1 && (
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-10">
                      <button
                        onClick={() => handleVideoPageChange(Math.max(1, videoPage - 1))}
                        disabled={videoPage === 1}
                        className="px-3 py-1.5 rounded-sm border border-[#EBE3DB] bg-white text-xs font-semibold uppercase tracking-wider text-charcoal disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8C6D40] hover:text-white transition-colors"
                      >
                        Prev
                      </button>
                      {Array.from({ length: totalVideoPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handleVideoPageChange(page)}
                          className={`h-8 w-8 rounded-sm text-xs font-semibold transition-colors ${
                            page === videoPage
                              ? "bg-[#8C6D40] text-white shadow-sm"
                              : "bg-white border border-[#EBE3DB] text-charcoal hover:bg-[#8C6D40]/10 hover:text-[#8C6D40]"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => handleVideoPageChange(Math.min(totalVideoPages, videoPage + 1))}
                        disabled={videoPage === totalVideoPages}
                        className="px-3 py-1.5 rounded-sm border border-[#EBE3DB] bg-white text-xs font-semibold uppercase tracking-wider text-charcoal disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8C6D40] hover:text-white transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* TEXT REVIEWS */}
              {reviews.length > 0 && (
                <section ref={reviewSectionRef}>
                  <div className="text-center mb-12">
                    <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">Written Reviews</h2>
                    <p className="mt-3 text-lg text-charcoal/60">Read what our amazing clients have to say about their experience.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {paginatedReviews.map((r) => (
                      <article 
                        key={r.id}
                        className="bg-white rounded-md border border-[#EBE3DB] shadow-sm cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#8C6D40]/30 group/card flex flex-col h-full overflow-hidden"
                        onClick={() => setActiveReview(r)}
                      >
                        {/* Images Top Half */}
                        <div className="relative w-full aspect-[16/10] bg-charcoal/5 flex overflow-hidden border-b border-[#EBE3DB] shrink-0">
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
                          
                          <div className="flex items-center gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-[#EBE3DB]/50 mt-auto">
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
                    ))}
                  </div>

                  {totalReviewPages > 1 && (
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-10">
                      <button
                        onClick={() => handleReviewPageChange(Math.max(1, reviewPage - 1))}
                        disabled={reviewPage === 1}
                        className="px-3 py-1.5 rounded-sm border border-[#EBE3DB] bg-white text-xs font-semibold uppercase tracking-wider text-charcoal disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8C6D40] hover:text-white transition-colors"
                      >
                        Prev
                      </button>
                      {Array.from({ length: totalReviewPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handleReviewPageChange(page)}
                          className={`h-8 w-8 rounded-sm text-xs font-semibold transition-colors ${
                            page === reviewPage
                              ? "bg-[#8C6D40] text-white shadow-sm"
                              : "bg-white border border-[#EBE3DB] text-charcoal hover:bg-[#8C6D40]/10 hover:text-[#8C6D40]"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => handleReviewPageChange(Math.min(totalReviewPages, reviewPage + 1))}
                        disabled={reviewPage === totalReviewPages}
                        className="px-3 py-1.5 rounded-sm border border-[#EBE3DB] bg-white text-xs font-semibold uppercase tracking-wider text-charcoal disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8C6D40] hover:text-white transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </section>
              )}

            </div>
          )}
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
              <div className="relative w-full md:w-[320px] lg:w-[360px] bg-black shrink-0 aspect-[9/16]">
                <video 
                  ref={videoRef}
                  src={activeVideo.video_url} 
                  autoPlay 
                  playsInline
                  onClick={togglePlay}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                />
                
                {/* Desktop controls (Hidden on mobile) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none hidden md:block" />
                <div className="absolute bottom-6 left-6 gap-3 z-10 hidden md:flex">
                  <button onClick={togglePlay} className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/20 transition-colors shadow-lg">
                    {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                  </button>
                  <button onClick={toggleMute} className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/20 transition-colors shadow-lg">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                {/* Mobile Overlay Content (Hidden on Desktop) */}
                <div className="absolute inset-x-0 bottom-0 pt-32 pb-6 px-5 bg-gradient-to-t from-black via-black/80 to-transparent md:hidden z-10 flex flex-col justify-end pointer-events-none rounded-b-2xl">
                  <div className="flex gap-3 mb-4 pointer-events-auto">
                    <button onClick={togglePlay} className="p-2.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-lg">
                      {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                    </button>
                    <button onClick={toggleMute} className="p-2.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-lg">
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="pointer-events-auto flex flex-col overflow-hidden">
                    {getProgramName(activeVideo.program_id) && (
                      <div className="mb-2 shrink-0">
                        <span className="inline-block bg-[#8C6D40]/80 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest shadow-sm">
                          {getProgramName(activeVideo.program_id)}
                        </span>
                      </div>
                    )}
                    <h4 className="text-white font-display font-semibold text-xl drop-shadow-md leading-tight shrink-0 mb-2">{activeVideo.name}</h4>
                    <div className="overflow-y-auto pr-2" style={{ maxHeight: '150px' }}>
                      <p className="text-white/90 text-sm drop-shadow-md leading-relaxed">{activeVideo.caption}</p>
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
    </PageShell>
  );
}
