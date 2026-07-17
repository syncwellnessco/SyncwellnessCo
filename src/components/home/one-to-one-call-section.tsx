"use client";

import { IMAGES } from "@/data/images";
import { motion } from "framer-motion";
import { BookingButton } from "@/components/ui/booking-button";
import { MessageSquare, ShieldCheck, Sparkles } from "lucide-react";

export function OneToOneCallSection() {
  const shadowBackground = IMAGES.shadowBackground;

  return (
    <section
      className="relative overflow-hidden bg-beige-100/40 bg-cover bg-center py-16 sm:py-20 border-b border-beige-200"
      style={{ backgroundImage: `url(${shadowBackground})` }}
    >
      <div className="absolute inset-0 bg-cream/30" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Heading and Details */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C6D40] mb-3 block">
                Free Consultation
              </span>
              <h2 className="font-display text-3xl font-semibold leading-tight text-charcoal sm:text-4xl lg:text-[2.5rem]">
                Talk to Our Coach & Get a{" "}
                <span className="box-decoration-clone bg-[#B38C50] px-2 py-0.5 text-cream block sm:inline mt-1 sm:mt-0">
                  Personalized Roadmap
                </span>
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-slate sm:text-base">
                Unsure which wellness program aligns with your health goals? Let’s connect for a complimentary one-to-one discovery session. We will evaluate your symptoms, identify core imbalances, and map out a tailored solution.
              </p>
            </motion.div>

            {/* Value Props */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-beige-100/50 border border-beige-200"
              >
                <MessageSquare className="h-5 w-5 text-[#8C6D40] mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-display text-[13px] font-semibold text-charcoal">
                    1:1 Guidance
                  </h4>
                  <p className="mt-1 text-[11px] text-slate leading-relaxed">
                    Direct advice tailored to your concerns.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-beige-100/50 border border-beige-200"
              >
                <Sparkles className="h-5 w-5 text-[#8C6D40] mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-display text-[13px] font-semibold text-charcoal">
                    Clear Action Plan
                  </h4>
                  <p className="mt-1 text-[11px] text-slate leading-relaxed">
                    Step-by-step recommendations for you.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-beige-100/50 border border-beige-200"
              >
                <ShieldCheck className="h-5 w-5 text-[#8C6D40] mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-display text-[13px] font-semibold text-charcoal">
                    No Obligation
                  </h4>
                  <p className="mt-1 text-[11px] text-slate leading-relaxed">
                    Zero obligation or pressure to commit.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Column: CTA card */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-beige-200 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8C6D40]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C6D40] bg-beige-100 px-3 py-1 rounded-full">
                Free Call Invitation
              </span>
              <h3 className="font-display text-xl font-semibold text-charcoal mt-5">
                Book Your 1:1 Call
              </h3>
              <p className="mt-2.5 text-xs text-slate leading-relaxed">
                Connect directly with Neha to outline your sustainable path to energy, balance, and health.
              </p>

              <div className="mt-6 border-y border-beige-100 py-4 text-left space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate">Format:</span>
                  <span className="font-semibold text-charcoal">Video or Voice Call</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate">Duration:</span>
                  <span className="font-semibold text-charcoal">30–45 Mins</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate">Cost:</span>
                  <span className="font-semibold text-[#8C6D40]">100% Free</span>
                </div>
              </div>

              <div className="mt-6">
                <BookingButton
                  programId="general-consultation"
                  programName="1:1 Health Consultation"
                  requireConsultant={true}
                  showMemberStatus={false}
                  className="w-full bg-[#8C6D40] text-white hover:bg-charcoal uppercase tracking-[0.15em] text-[10px] font-bold h-12 rounded-lg border-0 transition-all duration-300"
                >
                  Schedule Free Call
                </BookingButton>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
