"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { heroContent, heroTrustBadges } from "@/data/home-content";
import { useUserStore } from "@/store/user-store";

export function HeroSection() {
  const { user } = useUserStore();
  return (
    <section id="hero-section" className="relative w-full">
      {/* 16:9 full-bleed hero video */}
      <div className="relative aspect-[4/5] w-full sm:aspect-video sm:min-h-0 sm:max-h-[92vh]">
        {heroContent.videoUrl ? (
          <video
            src={heroContent.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : (
          <div
            className="absolute inset-0 h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url('${heroContent.image}')` }}
          />
        )}

        {/* Dark cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/55 via-charcoal/25 to-charcoal/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/40 via-transparent to-transparent" />

        {/* Mobile: Login + Join on top of image */}
        {!user && (
          <div className="absolute top-[4.25rem] left-0 right-0 z-10 flex gap-2 px-4 sm:top-20 sm:gap-3 sm:px-6 lg:hidden">
            <Link
              href="/login"
              className="flex-1 rounded-full border border-cream/50 bg-charcoal/30 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-cream backdrop-blur-sm transition-colors hover:bg-charcoal/50"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="flex-1 rounded-full bg-cream py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-charcoal transition-colors hover:bg-cream/90"
            >
              Join
            </Link>
          </div>
        )}

        {/* Desktop: marketing line + Get Started */}
        <div className="absolute inset-0 hidden flex-col justify-end lg:flex">
          <div className="mx-auto w-full max-w-7xl px-8 pb-10 xl:px-12 xl:pb-12">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl lg:max-w-none"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-cream/70">
                Women&apos;s Health Coaching
              </p>
              <h1 className="font-display text-[2.5rem] leading-[1.05] text-cream xl:text-[3.1rem] 2xl:text-[3.35rem] lg:whitespace-nowrap drop-shadow-md">
                {heroContent.marketingLine}
              </h1>
              <p className="mt-3 text-lg italic text-cream/85 sm:text-xl xl:text-2xl max-w-2xl drop-shadow-sm">
                {heroContent.marketingSubline.split("hormone health,").map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <>
                        hormone health,
                        <br className="hidden lg:inline" />
                      </>
                    )}
                  </span>
                ))}
              </p>
              <Link
                href="/programs"
                className="group mt-8 inline-flex items-center gap-2.5 rounded-full bg-[#8C6D40] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-xl shadow-black/25 transition-all duration-300 hover:bg-[#A38253] hover:shadow-2xl hover:shadow-[#8C6D40]/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Mobile: compact tagline at bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-8 pt-20 lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h1 className="font-display text-[4.4vw] leading-none text-cream sm:text-[1.8rem] md:text-[2rem] whitespace-nowrap drop-shadow-md">
              {heroContent.marketingLine}
            </h1>
            <p className="mt-2 text-[11px] leading-relaxed text-cream/80 sm:text-[13px] md:text-sm max-w-md text-balance drop-shadow-sm">
              {heroContent.marketingSubline}
            </p>
            <div className="mt-4">
              <Link
                href="/programs"
                className="group inline-flex items-center gap-2 rounded-full bg-[#8C6D40] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-lg transition-all duration-300 hover:bg-[#A38253] active:scale-95"
              >
                Get Started
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="relative bg-charcoal">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:px-6 sm:py-4 lg:px-8">
          <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8C6D40] sm:text-xs">
            Trusted by 500+ women worldwide
          </p>
          <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-0 sm:flex-nowrap sm:gap-5 lg:gap-6">
            {heroTrustBadges.map((badge, i) => (
              <motion.li
                key={badge}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.16em] text-cream sm:text-xs"
              >
                <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-sage-400 sm:h-4 sm:w-4">
                  <Check className="h-2 w-2 text-cream sm:h-2.5 sm:w-2.5" />
                </span>
                {badge}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
