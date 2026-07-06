"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, X, Loader2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { useRef } from "react";

interface VideoTestimonial {
  id: string;
  video_url: string;
  caption: string;
  name: string;
  program_id: string;
  featured_on_home: boolean;
  created_at: string;
}

export function VideoTestimonialsSection() {
  const [videos, setVideos] = useState<VideoTestimonial[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/videos?featured=true").then(res => res.json()),
      fetch("/api/programs").then(res => res.json())
    ]).then(([vidData, progData]) => {
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

  if (loading) {
    return (
      <section className="bg-sage-100/40 pt-7 pb-1 sm:pt-12 sm:pb-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Video Stories" title="Watch Their Transformations Unfold" description="Hear directly from our clients about their journey — in their own words." />
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#8C6D40]" /></div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null; // Don't show section if no featured videos
  }

  return (
    <section className="bg-sage-100/40 py-6 sm:py-8 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
        <SectionHeading
          eyebrow="Video Stories"
          title="Watch Their Transformations Unfold"
          description="Hear directly from our clients about their journey — in their own words."
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden w-full flex items-center group py-2">
          <div className="flex gap-4 sm:gap-6 w-max animate-marquee-reverse group-hover:[animation-play-state:paused]">
            {Array.from({ length: Math.max(12, videos.length * 4) }).map((_, i) => {
              const video = videos[i % videos.length];
              return (
                <div
                  key={`${video.id}-${i}`}
                  className="w-[240px] sm:w-[280px] shrink-0"
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
                </div>
              );
            })}
          </div>
          <style jsx>{`
            @keyframes marquee-reverse {
              0% { transform: translateX(calc(-50% - 12px)); }
              100% { transform: translateX(0%); }
            }
            .animate-marquee-reverse {
              animation: marquee-reverse 30s linear infinite;
            }
          `}</style>
        </div>
      </div>

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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute bottom-6 left-6 flex gap-3 z-10">
                  <button onClick={togglePlay} className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/20 transition-colors shadow-lg">
                    {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                  </button>
                  <button onClick={toggleMute} className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/20 transition-colors shadow-lg">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Right Side: Content */}
              <div className="w-full md:flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-[#1A1A1A] text-white overflow-y-auto">
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
