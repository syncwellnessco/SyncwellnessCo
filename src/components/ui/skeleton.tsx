import { cn } from "@/lib/utils";

/**
 * Core Base Boneyard Skeleton Primitive
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[#EBE3DB]/70 dark:bg-charcoal/40 transition-colors",
        className
      )}
      {...props}
    />
  );
}

/**
 * TextSkeleton
 * Configurable multi-line text block skeleton loader.
 */
export function TextSkeleton({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2.5 w-full", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-3.5 bg-[#EBE3DB]/80 rounded",
            i === 0 ? "w-full" : i === lines - 1 ? "w-3/5" : "w-11/12"
          )}
        />
      ))}
    </div>
  );
}

/**
 * CardSkeleton
 * Generic card loader skeleton matching container padding, optional thumbnail image, title and content.
 */
export function CardSkeleton({
  hasImage = true,
  className,
}: {
  hasImage?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white border border-[#EBE3DB] rounded-lg p-5 flex flex-col space-y-4 shadow-sm animate-pulse",
        className
      )}
    >
      {hasImage && (
        <Skeleton className="w-full aspect-[16/9] rounded-md bg-[#FAF8F5]" />
      )}
      <Skeleton className="h-5 w-2/3 bg-[#EBE3DB]" />
      <TextSkeleton lines={2} />
      <div className="pt-2 flex justify-between items-center border-t border-[#EBE3DB]/50">
        <Skeleton className="h-4 w-20 bg-[#EBE3DB]/60" />
        <Skeleton className="h-8 w-24 rounded bg-[#8C6D40]/20" />
      </div>
    </div>
  );
}

/**
 * ProductCardSkeleton & ProductGridSkeleton
 * Custom tailored to match program/product cards.
 */
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white border border-[#EBE3DB] rounded-lg overflow-hidden flex flex-col h-full shadow-sm animate-pulse",
        className
      )}
    >
      {/* Header Image Area */}
      <Skeleton className="w-full aspect-[16/9] bg-[#FAF8F5] shrink-0" />
      {/* Body Content */}
      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-2.5">
          <Skeleton className="h-3.5 w-24 bg-[#8C6D40]/20 uppercase rounded" />
          <Skeleton className="h-6 w-4/5 bg-charcoal/20 rounded" />
          <TextSkeleton lines={3} />
        </div>
        <div className="pt-4 border-t border-[#EBE3DB] flex items-center justify-between">
          <Skeleton className="h-6 w-20 bg-[#8C6D40]/30 rounded" />
          <Skeleton className="h-9 w-28 bg-[#8C6D40] rounded-sm" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * BlogCardSkeleton & BlogGridSkeleton
 * Matches blog posts grid layout across site & admin manager.
 */
export function BlogCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white border border-[#EBE3DB] rounded-lg overflow-hidden flex flex-col h-full shadow-sm animate-pulse",
        className
      )}
    >
      <Skeleton className="w-full aspect-[16/9] bg-[#FAF8F5]" />
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 bg-[#8C6D40]/30 rounded" />
          <Skeleton className="h-5 w-11/12 bg-charcoal/20 rounded" />
          <Skeleton className="h-3.5 w-full bg-[#EBE3DB]" />
          <Skeleton className="h-3.5 w-3/4 bg-[#EBE3DB]" />
        </div>
        <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-between">
          <Skeleton className="h-3 w-16 bg-[#EBE3DB]" />
          <Skeleton className="h-4 w-12 bg-[#8C6D40]/20" />
        </div>
      </div>
    </div>
  );
}

export function BlogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * TableSkeleton
 * Data table skeleton loader for admin tables (purchases, enquiries, bookings, quiz, ebooks, blogs).
 */
