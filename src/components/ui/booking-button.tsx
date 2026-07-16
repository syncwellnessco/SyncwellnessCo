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
  onBooked?: () => void;
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
  const { user, purchasedPrograms } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [consultationCompleted, setConsultationCompleted] = useState(false);
  const [bookingState, setBookingState] = useState<{
    status: "idle" | "loading" | "booked";
    details?: {
      event_name: string;
      start_time: string;
      end_time: string;
      join_url: string;
      timezone: string;
      email: string;
      name: string;
    };
  }>({ status: "idle" });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (user?.email) {
      fetch(`/api/bookings/check?email=${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.completed) {
            setConsultationCompleted(true);
          }
        })
        .catch((err) => console.error("Error checking booking status:", err));
    }
  }, [user]);

  const effectiveRequireConsultant = requireConsultant && !consultationCompleted;

  useEffect(() => {
    if (!isClient) return;
    const params = new URLSearchParams(window.location.search);
    if (effectiveRequireConsultant && params.get("openBooking") === "true" && user) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
      handleClick();
    }
  }, [isClient, effectiveRequireConsultant, user]);

  useEffect(() => {
    if (!programId) return;
    const saved = localStorage.getItem(`booking_${programId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Keep active for 24 hours
        if (Date.now() - parsed.time < 24 * 60 * 60 * 1000) {
          setBookingState({ status: "booked", details: parsed.details });
        } else {
          localStorage.removeItem(`booking_${programId}`);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [programId]);

  useEffect(() => {
    if (!effectiveRequireConsultant) return;

    const handleCalendlyEvent = async (e: MessageEvent) => {
      if (e.data?.event === "calendly.event_scheduled") {
        const inviteeUri = e.data.payload?.invitee?.uri;
        if (!inviteeUri) return;

        setBookingState({ status: "loading" });

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
              setBookingState({
                status: "booked",
                details: data.details
              });
              localStorage.setItem(`booking_${programId}`, JSON.stringify({
                time: Date.now(),
                details: data.details
              }));
              onBooked?.();
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
              setBookingState({
                status: "booked",
                details: fallbackDetails
              });
              localStorage.setItem(`booking_${programId}`, JSON.stringify({
                time: Date.now(),
                details: fallbackDetails
              }));
              onBooked?.();
            }
          }
        }, 1000);
      }
    };

    window.addEventListener("message", handleCalendlyEvent);
    return () => {
      window.removeEventListener("message", handleCalendlyEvent);
    };
  }, [effectiveRequireConsultant, programId, user, programName, onBooked]);

  const isPurchased = isClient && purchasedPrograms.includes(programId);

  const handleClick = () => {
    if (effectiveRequireConsultant) {
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

  if (effectiveRequireConsultant && bookingState.status === "loading") {
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

  if (effectiveRequireConsultant && bookingState.status === "booked") {
    return (
      <div className="flex items-center gap-3.5 p-5 border border-emerald-200 bg-emerald-50/50 w-full text-emerald-950 max-w-xl">
        <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
          <svg className="h-4.5 w-4.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-0.5">
          <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-emerald-800">
            Meeting Booked!
          </h4>
          <p className="text-[11px] sm:text-xs text-emerald-800/80 leading-relaxed font-medium">
            Please check your email for the calendar invitation and joining details.
          </p>
        </div>
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
        {children || "Join Program"}
      </span>
      {loading && <span className="shimmer-bg-light" />}
    </Button>
  );
}

