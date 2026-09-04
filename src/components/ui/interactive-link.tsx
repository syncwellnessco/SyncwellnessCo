"use client";

import * as React from "react";
import Link from "next/link";
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
  prefetch?: boolean;
}

export function InteractiveLink({
  href,
  className,
  children,
  variant = "raw",
  size,
  shimmerColor,
  onClick,
  prefetch = true,
  ...props
}: InteractiveLinkProps) {
  const router = useRouter();

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (props.onMouseEnter) props.onMouseEnter(e);
    if (href && href.startsWith("/")) {
      router.prefetch(href);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLAnchorElement>) => {
    if (props.onTouchStart) props.onTouchStart(e);
    if (href && href.startsWith("/")) {
      router.prefetch(href);
    }
  };

  const isRaw = variant === "raw";

  return (
    <Link
      href={href}
      prefetch={prefetch}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden transition-all duration-300 select-none",
        !isRaw && buttonVariants({ variant, size }),
        className
      )}
      {...props}
    >
      <span className="inline-flex items-center justify-center w-full h-full gap-2">
        {children}
      </span>
    </Link>
  );
}
