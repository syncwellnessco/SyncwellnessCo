"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Star, ArrowRight, PlayCircle } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { GlassBadge } from "@/components/ui/glass-badge";
import { ProgramHeroMedia } from "@/components/pages/program-hero-media";
import type { Program } from "@/types/program";

export function ProgramsSection({ programs = [] }: { programs?: Program[] }) {
  // Only show Rank 1 featured program on the Home Page
  const featuredPrograms = programs.filter((p) => p.featured && p.featured_rank === 1);
  const featuredIds = featuredPrograms.map(p => p.id);
  const others = programs.filter((p) => {
    if (featuredIds.includes(p.id)) return false;
    return p.showOnHome || p.featured;
  });

  return (
    <section
      className="py-24 relative overflow-hidden bg-[#FAF9F7]"
      id="programs"
    >
      <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-gold/5 blur-[100px] mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-sage-200/20 blur-[100px] mix-blend-multiply pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Signature Programs"
          title="Transform Your Health"
          description="Choose the program that meets you where you are — each designed to deliver real, sustainable results."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-12">
          {featuredPrograms.map((featured, fIdx) => (
            <motion.div
              key={featured.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: fIdx * 0.1 }}
              className="lg:col-span-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-espresso to-charcoal border border-white/10 shadow-2xl"
            >
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
              
              <div className="relative z-10 grid gap-6 lg:gap-8 lg:grid-cols-2 p-5 sm:p-6 lg:p-8">
                <div className="flex flex-col justify-center">
                  <div className="mb-4 flex flex-wrap gap-3">
                    <GlassBadge className="px-4 py-1.5 text-[11px] uppercase tracking-widest font-bold border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] shadow-sm">
                      <Star className="mr-1.5 h-3.5 w-3.5 fill-current" />
                      Featured
                    </GlassBadge>
                  </div>
                  
                  <h3 className="font-display text-3xl font-semibold text-white sm:text-4xl lg:text-[2.75rem] leading-[1.1] mb-5">
                    {featured.title}
                  </h3>
                  
                  <p className="text-base sm:text-lg leading-relaxed text-cream/80 mb-6 max-w-lg">
                    {featured.description}
                  </p>
                  
                  <ul className="mb-8 space-y-3">
                    {featured.included?.slice(0, 3).map((f, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-cream/90">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={2.5} />
                        <span className="text-sm sm:text-base leading-snug">{f.title}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
                    <span className="text-[11px] font-bold tracking-widest uppercase text-cream">{featured.duration}</span>
                    <Button asChild size="lg" className="bg-gold text-charcoal hover:bg-gold/90 text-[10px] font-bold tracking-[0.15em] uppercase h-12 px-8 rounded-sm">
                      <Link href={`/programs/${featured.slug || featured.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
                
                <div className="relative hidden lg:block my-auto">
                  <ProgramHeroMedia 
                    videoUrl={featured.hero?.introVideo} 
                    imageUrl={featured.hero?.bannerImage} 
                    title={featured.title} 
                  />
                </div>
              </div>
            </motion.div>
          ))}

          {others.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="lg:col-span-6 group relative flex flex-col rounded-3xl border border-beige-200 bg-white p-5 sm:p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 duration-300"
            >
              <div className="mb-6 flex gap-3">
                <GlassBadge variant="light">{program.duration}</GlassBadge>
              </div>
              
              <h3 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl mb-4 group-hover:text-gold transition-colors">
                {program.title}
              </h3>
              
              <p className="flex-1 text-base leading-relaxed text-charcoal mb-8">
                {program.description}
              </p>
              
              <div className="flex items-center justify-between border-t border-beige-100 pt-6 mt-auto">
                <span className="font-medium text-sage-800">
                  {program.pricing?.price ? `$${program.pricing.price}` : "Free"}
                </span>
                <Button asChild variant="ghost" className="group/btn text-charcoal hover:text-gold hover:bg-transparent px-0">
                  <Link href={`/programs/${program.slug || program.id}`}>
                    Explore
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg" className="rounded-full border-charcoal/20 bg-transparent text-charcoal hover:bg-charcoal/5 px-8">
            <Link href="/programs">View All Programs</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
