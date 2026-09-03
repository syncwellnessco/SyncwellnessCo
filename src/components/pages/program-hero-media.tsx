"use client";

import { useState, useRef, useEffect } from "react";
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
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isModalVideoReady, setIsModalVideoReady] = useState(false);
  const [activeModal, setActiveModal] = useState<'video' | 'image' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
          {/* Boneyard Skeleton Loader while video loads */}
          <div
            className={cn(
              "absolute inset-0 z-10 transition-opacity duration-500",
              isVideoReady ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            <VideoHeroSkeleton className="rounded-none border-0 shadow-none h-full w-full" />
          </div>

          <video 
            ref={videoRef}
            autoPlay 
            muted={isMuted || activeModal === 'video'} 
            loop 
            playsInline 
            preload="auto"
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
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105",
              isVideoReady ? "opacity-100" : "opacity-0"
            )}
            src={optimizedVideoUrl} 
          />

          {/* Center Play/Pause Icon Overlay */}
          <div 
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-300 z-20",
              !isVideoReady && "hidden",
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
          <div className={cn("absolute top-4 right-4 z-20 transition-opacity duration-300", !isVideoReady && "opacity-0 pointer-events-none")}>
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
            className={cn(
              "absolute bottom-0 left-0 right-0 z-20 px-4 pb-3 opacity-90 hover:opacity-100 transition-all duration-300",
              !isVideoReady && "opacity-0 pointer-events-none"
            )}
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

      {/* Lightbox Video / Image Modal */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center pt-20 sm:pt-24 pb-6 sm:pb-8 px-4 sm:px-6 bg-charcoal/95 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <button 
            type="button"
            onClick={() => setActiveModal(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white hover:text-gray-300 transition-colors p-2.5 z-[210] bg-charcoal/60 hover:bg-charcoal/90 rounded-full cursor-pointer border border-white/10 shadow-lg"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          
          <div 
            className="relative z-[205] max-h-[75vh] sm:max-h-[80vh] max-w-[95vw] sm:max-w-[90vw] rounded-2xl overflow-hidden shadow-2xl bg-black flex items-center justify-center border border-white/10 my-auto min-w-[280px] min-h-[360px]"
            onClick={(e) => e.stopPropagation()}
          >
            {activeModal === 'video' && videoUrl && (
              <>
                <div
                  className={cn(
                    "absolute inset-0 z-10 transition-opacity duration-500",
                    isModalVideoReady ? "opacity-0 pointer-events-none" : "opacity-100"
                  )}
                >
                  <VideoHeroSkeleton className="rounded-none border-0 shadow-none h-full w-full" />
                </div>
                <video 
                  autoPlay 
                  controls 
                  playsInline
                  preload="auto"
                  onLoadedData={() => setIsModalVideoReady(true)}
                  onCanPlay={() => setIsModalVideoReady(true)}
                  onPlaying={() => setIsModalVideoReady(true)}
                  className={cn(
                    "max-h-[75vh] sm:max-h-[80vh] max-w-[95vw] sm:max-w-[90vw] w-auto h-auto rounded-2xl object-contain transition-opacity duration-300",
                    isModalVideoReady ? "opacity-100" : "opacity-0"
                  )} 
                  src={optimizedVideoUrl} 
                  onLoadedMetadata={(e) => {
                    if (currentTime > 0 && currentTime < (duration || 9999)) {
                      e.currentTarget.currentTime = currentTime;
                    }
                  }}
                />
              </>
            )}
            
            {activeModal === 'image' && imageUrl && (
              <img 
                src={imageUrl} 
                alt={title} 
                className="max-h-[75vh] sm:max-h-[80vh] max-w-[95vw] sm:max-w-[90vw] w-auto h-auto rounded-2xl object-contain" 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
