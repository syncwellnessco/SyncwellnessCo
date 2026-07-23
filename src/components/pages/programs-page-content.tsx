import Link from "next/link";
import Image from "next/image";
import { Check, Star, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { getAllPrograms } from "@/lib/programs";
import { MyProgramsSection } from "@/components/pages/my-programs-section";
import { InteractiveLink } from "@/components/ui/interactive-link";
import { cn } from "@/lib/utils";
import { IMAGES } from "@/data/images";
import { ProgramPriceOverride } from "@/components/ui/program-price-override";

export async function ProgramsPageContent() {
  const programs = await getAllPrograms({ publishedOnly: true });
  const featuredPrograms = programs.filter((p) => p.featured).sort((a, b) => (a.featured_rank || 99) - (b.featured_rank || 99));
  const featuredIds = featuredPrograms.map(p => p.id);
  const others = programs.filter((p) => !featuredIds.includes(p.id));

  return (
    <article className="pb-12">
      {/* Hero */}
      <section 
        className="relative overflow-hidden bg-cover bg-center pt-16 pb-16 sm:pt-24 sm:pb-24 lg:pt-28 lg:pb-28"
        style={{ backgroundImage: `url(${IMAGES.shadowBackground})` }}
      >
        <div className="absolute inset-0 bg-[#4A5D5E]/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-slate-900/10" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mb-6 block text-[13px] font-semibold italic text-white/90 tracking-wide">
            Whether you're new to the journey or have been trying for years, one thing is clear:
          </span>
          <h1 className="font-display text-4xl font-normal leading-tight text-white sm:text-5xl lg:text-[4rem]">
            Transform Your <span className="bg-[#B38C50] text-white px-3 py-1">Health</span> with <em className="italic bg-[#B38C50] text-white px-3 py-1">Expert</em> Guidance
          </h1>
          <div className="mx-auto mt-8 max-w-2xl space-y-4 text-base text-white/90 sm:text-lg">
            <p>
              Hormones are at the core of women's health, and yet most solutions barely scratch the surface, leaving you piecing things together on your own.
            </p>
            <p>
              Choose the program that meets you where you are, each designed to deliver real, sustainable results through a research-backed, root-cause approach.
            </p>
          </div>
        </div>
      </section>

      {/* My Programs */}
      <MyProgramsSection allPrograms={programs} />

      {featuredPrograms.map((featured, fIdx) => {
        const titleWords = featured.title.trim().split(/\s+/);
        const hasMultipleWords = titleWords.length > 1;
        const lastWord = hasMultipleWords ? titleWords[titleWords.length - 1] : featured.title;
        const remainingTitle = hasMultipleWords ? titleWords.slice(0, -1).join(" ") : "";

        return (
          <section key={featured.id} className="relative bg-cream py-12 lg:py-16 border-b border-beige-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                
                <div className="flex flex-col justify-center order-2 lg:order-2">
                  <div className="mb-6">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal mb-2">
                      #{fIdx + 1} Featured Program
                    </span>
                  </div>
                  
                  <h2 className="font-display text-4xl lg:text-5xl font-medium leading-[1.15] text-charcoal mb-6">
                    {remainingTitle ? `${remainingTitle} ` : ""}
                    <span className="box-decoration-clone bg-[#EBE3DB] px-3 py-1">
                      {lastWord}
                    </span>
                  </h2>
                
                <p className="text-lg leading-relaxed text-charcoal mb-8 max-w-lg">
                  {featured.description}
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto pt-4 border-t border-beige-200 gap-4">
                  <div className="flex flex-row flex-nowrap items-center gap-1.5 sm:gap-2">
                    <span className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-[#8C6D40] border border-[#A8895C]/20 px-2.5 py-1 rounded-full whitespace-nowrap bg-[#FAF8F5]">
                      {featured.duration}
                    </span>
                    {featured.format && (
                      <span className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-[#8C6D40] border border-[#A8895C]/20 px-2.5 py-1 rounded-full whitespace-nowrap bg-[#FAF8F5]">
                        {featured.format}
                      </span>
                    )}
                  </div>
                  <InteractiveLink
                    href={`/programs/${featured.slug || featured.id}`}
                    variant="raw"
                    className="w-full sm:w-auto justify-center text-center bg-[#8C6D40] text-white hover:bg-[#B8955F] uppercase tracking-[0.15em] text-[10px] font-bold h-12 px-8 rounded-sm border-0 transition-colors inline-flex items-center"
                  >
                    Explore Program
                  </InteractiveLink>
                </div>
              </div>
              
              <div className="relative order-1 lg:order-1 aspect-video w-full rounded-sm overflow-hidden border border-beige-200 shadow-sm group bg-cream flex items-center justify-center">
                {featured.hero?.introVideo && (
                  <video 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                    src={featured.hero.introVideo} 
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 hidden lg:block" 
                  />
                )}
                {featured.hero?.bannerImage ? (
                  <Image 
                    src={featured.hero.bannerImage} 
                    className={cn(
                      "absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105",
                      featured.hero?.introVideo ? "lg:hidden" : ""
                    )} 
                    alt={featured.title} 
                    fill
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-sage-200">
                    <Star className="w-16 h-16 mb-4 opacity-50" />
                    <span className="font-display tracking-widest uppercase text-xs">Featured Program</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>
      );
      })}

      {/* Other Programs */}
      <section className="py-12 lg:py-16 bg-[#FAF9F7]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="More Options" title="Find Your Perfect Fit" align="center" />
          
          <div className="mt-16 grid gap-12 lg:grid-cols-2">
            {others.map((program) => (
              <article
                key={program.id}
                className="group relative flex flex-col bg-white border border-beige-200 p-6 sm:p-8 rounded-xl transition-all hover:shadow-xl duration-300 overflow-hidden"
              >
                {program.hero?.bannerImage && (
                  <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden rounded-lg mb-4 shadow-md border border-beige-100">
                    <Image
                      src={program.hero.bannerImage}
                      alt={program.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent pointer-events-none" />
                  </div>
                )}
                
                <div className="flex flex-1 flex-col">
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-beige-100 text-charcoal/70 px-2 py-0.5 rounded-full border border-beige-200">
                      {program.duration}
                    </span>
                    {program.format && (
                      <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-beige-100 text-charcoal/70 px-2 py-0.5 rounded-full border border-beige-200">
                        {program.format}
                      </span>
                    )}
                  </div>
                  
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C6D40] mb-2 block">
                    {program.category || "Signature Program"}
                  </span>
                  
                  <h3 className="font-display text-3xl font-medium text-charcoal sm:text-4xl mb-6 group-hover:text-[#8C6D40] transition-colors">
                    {program.title}
                  </h3>
                  
                  <p className="text-base leading-relaxed text-charcoal/85 mb-8 line-clamp-3">
                    {program.description}
                  </p>
                  
                  <div className="mb-8">
                    <h4 className="font-semibold text-xs text-charcoal uppercase tracking-widest mb-4">Core Focus</h4>
                    <ul className="space-y-4">
                      {program.included?.slice(0, 3).map((f: any, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-start gap-4 text-sm text-charcoal/90"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#8C6D40]" />
                          <span className="leading-relaxed">{f.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-beige-200 pt-6 mt-auto gap-4 w-full">
                    <ProgramPriceOverride program={program} />
                    <Button asChild variant="ghost" className="group/btn text-[#8C6D40] hover:text-[#B8955F] hover:bg-transparent px-0 font-semibold tracking-wide uppercase text-xs shrink-0">
                      <Link href={`/programs/${program.slug || program.id}`} className="flex items-center">
                        View Details
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
