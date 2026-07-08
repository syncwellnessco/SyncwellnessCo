"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, HeartPulse, UsersRound } from "lucide-react";

export function FinalCTASection() {
  const ctaVideoSrc =
    "https://res.cloudinary.com/daw1tscqr/video/upload/v1780735738/certified-functional-hormone-specialist_e844gt.mp4";

  return (
    <section className="relative overflow-hidden bg-charcoal py-6 sm:py-10">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src={ctaVideoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-charcoal/58 shadow-[inset_0_0_140px_rgba(0,0,0,0.7)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl overflow-hidden shadow-2xl shadow-charcoal/35"
        >
          <div className="grid md:grid-cols-2">
            <div className="bg-cream px-5 py-9 text-center sm:px-8 sm:py-12">
              <UsersRound className="mx-auto h-12 w-12 text-charcoal sm:h-14 sm:w-14" />
              <h3 className="mt-4 text-xl font-bold text-charcoal sm:text-2xl">
                Personalized Support
              </h3>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate sm:text-base">
                You receive a plan built around your hormones, gut health,
                lifestyle, and real schedule.
              </p>
            </div>

            <div className="bg-slate px-5 py-9 text-center sm:px-8 sm:py-12">
              <HeartPulse className="mx-auto h-12 w-12 text-cream/85 sm:h-14 sm:w-14" />
              <h3 className="mt-4 text-xl font-bold text-cream sm:text-2xl">
                Sustainable Transformation
              </h3>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-cream/88 sm:text-base">
                Balance your hormones, support digestion, and rebuild energy
                without extremes.
              </p>
            </div>
          </div>

          <div className="bg-gold px-5 py-9 text-left sm:px-10 sm:py-12 lg:px-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/85 sm:text-xs">
              Ready to Start Your Transformation?
            </p>
            <h2 className="mt-3 max-w-4xl font-display text-2xl font-semibold leading-tight text-cream sm:text-4xl lg:text-[2.75rem]">
              Your Health Transformation Starts Today
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-cream sm:text-base">
              Balanced hormones, a healed gut, and sustainable energy are
              possible with the right guidance and a plan that fits your life.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/programs"
                className="inline-flex items-center justify-center gap-2 bg-cream px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-charcoal transition-colors hover:bg-cream/90"
              >
                Book Free Call
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/programs"
                className="inline-flex items-center justify-center gap-2 border border-cream/55 px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-cream/10"
              >
                Apply For Coaching
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
