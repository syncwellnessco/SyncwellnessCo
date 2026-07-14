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
}

export function BookingButton({ 
  programId, 
  programSlug, 
  programName, 
  pricing, 
  className, 
  children,
  theme = "light",
  showMemberStatus = true
}: BookingButtonProps) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { user, purchasedPrograms } = useUserStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isPurchased = isClient && purchasedPrograms.includes(programId);

  const handleClick = () => {
    setLoading(true);
    // Redirect directly to the checkout page with the program ID
    router.push(`/checkout?programId=${encodeURIComponent(programSlug || programId)}`);
  };

  const handleAccessCourse = () => {
    router.push(`/programs/${programSlug || programId}/course`);
  };

  if (!isClient) {
    return <Button className={className}>{children || "Join Program"}</Button>;
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