export function TableSkeleton({
  rows = 5,
  columns = 5,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("w-full border border-[#EBE3DB] rounded-lg overflow-hidden bg-white shadow-sm", className)}>
      {/* Table Header */}
      <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#EBE3DB] flex items-center justify-between gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-4 bg-[#EBE3DB] rounded flex-1" />
        ))}
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-[#EBE3DB]">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={`r-${rIdx}`} className="px-6 py-4 flex items-center justify-between gap-4">
            {Array.from({ length: columns }).map((_, cIdx) => (
              <Skeleton
                key={`c-${rIdx}-${cIdx}`}
                className={cn(
                  "h-4 bg-[#EBE3DB]/60 rounded flex-1",
                  cIdx === 0 ? "w-1/3" : cIdx === columns - 1 ? "w-1/4 h-8 bg-[#8C6D40]/20" : "w-1/2"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * StatsCardSkeleton
 * Dashboard metric/summary card loader.
 */
export function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white border border-[#EBE3DB] rounded-lg p-5 flex flex-col justify-between space-y-3 shadow-sm animate-pulse min-h-[100px]",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-28 bg-[#EBE3DB]" />
        <Skeleton className="h-8 w-8 rounded-md bg-[#8C6D40]/15" />
      </div>
      <Skeleton className="h-8 w-20 bg-charcoal/20 rounded" />
      <Skeleton className="h-3 w-36 bg-[#EBE3DB]/60" />
    </div>
  );
}

/**
 * ProfileSkeleton
 * User profile page skeleton loader with exact 2-column replica.
 */
export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-cream pt-[88px] lg:pt-32 pb-24 border-t border-[#EBE3DB] animate-pulse">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left Column: Avatar & Info */}
          <div className="lg:col-span-4 flex flex-col pt-4 space-y-6">
            <Skeleton className="w-full aspect-square max-w-[280px] rounded-sm bg-[#FAF8F5] border border-[#EBE3DB]" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-48 bg-charcoal/20 rounded" />
              <Skeleton className="h-5 w-64 bg-[#EBE3DB] rounded" />
            </div>
            <Skeleton className="h-12 w-36 bg-[#EBE3DB] rounded-sm mt-4" />
          </div>

          {/* Right Column: Program Cards */}
          <div className="lg:col-span-8 flex flex-col pt-4 lg:pl-10 lg:border-l lg:border-[#EBE3DB] space-y-8">
            <Skeleton className="h-9 w-48 bg-charcoal/20 rounded pb-4" />
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-6 bg-[#FAF8F5] border border-[#EBE3DB] p-6 rounded-sm">
                  <Skeleton className="w-full sm:w-48 aspect-video sm:aspect-square bg-[#EBE3DB] shrink-0" />
                  <div className="flex flex-col justify-between flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4 bg-charcoal/20 rounded" />
                    <TextSkeleton lines={2} />
                    <Skeleton className="h-4 w-32 bg-[#8C6D40]/30 rounded mt-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * HeroSkeleton
 * Landing / Page Hero section loader skeleton.
 */
export function HeroSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full py-16 px-4 bg-[#FAF8F5] border-b border-[#EBE3DB] flex flex-col items-center justify-center text-center space-y-6 animate-pulse",
        className
      )}
    >
      <Skeleton className="h-4 w-32 bg-[#8C6D40]/30 rounded" />
      <Skeleton className="h-12 w-3/4 max-w-2xl bg-charcoal/20 rounded" />
      <Skeleton className="h-5 w-2/3 max-w-lg bg-[#EBE3DB] rounded" />
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-12 w-40 bg-[#8C6D40] rounded-sm" />
        <Skeleton className="h-12 w-40 bg-[#EBE3DB] rounded-sm" />
      </div>
    </div>
  );
}

/**
 * Video Card Skeleton component matching Video Testimonial Cards
 */
export function VideoCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "group overflow-hidden rounded-2xl border border-beige-200 bg-charcoal shadow-sm relative aspect-[9/16] animate-pulse",
        className
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm shadow-md" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 p-3 sm:p-5 z-10 space-y-2">
        <div className="h-4 bg-white/40 rounded w-24 sm:w-32 mb-1" />
        <div className="h-2.5 bg-[#D4AF37]/50 rounded w-28 sm:w-36 mb-2" />
        <div className="h-3 bg-white/30 rounded w-full mb-1" />
        <div className="h-3 bg-white/20 rounded w-4/5" />
      </div>
    </div>
  );
}

export function VideoCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      {[...Array(count)].map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Written Review Card Skeleton
 */
export function ReviewCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white rounded-md border border-beige-200 shadow-sm overflow-hidden flex flex-col h-full animate-pulse min-h-[300px]",
        className
      )}
    >
      <div className="relative w-full aspect-[16/10] bg-beige-100/70 flex items-center justify-center border-b border-beige-100 shrink-0">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#8C6D40]/10 flex items-center justify-center">
          <div className="h-4 w-4 rounded-full bg-[#8C6D40]/20" />
        </div>
      </div>
      <div className="p-4 sm:p-6 flex flex-col flex-1 bg-white justify-between">
        <div className="space-y-2 mb-4">
          <div className="h-3.5 bg-beige-200/80 rounded w-full" />
          <div className="h-3.5 bg-beige-200/80 rounded w-11/12" />
          <div className="h-3.5 bg-beige-200/50 rounded w-3/4" />
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-beige-100 mt-auto">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#8C6D40]/15 shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 bg-beige-200/80 rounded w-24" />
            <div className="h-2 bg-[#8C6D40]/30 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReviewCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {[...Array(count)].map((_, i) => (
        <ReviewCardSkeleton key={i} />
      ))}
    </div>
  );
}
