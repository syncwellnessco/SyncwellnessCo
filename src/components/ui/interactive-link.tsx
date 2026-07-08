"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

interface InteractiveLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  className?: string;
  children: React.ReactNode;
  variant?: VariantProps<typeof buttonVariants>["variant"] | "raw";
  size?: VariantProps<typeof buttonVariants>["size"];
  shimmerColor?: "light" | "dark";
}

export function InteractiveLink({
  href,
  className,
  children,
  variant = "raw",
  size,
  shimmerColor,
  onClick,
  ...props
}: InteractiveLinkProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If it's a modifier click (e.g., cmd+click, middle click), let browser handle it
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    e.preventDefault();
    if (loading) return;

    if (onClick) {
      onClick(e);
    }

    setLoading(true);
    router.push(href);
  };

  const isRaw = variant === "raw";
  
  // Decide shimmer color based on styling
  const finalShimmerColor = shimmerColor 
    ? shimmerColor 
    : (variant === "ghost" || variant === "link" || isRaw) ? "dark" : "light";

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        "relative overflow-hidden transition-all duration-300 select-none",
        !isRaw && buttonVariants({ variant, size }),
        loading && "pointer-events-none opacity-80",
        className
      )}
      {...props}
    >
      <span className={cn(
        "inline-flex items-center justify-center w-full h-full gap-2 transition-opacity",
        loading && "opacity-75"
      )}>
        {children}
      </span>
      {loading && (
        <span 
          className={cn(
            finalShimmerColor === "light" ? "shimmer-bg-light" : "shimmer-bg-dark"
          )} 
        />
      )}
    </a>
  );
}
