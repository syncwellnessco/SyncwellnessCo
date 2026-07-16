"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/user-store";
import { BookingButton } from "@/components/ui/booking-button";

interface ProgramDetailCTAProps {
  program: any;
  position: "hero" | "bottom";
}

export function ProgramDetailCTA({ program, position }: ProgramDetailCTAProps) {
  const { user } = useUserStore();
  const [consultationCompleted, setConsultationCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`booking_${program.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.time < 24 * 60 * 60 * 1000) {
          setBooked(true);
        }
      } catch (e) {}
    }
  }, [program.id]);

  useEffect(() => {
    if (user?.email) {
      setLoading(true);
      fetch(`/api/bookings/check?email=${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.completed) {
            setConsultationCompleted(true);
          }
        })
        .catch((err) => console.error("Error checking booking status:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const requireConsultant = program.pricing?.requireConsultant && !consultationCompleted;

  const listPrice = program.pricing?.price ? Number(program.pricing.price) : null;
  const salePrice = program.pricing?.salePrice ? Number(program.pricing.salePrice) : null;
  const hasDiscount = salePrice !== null && listPrice !== null && listPrice > salePrice;
  const displayPrice = hasDiscount ? salePrice : (listPrice || 0);
  const originalPrice = listPrice || 0;

  if (position === "hero") {
    if (requireConsultant) {
      return (
        <div className="mt-12 w-full max-w-3xl bg-white/[0.04] backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group">
          {/* Background design elements */}
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#8C6D40]/10 blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[#B8955F]/5 blur-2xl pointer-events-none" />

          <div className="flex items-start gap-4 z-10">
            <div className="p-3 bg-white/[0.04] border border-white/10 rounded-sm mt-1 shrink-0 text-[#B8955F]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <span className="text-white font-medium text-[16px] sm:text-[18px] leading-snug font-display tracking-wide">
                Book Free 1-to-1 Consultation
              </span>
              <p className="text-white/60 text-xs sm:text-sm max-w-xl font-light leading-relaxed">
                Schedule a private session with our clinical coach to assess your goals and find the right path for your health journey.
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[9px] sm:text-[10px] font-bold text-[#B8955F] uppercase tracking-widest bg-[#B8955F]/10 border border-[#B8955F]/20 px-2.5 py-0.5 rounded-full">
                  100% Free
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-[#B8955F] uppercase tracking-widest bg-[#B8955F]/10 border border-[#B8955F]/20 px-2.5 py-0.5 rounded-full">
                  No Commitment
                </span>
              </div>
            </div>
          </div>

          <BookingButton 
            programId={program.id} 
            programSlug={program.slug || program.id}
            programName={program.title} 
            requireConsultant={true}
            onBooked={() => setBooked(true)}
            theme="dark"
            className="w-full md:w-auto bg-[#8C6D40] text-white hover:bg-white hover:text-charcoal uppercase tracking-[0.2em] text-[10px] font-bold h-14 px-10 rounded-none border-0 transition-all duration-300 z-10 shrink-0 shadow-lg hover:shadow-xl"
          >
            Book Now
          </BookingButton>
        </div>
      );
    }

    return (
      <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6 min-h-[56px]">
        <BookingButton 
          programId={program.id} 
          programSlug={program.slug || program.id}
          programName={program.title} 
          theme="dark"
          className="w-full sm:w-auto bg-[#8C6D40] text-white hover:bg-white hover:text-charcoal uppercase tracking-[0.15em] text-[11px] font-bold h-14 px-10 rounded-none border-0 transition-all duration-300"
        >
          {program.hero?.ctaText || "Join Program"}
        </BookingButton>
        
        {program.pricing && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-3">
              {hasDiscount ? (
                <>
                  <span className="text-white/60 line-through font-light text-base">
                    ${originalPrice} AUD
                  </span>
                  <span className="text-white font-bold text-2xl sm:text-3xl">
                    ${displayPrice} AUD
                  </span>
                  <span className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-none self-center">
                    SAVE ${originalPrice - displayPrice}
                  </span>
                </>
              ) : (
                <span className="text-white font-bold text-2xl sm:text-3xl">
                  ${displayPrice} AUD
                </span>
              )}
            </div>
            <span className="text-[10px] text-white/60 font-light tracking-wide">
              Note: Special pricing valid today only, subject to change.
            </span>
          </div>
        )}
      </div>
    );
  }

  // position === "bottom"
  if (requireConsultant) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-[#FAF8F5] border border-[#EBE3DB] p-6 sm:p-8 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Background design elements */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#8C6D40]/5 blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110" />
        
        <div className="flex items-start gap-4 z-10">
          <div className="p-3 bg-white border border-[#EBE3DB] rounded-sm mt-1 shrink-0 text-[#8C6D40]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1.5 text-left">
            <span className="text-charcoal font-medium text-[16px] sm:text-[18px] leading-snug font-display tracking-wide">
              Book Free 1-to-1 Consultation
            </span>
            <p className="text-charcoal/70 text-xs sm:text-sm max-w-xl font-light leading-relaxed">
              Schedule a private session with our clinical coach to assess your goals and find the right path for your health journey.
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[9px] sm:text-[10px] font-bold text-[#8C6D40] uppercase tracking-widest bg-[#8C6D40]/5 border border-[#8C6D40]/15 px-2.5 py-0.5 rounded-full">
                100% Free
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#8C6D40] uppercase tracking-widest bg-[#8C6D40]/5 border border-[#8C6D40]/15 px-2.5 py-0.5 rounded-full">
                No Commitment
              </span>
            </div>
          </div>
        </div>

        <BookingButton 
          programId={program.id} 
          programSlug={program.slug || program.id}
          programName={program.title} 
          requireConsultant={true}
          onBooked={() => setBooked(true)}
          theme="light"
          className="w-full md:w-auto bg-[#8C6D40] text-white hover:bg-charcoal uppercase tracking-[0.2em] text-[10px] font-bold h-14 px-10 rounded-none border-0 transition-all duration-300 z-10 shrink-0 shadow-md hover:shadow-lg"
        >
          Book Now
        </BookingButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-6 min-h-[64px]">
      <BookingButton 
        programId={program.id} 
        programSlug={program.slug || program.id}
        programName={program.title} 
        theme="light"
        className="bg-[#8C6D40] text-white hover:bg-charcoal uppercase tracking-[0.2em] text-[11px] font-bold h-16 px-12 rounded-none border-0 transition-all duration-300 w-full sm:w-auto"
      >
        {program.hero?.ctaText || "Join Program"}
      </BookingButton>
      {program.pricing && (
        <div className="flex flex-col items-center sm:items-start gap-1.5">
          <div className="flex items-baseline gap-3">
            {hasDiscount ? (
              <>
                <span className="text-charcoal/60 line-through font-light text-lg">
                  ${originalPrice} AUD
                </span>
                <span className="text-charcoal font-bold text-2xl sm:text-3xl">
                  ${displayPrice} AUD
                </span>
                <span className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-none self-center">
                  SAVE ${originalPrice - displayPrice}
                </span>
              </>
            ) : (
              <span className="text-charcoal font-bold text-2xl sm:text-3xl">
                ${displayPrice} AUD
              </span>
            )}
          </div>
          <span className="text-[10px] text-charcoal/60 font-light tracking-wide">
            Note: Special pricing valid today only, subject to change.
          </span>
        </div>
      )}
    </div>
  );
}
