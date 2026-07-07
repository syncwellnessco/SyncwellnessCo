"use client";

import Link from "@/components/ui/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useUserStore } from "@/store/user-store";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";

export function MyProgramsSection({ allPrograms }: { allPrograms: any[] }) {
  const { user, purchasedPrograms } = useUserStore();

  if (!user || purchasedPrograms.length === 0) {
    return null;
  }

  const myPrograms = allPrograms.filter(p => purchasedPrograms.includes(p.id));

  return (
    <section className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-16 mb-16">
      <div className="bg-cream/90 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-white/40 shadow-2xl">
        <SectionHeading 
          eyebrow="Welcome Back" 
          title="My Programmes" 
          align="left" 
        />
        
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {myPrograms.map((program) => (
            <div key={program.id} className="relative overflow-hidden rounded-2xl bg-white shadow-md border border-beige-200 group">
              <div className="aspect-video bg-charcoal relative flex items-center justify-center">
                 {program.videoUrl ? (
                   <>
                     <video src={program.videoUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                     <PlayCircle className="w-12 h-12 text-white/80 relative z-10 group-hover:scale-110 transition-transform" />
                   </>
                 ) : (
                   <div className="bg-sage-800 w-full h-full flex items-center justify-center text-white/50 font-display">
                     {program.name}
                   </div>
                 )}
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-semibold text-charcoal mb-2">{program.name}</h3>
                <p className="text-sm text-charcoal mb-6 line-clamp-2">{program.description}</p>
                <Button asChild className="w-full bg-charcoal text-white hover:bg-charcoal/90">
                  <Link prefetch={false} href={`/programs/${program.slug || program.id}/course`}>
                    Access Course <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
