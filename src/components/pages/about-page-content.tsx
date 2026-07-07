"use client";

import Image from "next/image";
import Link from "@/components/ui/link";
import { aboutContent, brandContent } from "@/data/about-content";

export function AboutPageContent() {
  const coachImageSrc = "/neha_arora_coach.png";

  return (
    <article className="bg-[#FAF8F5] min-h-screen">
      
      {/* Hero / Founder Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="block">
          
          <div className="relative float-right ml-6 mb-6 md:ml-12 md:mb-8 w-[200px] sm:w-[280px] md:w-[380px] aspect-[4/5] overflow-hidden bg-[#EBE3DB] shadow-lg rounded-sm mt-2">
            <Image
              src={coachImageSrc}
              alt={`${aboutContent.aboutCoach.name} — ${aboutContent.aboutCoach.title}`}
              fill
              className="object-cover object-top"
              priority
            />
          </div>
          
          <div className="block">
            <span className="text-xs uppercase tracking-[0.15em] font-bold text-[#8C6D40] mb-4 block">
              About Our Founder
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal mb-4">
              {aboutContent.aboutCoach.name}
            </h1>
            <h2 className="text-[11px] md:text-xs uppercase tracking-[0.1em] font-bold text-charcoal/60 mb-10 leading-relaxed">
              {aboutContent.aboutCoach.title} <br className="hidden md:block" />
              <span className="md:hidden"> &bull; </span>
              {aboutContent.certifications.join(" | ")}
            </h2>
            
            <div className="space-y-6 text-[15px] md:text-base leading-relaxed text-charcoal/80">
              {aboutContent.story.map((paragraph, index) => (
                <p key={index} className={index === 5 ? "font-display text-2xl text-[#8C6D40] italic my-8 block" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>
            
            <div className="clear-both"></div>
          </div>

        </div>
      </section>

      {/* Why I Help Women Section */}
      <section className="py-20 lg:py-32 bg-[#EBE3DB]/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs uppercase tracking-[0.15em] font-bold text-[#8C6D40] mb-4 block">
            The Purpose
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal mb-10">
            {aboutContent.whyIHelpWomen.title}
          </h2>
          
          <div className="space-y-6 text-[15px] md:text-base leading-relaxed text-charcoal/80 text-left md:text-center">
            {aboutContent.whyIHelpWomen.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Coaching Philosophy Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-24 items-start">
            <div>
              <span className="text-xs uppercase tracking-[0.15em] font-bold text-[#8C6D40] mb-4 block">
                Methodology
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal mb-8">
                {aboutContent.coachingPhilosophy.title}
              </h2>
              <div className="space-y-6 text-[15px] md:text-base leading-relaxed text-charcoal/80 mb-8">
                {aboutContent.coachingPhilosophy.intro.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-8 sm:p-10 lg:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#EBE3DB] rounded-sm">
              <ul className="space-y-4">
                {aboutContent.coachingPhilosophy.bullets.map((bullet, index) => (
                  <li key={index} className="flex items-center text-charcoal/90 text-[15px] md:text-base">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D40] mr-4 flex-shrink-0"></span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 pt-8 border-t border-[#EBE3DB]">
                <p className="font-display text-xl text-charcoal italic">
                  "{aboutContent.coachingPhilosophy.outro}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes My Approach Different Section */}
      <section className="py-20 lg:py-32 bg-[#2A2A2A] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.15em] font-bold text-[#8C6D40] mb-4 block">
              The Difference
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-8">
              {aboutContent.whatMakesMyApproachDifferent.title}
            </h2>
            <div className="space-y-6 text-[15px] md:text-base leading-relaxed text-white/80">
              {aboutContent.whatMakesMyApproachDifferent.intro.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {aboutContent.whatMakesMyApproachDifferent.bullets.map((bullet, index) => (
              <div key={index} className="flex items-center bg-white/5 border border-white/10 p-4 sm:p-5 rounded-sm hover:bg-white/10 transition-colors">
                <span className="text-[#8C6D40] mr-4 text-xl">✓</span>
                <span className="text-white/90 text-sm tracking-wide">{bullet}</span>
              </div>
            ))}
          </div>
          
          <div className="max-w-3xl mx-auto mt-16 text-center space-y-4">
            {aboutContent.whatMakesMyApproachDifferent.outro.map((paragraph, index) => (
              <p key={index} className={index > 0 ? "font-display text-xl lg:text-2xl text-[#8C6D40]" : "text-[15px] md:text-base text-white/80"}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Business Values, Vision, Mission Section */}
      <section className="py-20 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-24 mb-24 items-center">
            <div className="bg-[#EBE3DB]/40 p-8 sm:p-10 lg:p-14 border-l-4 border-[#8C6D40]">
              <span className="text-xs uppercase tracking-[0.15em] font-bold text-charcoal/50 mb-3 block">Our Vision</span>
              <p className="font-display text-2xl md:text-3xl leading-snug text-charcoal">
                {brandContent.vision}
              </p>
            </div>
            <div className="p-4 sm:p-0">
              <span className="text-xs uppercase tracking-[0.15em] font-bold text-charcoal/50 mb-3 block">Our Mission</span>
              <p className="text-[17px] md:text-lg lg:text-xl leading-relaxed text-charcoal/80">
                {brandContent.mission}
              </p>
            </div>
          </div>

          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.15em] font-bold text-[#8C6D40] mb-4 block">
              Core Principles
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal">
              Business Values
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {brandContent.coreValues.map((value, index) => (
              <div key={index} className="bg-white p-8 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-[#FAF8F5] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] rounded-sm">
                <h3 className="font-display text-xl text-[#8C6D40] mb-3">{value.title}</h3>
                <p className="text-sm leading-relaxed text-charcoal/70">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
          
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 bg-[#EBE3DB]/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal mb-8">
            Ready to transform your health?
          </h2>
          <Link
            href="/programs"
            className="inline-flex items-center justify-center bg-charcoal text-white hover:bg-[#8C6D40] uppercase tracking-[0.15em] text-[11px] md:text-[12px] font-medium py-4 px-10 transition-colors duration-300 rounded-sm"
          >
            Explore Our Programmes
          </Link>
        </div>
      </section>

    </article>
  );
}
