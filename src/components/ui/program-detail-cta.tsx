"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/user-store";
import { BookingButton } from "@/components/ui/booking-button";

const formatBookingTime = (startTime: string, timezone?: string) => {
  if (!startTime) return "";
  try {
    const date = new Date(startTime);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    return `${formattedDate} at ${formattedTime}${timezone ? ` (${timezone})` : ""}`;
  } catch (e) {
    return startTime;
  }
};

interface ProgramDetailCTAProps {
  program: any;
  position: "hero" | "bottom" | "booking-banner";
}

export function ProgramDetailCTA({ program, position }: ProgramDetailCTAProps) {
  const { 
    user,
    purchasedPrograms = [],
    bookingDetails: allBookingDetails,
    consultationsCompleted,
    setBookingDetail,
    setConsultationCompleted
  } = useUserStore();

  const [loading, setLoading] = useState(true);

  const bookingDetails = allBookingDetails[program.id] || null;
  const booked = !!bookingDetails;
  const consultationCompleted = consultationsCompleted[program.id] || false;
  const isPurchased = purchasedPrograms.includes(program.id);

  useEffect(() => {
    if (!user) {
      return;
    }
    const saved = localStorage.getItem(`booking_${program.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.time < 24 * 60 * 60 * 1000) {
          if (parsed.details) {
            setBookingDetail(program.id, parsed.details);
          }
        }
      } catch (e) {}
    }
  }, [program.id, user, setBookingDetail]);

  useEffect(() => {
    if (!program.pricing?.requireConsultant) {
      setLoading(false);
      setBookingDetail(program.id, null);
      setConsultationCompleted(program.id, false);
      return;
    }

    if (user?.email) {
      setLoading(true);
      fetch(`/api/bookings/status?email=${encodeURIComponent(user.email)}&programId=${encodeURIComponent(program.id)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setConsultationCompleted(program.id, data.completed);
            setBookingDetail(program.id, data.booking);

            if (data.completed) {
              localStorage.removeItem(`booking_${program.id}`);
            } else if (data.booking) {
              localStorage.setItem(`booking_${program.id}`, JSON.stringify({
                time: Date.now(),
                details: data.booking
              }));
            } else {
              localStorage.removeItem(`booking_${program.id}`);
            }
          }
        })
        .catch((err) => console.error("Error checking booking status:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setBookingDetail(program.id, null);
      setConsultationCompleted(program.id, false);
    }
  }, [user?.email, program.id, program.pricing?.requireConsultant, setBookingDetail, setConsultationCompleted]);

  const requireConsultant = program.pricing?.requireConsultant || false;

  const listPrice = program.pricing?.price ? Number(program.pricing.price) : null;
  const salePrice = program.pricing?.salePrice ? Number(program.pricing.salePrice) : null;
  const hasDiscount = salePrice !== null && listPrice !== null && listPrice > salePrice;
  const displayPrice = hasDiscount ? salePrice : (listPrice || 0);
  const originalPrice = listPrice || 0;

  if (position === "hero") {
    if (isPurchased) {
      return (
        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6 min-h-[56px]">
          <BookingButton 
            programId={program.id} 
            programSlug={program.slug || program.id}
            programName={program.title} 
            theme="dark"
            className="w-full sm:w-auto bg-[#8C6D40] text-white hover:bg-white hover:text-charcoal uppercase tracking-[0.15em] text-[11px] font-bold h-14 px-10 rounded-none border-0 transition-all duration-300 cursor-pointer"
          >
            Access Course
          </BookingButton>
        </div>
      );
    }

    if (requireConsultant) {
      if (consultationCompleted) {
        return (
          <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6 min-h-[56px]">
            <BookingButton 
              programId={program.id} 
              programSlug={program.slug || program.id}
              programName={program.title} 
              requireConsultant={true}
              theme="dark"
              className="w-full sm:w-auto bg-[#8C6D40] text-white hover:bg-white hover:text-charcoal uppercase tracking-[0.15em] text-[11px] font-bold h-14 px-10 rounded-none border-0 transition-all duration-300 cursor-pointer"
            >
              Booked Again
            </BookingButton>
            <div className="flex flex-col gap-1 items-start">
              <span className="text-[10px] text-white/60 font-semibold tracking-wide uppercase">
                Consultation Completed
              </span>
              <span className="text-[10px] text-white/50 font-light tracking-wide leading-normal">
                Need another call? Click above to schedule. Scroll down to view pricing and enroll.
              </span>
            </div>
          </div>
        );
      }

      if (booked) {
        return (
          <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6 min-h-[56px]">
            {bookingDetails?.join_url ? (
              <a 
                href={bookingDetails.join_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#8C6D40] text-white hover:bg-white hover:text-charcoal uppercase tracking-[0.15em] text-[11px] font-bold h-14 px-10 rounded-none border-0 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                Join Call
              </a>
            ) : (
              <button 
                disabled
                className="w-full sm:w-auto bg-white/10 text-white/50 uppercase tracking-[0.15em] text-[11px] font-bold h-14 px-10 rounded-none border border-white/10 cursor-not-allowed"
              >
                Awaiting Call
              </button>
            )}
            
            <div className="flex flex-col gap-1.5 items-start">
              <div className="flex items-baseline gap-3">
                <span className="text-white font-bold text-xl sm:text-2xl tracking-wide uppercase">
                  Scheduled
                </span>
                <span className="text-[#8C6D40] font-bold text-sm">
                  {formatBookingTime(bookingDetails?.start_time, bookingDetails?.timezone)}
                </span>
              </div>
              <span className="text-[10px] text-white/60 font-light tracking-wide max-w-xs sm:max-w-md text-left leading-normal">
                Note: Clinical coach will call you. Once call is marked done, price details & buy button will unlock here.
              </span>
            </div>
          </div>
        );
      }

      return (
        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6 min-h-[56px]">
          <BookingButton 
            programId={program.id} 
            programSlug={program.slug || program.id}
            programName={program.title} 
            requireConsultant={true}
            onBooked={(details) => setBookingDetail(program.id, details)}
            theme="dark"
            className="w-full sm:w-auto bg-[#8C6D40] text-white hover:bg-white hover:text-charcoal uppercase tracking-[0.15em] text-[11px] font-bold h-14 px-10 rounded-none border-0 transition-all duration-300 cursor-pointer"
          >
            Book Free Call
          </BookingButton>

          <div className="flex flex-col gap-1.5 items-start">
            <div className="flex items-baseline gap-3">
              <span className="text-white font-bold text-2xl sm:text-3xl">
                FREE
              </span>
              <span className="bg-white/10 text-white border border-white/20 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-none self-center">
                NO COMMITMENT
              </span>
            </div>
            <span className="text-[10px] text-white/60 font-light tracking-wide max-w-xs sm:max-w-md text-left leading-normal">
              Note: 1-to-1 consultation with our clinical coach is required before enrollment.
            </span>
          </div>
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
          className="w-full sm:w-auto bg-[#8C6D40] text-white hover:bg-white hover:text-charcoal uppercase tracking-[0.15em] text-[11px] font-bold h-14 px-10 rounded-none border-0 transition-all duration-300 cursor-pointer"
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

  if (position === "booking-banner") {
    return null;
  }

  // position === "bottom"
  if (isPurchased) {
    return (
      <div className="flex justify-center items-center gap-6 min-h-[64px]">
        <BookingButton 
          programId={program.id} 
          programSlug={program.slug || program.id}
          programName={program.title} 
          theme="light"
          className="bg-[#8C6D40] text-white hover:bg-charcoal uppercase tracking-[0.2em] text-[11px] font-bold h-16 px-12 rounded-none border-0 transition-all duration-300 w-full sm:w-auto cursor-pointer"
        >
          Access Course
        </BookingButton>
      </div>
    );
  }

  if (requireConsultant) {
    if (consultationCompleted) {
      return (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 min-h-[64px]">
          <BookingButton 
            programId={program.id} 
            programSlug={program.slug || program.id}
            programName={program.title} 
            theme="light"
            className="bg-[#8C6D40] text-white hover:bg-charcoal uppercase tracking-[0.2em] text-[11px] font-bold h-16 px-12 rounded-none border-0 transition-all duration-300 w-full sm:w-auto cursor-pointer"
          >
            Enroll Now
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

    if (booked) {
      return (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 min-h-[64px]">
          {bookingDetails?.join_url ? (
            <a 
              href={bookingDetails.join_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#8C6D40] text-white hover:bg-charcoal uppercase tracking-[0.2em] text-[11px] font-bold h-16 px-12 rounded-none border-0 transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              Join Call
            </a>
          ) : (
            <button 
              disabled
              className="bg-charcoal/5 text-charcoal/40 uppercase tracking-[0.2em] text-[11px] font-bold h-16 px-12 rounded-none border border-charcoal/10 w-full sm:w-auto cursor-not-allowed"
            >
              Awaiting Call
            </button>
          )}

          <div className="flex flex-col items-center sm:items-start gap-1.5">
            <div className="flex items-baseline gap-3">
              <span className="text-charcoal font-bold text-xl sm:text-2xl uppercase tracking-wide">
                Scheduled
              </span>
              <span className="text-[#8C6D40] font-bold text-sm">
                {formatBookingTime(bookingDetails?.start_time, bookingDetails?.timezone)}
              </span>
            </div>
            <span className="text-[10px] text-charcoal/60 font-light tracking-wide text-center sm:text-left leading-normal">
              Note: Clinical coach will call you. Once marked done, checkout will unlock here.
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row justify-center items-center gap-6 min-h-[64px]">
        <BookingButton 
          programId={program.id} 
          programSlug={program.slug || program.id}
          programName={program.title} 
          requireConsultant={true}
          onBooked={(details) => setBookingDetail(program.id, details)}
          theme="light"
          className="bg-[#8C6D40] text-white hover:bg-charcoal uppercase tracking-[0.2em] text-[11px] font-bold h-16 px-12 rounded-none border-0 transition-all duration-300 w-full sm:w-auto cursor-pointer"
        >
          Book Free Call
        </BookingButton>

        <div className="flex flex-col items-center sm:items-start gap-1.5">
          <div className="flex items-baseline gap-3">
            <span className="text-charcoal font-bold text-2xl sm:text-3xl">
              FREE
            </span>
            <span className="bg-charcoal/5 text-charcoal border border-charcoal/10 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-none self-center">
              NO COMMITMENT
            </span>
          </div>
          <span className="text-[10px] text-charcoal/60 font-light tracking-wide text-center sm:text-left leading-normal">
            Note: 1-to-1 consultation is required before enrollment.
          </span>
        </div>
      </div>
    );
  }

  // Remove pricing from bottom for all other courses
  return null;
}
