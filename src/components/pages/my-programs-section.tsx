"use client";

import { ArrowRight, PlayCircle } from "lucide-react";
import { useUserStore } from "@/store/user-store";
import { SectionHeading } from "@/components/ui/section-heading";
import { InteractiveLink } from "@/components/ui/interactive-link";

export function MyProgramsSection({ allPrograms }: { allPrograms: any[] }) {
  const { user, purchasedPrograms } = useUserStore();

  if (!user || purchasedPrograms.length === 0) {
    return null;
  }

  const myPrograms = allPrograms.filter(p => purchasedPrograms.includes(p.id));

  return (
    <section className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 mb-6 sm:mb-8">
      <div className="bg-[#FAF8F5] p-6 sm:p-8 border border-[#EBE3DB] rounded-none shadow-sm">
        <SectionHeading 
          eyebrow="Welcome Back" 
          title="My Programmes" 
          align="left" 
        />
        
        <div className="mt-6 sm:mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {myPrograms.map((program) => {
            let heroData: any = {};
            if (program.hero) {
              if (typeof program.hero === 'string') {
                try {
                  heroData = JSON.parse(program.hero);
                } catch (e) {}
              } else {
                heroData = program.hero;
              }
            }
            const bannerImage = heroData?.bannerImage || heroData?.bannerimage || program.bannerImage || "";
            const introVideo = heroData?.introVideo || heroData?.introvideo || program.videoUrl || "";

            return (
              <div key={program.id} className="relative overflow-hidden rounded-none bg-white shadow-sm border border-[#EBE3DB] group flex flex-col justify-between">
                <div className="aspect-video bg-[#F4EFEA] relative flex items-center justify-center overflow-hidden rounded-none border-b border-[#EBE3DB]">
                   {bannerImage ? (
                     <img 
                       src={bannerImage} 
                       alt={program.title || program.name} 
                       className="absolute inset-0 w-full h-full object-cover rounded-none group-hover:scale-105 transition-transform duration-300"
                     />
                   ) : introVideo ? (
                     <>
                       <video src={introVideo} className="absolute inset-0 w-full h-full object-cover opacity-60 rounded-none" />
                       <PlayCircle className="w-10 h-10 text-[#8C6D40] absolute inset-0 m-auto z-10 group-hover:scale-110 transition-transform" />
                     </>
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                       <PlayCircle className="w-10 h-10 text-[#DCD3C6] mb-2" />
                     </div>
                   )}
                </div>
                
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-charcoal mb-1.5">
                      {program.title || program.name}
                    </h3>
                    <p className="text-sm text-charcoal/80 mb-4 line-clamp-2 leading-relaxed">
                      {program.shortDescription || program.shortdescription || program.description}
                    </p>
                  </div>
                  <InteractiveLink 
                    href={`/programs/${program.slug || program.id}/course`}
                    variant="raw"
                    className="w-full justify-center bg-[#8C6D40] text-white hover:bg-charcoal uppercase tracking-[0.15em] text-[10px] font-bold h-12 px-6 rounded-none border-0 transition-colors inline-flex items-center gap-2"
                  >
                    Access Course <ArrowRight className="w-3.5 h-3.5" />
                  </InteractiveLink>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
