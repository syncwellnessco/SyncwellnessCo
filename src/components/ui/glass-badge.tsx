import { cn } from "@/lib/utils";

type GlassBadgeProps = {
  children: React.ReactNode;
  variant?: "light" | "dark" | "gold";
  className?: string;
};

export function GlassBadge({
  children,
  variant = "light",
  className,
}: GlassBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur-md transition-colors sm:text-sm",
        variant === "light" &&
          "border-white/30 bg-cream/20 text-charcoal shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]",
        variant === "dark" &&
          "border-cream/20 bg-charcoal/40 text-cream shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
        variant === "gold" &&
          "border-gold/30 bg-gold/15 text-charcoal shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
