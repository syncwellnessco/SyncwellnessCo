"use client";

import { useEffect, Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Sparkles, Mail, ArrowRight, BookOpen } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Spinner } from "@/components/ui/spinner";
import { useUserStore } from "@/store/user-store";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const programId = searchParams.get("programId");
  const email = searchParams.get("email");
  const title = searchParams.get("title") || "the program";
  const amount = searchParams.get("amount");
  const currency = "AUD";

  const { user } = useUserStore();

  const priceFormatted = amount ? `$${parseFloat(amount).toFixed(2)}` : "";

  return (
    <div className="pb-24 pt-4 sm:pt-6 lg:py-12">
      <div className="mx-auto max-w-4xl lg:max-w-6xl px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white border border-[#EBE3DB] shadow-lg p-8 sm:p-16 rounded-sm relative overflow-hidden max-w-3xl mx-auto text-center lg:bg-transparent lg:border-none lg:shadow-none lg:p-0 lg:max-w-none lg:text-left lg:overflow-visible">
          {/* Decorative top border */}
          <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-[#8C6D40] to-[#B8955F] lg:hidden"></div>

          <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-start">
            
            {/* Left Column: Success Header, Message, and Action Buttons */}
            <div className="lg:col-span-7 lg:flex lg:flex-col lg:items-start">
              
              {/* Animated Check Success */}
              <div className="relative mx-auto lg:mx-0 w-24 h-24 lg:w-20 lg:h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-10 lg:mb-6 shadow-[0_10px_30px_rgba(16,185,129,0.1)] border border-emerald-100">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" style={{ animationDuration: "2s" }} />
                <div className="w-16 h-16 lg:w-14 lg:h-14 bg-[#8C6D40] rounded-full flex items-center justify-center text-white shadow-inner">
                  <Check className="h-8 w-8 lg:h-7 lg:w-7 stroke-[3]" />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-[#8C6D40] uppercase bg-[#8C6D40]/5 px-4 py-2 rounded-sm mb-6 lg:mb-4">
                <Sparkles className="h-3.5 w-3.5" /> Registration Successful
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[44px] font-normal text-charcoal mb-6 lg:mb-4 leading-tight text-center lg:text-left">
                Your Health Journey <span className="italic font-light">Begins Now</span>.
              </h1>

              <p className="text-charcoal/80 text-[15px] sm:text-[16px] leading-relaxed max-w-lg mx-auto lg:mx-0 mb-12 lg:mb-8 text-center lg:text-left">
                Thank you for your enrollment. You are now registered in <span className="font-semibold text-charcoal">{title}</span>. 
                {email && (
                  <>
                    {" "}
                    We have sent a receipt and onboarding instructions to <span className="font-semibold text-charcoal">{email}</span>.
                  </>
                )}
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 w-full max-w-md mx-auto lg:mx-0">
                <Link
                  href="/profile"
                  className="flex-1 bg-charcoal text-white hover:bg-[#8C6D40] uppercase tracking-[0.15em] text-[11px] font-bold py-4.5 px-6 transition-all duration-300 flex items-center justify-center gap-2 rounded-sm shadow-sm"
                >
                  GO TO MY PROFILE <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/"
                  className="flex-1 bg-transparent hover:bg-[#FAF8F5] border border-[#DCD3C6] text-charcoal uppercase tracking-[0.15em] text-[11px] font-bold py-4.5 px-6 transition-all duration-300 flex items-center justify-center rounded-sm"
                >
                  BACK TO HOME
                </Link>
              </div>

            </div>

            {/* Right Column: Transaction Summary and Next Steps */}
            <div className="lg:col-span-5 lg:space-y-6 lg:mt-0 mt-12 w-full">

              {/* Transaction info block */}
              <div className="bg-[#FAF8F5] lg:bg-white border border-[#EBE3DB] p-6 sm:p-8 text-left rounded-sm mb-12 lg:mb-0 max-w-md lg:max-w-none mx-auto shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-4 border-b border-[#EBE3DB]/60 pb-2">
                  Enrollment Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal/60">Program</span>
                    <span className="font-medium text-charcoal text-right pl-4">{title}</span>
                  </div>
                  {priceFormatted && (
                    <div className="flex justify-between items-center">
                      <span className="text-charcoal/60">Amount Charged</span>
                      <span className="font-semibold text-[#8C6D40]">{priceFormatted} {currency}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal/60">Status</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-sm">Confirmed</span>
                  </div>
                </div>
              </div>

              {/* Action Steps */}
              <div className="max-w-md lg:max-w-none mx-auto text-left mb-16 lg:mb-0 space-y-8 lg:space-y-6">
                <h3 className="font-display text-2xl font-normal text-charcoal mb-6 lg:mb-4 text-center lg:text-left">Next Steps</h3>
                
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#EBE3DB] flex items-center justify-center shrink-0 text-[#8C6D40] font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal text-sm flex items-center gap-1.5">
                      Check Your Inbox <Mail className="h-4 w-4 text-charcoal/40" />
                    </h4>
                    <p className="text-xs text-charcoal/70 leading-relaxed mt-1">
                      Look for our welcome email containing your customized prep checklist, client intake forms, and scheduling link for your first clinical review.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#EBE3DB] flex items-center justify-center shrink-0 text-[#8C6D40] font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal text-sm flex items-center gap-1.5">
                      Access Program Materials <BookOpen className="h-4 w-4 text-charcoal/40" />
                    </h4>
                    <p className="text-xs text-charcoal/70 leading-relaxed mt-1">
                      Log into your profile dashboard to view program details, downloadable guides, resource libraries, and clinical trackers.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <PageShell>
      <Suspense fallback={
        <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4 py-16">
          <Spinner className="h-8 w-8 text-[#8C6D40] animate-spin" />
          <p className="text-charcoal/60 text-sm font-semibold tracking-wider">LOADING CONFIRMATION...</p>
        </div>
      }>
        <SuccessPageContent />
      </Suspense>
    </PageShell>
  );
}
