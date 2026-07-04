"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type HighlightHeadingProps = {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
};

export function HighlightHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
  dark = false,
  className,
}: HighlightHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <span className="mb-1.5 inline-block text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "font-display text-[1.65rem] font-semibold leading-tight sm:text-3xl lg:text-4xl",
          dark ? "text-cream" : "text-charcoal",
        )}
      >
        {highlight ? (
          <span className="box-decoration-clone bg-gold px-2 py-0.5 text-cream">
            {title}{" "}
            <em className="italic">{highlight}</em>
          </span>
        ) : (
          title
        )}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-2 text-sm leading-relaxed sm:mt-3 sm:text-base",
            dark ? "text-cream/85" : "text-charcoal",
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
