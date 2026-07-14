"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

import { IMAGES } from "@/data/images";

export function FreeResourceSection() {

  return (
    <section className="bg-cream py-6 sm:py-10" id="resources">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-sm border border-[#EBE3DB] bg-[#FAF8F5]">
          <div className="grid lg:grid-cols-2">
            <div className="p-5 sm:p-12 lg:p-14">
              <SectionHeading
                eyebrow="Free Resource"
                title="Free Hormone Balance eBook"
                description="Discover the 7 foundational principles for balancing hormones naturally — without restrictive diets or overwhelming protocols."
                align="left"
              />

              <div className="mt-8 mb-10">
                <ul className="space-y-4 text-charcoal/80 text-[15px] max-w-md">
                  <li className="flex items-start gap-3">
                    <span className="text-[#8C6D40] mt-0.5 text-xl leading-none">•</span>
                    <span>Cycle-synced nutrition basics to eat in harmony with your body.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#8C6D40] mt-0.5 text-xl leading-none">•</span>
                    <span>The crucial Gut-Hormone connection and how to naturally heal it.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#8C6D40] mt-0.5 text-xl leading-none">•</span>
                    <span>Stress & sleep optimization routines designed for busy women.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#8C6D40] mt-0.5 text-xl leading-none">•</span>
                    <span>A simple, sustainable 7-day meal plan template you can actually stick to.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/resources/ebook"
                  className="bg-[#8C6D40] text-white hover:bg-[#B8955F] uppercase tracking-[0.15em] text-[11px] font-semibold py-4 px-12 transition-colors flex items-center justify-center sm:justify-start w-full sm:w-fit"
                >
                  KNOW MORE <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative flex items-center justify-center p-5 sm:p-12">
              <img
                src={IMAGES.ebookMockupPng}
                alt="Free Hormone Balance eBook"
                className="w-full max-w-sm drop-shadow-2xl object-contain hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
