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

type ProgramDetailContentProps = {
  id: string;
};

export async function ProgramDetailContent({ id }: ProgramDetailContentProps) {
  const program = await getProgram(id);

  if (!program || !program.published) {
    notFound();
  }

  return (
    <article className="pb-0">
      {/* Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center bg-cover bg-center overflow-hidden pt-32 pb-24"
        style={{ backgroundImage: `url(https://res.cloudinary.com/daw1tscqr/image/upload/v1780733233/shadow-background_wbrsm4.jpg)` }}
      >
        <div className="absolute inset-0 bg-[#4A5D5E]/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-slate-900/20" />
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            <div className="lg:col-span-7 flex flex-col justify-center">
              {program.trustLine && (
                <span className="mb-6 block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B8955F]">
                  {program.trustLine}
                </span>
              )}
              
              <h1 className="font-display text-5xl lg:text-[4.5rem] font-medium leading-[1.05] text-white mb-6">
                {program.name}
              </h1>
              
              <p className="font-display italic text-2xl lg:text-3xl text-white/90 mb-8 font-light">
                {program.overview}
              </p>
              
              <div className="space-y-6 text-[1.1rem] leading-relaxed text-white/80 max-w-xl">
                <p>{program.description}</p>
              </div>
              
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <GlassBadge variant="dark" className="bg-white/10 text-white border-white/20 rounded-none tracking-widest uppercase text-[10px]">{program.duration}</GlassBadge>
                <GlassBadge variant="dark" className="bg-white/10 text-white border-white/20 rounded-none tracking-widest uppercase text-[10px]">{program.format}</GlassBadge>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <BookingButton 
                  programId={program.id} 
                  programName={program.name} 
                  className="w-full sm:w-auto bg-[#B8955F] text-white hover:bg-white hover:text-charcoal uppercase tracking-[0.15em] text-[11px] font-bold h-14 px-10 rounded-none border-0 transition-all duration-300"
                >
                  {program.cta}
                </BookingButton>
                
                {program.pricing && (
                  <p className="text-sm text-white/70 italic">
                    Investment: {program.pricing}
                  </p>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative w-full aspect-[4/5] rounded-none overflow-hidden shadow-2xl ring-1 ring-white/10">
                {program.videoUrl ? (
                  <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" src={program.videoUrl} />
                ) : (
                  <div className="absolute inset-0 bg-charcoal/50 flex items-center justify-center">
                    <span className="text-white/50 font-display">No media</span>
                  </div>
                )}
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#B8955F] rounded-none mix-blend-multiply opacity-50 blur-2xl" />
            </div>

          </div>
        </div>
      </section>

      {/* Stats / Keypoints */}
      <section className="bg-charcoal py-8 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-12">
            {program.stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <Star className="h-3 w-3 text-[#B8955F]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
                  {stat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Is This For You? (The Problem) */}
      <section className="py-24 lg:py-32 bg-[#FAF8F5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div className="lg:sticky lg:top-32">
              <span className="text-[#B8955F] text-[11px] font-bold uppercase tracking-[0.2em] mb-4 block">The Reality</span>
              <h2 className="font-display text-4xl lg:text-[3.5rem] leading-[1.1] text-charcoal mb-8">
                Is this you right now?
              </h2>
              <p className="text-lg text-charcoal/80 leading-relaxed max-w-md">
                You’re doing everything "right" but still feeling exhausted, out of balance, and overwhelmed. It's not your fault—the conventional approach often misses the root cause.
              </p>
            </div>
            <div className="space-y-6">
              {program.problems.map((problem, i) => (
                <div key={i} className="flex items-start gap-5 p-6 bg-white rounded-none shadow-[0_2px_10px_rgba(0,0,0,0.03)] border-l-2 border-[#B8955F] transition-all hover:translate-x-2 duration-300">
                  <span className="text-[#B8955F] font-display text-xl opacity-50 italic mt-0.5">{String(i + 1).padStart(2, '0')}</span>
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
      <section className="py-24 lg:py-32 bg-white border-t border-[#EBE3DB]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-[#B8955F] text-[11px] font-bold uppercase tracking-[0.2em] mb-4 block">The Solution</span>
            <h2 className="font-display text-4xl lg:text-[3.5rem] leading-[1.1] text-charcoal">
              A Better Way Forward
            </h2>
            <div className="mt-6 space-y-4 text-lg text-charcoal/80">
              <p>{program.overview}</p>
              {program.overviewParagraphs?.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            
            <div className="lg:col-span-5">
              <h3 className="font-display text-3xl text-charcoal mb-8 border-b border-[#EBE3DB] pb-4">Perfect For...</h3>
              <ul className="space-y-4">
                {program.perfectFor.map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <CheckCircle2 className="h-5 w-5 text-[#B8955F] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-base text-charcoal/90 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7">
              <h3 className="font-display text-3xl text-charcoal mb-8 border-b border-[#EBE3DB] pb-4">What's Included</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {program.features.map((feature, i) => (
                  <div key={i} className="bg-[#FAF8F5] p-6 rounded-none">
                    <div className="w-8 h-8 rounded-full bg-[#EBE3DB] flex items-center justify-center mb-4">
                      <Check className="h-4 w-4 text-[#B8955F]" strokeWidth={2} />
                    </div>
                    <p className="text-[15px] text-charcoal font-medium leading-snug">{feature}</p>
                  </div>
                ))}
              </div>

              {program.bonuses && program.bonuses.length > 0 && (
                <div className="mt-10 p-8 bg-charcoal text-white rounded-none">
                  <h4 className="font-display text-2xl mb-6 flex items-center gap-3">
                    <Star className="h-5 w-5 text-[#B8955F] fill-current" />
                    Exclusive Bonuses
                  </h4>
                  <ul className="space-y-4">
                    {program.bonuses.map((bonus, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-[#B8955F] shrink-0 mt-0.5" />
                        <span className="text-[15px] text-white/90 leading-relaxed">{bonus}</span>
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
      {program.timeline && program.timeline.length > 0 && (
        <section 
          className="relative py-24 lg:py-32 bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: `url(https://res.cloudinary.com/daw1tscqr/image/upload/v1780733233/shadow-background_wbrsm4.jpg)` }}
        >
          <div className="absolute inset-0 bg-[#4A5D5E]/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-charcoal/60" />
          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-[#B8955F] tracking-[0.2em] uppercase text-[11px] font-bold mb-4 block">The Journey</span>
              <h2 className="font-display text-4xl lg:text-5xl font-medium text-white">Program Timeline</h2>
            </div>
            
            <div className="relative border-l border-white/20 ml-4 sm:ml-8">
              {program.timeline.map((step, i) => (
                <div key={i} className="mb-12 relative pl-8 sm:pl-12 last:mb-0">
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#B8955F] shadow-[0_0_10px_#B8955F]" />
                  <span className="inline-block px-3 py-1 mb-3 text-[10px] font-bold uppercase tracking-widest text-charcoal bg-[#B8955F] rounded-none">
                    {step.label}
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
      <section className="py-24 bg-[#FAF8F5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-white p-10 lg:p-14 rounded-none shadow-sm border border-[#EBE3DB]">
              <span className="text-[#B8955F] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 block">The Result</span>
              <h3 className="font-display text-3xl text-charcoal mb-6">Expected Outcomes</h3>
              <p className="text-charcoal/80 leading-relaxed text-lg">{program.outcomes}</p>
            </div>
            {program.methodology && (
              <div className="bg-charcoal p-10 lg:p-14 rounded-none shadow-sm">
                <span className="text-[#B8955F] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 block">The Science</span>
                <h3 className="font-display text-3xl text-white mb-6">Our Methodology</h3>
                <p className="text-white/80 leading-relaxed text-lg">{program.methodology}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {program.faqs && program.faqs.length > 0 && (
        <section className="py-24 bg-white border-t border-[#EBE3DB]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-[#B8955F] text-[11px] font-bold uppercase tracking-[0.2em] mb-4 block">Clarity</span>
              <h2 className="font-display text-4xl lg:text-5xl font-medium text-charcoal">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {program.faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-[#EBE3DB]">
                  <AccordionTrigger className="text-left font-display text-xl sm:text-2xl text-charcoal hover:text-[#B8955F] py-6 transition-colors">
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

      {/* Final CTA */}
      <section className="py-32 bg-[#EBE3DB]/40 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl lg:text-[4rem] leading-[1.1] font-medium text-charcoal mb-6">
            Ready to Transform?
          </h2>
          <p className="text-xl text-charcoal/80 mb-10 max-w-2xl mx-auto font-light">
            Take the first step towards a healthier, more balanced you. Spots are limited to ensure personalized attention.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <BookingButton 
              programId={program.id} 
              programName={program.name} 
              className="bg-[#B8955F] text-white hover:bg-charcoal uppercase tracking-[0.2em] text-[11px] font-bold h-16 px-12 rounded-none border-0 transition-all duration-300 w-full sm:w-auto"
            >
              {program.cta}
            </BookingButton>
            {program.pricing && (
              <span className="text-charcoal/60 italic font-display text-xl">
                or starting at {program.pricing}
              </span>
            )}
          </div>
        </div>
      </section>
    </article>
  );
}
