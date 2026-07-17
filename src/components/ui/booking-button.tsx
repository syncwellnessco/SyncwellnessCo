"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user-store";
import { cn } from "@/lib/utils";

interface BookingButtonProps {
  programId: string;
  programSlug?: string;
  programName: string;
  pricing?: string;
  className?: string;
  children?: React.ReactNode;
  theme?: "light" | "dark";
  showMemberStatus?: boolean;
  requireConsultant?: boolean;
  onBooked?: (details?: any) => void;
}

export function BookingButton({ 
  programId, 
  programSlug, 
  programName, 
  pricing, 
  className, 
  children,
  theme = "light",
  showMemberStatus = true,
  requireConsultant = false,
  onBooked
}: BookingButtonProps) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { 
    user, 
    purchasedPrograms,
    bookingDetails: allBookingDetails,
    consultationsCompleted,
    setBookingDetail,
    setConsultationCompleted
  } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [localBookingState, setLocalBookingState] = useState<{
    status: "idle" | "loading" | "booked";
    details?: any;
  }>({ status: "idle" });

  const consultationCompleted = consultationsCompleted[programId] || false;
  const bookingDetail = allBookingDetails[programId] || null;

  const bookingState = localBookingState.status === "loading"
    ? localBookingState
    : {
        status: bookingDetail ? ("booked" as const) : ("idle" as const),
        details: bookingDetail || undefined
      };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const effectiveRequireConsultant = requireConsultant && !consultationCompleted;

  useEffect(() => {
    if (!isClient) return;
    const params = new URLSearchParams(window.location.search);
    if (effectiveRequireConsultant && params.get("openBooking") === "true" && user) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
      handleClick();
    }
  }, [isClient, effectiveRequireConsultant, user?.email]);

  useEffect(() => {
    if (!programId || !user) {
      return;
    }
    const saved = localStorage.getItem(`booking_${programId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Keep active for 24 hours
        if (Date.now() - parsed.time < 24 * 60 * 60 * 1000) {
          setBookingDetail(programId, parsed.details);
        } else {
          localStorage.removeItem(`booking_${programId}`);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [programId, user, setBookingDetail]);

  useEffect(() => {
    if (!requireConsultant) return;

    const handleCalendlyEvent = async (e: MessageEvent) => {
      if (e.data?.event === "calendly.event_scheduled") {
        const inviteeUri = e.data.payload?.invitee?.uri;
        if (!inviteeUri) return;

        setLocalBookingState({ status: "loading" });

        // Close the Calendly popup widget programmatically
        if ((window as any).Calendly?.closePopupWidget) {
          try {
            (window as any).Calendly.closePopupWidget();
          } catch (err) {
            console.error("Failed to close Calendly popup:", err);
          }
        }

        // Register the booking to the database from the client side immediately
        try {
          await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              inviteeUri,
              email: user?.email || "anonymous@syncwellness.co",
              name: user?.name || "Client Guest",
              programName
            })
          });
        } catch (err) {
          console.error("Failed to save booking fallback on client:", err);
        }

        let attempts = 0;
        const maxAttempts = 15;

        const poll = async () => {
          try {
            const res = await fetch(`/api/bookings?invitee_uri=${encodeURIComponent(inviteeUri)}`);
            const data = await res.json();
            
            if (data && data.found) {
              setBookingDetail(programId, data.details);
              setLocalBookingState({ status: "idle" });
              localStorage.setItem(`booking_${programId}`, JSON.stringify({
                time: Date.now(),
                details: data.details
              }));
              onBooked?.(data.details);
              return true;
            }
          } catch (err) {
            console.error("Error polling booking status:", err);
          }
          return false;
        };

        const intervalId = setInterval(async () => {
          attempts++;
          const found = await poll();
          if (found || attempts >= maxAttempts) {
            clearInterval(intervalId);
            if (!found) {
              const fallbackDetails = {
                event_name: "1:1 Consultation Call",
                start_time: new Date().toISOString(),
                end_time: new Date().toISOString(),
                join_url: "",
                timezone: "",
                email: user?.email || "",
                name: user?.name || ""
              };
              setBookingDetail(programId, fallbackDetails);
              setLocalBookingState({ status: "idle" });
              localStorage.setItem(`booking_${programId}`, JSON.stringify({
                time: Date.now(),
                details: fallbackDetails
              }));
              onBooked?.(fallbackDetails);
            }
          }
        }, 1000);
      }
    };

    window.addEventListener("message", handleCalendlyEvent);
    return () => {
      window.removeEventListener("message", handleCalendlyEvent);
    };
  }, [requireConsultant, programId, user?.email, programName, onBooked]);

  const isPurchased = isClient && purchasedPrograms.includes(programId);

  const handleClick = () => {
    if (requireConsultant) {
      if (!user) {
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath + "?openBooking=true")}`);
        return;
      }
      const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com";
      
      if ((window as any).Calendly) {
        (window as any).Calendly.initPopupWidget({ url: calendlyUrl });
        return;
      }

      if (!document.getElementById("calendly-css")) {
        const link = document.createElement("link");
        link.id = "calendly-css";
        link.href = "https://assets.calendly.com/assets/external/widget.css";
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }

      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => {
        if ((window as any).Calendly) {
          (window as any).Calendly.initPopupWidget({ url: calendlyUrl });
        }
      };
      document.body.appendChild(script);
      return;
    }

    setLoading(true);
    router.push(`/checkout?programId=${encodeURIComponent(programSlug || programId)}`);
  };

  const handleAccessCourse = () => {
    router.push(`/programs/${programSlug || programId}/course`);
  };

  if (!isClient) {
    return <Button className={className}>{children || "Join Program"}</Button>;
  }

  if (requireConsultant && bookingState.status === "loading") {
    return (
      <Button 
        className={cn("relative overflow-hidden select-none", className)} 
        disabled
      >
        <span className="inline-flex items-center justify-center gap-2 w-full h-full">
          <span className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
          Booking Confirmed...
        </span>
      </Button>
    );
  }

  const hasActiveBooking = bookingDetail && !bookingDetail.completed;

  if (requireConsultant && bookingState.status === "booked" && hasActiveBooking) {
    const details = bookingState.details;
    const formatBookingTimeLocal = (startTime?: string) => {
      if (!startTime) return "";
      try {
        const date = new Date(startTime);
        return date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        });
      } catch (e) {
        return startTime;
      }
    };
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-6 border border-[#8C6D40]/30 bg-charcoal/95 w-full text-white shadow-lg rounded-md text-left">
        <div className="flex items-start gap-4 flex-1">
          <svg className="w-8 h-8 text-[#B8955F] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
          <div className="space-y-1">
            <h4 className="font-bold text-sm uppercase tracking-wider text-[#B8955F]">
              Consultation Booked!
            </h4>
            <div className="text-xs text-white/80 leading-relaxed font-light">
              <p className="font-medium text-white">{details?.event_name || "1:1 Consultation Call"}</p>
              {details?.start_time && (
                <p className="text-white/70 font-medium">{formatBookingTimeLocal(details.start_time)}</p>
              )}
              <p className="text-white/50 mt-1">Please check your email for joining details. Once completed, your payment checkout will unlock.</p>
            </div>
          </div>
        </div>
        {details?.join_url && (
          <a 
            href={details.join_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-[#8C6D40] text-white hover:bg-[#A88858] hover:translate-y-[-2px] active:translate-y-[0px] active:scale-98 uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-6 rounded-sm border-0 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 shrink-0"
          >
            Join Call
          </a>
        )}
      </div>
    );
  }

  if (isPurchased) {
    if (showMemberStatus) {
      return (
        <div className="flex flex-col gap-2 w-full sm:w-auto items-stretch">
          <Button 
            className={cn("relative overflow-hidden select-none w-full", className)} 
            onClick={handleAccessCourse}
          >
            Access Course
          </Button>
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-2 rounded-none shadow-sm bg-emerald-600 text-white flex items-center justify-center gap-1.5 mt-1 w-full text-center">
            ✓ ALREADY A MEMBER
          </span>
        </div>
      );
    } else {
      return (
        <Button 
          className={cn("relative overflow-hidden select-none", className)} 
          onClick={handleAccessCourse}
        >
          Access Course
        </Button>
      );
    }
  }

  return (
    <Button 
      className={cn("relative overflow-hidden select-none", className)} 
      onClick={handleClick} 
      disabled={loading}
    >
      <span className={cn("inline-flex items-center justify-center gap-2 w-full h-full transition-opacity", loading && "opacity-75")}>
        {requireConsultant && consultationCompleted ? "Book Again" : (children || "Join Program")}
      </span>
      {loading && <span className="shimmer-bg-light" />}
    </Button>
  );
}
