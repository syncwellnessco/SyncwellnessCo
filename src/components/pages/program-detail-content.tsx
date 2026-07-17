import Link from "next/link";
import { Check, Star, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassBadge } from "@/components/ui/glass-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { getProgram } from "@/lib/programs";
import { HighlightCard } from "@/components/ui/highlight-card";
import { BookingButton } from "@/components/ui/booking-button";
import { ProgramHeroMedia } from "@/components/pages/program-hero-media";
import { ProgramReviewsSection } from "@/components/pages/program-reviews-section";
import { ProgramVideoTestimonials } from "@/components/pages/program-video-testimonials";
import { IMAGES } from "@/data/images";
import { ProgramQuiz } from "@/components/pages/program-quiz";
import { ProgramDetailCTA } from "@/components/ui/program-detail-cta";

type ProgramDetailContentProps = {
  slug: string;
};

export async function ProgramDetailContent({ slug }: ProgramDetailContentProps) {
  const { getProgramBySlug } = await import("@/lib/programs");
  const program = await getProgramBySlug(slug);

  if (!program || program.status !== "published") {
    notFound();
  }

  const listPrice = program.pricing?.price ? Number(program.pricing.price) : null;
  const salePrice = program.pricing?.salePrice ? Number(program.pricing.salePrice) : null;
  const hasDiscount = salePrice !== null && listPrice !== null && listPrice > salePrice;
  const displayPrice = hasDiscount ? salePrice : (listPrice || 0);
  const originalPrice = listPrice || 0;

  return (
    <article className="pb-0">
      {/* Hero Section */}
      <section 
        className="relative min-h-[70vh] flex items-center bg-cover bg-center overflow-hidden pt-32 sm:pt-36 lg:pt-40 pb-12"
        style={{ backgroundImage: `url(${IMAGES.shadowBackground})` }}
      >
        <div className="absolute inset-0 bg-[#4A5D5E]/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-slate-900/20" />
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-12">
            
            <div className="lg:col-span-7 flex flex-col justify-center">
              {program.category && (
                <span className="mb-6 w-fit bg-[#8C6D40] text-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm">
                  {program.category}
                </span>
              )}
              
              <h1 className="font-display text-5xl lg:text-[4.5rem] font-medium leading-[1.05] text-white mb-6">
                {program.title}
              </h1>
              
              <p className="font-display italic text-2xl lg:text-3xl text-white/90 mb-8 font-light">
                {program.shortDescription}
              </p>
              
              <div className="space-y-6 text-[1.1rem] leading-relaxed text-white/80 max-w-xl">
                <p>{program.description}</p>
              </div>
              
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <GlassBadge variant="dark" className="bg-white/10 text-white border-white/20 rounded-none tracking-widest uppercase text-[10px]">{program.duration}</GlassBadge>
                <GlassBadge variant="dark" className="bg-white/10 text-white border-white/20 rounded-none tracking-widest uppercase text-[10px]">{program.format}</GlassBadge>
              </div>

              <ProgramDetailCTA program={program} position="hero" />
            </div>

            <div className="lg:col-span-5 relative">
              <ProgramHeroMedia 
                videoUrl={program.hero?.introVideo} 
                imageUrl={program.hero?.bannerImage} 
                title={program.title} 
              />
            </div>

          </div>

        </div>
      </section>

      <ProgramDetailCTA program={program} position="booking-banner" />

      {/* Stats / Keypoints */}
      <section className="bg-charcoal py-8 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-12">
            {[program.duration, program.format, program.category, "Evidence Based", "Custom Approach"].filter(Boolean).map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <Star className="h-3 w-3 text-[#8C6D40]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
                  {stat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Quiz Section (Conditional) */}
      {program.quiz?.enabled && (
        <ProgramQuiz 
          programId={program.id} 
          programSlug={program.slug || program.id} 
          programTitle={program.title} 
        />
      )}

      {/* Is This For You? (The Problem) */}
      <section className="py-12 lg:py-16 bg-[#FAF8F5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div className="lg:sticky lg:top-32">
              <span className="text-[#8C6D40] text-[11px] font-bold uppercase tracking-[0.2em] mb-4 block">The Reality</span>
              <h2 className="font-display text-4xl lg:text-[3.5rem] leading-[1.1] text-charcoal mb-8">
                Is this you right now?
              </h2>
              <p className="text-lg text-charcoal/80 leading-relaxed max-w-md">
                You’re doing everything "right" but still feeling exhausted, out of balance, and overwhelmed. It's not your fault—the conventional approach often misses the root cause.
              </p>
            </div>
            <div className="space-y-6">
              {program.problemsSolved?.map((problem, i) => (
                <div key={i} className="flex items-start gap-5 p-6 bg-white rounded-none shadow-[0_2px_10px_rgba(0,0,0,0.03)] border-l-2 border-[#8C6D40] transition-all hover:translate-x-2 duration-300">
                  <span className="text-[#8C6D40] font-display text-xl opacity-50 italic mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <p className="text-[1.1rem] text-charcoal leading-relaxed font-medium">
                    {problem}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Perfect For & Curriculum */}
      <section className="py-12 lg:py-16 bg-white border-t border-[#EBE3DB]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[#8C6D40] text-[11px] font-bold uppercase tracking-[0.2em] mb-4 block">The Solution</span>
            <h2 className="font-display text-4xl lg:text-[3.5rem] leading-[1.1] text-charcoal">
              A Better Way Forward
            </h2>
            <div className="mt-6 space-y-4 text-lg text-charcoal/80">
              <p>{program.shortDescription}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            
            <div className="lg:col-span-5">
              <h3 className="font-display text-3xl text-charcoal mb-8 border-b border-[#EBE3DB] pb-4">Perfect For...</h3>
              <ul className="space-y-4">
                {program.audience?.designedFor?.map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <CheckCircle2 className="h-5 w-5 text-[#8C6D40] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-base text-charcoal/90 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7">
              <h3 className="font-display text-3xl text-charcoal mb-8 border-b border-[#EBE3DB] pb-4">What's Included</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {program.included?.map((feature, i) => (
                  <div key={i} className="bg-[#FAF8F5] p-6 flex items-center gap-4 rounded-none">
                    <div className="w-8 h-8 rounded-full bg-[#EBE3DB] flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-[#8C6D40]" strokeWidth={2} />
                    </div>
                    <p className="text-[15px] text-charcoal font-medium leading-snug">{feature.title}</p>
                  </div>
                ))}
              </div>

              {program.bonuses && program.bonuses.length > 0 && (
                <div className="mt-10 p-8 bg-charcoal text-white rounded-none">
                  <h4 className="font-display text-2xl mb-6 flex items-center gap-3">
                    <Star className="h-5 w-5 text-[#8C6D40] fill-current" />
                    Exclusive Bonuses
                  </h4>
                  <ul className="space-y-4">
                    {program.bonuses.map((bonus, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-[#8C6D40] shrink-0 mt-0.5" />
                        <span className="text-[15px] text-white/90 leading-relaxed">{bonus.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Program Timeline */}
      {program.structure?.weeks && program.structure.weeks.length > 0 && (
        <section 
          className="relative py-12 lg:py-16 bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: `url(${IMAGES.shadowBackground})` }}
        >
          <div className="absolute inset-0 bg-[#4A5D5E]/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-charcoal/60" />
          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-[#8C6D40] tracking-[0.2em] uppercase text-[11px] font-bold mb-4 block">The Journey</span>
              <h2 className="font-display text-4xl lg:text-5xl font-medium text-white">Program Timeline</h2>
            </div>
            
            <div className="relative border-l border-white/20 ml-4 sm:ml-8">
              {program.structure.weeks.map((step, i) => (
                <div key={i} className="mb-12 relative pl-8 sm:pl-12 last:mb-0">
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#8C6D40] shadow-[0_0_10px_#8C6D40]" />
                  <span className="inline-block px-3 py-1 mb-3 text-[10px] font-bold uppercase tracking-widest text-charcoal bg-[#8C6D40] rounded-none">
                    {step.week}
                  </span>
                  <h3 className="text-2xl font-display font-medium text-white mb-3">{step.title}</h3>
                  <p className="text-white/70 text-base leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Outcomes & Methodology */}
      <section className="py-12 lg:py-16 bg-[#FAF8F5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-white p-10 lg:p-14 rounded-none shadow-sm border border-[#EBE3DB]">
              <span className="text-[#8C6D40] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 block">The Result</span>
              <h3 className="font-display text-3xl text-charcoal mb-6">Expected Outcomes</h3>
              <p className="text-charcoal/80 leading-relaxed text-lg">{program.outcomes?.summary}</p>
            </div>
            {program.methodology && (
              <div className="bg-charcoal p-10 lg:p-14 rounded-none shadow-sm">
                <span className="text-[#8C6D40] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 block">The Science</span>
                <h3 className="font-display text-3xl text-white mb-6">Our Methodology</h3>
                <p className="text-white/80 leading-relaxed text-lg">{program.methodology.process}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {program.faqs && program.faqs.length > 0 && (
        <section className="py-12 lg:py-16 bg-white border-t border-[#EBE3DB]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-[#8C6D40] text-[11px] font-bold uppercase tracking-[0.2em] mb-4 block">Clarity</span>
              <h2 className="font-display text-4xl lg:text-5xl font-medium text-charcoal">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {program.faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-[#EBE3DB]">
                  <AccordionTrigger className="text-left font-display text-xl sm:text-2xl text-charcoal hover:text-[#8C6D40] py-6 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-charcoal/80 text-base leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* Program Reviews */}
      <ProgramReviewsSection programId={program.id} />

      {/* Program Video Testimonials */}
      <ProgramVideoTestimonials programId={program.id} programTitle={program.title} />

      {/* Final CTA */}
      <section className="py-12 lg:py-16 bg-[#EBE3DB]/40 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl lg:text-[4rem] leading-[1.1] font-medium text-charcoal mb-6">
            Ready to Transform?
          </h2>
          <p className="text-xl text-charcoal/80 mb-10 max-w-2xl mx-auto font-light">
            Take the first step towards a healthier, more balanced you. Spots are limited to ensure personalized attention.
          </p>
          <ProgramDetailCTA program={program} position="bottom" />
        </div>
      </section>
    </article>
  );
}
