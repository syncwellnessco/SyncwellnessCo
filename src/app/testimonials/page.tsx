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
                        
                        {getProgramName(video.program_id) && (
                          <span className="absolute left-3 top-3 rounded-full bg-charcoal/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cream backdrop-blur-sm shadow-sm border border-white/10 z-10">
                            {getProgramName(video.program_id)}
                          </span>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md shadow-lg transition-transform group-hover:scale-110 border border-white/30">
                            <Play className="ml-1 h-6 w-6 fill-white text-white" />
                          </div>
                        </div>

                        <div className="absolute bottom-0 inset-x-0 p-4">
                          <h4 className="text-white font-bold text-sm drop-shadow-md mb-1">{video.name}</h4>
                          <p className="text-white/90 font-medium text-xs drop-shadow-md line-clamp-2 leading-snug">
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-black aspect-[9/16]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 backdrop-blur-md"
              >
                <X className="h-5 w-5" />
              </button>
              
              <video 
                ref={videoRef}
                src={activeVideo.video_url} 
                autoPlay 
                playsInline
                onClick={togglePlay}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full object-cover cursor-pointer"
              />
              
              <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/80 pt-16 to-transparent flex justify-between items-end pointer-events-none">
                <div className="flex gap-3 pointer-events-auto">
                  <button onClick={togglePlay} className="p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur border border-white/20 transition-colors">
                    {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                  </button>
                  <button onClick={toggleMute} className="p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur border border-white/20 transition-colors">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                <div className="text-right flex flex-col items-end max-w-[60%] pointer-events-auto">
                  {getProgramName(activeVideo.program_id) && (
                    <span className="bg-[#8C6D40] text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest mb-2 shadow-sm">
                      {getProgramName(activeVideo.program_id)}
                    </span>
                  )}
                  <h4 className="text-white font-display font-semibold text-lg drop-shadow-md leading-tight">{activeVideo.name}</h4>
                  <p className="text-white/90 text-xs mt-1 line-clamp-3 drop-shadow-md leading-relaxed">{activeVideo.caption}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
