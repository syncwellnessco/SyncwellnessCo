"use client";

import { useState } from "react";
import { Volume2, VolumeX, X } from "lucide-react";
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
    <div className="relative flex flex-col gap-8 w-full max-w-lg mx-auto lg:ml-auto">
      {videoUrl && (
        <div 
          className={cn(
            "relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10 group cursor-pointer",
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
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
            src={videoUrl} 
          />

          {/* Mute / Unmute Button at Bottom Right */}
          <button 
            type="button"
            onClick={toggleMute}
            className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full bg-charcoal/80 flex items-center justify-center backdrop-blur-md text-white hover:bg-white hover:text-charcoal transition-colors shadow-lg"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      )}

      {imageUrl && (
        <div 
          className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10 group cursor-pointer"
          onClick={() => setActiveModal('image')}
        >
          <img src={imageUrl} alt={title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-charcoal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {!videoUrl && !imageUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10 bg-charcoal/50 flex items-center justify-center">
          <span className="text-white/50 font-display">No media</span>
        </div>
      )}

      {/* Decorative element */}
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#8C6D40] rounded-none mix-blend-multiply opacity-50 blur-2xl z-[-1]" />

      {/* Modal */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/95 backdrop-blur-sm p-4"
          onClick={() => setActiveModal(null)}
        >
          <button 
            type="button"
            onClick={() => setActiveModal(null)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors p-2 z-[110] bg-charcoal/40 rounded-full"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div 
            className={`w-full max-w-5xl rounded-none overflow-hidden shadow-2xl bg-black relative z-[100] ${activeModal === 'video' ? 'aspect-video' : 'max-h-[90vh]'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {activeModal === 'video' && videoUrl && (
              <video 
                autoPlay 
                controls 
                className="absolute inset-0 h-full w-full object-contain" 
                src={videoUrl} 
              />
            )}
            
            {activeModal === 'image' && imageUrl && (
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-full h-full max-h-[90vh] object-contain" 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
