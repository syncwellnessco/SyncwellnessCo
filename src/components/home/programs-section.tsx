"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Star, ArrowRight, PlayCircle } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { GlassBadge } from "@/components/ui/glass-badge";
import { programs } from "@/data/programs";

export function ProgramsSection() {
  const featured = programs.find((p) => p.featured);
  const others = programs.filter((p) => !p.featured);

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
          {featured && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-12 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-espresso to-charcoal border border-white/10 shadow-2xl"
            >
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
              
              <div className="relative z-10 grid gap-8 lg:grid-cols-2 p-8 sm:p-12 lg:p-16">
                <div className="flex flex-col justify-center">
                  <div className="mb-6 flex flex-wrap gap-3">
                    <GlassBadge variant="gold" className="px-4 py-1.5 text-xs">
                      <Star className="mr-1.5 h-3.5 w-3.5 fill-current" />
                      Featured
                    </GlassBadge>
                    <GlassBadge variant="dark" className="px-4 py-1.5 text-xs">
                      {featured.duration}
                    </GlassBadge>
                  </div>
                  
                  <h3 className="font-display text-3xl font-semibold text-white sm:text-4xl lg:text-5xl mb-6">
                    {featured.name}
                  </h3>
                  
                  <p className="text-lg leading-relaxed text-cream/80 mb-8 max-w-lg">
                    {featured.description}
                  </p>
                  
                  <ul className="mb-10 space-y-3">
                    {featured.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex items-start gap-3 text-cream/90">
                        <Check className="mt-1 h-5 w-5 shrink-0 text-gold" />
                        <span className="text-base">{f}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                    <Button asChild size="lg" className="bg-gold text-charcoal hover:bg-gold/90 text-base h-14 px-8 w-fit">
                      <Link href={`/programs/${featured.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
                
                <div className="relative hidden lg:block rounded-2xl overflow-hidden border border-white/10 shadow-inner group min-h-[400px]">
                  {featured.videoUrl ? (
                     <>
                       <video 
                         autoPlay 
                         muted 
                         loop 
                         playsInline 
                         src={featured.videoUrl} 
                         className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                       />
                       <div className="absolute inset-0 bg-charcoal/20" />
                     </>
                  ) : (
                    <div className="absolute inset-0 bg-sage-200/20 backdrop-blur-md flex items-center justify-center">
                      <PlayCircle className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {others.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="lg:col-span-6 group relative flex flex-col rounded-3xl border border-beige-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 duration-300"
            >
              <div className="mb-6 flex gap-3">
                <GlassBadge variant="light">{program.duration}</GlassBadge>
              </div>
              
              <h3 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl mb-4 group-hover:text-gold transition-colors">
                {program.name}
              </h3>
              
              <p className="flex-1 text-base leading-relaxed text-charcoal mb-8">
                {program.description}
              </p>
              
              <div className="flex items-center justify-between border-t border-beige-100 pt-6 mt-auto">
                <span className="font-medium text-sage-800">{program.pricing}</span>
                <Button asChild variant="ghost" className="group/btn text-charcoal hover:text-gold hover:bg-transparent px-0">
                  <Link href={`/programs/${program.id}`}>
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
