"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { ComponentProps, MouseEvent, TouchEvent, forwardRef } from "react";

export type LinkProps = ComponentProps<typeof NextLink>;

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    { href, prefetch = false, onMouseEnter, onTouchStart, ...props },
    ref
  ) => {
    const router = useRouter();

    const handlePrefetch = () => {
      const targetPath = typeof href === "string" ? href : href?.pathname;
      if (targetPath && targetPath.startsWith("/") && !targetPath.startsWith("/#")) {
        router.prefetch(targetPath);
      }
    };

    const handleMouseEnter = (e: MouseEvent<HTMLAnchorElement>) => {
      handlePrefetch();
      if (onMouseEnter) onMouseEnter(e);
    };

    const handleTouchStart = (e: TouchEvent<HTMLAnchorElement>) => {
      handlePrefetch();
      if (onTouchStart) onTouchStart(e);
    };

    return (
      <NextLink
        ref={ref}
        href={href}
        prefetch={prefetch}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleTouchStart}
        {...props}
      />
    );
  }
);

Link.displayName = "Link";

export default Link;
