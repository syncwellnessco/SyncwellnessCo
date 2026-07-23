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

const isBookingOver = (booking: any) => {
  if (!booking) return true;
  if (booking.completed) return true;
  if (booking.end_time) {
    return Date.now() > new Date(booking.end_time).getTime();
  }
  if (booking.start_time) {
    return Date.now() > (new Date(booking.start_time).getTime() + 60 * 60 * 1000);
  }
  return false;
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

  const rawBookingDetails = allBookingDetails[program.id] || null;
  const bookingDetails = (rawBookingDetails && user && rawBookingDetails.email && rawBookingDetails.email.toLowerCase() === user.email.toLowerCase() && !isBookingOver(rawBookingDetails)) 
    ? rawBookingDetails 
    : null;
  const booked = !!bookingDetails;
  const consultationCompleted = consultationsCompleted[program.id] || false;
  const isPurchased = purchasedPrograms.includes(program.id);

  useEffect(() => {
    if (!user?.email) {
      return;
    }
    const saved = localStorage.getItem(`booking_${program.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const details = parsed.details;
        if (details && details.email && details.email.toLowerCase() === user.email.toLowerCase() && !isBookingOver(details)) {
          setBookingDetail(program.id, details);
        } else {
          localStorage.removeItem(`booking_${program.id}`);
          setBookingDetail(program.id, null);
        }
      } catch (e) {}
    }
  }, [program.id, user?.email, setBookingDetail]);

  useEffect(() => {
    if (user?.email) {
      setTimeout(() => {
        setLoading(true);
      }, 0);
      fetch(`/api/bookings/status?email=${encodeURIComponent(user.email)}&programId=${encodeURIComponent(program.id)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setConsultationCompleted(program.id, data.completed);
            
            const booking = data.booking;
            // Only set booking detail if active, not completed, not over, and belongs to current user
            if (booking && !booking.completed && !isBookingOver(booking) && booking.email && booking.email.toLowerCase() === user.email.toLowerCase()) {
              setBookingDetail(program.id, booking);
              localStorage.setItem(`booking_${program.id}`, JSON.stringify({
                time: Date.now(),
                details: booking
              }));
            } else {
              setBookingDetail(program.id, null);
              localStorage.removeItem(`booking_${program.id}`);
            }
          }
        })
        .catch((err) => console.error("Error checking booking status:", err))
        .finally(() => setLoading(false));
    } else {
      setTimeout(() => {
        setLoading(false);
        setBookingDetail(program.id, null);
        setConsultationCompleted(program.id, false);
      }, 0);
    }
  }, [user?.email, program.id, setBookingDetail, setConsultationCompleted]);

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
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white uppercase tracking-[0.15em] text-[11px] font-bold h-14 px-10 rounded-none border-0 transition-all duration-300 cursor-pointer"
          >
            Access Course
          </BookingButton>
          <div className="flex flex-col gap-1 items-start">
            <span className="text-[10px] text-white/60 font-semibold tracking-wide uppercase">
              Already Enrolled
            </span>
            <span className="text-[10px] text-white/50 font-light tracking-wide leading-normal">
              You have full lifetime access to this program. Click the button to start learning.
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
              <span className="text-[#E6C594] font-bold text-sm sm:text-base">
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

    if (requireConsultant) {
      if (consultationCompleted) {
        return (
          <div className="mt-12 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 min-h-[56px]">
            <BookingButton 
              programId={program.id} 
              programSlug={program.slug || program.id}
              programName={program.title} 
              requireConsultant={true}
              theme="dark"
              className="w-full sm:w-auto bg-transparent border border-white/30 text-white hover:bg-white hover:text-charcoal uppercase tracking-[0.15em] text-[11px] font-bold h-14 px-8 rounded-none transition-all duration-300 cursor-pointer"
            >
              Book Again
            </BookingButton>

            <BookingButton 
              programId={program.id} 
              programSlug={program.slug || program.id}
              programName={program.title} 
              theme="dark"
              className="w-full sm:w-auto bg-[#8C6D40] text-white hover:bg-[#a37f4c] uppercase tracking-[0.15em] text-[11px] font-bold h-14 px-10 rounded-none border-0 transition-all duration-300 cursor-pointer"
            >
              Enroll Now
            </BookingButton>

            {program.pricing && (
              <div className="flex flex-col gap-1 items-start sm:ml-2">
                <div className="flex items-baseline gap-2">
                  {hasDiscount ? (
                    <>
                      <span className="text-white/60 line-through font-light text-xs">
                        ${originalPrice} AUD
                      </span>
                      <span className="text-white font-bold text-lg">
                        ${displayPrice} AUD
                      </span>
                    </>
                  ) : (
                    <span className="text-white font-bold text-lg">
                      ${displayPrice} AUD
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-white/50 font-light tracking-wide leading-none">
                  Consultation completed! Enroll now to access.
                </span>
              </div>
            )}
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
              Note: Special pricing valid for limited period only, subject to change.
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
    return null;
  }

  if (requireConsultant) {
    if (consultationCompleted) {
      return (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 min-h-[64px]">
          <BookingButton 
            programId={program.id} 
            programSlug={program.slug || program.id}
            programName={program.title} 
            requireConsultant={true}
            theme="light"
            className="bg-transparent border border-charcoal/30 text-charcoal hover:bg-charcoal hover:text-white uppercase tracking-[0.2em] text-[11px] font-bold h-16 px-8 rounded-none transition-all duration-300 w-full sm:w-auto cursor-pointer"
          >
            Book Again
          </BookingButton>

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
                Note: Special pricing valid for limited period only, subject to change.
              </span>
            </div>
          )}
        </div>
      );
    }

    // Nothing at bottom if one-to-one consultation is enabled but not marked done
    return null;
  }

  // Remove pricing from bottom for all other courses
  return null;
}
