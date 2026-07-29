import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-beige-200/70", className)}
      {...props}
    />
  );
}

/**
 * Video Card Skeleton component that matches the exact inner content structure
 * of Video Testimonial Cards (aspect-[9/16], glass play icon, bottom title, tag, caption).
 */
export function VideoCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "group overflow-hidden rounded-2xl border border-beige-200 bg-charcoal shadow-sm relative aspect-[9/16] animate-pulse",
        className
      )}
    >
      {/* Center play button circle skeleton */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm shadow-md" />
      </div>

      {/* Dark gradient bottom overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      {/* Bottom text content skeleton */}
      <div className="absolute bottom-0 inset-x-0 p-3 sm:p-5 z-10 space-y-2">
        <div className="h-4 bg-white/40 rounded w-24 sm:w-32 mb-1" />
        <div className="h-2.5 bg-[#D4AF37]/50 rounded w-28 sm:w-36 mb-2" />
        <div className="h-3 bg-white/30 rounded w-full mb-1" />
        <div className="h-3 bg-white/20 rounded w-4/5" />
      </div>
    </div>
  );
}

/**
 * Grid of Video Card Skeletons
 */
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
 * Written Review Card Skeleton component that matches the exact inner content structure
 * of Written Review Cards (top before/after image area, quote lines, avatar, rating stars).
 */
export function ReviewCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white rounded-md border border-beige-200 shadow-sm overflow-hidden flex flex-col h-full animate-pulse min-h-[300px]",
        className
      )}
    >
      {/* Top Image / Experience Area */}
      <div className="relative w-full aspect-[16/10] bg-beige-100/70 flex items-center justify-center border-b border-beige-100 shrink-0">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#8C6D40]/10 flex items-center justify-center">
          <div className="h-4 w-4 rounded-full bg-[#8C6D40]/20" />
        </div>
      </div>

      {/* Content Bottom Area */}
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

/**
 * Grid of Review Card Skeletons
 */
export function ReviewCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {[...Array(count)].map((_, i) => (
        <ReviewCardSkeleton key={i} />
      ))}
    </div>
  );
}

export { Skeleton };
