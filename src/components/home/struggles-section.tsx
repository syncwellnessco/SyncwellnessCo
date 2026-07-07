"use client";

import { motion } from "framer-motion";
import { struggles } from "@/data/home-content";

/* ── Pill component for each struggle tag ── */
function StrugglePill({ label }: { label: string }) {
  return (
    <span className="group relative inline-flex shrink-0 cursor-default items-center gap-2.5 rounded-full border border-gold/20 bg-cream/90 px-5 py-2.5 shadow-[0_2px_12px_rgba(179,140,80,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-md transition-all duration-300 hover:border-gold/50 hover:shadow-[0_4px_20px_rgba(179,140,80,0.16)] sm:px-6 sm:py-3">
      <span className="h-1.5 w-1.5 rounded-full bg-gold/50 transition-colors duration-300 group-hover:bg-gold" />
      <span className="whitespace-nowrap text-xs font-semibold tracking-wide text-charcoal/85 transition-colors duration-300 group-hover:text-charcoal sm:text-[13px]">
        {label}
      </span>
    </span>
  );
}

/* ── Row splits for visual variety ── */
const row1 = struggles.slice(0, 5);
const row2 = [...struggles.slice(5), ...struggles.slice(0, 2)];
const row3 = [...struggles.slice(2, 7)];

export function StrugglesSection() {
  const backgroundSrc =
    "https://res.cloudinary.com/daw1tscqr/image/upload/v1780733233/shadow-background_wbrsm4.jpg";

  return (
    <section
      className="relative overflow-hidden bg-cream bg-cover bg-center pt-4 pb-8 sm:pt-6 sm:pb-12"
      style={{ backgroundImage: `url(${backgroundSrc})` }}
    >
      <div className="absolute inset-0 bg-cream/85" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ── Top: Scrolling Struggles Pills ── */}
        <div className="relative mb-6 space-y-3 overflow-hidden py-2 sm:mb-10 sm:space-y-4">
          {/* Gradient fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-cream/85 to-transparent sm:w-20 lg:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-cream/85 to-transparent sm:w-20 lg:w-24" />

          {/* Row 1 — scrolls left */}
          <div className="marquee-track overflow-hidden">
            <div className="marquee-scroll-left flex w-max gap-3 sm:gap-4">
              {[...row1, ...row1, ...row1, ...row1].map((s, i) => (
                <StrugglePill key={`r1-${i}`} label={s} />
              ))}
            </div>
          </div>

          {/* Row 2 — scrolls right */}
          <div className="marquee-track overflow-hidden">
            <div className="marquee-scroll-right flex w-max gap-3 sm:gap-4">
              {[...row2, ...row2, ...row2, ...row2].map((s, i) => (
                <StrugglePill key={`r2-${i}`} label={s} />
              ))}
            </div>
          </div>

          {/* Row 3 — scrolls left slower */}
          <div className="marquee-track overflow-hidden">
            <div className="marquee-scroll-left-slow flex w-max gap-3 sm:gap-4">
              {[...row3, ...row3, ...row3, ...row3].map((s, i) => (
                <StrugglePill key={`r3-${i}`} label={s} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom: Glass Effect Card with Content ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl border border-gold/15 bg-cream/60 px-6 py-10 shadow-[0_8px_32px_rgba(179,140,80,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl sm:px-10 sm:py-14 lg:px-14 lg:py-16"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

          <div className="relative">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C6D40]">
              Sound Familiar?
            </span>
            <h2 className="mt-3 font-display text-[2rem] font-semibold leading-tight text-charcoal sm:text-4xl lg:text-5xl">
              You&apos;re Not Alone in{" "}
              <span className="box-decoration-clone bg-gradient-to-r from-gold/20 to-gold/10 px-2 text-charcoal">
                These Struggles
              </span>
            </h2>
            <p className="mt-5 text-sm font-semibold leading-relaxed text-charcoal sm:text-base lg:text-lg">
              Thousands of women experience these symptoms daily. The good news?
              They&apos;re often connected and healable with the right support.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-sage-800 sm:text-base lg:text-base">
              These symptoms aren&apos;t random. They&apos;re signals your body
              is sending. Let&apos;s decode them together and create your path
              to vibrant health.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
