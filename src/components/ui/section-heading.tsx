"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="mb-1.5 inline-block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B8955F]">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-[1.65rem] font-semibold leading-tight text-charcoal sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-charcoal sm:mt-3 sm:text-base">
          {description}
        </p>
      )}
    </motion.div>
  );
}
