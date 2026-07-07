"use client";

import NextLink from "next/link";
import { ComponentProps, forwardRef } from "react";

export type LinkProps = ComponentProps<typeof NextLink>;

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    { href, ...props },
    ref
  ) => {
    return (
      <NextLink
        ref={ref}
        href={href}
        {...props}
      />
    );
  }
);

Link.displayName = "Link";

export default Link;
