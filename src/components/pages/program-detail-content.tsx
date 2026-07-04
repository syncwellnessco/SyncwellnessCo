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
    <article className="pb-16">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-cream overflow-hidden pt-24 pb-16 lg:pt-0 lg:pb-0">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Image/Video */}
            <div className="relative w-full aspect-[4/5] lg:aspect-[3/4] rounded-sm overflow-hidden order-2 lg:order-1 border border-beige-200 shadow-sm">
              {program.videoUrl ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                  src={program.videoUrl}
                />
              ) : (
                <div className="absolute inset-0 bg-sage-100 flex items-center justify-center">
                  <span className="text-sage-400 font-display">No media available</span>
                </div>
              )}
            </div>

            {/* Right Content */}
            <div className="relative z-10 order-1 lg:order-2 flex flex-col justify-center py-8 lg:py-24">
              {program.trustLine && (
                <span className="mb-6 block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                  {program.trustLine}
                </span>
              )}
              
              <h1 className="font-display text-4xl lg:text-[3.2rem] font-medium leading-[1.15] text-[#2C3E3A]">
                {program.name}{" "}
                <span className="box-decoration-clone bg-[#EBE3DB] px-3 py-1">
                  Program
                </span>
              </h1>
              
              <div className="mt-8 space-y-6 text-[1.1rem] leading-relaxed text-[#4A5551] max-w-lg">
                <p>{program.description}</p>
              </div>
              
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <GlassBadge variant="dark" className="bg-[#2C3E3A]/10 text-[#2C3E3A] border-[#2C3E3A]/20">{program.duration}</GlassBadge>
                <GlassBadge variant="dark" className="bg-[#2C3E3A]/10 text-[#2C3E3A] border-[#2C3E3A]/20">{program.format}</GlassBadge>
              </div>

              <div className="mt-12">
                <BookingButton 
                  programId={program.id} 
                  programName={program.name} 
                  className="w-full sm:w-auto bg-[#B38A58] text-white hover:bg-[#967246] uppercase tracking-[0.15em] text-xs font-semibold h-14 px-10 rounded-sm border-0 transition-colors"
                >
                  {program.cta}
                </BookingButton>
                
                {program.pricing && (
                  <p className="mt-4 text-sm text-[#8F9C9F] italic">
                    Investment: {program.pricing}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Keypoints Row */}
      <section className="py-6 sm:py-8 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-charcoal py-4 sm:py-5 px-4 rounded-sm">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 sm:gap-6 lg:gap-8">
              {program.stats.map((stat, i) => (
                <div 
                  key={i} 
                  className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B38C50] sm:text-xs"
                >
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-sage-400 sm:h-4 sm:w-4">
                    <Check className="h-2 w-2 text-cream sm:h-2.5 sm:w-2.5 stroke-[3]" />
                  </span>
                  {stat}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Program Overview */}
      <section className="py-16 bg-[#FAF9F7]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            eyebrow="About This Program"
            title="A Better Way Forward"
            description={program.overview}
          />
          {program.overviewParagraphs && (
            <div className="mt-8 space-y-4 text-left text-base sm:text-lg text-sage-700 leading-relaxed max-w-3xl mx-auto">
              {program.overviewParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Problems We Solve (Glassmorphism) */}
      <section className="py-16 bg-sage-50 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-sage-200/50 blur-3xl" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl mb-10">Problems We Help With</h2>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {program.problems.map((problem) => (
              <span 
                key={problem} 
                className="group relative inline-flex shrink-0 cursor-default items-center gap-2.5 rounded-full border border-gold/20 bg-cream/90 px-5 py-2.5 shadow-[0_2px_12px_rgba(179,140,80,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-md transition-all duration-300 hover:border-gold/50 hover:shadow-[0_4px_20px_rgba(179,140,80,0.16)] sm:px-6 sm:py-3"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold/50 transition-colors duration-300 group-hover:bg-gold" />
                <span className="whitespace-nowrap text-sm sm:text-base font-medium tracking-wide text-charcoal/85 transition-colors duration-300 group-hover:text-charcoal">
                  {problem}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included & Perfect For */}
      <section className="py-16 bg-cream" id="curriculum">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            
            <div>
              <SectionHeading eyebrow="Curriculum" title="What's Included" align="left" />
              <ul className="mt-8 space-y-4">
                {program.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-4 p-5 rounded-2xl bg-white shadow-sm border border-beige-200 hover:border-gold/30 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-beige-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-gold" />
                    </div>
                    <span className="text-base text-charcoal pt-1">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionHeading eyebrow="Is this for you?" title="Perfect For" align="left" />
              <div className="mt-8 grid gap-3">
                {program.perfectFor.map((item) => (
                  <div key={item} className="flex items-start gap-3 p-4 rounded-xl bg-sage-50/50 border border-sage-200/50">
                    <CheckCircle2 className="h-5 w-5 text-sage-600 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-sage-800">{item}</span>
                  </div>
                ))}
              </div>
              
              {program.bonuses && program.bonuses.length > 0 && (
                <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-charcoal to-espresso text-cream">
                  <h3 className="font-display text-xl font-semibold mb-5 flex items-center gap-2">
                    <Star className="h-5 w-5 text-gold fill-current" />
                    Exclusive Bonuses
                  </h3>
                  <ul className="space-y-3">
                    {program.bonuses.map((bonus) => (
                      <li key={bonus} className="flex items-start gap-2 text-sm sm:text-base text-cream/90">
                        <Check className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                        <span>{bonus}</span>
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
        <section className="py-16 bg-charcoal text-cream relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-gold tracking-[0.15em] uppercase text-[10px] font-semibold mb-2 block">The Journey</span>
              <h2 className="font-display text-2xl sm:text-4xl font-semibold">Program Timeline</h2>
            </div>
            
            <div className="max-w-3xl mx-auto relative border-l-2 border-white/10 ml-4 sm:ml-auto">
              {program.timeline.map((step, i) => (
                <div key={i} className="mb-10 relative pl-8 sm:pl-10">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gold shadow-[0_0_12px_rgba(212,175,55,0.5)]" />
                  <span className="inline-block px-3 py-1 mb-2 text-[10px] font-semibold text-charcoal bg-gold rounded-full">
                    {step.label}
                  </span>
                  <h3 className="text-xl font-display font-semibold mb-2">{step.title}</h3>
                  <p className="text-cream/70 text-sm sm:text-base leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Outcomes & Methodology */}
      <section className="py-16 bg-[#FAF9F7]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <HighlightCard 
              title="Expected Outcomes" 
              description={program.outcomes}
              variant="light"
            />
            {program.methodology && (
              <HighlightCard 
                title="Our Methodology" 
                description={program.methodology}
                variant="glass"
                className="bg-white/40 border-sage-200"
              />
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {program.faqs && program.faqs.length > 0 && (
        <section className="py-16 bg-cream">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Got Questions?" title="Frequently Asked Questions" />
            <div className="mt-10">
              <Accordion type="single" collapsible className="w-full">
                {program.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-beige-200">
                    <AccordionTrigger className="text-left font-medium text-base sm:text-lg text-charcoal hover:text-charcoal/80 py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sage-700 text-sm sm:text-base leading-relaxed pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-beige-100 to-cream">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal mb-4">Ready to Transform Your Health?</h2>
          <p className="text-lg text-sage-700 mb-8 max-w-2xl mx-auto">Take the first step towards a healthier, more balanced you. Spots are limited to ensure personalized attention.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <BookingButton 
              programId={program.id} 
              programName={program.name} 
              className="h-14 px-8 text-base"
            >
              {program.cta}
            </BookingButton>
            {program.pricing && (
              <div className="flex items-center justify-center text-sm font-medium text-sage-600 sm:ml-4">
                {program.pricing}
              </div>
            )}
          </div>
        </div>
      </section>
    </article>
  );
}
