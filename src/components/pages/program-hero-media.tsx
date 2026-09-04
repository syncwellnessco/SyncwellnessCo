"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Play, Pause, Volume2, VolumeX, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoHeroSkeleton } from "@/components/ui/skeleton";

interface ProgramHeroMediaProps {
  videoUrl?: string;
  imageUrl?: string;
  title: string;
  hideVideoOnMobile?: boolean;
  linkHref?: string;
}

export function ProgramHeroMedia({
  videoUrl,
  imageUrl,
  title,
  hideVideoOnMobile,
  linkHref,
}: ProgramHeroMediaProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isModalVideoReady, setIsModalVideoReady] = useState(false);
  const [activeModal, setActiveModal] = useState<'video' | 'image' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Optimized video URL with keyframe fragment for immediate browser decoding
  const optimizedVideoUrl = videoUrl
    ? (videoUrl.includes("#t=") ? videoUrl : `${videoUrl}#t=0.001`)
    : undefined;

  useEffect(() => {
    // If video element is already ready (e.g. cached)
    if (videoRef.current && videoRef.current.readyState >= 2) {
      setIsVideoReady(true);
    }
  }, [videoUrl]);

  useEffect(() => {
    if (activeModal) {
      setIsModalVideoReady(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.muted = true;
        setIsMuted(true);
      }
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setActiveModal(null);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeModal]);

  const handleContainerClick = () => {
    if (linkHref) {
      router.push(linkHref);
    } else {
      setActiveModal('video');
    }
  };

  const handleImageContainerClick = () => {
    if (linkHref) {
      router.push(linkHref);
    } else {
      setActiveModal('image');
    }
  };

  const handlePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleMuteUnmute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto lg:ml-auto">
      {videoUrl ? (
        <div 
          className={cn(
            "relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group cursor-pointer bg-[#1A1F21] select-none",
            hideVideoOnMobile && "hidden lg:block"
          )}
          onClick={handleContainerClick}
        >
          <video 
            ref={videoRef}
            autoPlay 
            muted={isMuted || activeModal === 'video'} 
            loop 
            playsInline 
            preload="auto"
            onLoadedMetadata={(e) => {
              setIsVideoReady(true);
              setDuration(e.currentTarget.duration || 0);
            }}
            onLoadedData={() => setIsVideoReady(true)}
            onCanPlay={() => setIsVideoReady(true)}
            onPlaying={() => {
              setIsVideoReady(true);
              setIsPlaying(true);
            }}
            onTimeUpdate={(e) => {
              if (!isVideoReady) setIsVideoReady(true);
              setCurrentTime(e.currentTarget.currentTime);
            }}
            onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
            src={optimizedVideoUrl} 
          />

          {/* Center Play/Pause Icon Overlay */}
          <div 
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-300 z-20",
              isPlaying 
                ? "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto" 
                : "opacity-100 pointer-events-auto"
            )}
          >
            <button
              type="button"
              onClick={handlePlayPause}
              className="p-4 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-md shadow-xl text-white active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-white text-white" />
              ) : (
                <Play className="w-8 h-8 fill-white text-white translate-x-[2px]" />
              )}
            </button>
          </div>

          {/* Mute / Unmute Button at Top Right */}
          <div className="absolute top-4 right-4 z-20 transition-opacity duration-300">
            <button 
              type="button"
              onClick={handleMuteUnmute}
              className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-md shadow-lg text-white active:scale-95 cursor-pointer transition-all duration-300 flex items-center justify-center"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>
          </div>

          {/* Bottom Seekbar */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-3 opacity-90 hover:opacity-100 transition-all duration-300"
          >
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              style={{
                background: `linear-gradient(to right, #8C6D40 0%, #8C6D40 ${progressPercent}%, rgba(255, 255, 255, 0.2) ${progressPercent}%, rgba(255, 255, 255, 0.2) 100%)`
              }}
              className="w-full h-1 rounded-lg appearance-none cursor-pointer outline-none transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-125 [&::-webkit-slider-thumb]:transition-transform"
              aria-label="Seek video"
            />
          </div>
        </div>
      ) : imageUrl ? (
        <div 
          className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group cursor-pointer bg-charcoal"
          onClick={handleImageContainerClick}
        >
          <img src={imageUrl} alt={title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-charcoal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ) : (
        <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-charcoal/50 flex items-center justify-center">
          <span className="text-white/50 font-display">No media</span>
        </div>
      )}

      {/* Lightbox Video / Image Modal rendered in Portal for perfect full screen & high z-index */}
      {activeModal && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden"
          onClick={() => setActiveModal(null)}
        >
          {/* Minimal Mobile-Only Exit Button */}
          <button 
            type="button"
            onClick={() => setActiveModal(null)}
            className="md:hidden absolute top-3 right-3 text-white/70 hover:text-white p-1.5 z-[10000] bg-black/40 hover:bg-black/60 rounded-none cursor-pointer border border-white/10 backdrop-blur-sm active:scale-95 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div 
            className="relative z-[9999] max-h-[85vh] sm:max-h-[90vh] max-w-[95vw] sm:max-w-[85vw] rounded-2xl overflow-hidden shadow-2xl bg-black flex items-center justify-center border border-white/15 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {activeModal === 'video' && videoUrl && (
              <>
                <video 
                  autoPlay 
                  controls 
                  playsInline
                  preload="auto"
                  onLoadedMetadata={(e) => {
                    setIsModalVideoReady(true);
                    if (currentTime > 0 && currentTime < (duration || 9999)) {
                      e.currentTarget.currentTime = currentTime;
                    }
                  }}
                  onLoadedData={() => setIsModalVideoReady(true)}
                  onCanPlay={() => setIsModalVideoReady(true)}
                  onPlaying={() => setIsModalVideoReady(true)}
                  className="max-h-[85vh] sm:max-h-[90vh] max-w-[95vw] sm:max-w-[85vw] w-auto h-auto rounded-2xl object-contain"
                  src={optimizedVideoUrl} 
                />
              </>
            )}
            
            {activeModal === 'image' && imageUrl && (
              <img 
                src={imageUrl} 
                alt={title} 
                className="max-h-[85vh] sm:max-h-[90vh] max-w-[95vw] sm:max-w-[85vw] w-auto h-auto rounded-2xl object-contain" 
              />
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
