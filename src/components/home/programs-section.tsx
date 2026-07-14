"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Star, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { GlassBadge } from "@/components/ui/glass-badge";
import { ProgramHeroMedia } from "@/components/pages/program-hero-media";
import { InteractiveLink } from "@/components/ui/interactive-link";
import { IMAGES } from "@/data/images";
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
      className="pt-6 pb-6 sm:pt-10 sm:pb-8 relative overflow-hidden bg-[#FAF9F7]"
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
              className="lg:col-span-12 relative overflow-hidden rounded-xl bg-gradient-to-br from-espresso to-charcoal border border-white/10 shadow-2xl"
            >
              {/* Blurred background image to extract organic colors */}
              {featured.hero?.bannerImage && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-xl">
                  <Image
                     src={featured.hero.bannerImage}
                     alt=""
                     fill
                     className="object-cover opacity-15 blur-3xl scale-110"
                     unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso via-transparent to-espresso/60 mix-blend-multiply" />
                </div>
              )}
              
              <div className="absolute inset-0 opacity-5 z-0 pointer-events-none" style={{ backgroundImage: `url('${IMAGES.cubePattern}')` }} />
              
              <div className="relative z-10 grid gap-6 lg:gap-8 lg:grid-cols-2 p-5 sm:p-6 lg:p-8">
                <div className="flex flex-col justify-center order-2 lg:order-1">
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
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto pt-6 border-t border-white/10 gap-4">
                    <div className="flex flex-row flex-nowrap items-center gap-1.5">
                      <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] bg-white/10 border border-white/20 text-cream px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-sm whitespace-nowrap">
                        {featured.duration}
                      </span>
                      {featured.format && (
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] bg-white/10 border border-white/20 text-cream px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-sm whitespace-nowrap">
                          {featured.format}
                        </span>
                      )}
                    </div>
                    <InteractiveLink
                      href={`/programs/${featured.slug || featured.id}`}
                      variant="raw"
                      className="w-full sm:w-auto justify-center text-center bg-gold text-charcoal hover:bg-gold/90 text-[10px] font-bold tracking-[0.15em] uppercase h-12 px-8 rounded-sm inline-flex items-center"
                    >
                      Explore Program
                    </InteractiveLink>
                  </div>
                </div>
                
                <div className="relative w-full order-1 lg:order-2 my-auto">
                  <ProgramHeroMedia 
                    videoUrl={featured.hero?.introVideo} 
                    imageUrl={featured.hero?.bannerImage} 
                    title={featured.title} 
                    hideVideoOnMobile={true}
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
              className="lg:col-span-6 group relative flex flex-col rounded-xl border border-beige-200 bg-white p-5 sm:p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 duration-300"
            >
              {program.hero?.bannerImage && (
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden rounded-lg mb-6 shadow-md border border-beige-100">
                  <Image
                    src={program.hero.bannerImage}
                    alt={program.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent pointer-events-none" />
                  
                  {/* Overlaid Badges Container - Forced Inline & Smaller on Mobile */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex flex-row flex-nowrap items-center gap-1.5 max-w-[calc(100%-1.5rem)]">
                    <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] bg-white/95 backdrop-blur-md text-[#8C6D40] border border-[#A8895C]/20 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-sm whitespace-nowrap">
                      {program.duration}
                    </span>
                    {program.format && (
                      <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] bg-white/95 backdrop-blur-md text-[#8C6D40] border border-[#A8895C]/20 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-sm whitespace-nowrap">
                        {program.format}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex flex-1 flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C6D40] mb-2 block">
                  {program.category || "Signature Program"}
                </span>
                
                <h3 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl mb-4 group-hover:text-[#8C6D40] transition-colors">
                  {program.title}
                </h3>
                
                <p className="flex-1 text-base leading-relaxed text-charcoal/80 mb-8 line-clamp-3">
                  {program.description}
                </p>
                
                <div className="flex items-center justify-between border-t border-beige-100 pt-6 mt-auto">
                  {(() => {
                    const listPrice = program.pricing?.price ? Number(program.pricing.price) : null;
                    const salePrice = program.pricing?.salePrice ? Number(program.pricing.salePrice) : null;
                    const hasDiscount = salePrice !== null && listPrice !== null && listPrice > salePrice;
                    const displayPrice = hasDiscount ? salePrice : (listPrice || 0);
                    const originalPrice = listPrice || 0;

                    if (hasDiscount) {
                      return (
                        <div className="flex items-baseline gap-2">
                          <span className="font-light text-sm text-charcoal/40 line-through">
                            ${originalPrice} AUD
                          </span>
                          <span className="font-bold text-lg text-charcoal">
                            ${displayPrice} AUD
                          </span>
                          <span className="bg-black text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-none">
                            SAVE ${originalPrice - displayPrice}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <span className="font-semibold text-lg text-charcoal">
                        {displayPrice > 0 ? `$${displayPrice} AUD` : "Free"}
                      </span>
                    );
                  })()}
                  <Button asChild variant="ghost" className="group/btn text-[#8C6D40] hover:text-[#B8955F] hover:bg-transparent px-0 font-bold uppercase tracking-wider text-xs">
                    <Link href={`/programs/${program.slug || program.id}`}>
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6 sm:mt-8 text-center">
          <InteractiveLink
            href="/programs"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal transition-colors hover:text-[#8C6D40]"
          >
            View All Programs
            <ArrowRight className="h-4 w-4" />
          </InteractiveLink>
        </div>
      </div>
    </section>
  );
}
