"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { aboutContent, brandContent } from "@/data/about-content";
import { IMAGES } from "@/data/images";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export function AboutPageContent() {
  const coachImageSrc = IMAGES.aboutPageProfile;
  const coachVideoSrc = "/about.mp4";

  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.log("Autoplay was blocked or failed:", err);
          setIsPlaying(false);
        });
    }
  }, []);

  const handlePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.log(err));
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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
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

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <article className="bg-[#FAF8F5] min-h-screen">
      
      {/* Title Header */}
      <section className="pt-6 pb-4 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <span className="text-xs uppercase tracking-[0.15em] font-bold text-[#8C6D40] mb-3 block">
          About Our Founder
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-charcoal mb-4">
          {aboutContent.aboutCoach.name}
        </h1>
        <h2 className="text-xs sm:text-sm uppercase tracking-[0.1em] font-bold text-charcoal/60 max-w-2xl mx-auto leading-relaxed">
          {aboutContent.aboutCoach.title}
          <span className="mx-2 text-charcoal/30">&bull;</span>
          {aboutContent.certifications.join(" • ")}
        </h2>
      </section>

      {/* Standalone Video Player Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mb-6 sm:mb-8">
        <div 
          className="relative aspect-video w-full rounded-2xl overflow-hidden bg-charcoal shadow-2xl border border-beige-200 group select-none"
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            poster={coachImageSrc}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            onLoadedMetadata={handleDurationChange}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={coachVideoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Clickable overlay to toggle play/pause */}
          <div 
            onClick={() => handlePlayPause()}
            className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all duration-300 cursor-pointer"
          />

          {/* Custom Controls Layout */}
          
          {/* Center Play/Pause Button */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <button
              onClick={() => handlePlayPause()}
              type="button"
              className={`p-6 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-white active:scale-95 transition-all duration-300 pointer-events-auto focus:outline-none flex items-center justify-center ${
                isPlaying ? "opacity-0 scale-75 pointer-events-none" : "opacity-100 scale-100 pointer-events-auto"
              }`}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-white text-white" />
              ) : (
                <Play className="w-8 h-8 fill-white text-white translate-x-[1.5px]" />
              )}
            </button>
          </div>

          {/* Top Right Mute Button */}
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={handleMuteUnmute}
              type="button"
              className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-white active:scale-95 cursor-pointer focus:outline-none flex items-center justify-center transition-all duration-300 opacity-100 pointer-events-auto"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>
          </div>

          {/* Bottom Seekbar */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className={`absolute bottom-0 left-0 right-0 z-20 px-4 pb-3 transition-all duration-300 ${
              isPlaying 
                ? "opacity-0 pointer-events-none translate-y-1 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0" 
                : "opacity-100 pointer-events-auto translate-y-0"
            }`}
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
      </section>

      {/* Story details */}
      <section className="pt-0 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="space-y-6 text-[15px] sm:text-base leading-relaxed text-charcoal/80">
          {aboutContent.story.map((paragraph, index) => (
            <p key={index} className={index === 5 ? "font-display text-2xl text-[#8C6D40] italic my-8 block text-center" : ""}>
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* Why I Help Women Section */}
      <section className="py-20 lg:py-32 bg-[#EBE3DB]/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs uppercase tracking-[0.15em] font-bold text-[#8C6D40] mb-4 block">
            The Purpose
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal mb-10">
            {aboutContent.whyIHelpWomen.title}
          </h2>
          
          <div className="space-y-6 text-[15px] md:text-base leading-relaxed text-charcoal/80 text-left md:text-center">
            {aboutContent.whyIHelpWomen.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Coaching Philosophy Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-24 items-start">
            <div>
              <span className="text-xs uppercase tracking-[0.15em] font-bold text-[#8C6D40] mb-4 block">
                Methodology
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal mb-8">
                {aboutContent.coachingPhilosophy.title}
              </h2>
              <div className="space-y-6 text-[15px] md:text-base leading-relaxed text-charcoal/80 mb-8">
                {aboutContent.coachingPhilosophy.intro.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-8 sm:p-10 lg:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#EBE3DB] rounded-sm">
              <ul className="space-y-4">
                {aboutContent.coachingPhilosophy.bullets.map((bullet, index) => (
                  <li key={index} className="flex items-center text-charcoal/90 text-[15px] md:text-base">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D40] mr-4 flex-shrink-0"></span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 pt-8 border-t border-[#EBE3DB]">
                <p className="font-display text-xl text-charcoal italic">
                  "{aboutContent.coachingPhilosophy.outro}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes My Approach Different Section */}
      <section className="py-20 lg:py-32 bg-[#2A2A2A] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.15em] font-bold text-[#8C6D40] mb-4 block">
              The Difference
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-8">
              {aboutContent.whatMakesMyApproachDifferent.title}
            </h2>
            <div className="space-y-6 text-[15px] md:text-base leading-relaxed text-white/80">
              {aboutContent.whatMakesMyApproachDifferent.intro.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {aboutContent.whatMakesMyApproachDifferent.bullets.map((bullet, index) => (
              <div key={index} className="flex items-center bg-white/5 border border-white/10 p-4 sm:p-5 rounded-sm hover:bg-white/10 transition-colors">
                <span className="text-[#8C6D40] mr-4 text-xl">✓</span>
                <span className="text-white/90 text-sm tracking-wide">{bullet}</span>
              </div>
            ))}
          </div>
          
          <div className="max-w-3xl mx-auto mt-16 text-center space-y-4">
            {aboutContent.whatMakesMyApproachDifferent.outro.map((paragraph, index) => (
              <p key={index} className={index > 0 ? "font-display text-xl lg:text-2xl text-[#8C6D40]" : "text-[15px] md:text-base text-white/80"}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Business Values, Vision, Mission Section */}
      <section className="py-20 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-24 mb-24 items-center">
            <div className="bg-[#EBE3DB]/40 p-8 sm:p-10 lg:p-14 border-l-4 border-[#8C6D40]">
              <span className="text-xs uppercase tracking-[0.15em] font-bold text-charcoal/50 mb-3 block">Our Vision</span>
              <p className="font-display text-2xl md:text-3xl leading-snug text-charcoal">
                {brandContent.vision}
              </p>
            </div>
            <div className="p-4 sm:p-0">
              <span className="text-xs uppercase tracking-[0.15em] font-bold text-charcoal/50 mb-3 block">Our Mission</span>
              <p className="text-[17px] md:text-lg lg:text-xl leading-relaxed text-charcoal/80">
                {brandContent.mission}
              </p>
            </div>
          </div>

          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.15em] font-bold text-[#8C6D40] mb-4 block">
              Core Principles
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal">
              Business Values
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {brandContent.coreValues.map((value, index) => (
              <div key={index} className="bg-white p-8 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-[#FAF8F5] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] rounded-sm">
                <h3 className="font-display text-xl text-[#8C6D40] mb-3">{value.title}</h3>
                <p className="text-sm leading-relaxed text-charcoal/70">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
          
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 bg-[#EBE3DB]/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal mb-8">
            Ready to transform your health?
          </h2>
          <Link
            href="/programs"
            className="inline-flex items-center justify-center bg-charcoal text-white hover:bg-[#8C6D40] uppercase tracking-[0.15em] text-[11px] md:text-[12px] font-medium py-4 px-10 transition-colors duration-300 rounded-sm"
          >
            Explore Our Programmes
          </Link>
        </div>
      </section>

    </article>
  );
}
