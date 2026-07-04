"use client";

import { motion } from "framer-motion";
import { howWeHelp } from "@/data/home-content";

export function HowWeHelpSection() {
  const helpVideoSrc =
    "https://res.cloudinary.com/daw1tscqr/video/upload/v1780733233/female-hormone-specialist-certification-curriculum-papers_pm0ohz.mp4";

  return (
    <section className="relative overflow-hidden bg-charcoal py-8 sm:py-16">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src={helpVideoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-charcoal/72 shadow-[inset_0_0_120px_rgba(0,0,0,0.65)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="mb-1.5 inline-block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B8955F]">
            How We Help?
          </span>
          <h2 className="font-display text-[1.65rem] font-semibold leading-tight text-cream sm:text-3xl lg:text-4xl">
            <span className="box-decoration-clone bg-[#B38C50] px-2 py-0.5 text-cream">
              Comprehensive Support for Your{" "}
              <em className="italic">Health</em> Journey
            </span>
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-cream/85 sm:mt-3 sm:text-base">
            Our integrated approach addresses every aspect of your wellness —
            from hormones to habits — with personalized guidance every step of
            the way.
          </p>
        </motion.div>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 sm:grid-cols-2">
          {howWeHelp.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-slate/88 p-5 shadow-lg shadow-charcoal/20 backdrop-blur-sm sm:p-7"
            >
              <span className="mb-2 inline-block font-display text-2xl font-light text-cream/50 sm:mb-3 sm:text-3xl">
                0{index + 1}
              </span>
              <h3 className="font-display text-xl font-semibold text-cream sm:text-2xl">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/90 sm:mt-3 sm:text-base">
                {item.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
