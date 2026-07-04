"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Download, CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FreeResourceSection() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section className="bg-cream py-8 sm:py-16" id="resources">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-beige-200 bg-gradient-to-br from-sage-50 via-cream to-blush-100">
          <div className="grid lg:grid-cols-2">
            <div className="p-5 sm:p-12 lg:p-14">
              <SectionHeading
                eyebrow="Free Resource"
                title="Free Hormone Balance eBook"
                description="Discover the 7 foundational principles for balancing hormones naturally — without restrictive diets or overwhelming protocols."
                align="left"
              />

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 flex items-start gap-3 rounded-xl bg-sage-100 p-4 sm:mt-8 sm:p-5"
                >
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-charcoal" />
                  <div>
                    <p className="font-semibold text-charcoal">
                      Check your inbox!
                    </p>
                    <p className="mt-1 text-xs text-charcoal sm:text-sm">
                      Your free eBook download link is on its way. Don&apos;t
                      forget to check spam.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@email.com"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full sm:w-auto"
                    disabled={loading}
                  >
                    {loading ? (
                      "Sending..."
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download Free eBook
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-charcoal">
                    We respect your privacy. Unsubscribe anytime.
                  </p>
                </form>
              )}
            </div>

            <div className="relative flex items-center justify-center bg-sage-600/10 p-5 sm:p-12">
              <motion.div
                initial={{ opacity: 0, rotate: -2 }}
                whileInView={{ opacity: 1, rotate: 0 }}
                viewport={{ once: true }}
                className="relative w-full max-w-xs"
              >
                <div className="aspect-[3/4] rounded-2xl border border-beige-200 bg-cream p-6 shadow-2xl sm:p-8">
                  <BookOpen className="h-12 w-12 text-charcoal" />
                  <h3 className="mt-4 font-display text-xl font-semibold text-charcoal sm:mt-6 sm:text-2xl">
                    The Hormone Balance Guide
                  </h3>
                  <ul className="mt-4 space-y-2 text-xs text-charcoal sm:mt-6 sm:space-y-3 sm:text-sm">
                    <li>• Cycle-synced nutrition basics</li>
                    <li>• Gut-hormone connection</li>
                    <li>• Stress & sleep optimization</li>
                    <li>• Supplement starter guide</li>
                    <li>• 7-day meal plan template</li>
                  </ul>
                  <p className="mt-6 text-[10px] font-medium uppercase tracking-wider text-charcoal sm:mt-8 sm:text-xs">
                    42 pages · Instant download
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
