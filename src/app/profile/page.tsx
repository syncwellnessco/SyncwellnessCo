"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "@/components/ui/link";
import { User, LogOut, BookOpen, ArrowRight, PlayCircle } from "lucide-react";
import { useUserStore } from "@/store/user-store";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { getProgramsAction } from "@/app/actions/programs";



export default function ProfilePage() {
  const { user, purchasedPrograms } = useUserStore();
  const router = useRouter();
  const supabase = createClient();
  
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (user === undefined) return; // Still loading
    if (user === null) {
      router.push("/login?redirect=/profile");
    } else {
      // User is loaded
      getProgramsAction().then(progs => {
        setAllPrograms(progs);
        setLoading(false);
      });
    }
  }, [user, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-cream pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-64">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="flex-1 space-y-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const myProgramsData = allPrograms.filter(p => purchasedPrograms.includes(p.id));
  const hasPrograms = myProgramsData.length > 0;
  
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "Beautiful Soul";
  const avatarUrl = user.user_metadata?.avatar_url || null;

  return (
      <div className="min-h-screen bg-cream pt-[88px] lg:pt-32 pb-24 border-t border-[#EBE3DB]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-4 flex flex-col pt-4">
              <div className="mb-10 relative w-full aspect-square max-w-[280px] rounded-sm overflow-hidden border border-[#EBE3DB] shadow-sm">
                {avatarUrl && !imgError ? (
                  <img 
                    src={avatarUrl} 
                    alt={fullName} 
                    className="w-full h-full object-cover" 
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-[#FAF8F5] flex items-center justify-center">
                    <User className="w-24 h-24 text-[#DCD3C6]" />
                  </div>
                )}
              </div>
              
              <h1 className="font-display text-4xl lg:text-5xl font-normal text-charcoal mb-4">
                Welcome,
                <br />
                {fullName}
              </h1>
              
              <p className="text-[15px] text-charcoal mb-8 font-medium">
                {user.email}
              </p>
              
              <button 
                onClick={handleLogout} 
                className="bg-transparent border border-[#DCD3C6] text-charcoal hover:bg-[#FAF8F5] uppercase tracking-[0.15em] text-[11px] font-semibold py-4 px-8 transition-colors self-start flex items-center gap-2 rounded-sm"
              >
                <LogOut className="w-4 h-4" /> SIGN OUT
              </button>
            </div>

            {/* Right Column - Programmes */}
            <div className="lg:col-span-8 flex flex-col pt-4 lg:pl-10 lg:border-l lg:border-[#EBE3DB]">
              <h2 className="font-display text-3xl font-normal text-charcoal mb-10 pb-4 border-b border-[#DCD3C6]">
                My Programmes
              </h2>
              
              {hasPrograms ? (
                <div className="flex flex-col gap-8">
                  {myProgramsData.map((program) => (
                    <div key={program.id} className="group relative flex flex-col sm:flex-row gap-6 bg-[#FAF8F5] border border-[#EBE3DB] p-6 rounded-sm transition-all hover:shadow-sm">
                      <div className="w-full sm:w-48 aspect-video sm:aspect-square bg-[#F4EFEA] relative flex-shrink-0 border border-[#EBE3DB]">
                         {program.videoUrl ? (
                           <>
                             <video src={program.videoUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                             <PlayCircle className="w-10 h-10 text-[#8C6D40] absolute inset-0 m-auto z-10 group-hover:scale-110 transition-transform" />
                           </>
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                             <PlayCircle className="w-10 h-10 text-[#DCD3C6] mb-2" />
                           </div>
                         )}
                      </div>
                      
                      <div className="flex flex-col justify-center flex-1">
                        <h3 className="font-display text-2xl font-normal text-charcoal mb-3">{program.name}</h3>
                        <p className="text-sm text-charcoal mb-6 line-clamp-2 leading-relaxed">{program.description}</p>
                        
                        <Link prefetch={false} 
                          href={`/programs/${program.slug || program.id}/course`}
                          className="text-[#8C6D40] hover:text-[#B8955F] uppercase tracking-[0.15em] text-[11px] font-semibold flex items-center gap-2 mt-auto self-start"
                        >
                          ACCESS COURSE <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#FAF8F5] p-10 sm:p-16 text-center border border-[#EBE3DB] rounded-sm flex flex-col items-center">
                  <BookOpen className="w-12 h-12 text-[#DCD3C6] mb-6" />
                  <h3 className="font-display text-2xl font-normal text-charcoal mb-4">Your Journey Awaits</h3>
                  <p className="text-[15px] text-charcoal max-w-md mx-auto mb-10 leading-relaxed">
                    You haven't enrolled in any programs yet. Discover our transformative courses designed to help you balance your hormones naturally.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                    <Link prefetch={false} 
                      href="/programs"
                      className="bg-[#8C6D40] text-white hover:bg-[#B8955F] uppercase tracking-[0.15em] text-[11px] font-semibold py-4 px-8 transition-colors rounded-sm w-full sm:w-auto"
                    >
                      EXPLORE PROGRAMMES
                    </Link>
                    <Link prefetch={false} 
                      href="/blog"
                      className="bg-transparent border border-[#DCD3C6] text-charcoal hover:bg-white uppercase tracking-[0.15em] text-[11px] font-semibold py-4 px-8 transition-colors rounded-sm w-full sm:w-auto"
                    >
                      READ BLOGS
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
  );
}
