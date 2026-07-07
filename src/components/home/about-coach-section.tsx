"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { coachHighlights } from "@/data/home-content";

export function AboutCoachSection() {
  const coachImageSrc = "/neha_arora_coach.png";
  const coachBackgroundSrc =
    "https://res.cloudinary.com/daw1tscqr/image/upload/v1780733233/shadow-background_wbrsm4.jpg";



  return (
    <section
      className="relative overflow-hidden bg-beige-100/40 bg-cover bg-center py-6 sm:py-10"
      style={{ backgroundImage: `url(${coachBackgroundSrc})` }}
    >
      <div className="absolute inset-0 bg-cream/30" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative order-1 lg:order-1"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-beige-200">
              <Image
                src={coachImageSrc}
                alt="SyncWellnessCo Women's Health Coach"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-3 -right-2 rounded-xl border border-beige-200 bg-cream px-3 py-2 shadow-md sm:-bottom-5 sm:-right-5 sm:px-4 sm:py-3">
              <p className="font-display text-sm font-semibold text-charcoal sm:text-base">
                Certified Coach
              </p>
              <p className="text-xs text-charcoal sm:text-sm">
                Women&apos;s Health & Hormone Specialist
              </p>
            </div>
          </motion.div>

          <div className="order-2 lg:order-2">
            <SectionHeading
              eyebrow="Meet Your Coach"
              title={<>Compassionate Expertise for Your <span className="box-decoration-clone bg-[#B38C50] px-2 py-0.5 text-cream">Unique Journey</span></>}
              description="I'm passionate about helping women reclaim their health without sacrificing their lifestyle. Every protocol is personalized, every client is supported."
              align="left"
            />

            <div className="mt-5 grid gap-3 sm:mt-6 sm:gap-4 sm:grid-cols-2">
              {coachHighlights.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-xl border border-beige-200 bg-cream p-4 sm:p-5"
                >
                  <h3 className="font-display text-base font-semibold text-charcoal sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-charcoal sm:mt-2 sm:text-sm">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
