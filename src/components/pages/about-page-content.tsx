"use client";

import Image from "next/image";
import Link from "next/link";
import { aboutContent } from "@/data/about-content";
import { siteConfig } from "@/data/site";

export function AboutPageContent() {
  const coachImageSrc = "/neha_arora_coach.png";

  return (
    <article className="bg-[#FAF8F5] min-h-screen">
      
      {/* Our Story Section (No Image) */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl lg:text-[3rem] text-charcoal mb-10">
            Our <span className="relative inline-block"><span className="relative z-10 italic font-medium pr-1">Story</span><span className="absolute bottom-1 left-0 w-full h-[50%] bg-[#EBE3DB] -z-0"></span></span>
          </h2>
          
          <div className="space-y-6 text-[15px] lg:text-[16px] leading-relaxed text-charcoal text-left">
            <p>{aboutContent.story[0]}</p>
            <p>{aboutContent.story[1]}</p>
            
            <p className="font-semibold italic text-charcoal mt-8 text-center text-lg">
              Because let's be clear: not all education for women's health is created equal.
            </p>
            
            <h3 className="font-semibold uppercase tracking-[0.12em] text-[#B8955F] mt-8 text-center text-[14px] leading-relaxed">
              SYNCWELLNESS OFFERS MORE THAN JUST INFORMATION — WE PROVIDE TRANSFORMATION.
            </h3>
            
            <p className="mt-8">{aboutContent.story[2]}</p>
            <p>{aboutContent.story[3]}</p>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">
            
            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-sm bg-[#EBE3DB] shadow-sm">
              <Image
                src={coachImageSrc}
                alt={`${siteConfig.founder} — ${siteConfig.founderTitle}`}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex flex-col pt-4">
              <p className="font-display italic text-[1.35rem] text-charcoal mb-1">Our Founder</p>
              <h2 className="font-display text-4xl lg:text-5xl text-[#B8955F] mb-2 font-normal">
                {siteConfig.founder}
              </h2>
              <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-charcoal mb-8">
                {aboutContent.certifications.join(", ")}
              </p>
              
              <div className="space-y-5 text-[14px] lg:text-[15px] leading-relaxed text-charcoal">
                <p>
                  <strong className="text-charcoal font-bold">
                    Before {siteConfig.founder.split(" ")[0]} became a leader in women's health, she was a seeker—a practitioner driven by relentless curiosity and a deep frustration with the gaps she saw in conventional healthcare.
                  </strong> 
                  {" "} She witnessed firsthand how countless women were dismissed, misdiagnosed, and underserved by conventional systems. She felt the overwhelm of sorting through conflicting research, the insecurity of wanting to help complex clients but not knowing if she had all the answers. But she refused to settle.
                </p>
                <p>
                  With a passion for teaching, an obsession with evidence-based research, and a fierce determination to revolutionize women's healthcare, she laid the foundation for something far greater than herself: SyncwellnessCo.
                </p>
                <p>
                  Today, {siteConfig.founder.split(" ")[0]} is not just the founder—she's the heart of a movement. Through her holistic coaching programs, she empowers women to rise with confidence, master their bodies, and lead their lives with integrity, clarity, and courage. She's here to remind you—you don't have to figure it out alone.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#EBE3DB]/40 border-t border-[#EBE3DB]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl lg:text-4xl text-charcoal mb-8">
            Ready to transform your health?
          </h2>
          <Link
            href="/programs"
            className="inline-flex bg-[#B8955F] text-white hover:bg-[#967246] uppercase tracking-[0.15em] text-[11px] font-semibold py-4 px-10 transition-colors"
          >
            LEARN MORE ABOUT OUR PROGRAMMES &rarr;
          </Link>
        </div>
      </section>

    </article>
  );
}
