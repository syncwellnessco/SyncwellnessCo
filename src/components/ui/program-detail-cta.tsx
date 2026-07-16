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
    return (
      <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6 min-h-[56px]">
        {requireConsultant ? (
          <>
            <BookingButton 
              programId={program.id} 
              programSlug={program.slug || program.id}
              programName={program.title} 
              requireConsultant={true}
              onBooked={() => setBooked(true)}
              theme="dark"
              className="w-full sm:w-auto bg-[#8C6D40] text-white hover:bg-white hover:text-charcoal uppercase tracking-[0.15em] text-[11px] font-bold h-14 px-10 rounded-none border-0 transition-all duration-300"
            >
              Book Now
            </BookingButton>
            {!booked && (
              <div className="flex flex-col gap-1">
                <span className="text-white font-medium text-[15px] sm:text-[16px] leading-snug">
                  Book free 1-to-1 consultation with our coach
                </span>
                <span className="text-[11px] text-[#B8955F] uppercase font-bold tracking-wider">
                  100% Free • No commitment
                </span>
              </div>
            )}
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    );
  }

  // position === "bottom"
  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-6 min-h-[64px]">
      {requireConsultant ? (
        <>
          <BookingButton 
            programId={program.id} 
            programSlug={program.slug || program.id}
            programName={program.title} 
            requireConsultant={true}
            onBooked={() => setBooked(true)}
            theme="light"
            className="bg-[#8C6D40] text-white hover:bg-charcoal uppercase tracking-[0.2em] text-[11px] font-bold h-16 px-12 rounded-none border-0 transition-all duration-300 w-full sm:w-auto"
          >
            Book Now
          </BookingButton>
          {!booked && (
            <div className="flex flex-col items-center sm:items-start gap-1">
              <span className="text-charcoal font-medium text-[16px] leading-snug">
                Book free 1-to-1 consultation with our coach
              </span>
              <span className="text-[11px] text-[#8C6D40] uppercase font-bold tracking-wider">
                100% Free • No commitment
              </span>
            </div>
          )}
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
