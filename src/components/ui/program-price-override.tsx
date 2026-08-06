"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/user-store";
import { Skeleton } from "@/components/ui/skeleton";

interface ProgramPriceOverrideProps {
  program: any;
}

export function ProgramPriceOverride({ program }: ProgramPriceOverrideProps) {
  const { user } = useUserStore();
  const [consultationCompleted, setConsultationCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

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

  if (loading && user?.email) {
    return <Skeleton className="h-5 w-24 bg-[#EBE3DB]" />;
  }

  const requireConsultant = program.pricing?.requireConsultant && !consultationCompleted;

  if (requireConsultant) {
    return (
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-semibold text-xs sm:text-sm text-[#8C6D40] uppercase tracking-wider truncate">
          1:1 Consultation
        </span>
        <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium">
          Free to book
        </span>
      </div>
    );
  }

  const listPrice = program.pricing?.price ? Number(program.pricing.price) : null;
  const salePrice = program.pricing?.salePrice ? Number(program.pricing.salePrice) : null;
  const hasDiscount = salePrice !== null && listPrice !== null && listPrice > salePrice;
  const displayPrice = hasDiscount ? salePrice : (listPrice || 0);
  const originalPrice = listPrice || 0;

  if (hasDiscount) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
        <span className="font-light text-xs text-slate-400 line-through whitespace-nowrap">
          ${originalPrice}
        </span>
        <span className="font-bold text-sm sm:text-lg text-slate-800 whitespace-nowrap">
          ${displayPrice} AUD
        </span>
        <span className="bg-black text-white text-[7px] sm:text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-none whitespace-nowrap">
          SAVE ${originalPrice - salePrice}
        </span>
      </div>
    );
  }

  return (
    <span className="font-semibold text-sm sm:text-lg text-slate-800 whitespace-nowrap">
      {displayPrice > 0 ? `$${displayPrice} AUD` : "Free"}
    </span>
  );
}
