"use client";

import { useState, useEffect } from "react";
import { Loader2, Star, Play, Pause, Volume2, VolumeX, X } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { PageShell } from "@/components/layout/page-shell";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRef } from "react";

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
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
                  <h3 className="font-display text-3xl text-charcoal mb-1">100+</h3>
                  <p className="text-xs uppercase tracking-wider text-charcoal/60">Women Transformed</p>
                </div>
              </div>
            </div>

            {/* Image Content */}
            <div className="relative w-full aspect-[4/5] lg:aspect-square rounded-none overflow-hidden shadow-sm border border-[#EBE3DB]">
              <img 
                src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80" 
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
                <section>
                  <div className="text-center mb-12">
                    <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">Video Stories</h2>
                    <p className="mt-3 text-lg text-charcoal/60">Watch their journeys unfold in their own words.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {videos.map((video) => (
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
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md shadow-lg transition-transform group-hover:scale-110 border border-white/30">
                            <Play className="ml-1 h-6 w-6 fill-white text-white" />
                          </div>
                        </div>

                        <div className="absolute bottom-0 inset-x-0 p-5 z-10">
                          <div className="mb-1.5">
                            <h4 className="text-white font-bold text-base mb-0.5 leading-tight drop-shadow-md">{video.name}</h4>
                            {getProgramName(video.program_id) && (
                              <span className="text-[#D4AF37] text-[9px] font-bold uppercase tracking-widest block drop-shadow-md">
                                {getProgramName(video.program_id)}
                              </span>
                            )}
                          </div>
                          <p className="text-white/90 font-medium text-xs line-clamp-2 leading-relaxed drop-shadow-md">
                            {video.caption}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* TEXT REVIEWS */}
              {reviews.length > 0 && (
                <section>
                  <div className="text-center mb-12">
                    <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">Written Reviews</h2>
                    <p className="mt-3 text-lg text-charcoal/60">Read what our amazing clients have to say about their experience.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((r) => (
                      <article key={r.id} className="overflow-hidden rounded-2xl border border-[#EBE3DB] bg-white shadow-sm flex flex-col hover:shadow-md transition-shadow">
                        <div className="relative flex aspect-[16/10] bg-charcoal overflow-hidden group border-b border-[#EBE3DB]">
                          {r.before_image || r.after_image ? (
                            <>
                              {r.before_image && (
                                <img src={r.before_image} alt={`${r.name} before`} className={cn("object-cover h-full", r.after_image ? "w-1/2 border-r border-black/20" : "w-full")} />
                              )}
                              {r.after_image && (
                                <img src={r.after_image} alt={`${r.name} after`} className={cn("object-cover h-full", r.before_image ? "w-1/2" : "w-full")} />
                              )}
                              {r.before_image && r.after_image && (
                                <div className="absolute inset-x-0 bottom-0 p-2 flex gap-1 justify-center bg-gradient-to-t from-black/60 to-transparent">
                                  <span className="bg-black/50 text-white text-[9px] px-3 py-0.5 rounded backdrop-blur">BEFORE & AFTER</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF8F5]">
                               <div className="h-16 w-16 rounded-full bg-[#8C6D40]/10 flex items-center justify-center mb-3">
                                 <Star className="h-6 w-6 text-[#8C6D40] opacity-50" />
                               </div>
                               <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8C6D40] opacity-60">Verified Experience</span>
                            </div>
                          )}
                          <span className="absolute left-3 top-3 rounded-full bg-charcoal/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cream backdrop-blur-sm shadow-sm border border-white/10">
                            {getProgramName(r.program_id)}
                          </span>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-[#8C6D40]/20 flex items-center justify-center font-display font-semibold text-[#8C6D40] text-lg shrink-0">
                              {r.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-charcoal">{r.name}</p>
                              <div className="flex gap-0.5 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-3.5 w-3.5 ${i < (r.rating || 5) ? 'fill-[#8C6D40] text-[#8C6D40]' : 'fill-[#EBE3DB] text-[#EBE3DB]'}`} />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 mt-2">
                            <p className="text-sm leading-relaxed text-charcoal italic bg-[#FAF8F5] p-4 rounded border border-[#EBE3DB]">
                              "{r.testimonial}"
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
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
    </PageShell>
  );
}
