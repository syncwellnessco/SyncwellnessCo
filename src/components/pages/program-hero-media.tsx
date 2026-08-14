"use client";

import { useState } from "react";
import { Play, Volume2, VolumeX, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgramHeroMediaProps {
  videoUrl?: string;
  imageUrl?: string;
  title: string;
  hideVideoOnMobile?: boolean;
}

export function ProgramHeroMedia({ videoUrl, imageUrl, title, hideVideoOnMobile }: ProgramHeroMediaProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [activeModal, setActiveModal] = useState<'video' | 'image' | null>(null);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  return (
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto lg:ml-auto">
      {videoUrl ? (
        <div 
          className={cn(
            "relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group cursor-pointer bg-charcoal",
            hideVideoOnMobile && "hidden lg:block"
          )}
          onClick={() => {
            setIsMuted(true);
            setActiveModal('video');
          }}
        >
          <video 
            autoPlay 
            muted={isMuted || activeModal === 'video'} 
            loop 
            playsInline 
            poster={imageUrl}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
            src={videoUrl} 
          />

          {/* Center Play Icon Overlay */}
          <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 bg-black/20 pointer-events-none">
            <div className="p-4 rounded-full bg-white/20 border border-white/30 backdrop-blur-md shadow-xl text-white">
              <Play className="w-8 h-8 fill-white text-white translate-x-[2px]" />
            </div>
          </div>

          {/* Mute / Unmute Button at Top Right */}
          <div className="absolute top-4 right-4 z-20">
            <button 
              type="button"
              onClick={toggleMute}
              className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-md shadow-lg text-white active:scale-95 cursor-pointer transition-all duration-300 flex items-center justify-center"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>
      ) : imageUrl ? (
        <div 
          className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group cursor-pointer bg-charcoal"
          onClick={() => setActiveModal('image')}
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
            className="relative z-[205] max-h-[75vh] sm:max-h-[80vh] max-w-[90vw] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-black flex items-center justify-center border border-white/10 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {activeModal === 'video' && videoUrl && (
              <video 
                autoPlay 
                controls 
                playsInline
                className="w-full h-full object-cover rounded-2xl" 
                src={videoUrl} 
              />
            )}
            
            {activeModal === 'image' && imageUrl && (
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-full h-full object-cover rounded-2xl" 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

