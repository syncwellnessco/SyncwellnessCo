"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type HighlightCardProps = {
  index?: number;
  title: string;
  description: string;
  variant?: "dark" | "light" | "glass";
  className?: string;
};

export function HighlightCard({
  index,
  title,
  description,
  variant = "dark",
  className,
}: HighlightCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (index ?? 0) * 0.08, duration: 0.5 }}
      className={cn(
        "p-5 shadow-lg sm:p-7",
        variant === "dark" &&
          "bg-slate/88 shadow-charcoal/20 backdrop-blur-sm",
        variant === "light" &&
          "border border-beige-200/80 bg-cream/80 shadow-beige-200/40 backdrop-blur-sm",
        variant === "glass" &&
          "border border-white/25 bg-cream/15 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl",
        className,
      )}
    >
      {index !== undefined && (
        <span
          className={cn(
            "mb-2 inline-block font-display text-2xl font-light sm:mb-3 sm:text-3xl",
            variant === "dark" ? "text-cream/50" : "text-sage-400",
          )}
        >
          0{index + 1}
        </span>
      )}
      <h3
        className={cn(
          "font-display text-xl font-semibold sm:text-2xl",
          variant === "dark" ? "text-cream" : "text-charcoal",
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "mt-2 text-sm leading-relaxed sm:mt-3 sm:text-base",
          variant === "dark" ? "text-cream/90" : "text-charcoal",
        )}
      >
        {description}
      </p>
    </motion.article>
  );
}
