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
    <section className="bg-sage-100/40 pt-7 pb-12 sm:pt-12 sm:pb-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <SectionHeading
          eyebrow="Video Stories"
          title="Watch Their Transformations Unfold"
          description="Hear directly from our clients about their journey — in their own words."
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden w-full flex items-center group py-4 mt-2 sm:mt-4">
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
    </section>
  );
}
