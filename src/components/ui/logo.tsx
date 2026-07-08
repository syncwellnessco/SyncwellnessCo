import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "default" | "light";
};

export function Logo({ className, variant = "default" }: LogoProps) {
  const isLight = variant === "light";

  return (
    <Link
      href="/"
      className={cn(
        "group leading-none transition-opacity hover:opacity-90",
        className
      )}
    >
      <span
        className={cn(
          "font-display text-[1.35rem] tracking-tight sm:text-2xl",
          isLight ? "text-cream" : "text-charcoal"
        )}
      >
        SyncwellnessCo
      </span>
    </Link>
  );
}
