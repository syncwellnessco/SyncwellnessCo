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
    bookingDetails: allBookingDetails,
    consultationsCompleted,
    setBookingDetail,
    setConsultationCompleted
  } = useUserStore();

  const [loading, setLoading] = useState(true);

  const bookingDetails = allBookingDetails[program.id] || null;
  const booked = !!bookingDetails;
  const consultationCompleted = consultationsCompleted[program.id] || false;

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

  const requireConsultant = program.pricing?.requireConsultant && !consultationCompleted;

  const listPrice = program.pricing?.price ? Number(program.pricing.price) : null;
  const salePrice = program.pricing?.salePrice ? Number(program.pricing.salePrice) : null;
  const hasDiscount = salePrice !== null && listPrice !== null && listPrice > salePrice;
  const displayPrice = hasDiscount ? salePrice : (listPrice || 0);
  const originalPrice = listPrice || 0;

  if (position === "hero") {
    if (requireConsultant) {
      // Keep payment and join button hidden in hero section when consultation is required and not completed
      return null;
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

  if (position === "booking-banner") {
    if (!requireConsultant) {
      return null;
    }

    return (
      <>
        <section className="w-full bg-[#1A1E18] border-y border-white/5 relative overflow-hidden py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {booked ? (
              <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group">
                <div className="flex items-start gap-4.5 z-10 flex-1">
                  <svg className="w-8 h-8 text-[#8C6D40] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296a3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                  <div className="flex flex-col gap-2 text-left">
                    <span className="text-white font-semibold text-[17px] sm:text-[19px] leading-snug font-display tracking-wide">
                      One-to-One Interaction Scheduled
                    </span>
                    <div className="flex flex-col gap-1.5 text-white/90 text-xs sm:text-[13px] font-light leading-relaxed">
                      <p className="font-medium text-[#8C6D40]">{bookingDetails?.event_name || "One-to-One Call"}</p>
                      <p className="text-white/80 font-medium">{formatBookingTime(bookingDetails?.start_time, bookingDetails?.timezone)}</p>
                      <p className="text-white/60 mt-1 leading-normal max-w-xl">
                        Our team will connect with you at the scheduled time. Once your call is completed, the dashboard will update and your enrollment check-out will unlock.
                      </p>
                    </div>
                  </div>
                </div>

                {bookingDetails?.join_url ? (
                  <a 
                    href={bookingDetails.join_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full md:w-auto bg-[#8C6D40] text-white hover:bg-white hover:text-black uppercase tracking-[0.2em] text-[10.5px] font-bold h-12 px-8 rounded-none border-0 transition-all duration-300 z-10 shrink-0 cursor-pointer flex items-center justify-center gap-2"
                  >
                    Join Call
                  </a>
                ) : (
                  <span className="text-[10px] font-bold text-[#8C6D40] uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-2 rounded-none shrink-0 z-10">
                    Awaiting Call
                  </span>
                )}
              </div>
            ) : (
              <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group">
                <div className="flex items-start gap-4.5 z-10 flex-1">
                  <svg className="w-8 h-8 text-[#8C6D40] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                  </svg>
                  <div className="flex flex-col gap-2 text-left">
                    <span className="text-white font-semibold text-[17px] sm:text-[19px] leading-snug font-display tracking-wide">
                      Book <span className="text-[#8C6D40]">Free</span> One-to-One Interaction
                    </span>
                    <p className="text-white/80 text-xs sm:text-[13px] max-w-xl font-light leading-relaxed">
                      Schedule a private session with our clinical coach to assess your goals and find the right path for your health journey.
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] font-bold text-[#8C6D40] uppercase tracking-[0.2em]">
                        Free
                      </span>
                      <span className="text-white/30">•</span>
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">
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
                  onBooked={(details) => {
                    setBookingDetail(program.id, details);
                  }}
                  theme="dark"
                  className="w-full md:w-auto bg-[#8C6D40] text-white hover:bg-white hover:text-black uppercase tracking-[0.2em] text-[10.5px] font-bold h-12 px-8 rounded-none border-0 transition-all duration-300 z-10 shrink-0 cursor-pointer"
                >
                  Book Now
                </BookingButton>
              </div>
            )}
          </div>
        </section>

        {/* Static Colored Strip */}
        <div className="w-full bg-[#8C6D40] h-1.5 relative z-20" />
      </>
    );
  }

  // position === "bottom"
  if (requireConsultant) {
    if (booked) {
      return (
        <div className="w-full max-w-4xl mx-auto bg-[#FAF8F5] border border-[#EBE3DB] p-6 sm:p-8 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow duration-300">
          {/* Background design elements */}
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#8C6D40]/5 blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110" />
          
          <div className="flex items-start gap-4.5 z-10 flex-1">
            <svg className="w-8 h-8 text-[#8C6D40] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
            <div className="flex flex-col gap-2 text-left">
              <span className="text-charcoal font-semibold text-[17px] sm:text-[19px] leading-snug font-display tracking-wide">
                Consultation Scheduled
              </span>
              <div className="flex flex-col gap-1.5 text-charcoal/80 text-xs sm:text-[13px] font-light leading-relaxed">
                <p className="font-medium text-[#8C6D40]">{bookingDetails?.event_name || "1:1 Consultation Call"}</p>
                <p className="text-charcoal/70 font-medium">{formatBookingTime(bookingDetails?.start_time, bookingDetails?.timezone)}</p>
                <p className="text-charcoal/60 mt-1 leading-normal max-w-xl">
                  Our team will connect with you at the scheduled time. Once your call is completed, the dashboard will update and your enrollment check-out will unlock.
                </p>
              </div>
            </div>
          </div>

          {bookingDetails?.join_url ? (
            <a 
              href={bookingDetails.join_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full md:w-auto bg-[#8C6D40] text-white hover:bg-charcoal uppercase tracking-[0.2em] text-[10.5px] font-bold h-14 px-10 rounded-sm border-0 transition-all duration-300 z-10 shrink-0 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              Join Call
            </a>
          ) : (
            <span className="text-[10px] font-bold text-[#8C6D40] uppercase tracking-widest bg-[#8C6D40]/5 border border-[#8C6D40]/15 px-4 py-2.5 rounded-sm shrink-0 z-10">
              Awaiting Call
            </span>
          )}
        </div>
      );
    }

    return (
      <div className="w-full max-w-4xl mx-auto bg-[#FAF8F5] border border-[#EBE3DB] p-6 sm:p-8 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Background design elements */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#8C6D40]/5 blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110" />
        
        <div className="flex items-start gap-4.5 z-10 flex-1">
          {/* Calendar icon with no background and border */}
          <svg className="w-8 h-8 text-[#8C6D40] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
          </svg>
          <div className="flex flex-col gap-2 text-left">
            <span className="text-charcoal font-semibold text-[17px] sm:text-[19px] leading-snug font-display tracking-wide">
              Book Free 1-to-1 Consultation
            </span>
            <p className="text-charcoal/70 text-xs sm:text-[13px] max-w-xl font-light leading-relaxed">
              Schedule a private session with our clinical coach to assess your goals and find the right path for your health journey.
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-[#8C6D40] uppercase tracking-wider bg-[#8C6D40]/5 border border-[#8C6D40]/15 px-3 py-0.5 rounded-sm">
                100% Free
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#8C6D40] uppercase tracking-wider bg-[#8C6D40]/5 border border-[#8C6D40]/15 px-3 py-0.5 rounded-sm">
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
          onBooked={(details) => {
            setBookingDetail(program.id, details);
          }}
          theme="light"
          className="w-full md:w-auto bg-[#8C6D40] text-white hover:bg-charcoal uppercase tracking-[0.2em] text-[10.5px] font-bold h-14 px-10 rounded-sm border-0 transition-all duration-300 z-10 shrink-0 shadow-md hover:shadow-lg cursor-pointer"
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
