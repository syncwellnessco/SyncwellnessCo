import Link from "next/link";
import { Check, Star, ArrowRight, PlayCircle } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { GlassBadge } from "@/components/ui/glass-badge";
import { getAllPrograms } from "@/lib/programs";
import { MyProgramsSection } from "@/components/pages/my-programs-section";

export async function ProgramsPageContent() {
  const programs = await getAllPrograms({ publishedOnly: true });
  const featured = programs.find((p) => p.featured);
  const others = programs.filter((p) => !p.featured);

  return (
    <article className="pb-24">
      {/* Hero */}
      <section 
        className="relative overflow-hidden bg-cover bg-center pt-32 pb-24 sm:pt-40 sm:pb-32"
        style={{ backgroundImage: `url(https://res.cloudinary.com/daw1tscqr/image/upload/v1780733233/shadow-background_wbrsm4.jpg)` }}
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
              Hormones are at the core of women's health — and yet most solutions barely scratch the surface, leaving you piecing things together on your own.
            </p>
            <p>
              Choose the program that meets you where you are — each designed to deliver real, sustainable results through a research-backed, root-cause approach.
            </p>
          </div>
        </div>
      </section>

      {/* My Programs */}
      <MyProgramsSection allPrograms={programs} />

      {/* Featured Program */}
      {featured && (
        <section className="relative bg-cream py-24 border-b border-beige-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              
              <div className="flex flex-col justify-center order-2 lg:order-2">
                <div className="mb-6">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal mb-2">
                    Our Featured Program
                  </span>
                </div>
                
                <h2 className="font-display text-4xl lg:text-5xl font-medium leading-[1.15] text-charcoal mb-6">
                  {featured.title}{" "}
                  <span className="box-decoration-clone bg-[#EBE3DB] px-3 py-1">
                    Masterclass
                  </span>
                </h2>
                
                <p className="text-lg leading-relaxed text-charcoal mb-8 max-w-lg">
                  {featured.description}
                </p>
                
                <div className="flex items-center gap-3 mb-10">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D40] border border-[#A8895C]/30 px-3 py-1 rounded-sm">{featured.duration}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                  <Button asChild size="lg" className="w-full sm:w-auto bg-[#8C6D40] text-white hover:bg-[#B8955F] uppercase tracking-[0.15em] text-xs font-semibold h-14 px-10 rounded-sm border-0 transition-colors">
                    <Link href={`/programs/${featured.id}`}>Explore Program</Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative order-1 lg:order-1 aspect-[4/5] lg:aspect-auto lg:h-[600px] w-full rounded-sm overflow-hidden border border-beige-200 shadow-sm group">
                {featured.hero?.introVideo ? (
                   <>
                     <video 
                       autoPlay 
                       muted 
                       loop 
                       playsInline 
                       src={featured.hero.introVideo} 
                       className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                     />
                   </>
                ) : (
                  <div className="absolute inset-0 bg-sage-50 flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-sage-200" />
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Other Programs */}
      <section className="py-24 bg-[#FAF9F7]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="More Options" title="Find Your Perfect Fit" align="center" />
          
          <div className="mt-16 grid gap-12 lg:grid-cols-2">
            {others.map((program) => (
              <article
                key={program.id}
                className="group relative flex flex-col bg-white border border-beige-200 p-10 transition-all hover:shadow-xl duration-300"
              >
                <div className="mb-6 flex gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8C6D40] border border-[#A8895C]/30 px-2.5 py-1 rounded-sm">
                    {program.duration}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8C6D40] border border-[#A8895C]/30 px-2.5 py-1 rounded-sm">
                    {program.format}
                  </span>
                </div>
                
                <h3 className="font-display text-3xl font-medium text-charcoal sm:text-4xl mb-6 group-hover:text-[#8C6D40] transition-colors">
                  {program.title}
                </h3>
                
                <p className="flex-1 text-base leading-relaxed text-charcoal mb-8">
                  {program.description}
                </p>
                
                <div className="mb-10">
                  <h4 className="font-semibold text-xs text-charcoal uppercase tracking-widest mb-4">Core Focus</h4>
                  <ul className="space-y-4">
                    {program.included?.slice(0, 3).map((f, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-4 text-sm text-charcoal"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#8C6D40]" />
                        <span className="leading-relaxed">{f.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center justify-between border-t border-beige-200 pt-6 mt-auto">
                  <span className="font-medium text-slate-800">
                    {program.pricing?.price ? `$${program.pricing.price}` : "Free"}
                  </span>
                  <Button asChild variant="ghost" className="group/btn text-[#8C6D40] hover:text-[#B8955F] hover:bg-transparent px-0 font-semibold tracking-wide uppercase text-xs">
                    <Link href={`/programs/${program.id}`}>
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
