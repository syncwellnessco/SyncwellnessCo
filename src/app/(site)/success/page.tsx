"use client";

import { useEffect, Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Spinner } from "@/components/ui/spinner";
import { useUserStore } from "@/store/user-store";
import { getProgramsAction } from "@/app/actions/programs";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addPurchasedProgram } = useUserStore();

  const sessionId = searchParams.get("session_id") || searchParams.get("sessionId");
  const fallbackProgramId = searchParams.get("programId");
  const fallbackEmail = searchParams.get("email");
  const rawTitle = searchParams.get("title");
  const fallbackAmount = searchParams.get("amount");

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);
  const [programTitle, setProgramTitle] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function verifyPayment() {
      if (!sessionId) {
        if (fallbackProgramId) {
          addPurchasedProgram(fallbackProgramId);
          setVerified(true);
        } else {
          setErrorMsg("No payment session reference found. Please check your profile or email.");
        }
        setVerifying(false);
        return;
      }

      setVerifying(true);
      setErrorMsg(null);

      try {
        const res = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json().catch(() => ({}));

        if (!isMounted) return;

        if (res.ok && data.success && data.purchase) {
          setVerified(true);
          setPurchaseDetails(data.purchase);
          if (data.purchase.program_id) {
            addPurchasedProgram(data.purchase.program_id);
          }
        } else {
          setVerified(false);
          setErrorMsg(
            data.error || "We could not verify your payment session status with Stripe."
          );
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Verification exception:", err);
        setVerified(false);
        setErrorMsg("An unexpected network error occurred while verifying your payment.");
      } finally {
        if (isMounted) {
          setVerifying(false);
        }
      }
    }

    verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [sessionId, fallbackProgramId, addPurchasedProgram]);

  // Load actual program title from database to prevent displaying raw UUID
  useEffect(() => {
    let isMounted = true;
    const targetId = purchaseDetails?.program_id || fallbackProgramId;

    if (rawTitle && !rawTitle.includes("-") && rawTitle.length < 35) {
      setProgramTitle(rawTitle);
      return;
    }

    if (targetId) {
      getProgramsAction()
        .then((progs) => {
          if (!isMounted) return;
          const match = progs.find((p: any) => p.id === targetId || p.slug === targetId);
          if (match?.title) {
            setProgramTitle(match.title);
          } else if (rawTitle) {
            setProgramTitle(rawTitle);
          } else {
            setProgramTitle("Health & Wellness Coaching Program");
          }
        })
        .catch(() => {
          if (isMounted) setProgramTitle(rawTitle || "Health & Wellness Coaching Program");
        });
    } else if (rawTitle) {
      setProgramTitle(rawTitle);
    }
  }, [purchaseDetails, fallbackProgramId, rawTitle]);

  const displayTitle = programTitle || "Your Health Program";
  const displayEmail = purchaseDetails?.email || fallbackEmail;
  const displayAmount = purchaseDetails?.amount
    ? `$${(purchaseDetails.amount / 100).toFixed(2)}`
    : fallbackAmount
    ? `$${parseFloat(fallbackAmount).toFixed(2)}`
    : "";

  // 1. LOADING STATE
  if (verifying) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-4 py-16 px-4 text-center">
        <Spinner className="h-9 w-9 text-[#8C6D40] animate-spin" />
        <div>
          <h2 className="font-display text-2xl font-normal text-charcoal mb-1.5">
            Verifying Your Payment...
          </h2>
          <p className="text-charcoal/60 text-xs sm:text-sm max-w-md">
            Please wait while we confirm your enrollment with Stripe and activate your program access.
          </p>
        </div>
      </div>
    );
  }

  // 2. VERIFICATION FAILURE STATE
  if (!verified || errorMsg) {
    return (
      <div className="min-h-[calc(100vh-96px)] flex flex-col justify-center py-6 px-4 sm:px-6">
        <div className="mx-auto max-w-xl w-full">
          <div className="bg-white border border-red-200 shadow-sm p-6 sm:p-10 rounded-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
            
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertCircle className="h-7 w-7 stroke-[2]" />
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-normal text-charcoal mb-2">
              Payment Verification Issue
            </h1>

            <p className="text-charcoal/80 text-xs sm:text-sm leading-relaxed mb-5">
              {errorMsg || "We were unable to confirm your payment with Stripe."}
            </p>

            <div className="bg-[#FAF8F5] p-3.5 rounded-sm border border-[#EBE3DB] text-xs text-charcoal/70 mb-6 text-left space-y-1">
              <p className="font-semibold text-charcoal">What should you do?</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11.5px]">
                <li>If your card was charged, your enrollment is safe. Please check your email for confirmation.</li>
                <li>Try clicking "Retry Verification" below.</li>
                <li>Visit your Profile dashboard to see if your program is listed.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-charcoal text-white hover:bg-[#8C6D40] uppercase tracking-wider text-[11px] font-bold py-3 px-5 transition-all rounded-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> RETRY VERIFICATION
              </button>

              <Link
                href="/profile"
                className="bg-transparent hover:bg-[#FAF8F5] border border-[#DCD3C6] text-charcoal uppercase tracking-wider text-[11px] font-bold py-3 px-5 transition-all rounded-sm flex items-center justify-center gap-2"
              >
                GO TO PROFILE <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. SUCCESS STATE - Centered on mobile, left-aligned on sm+
  return (
    <div className="min-h-[calc(100vh-96px)] flex flex-col justify-center py-4 sm:py-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-5xl w-full">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
          
          {/* Left Column: Confirmation Header, Message & Action Buttons */}
          <div className="lg:col-span-7 flex flex-col items-center sm:items-start text-center sm:text-left mb-8 lg:mb-0">
            
            {/* Check Icon Circle - Centered on mobile */}
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100 shadow-2xs">
              <div className="w-11 h-11 bg-[#8C6D40] rounded-full flex items-center justify-center text-white">
                <Check className="h-5 w-5 stroke-[3]" />
              </div>
            </div>

            {/* Clean Badge WITHOUT rounded background pill */}
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#8C6D40] uppercase mb-2.5 block">
              REGISTRATION VERIFIED & CONFIRMED
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-2xl sm:text-3xl lg:text-[38px] font-normal text-charcoal mb-3 leading-tight">
              Your Health Journey <span className="italic font-light">Begins Now</span>.
            </h1>

            <p className="text-charcoal/80 text-xs sm:text-sm leading-relaxed max-w-lg mb-6">
              Thank you for your enrollment. You are now registered in <span className="font-semibold text-charcoal">{displayTitle}</span>. 
              {displayEmail && (
                <>
                  {" "}
                  We have sent a receipt and onboarding agreement link to <span className="font-semibold text-charcoal">{displayEmail}</span>.
                </>
              )}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 w-full max-w-md">
              <Link
                href="/profile"
                className="w-full sm:flex-1 bg-charcoal text-white hover:bg-[#8C6D40] uppercase tracking-[0.15em] text-[11px] font-bold py-3.5 px-6 transition-all duration-300 flex items-center justify-center gap-2 rounded-sm shadow-sm"
              >
                GO TO MY PROFILE <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/"
                className="w-full sm:flex-1 bg-transparent hover:bg-white/70 border border-[#DCD3C6] text-charcoal uppercase tracking-[0.15em] text-[11px] font-bold py-3.5 px-6 transition-all duration-300 flex items-center justify-center rounded-sm text-center"
              >
                BACK TO HOME
              </Link>
            </div>

          </div>

          {/* Right Column: Enrollment Summary and Next Steps */}
          <div className="lg:col-span-5 space-y-6 w-full text-left">

            {/* Enrollment Summary Card */}
            <div className="bg-white/90 border border-[#EBE3DB] p-5 sm:p-6 rounded-sm shadow-2xs backdrop-blur-xs">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-charcoal/50 mb-3 border-b border-[#EBE3DB] pb-2">
                Enrollment Summary
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-charcoal/60 shrink-0">Program</span>
                  <span className="font-semibold text-charcoal text-right text-xs sm:text-sm leading-snug">{displayTitle}</span>
                </div>
                {displayAmount && (
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal/60">Amount Charged</span>
                    <span className="font-bold text-[#8C6D40] text-xs sm:text-sm">{displayAmount} AUD</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1.5 border-t border-[#EBE3DB]">
                  <span className="text-charcoal/60">Status</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 uppercase text-[9.5px] tracking-wider px-2.5 py-0.5 rounded-sm">
                    VERIFIED
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-4 pt-1">
              <h3 className="font-display text-xl font-normal text-charcoal border-b border-[#EBE3DB]/60 pb-2">
                Next Steps
              </h3>
              
              <div className="flex gap-3.5 items-start">
                <div className="w-7 h-7 rounded-full bg-[#8C6D40]/10 text-[#8C6D40] flex items-center justify-center shrink-0 font-bold text-xs">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal text-xs sm:text-sm">
                    Check Your Inbox
                  </h4>
                  <p className="text-xs text-charcoal/70 leading-relaxed mt-0.5">
                    Look for our welcome email containing your prep checklist, client intake forms, and digital agreement link.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-7 h-7 rounded-full bg-[#8C6D40]/10 text-[#8C6D40] flex items-center justify-center shrink-0 font-bold text-xs">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal text-xs sm:text-sm">
                    Access Program Materials
                  </h4>
                  <p className="text-xs text-charcoal/70 leading-relaxed mt-0.5">
                    Log into your profile dashboard to view program details, downloadable guides, and clinical trackers.
                  </p>
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
    <PageShell className="bg-cream">
      <Suspense fallback={
        <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4 py-16">
          <Spinner className="h-8 w-8 text-[#8C6D40] animate-spin" />
          <p className="text-charcoal/60 text-xs font-semibold tracking-wider">LOADING CONFIRMATION...</p>
        </div>
      }>
        <SuccessPageContent />
      </Suspense>
    </PageShell>
  );
}
