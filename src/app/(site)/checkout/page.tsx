"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  Award,
  FileText,
  MessageSquare,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Spinner } from "@/components/ui/spinner";
import { useUserStore } from "@/store/user-store";
import toast from "react-hot-toast";

interface ProgramDetails {
  id: string;
  slug?: string;
  title: string;
  shortDescription?: string;
  description?: string;
  duration?: string;
  format?: string;
  category?: string;
  pricing?: {
    price: number;
    currency: string;
    salePrice?: number;
  };
  included?: {
    title: string;
    description?: string;
    icon?: string;
  }[];
  problemsSolved?: string[];
}

// Powered by Stripe badge using local SVG from public folder
function PoweredByStripeBadge({ className = "h-7" }: { className?: string }) {
  return (
    <img
      src="/Powered%20by%20Stripe%20-%20blurple.svg"
      alt="Powered by Stripe"
      className={className}
    />
  );
}

function VisaLogo({ className = "h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" fill="#1434CB" />
      <path d="M19.4 20.9h-2.7l1.7-10.4h2.7l-1.7 10.4zm11.2-10.1c-.5-.2-1.4-.4-2.4-.4-2.7 0-4.6 1.4-4.6 3.4 0 1.5 1.3 2.3 2.3 2.8 1.1.5 1.4.8 1.4 1.3 0 .7-.9 1.1-1.7 1.1-1.1 0-1.8-.2-2.7-.6l-.4-.2-.4 2.6c.7.3 2.1.6 3.5.6 3.3 0 5.4-1.6 5.4-3.7 0-1.2-.7-2.2-2.3-2.9-.9-.5-1.5-.8-1.5-1.3 0-.4.5-.9 1.6-.9.9 0 1.6.2 2.1.4l.3.1.4-2.3zm7.6 0h-2.1c-.6 0-1.1.2-1.3.8l-3.8 9.3h2.8l.6-1.6h3.4l.3 1.6h2.5l-2.4-10.1zm-2.7 6.3l1.4-3.8.8 3.8h-2.2zM14.3 10.5l-2.5 7.1-.3-1.4c-.5-1.6-1.9-3.4-3.6-4.3l2.3 8.9h2.8l4.2-10.3h-2.9z" fill="white" />
    </svg>
  );
}

function MastercardLogo({ className = "h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" fill="#0A0A0A" />
      <circle cx="19" cy="16" r="9" fill="#EB001B" />
      <circle cx="29" cy="16" r="9" fill="#F79E1B" />
      <path d="M24 9.8a8.95 8.95 0 0 0-3.3 6.2 8.95 8.95 0 0 0 3.3 6.2 8.95 8.95 0 0 0 3.3-6.2c0-2.4-1-4.6-2.7-5.8A8.9 8.9 0 0 0 24 9.8z" fill="#FF5F00" />
    </svg>
  );
}

function AmexLogo({ className = "h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" fill="#006FCF" />
      <path d="M7 12.5h3.6l1.2 2.5 1.2-2.5H16.6v7h-2.3v-4.5l-1.3 2.7h-1.6l-1.3-2.7v4.5H7v-7zm10.5 0h6v1.8h-3.7v.8h3.5v1.7h-3.5v.9h3.7v1.8h-6v-7zm7 0h2.4l1.6 2.7 1.6-2.7h2.4v7h-2.3v-4.2l-1.7 2.7h-1l-1.7-2.7v4.2h-1.3v-7zm9.2 0h5.8v1.8h-3.5v.8h3.3v1.7h-3.3v.9h3.5v1.8h-5.8v-7z" fill="white" />
    </svg>
  );
}

function CheckoutForm({ program }: { program: ProgramDetails }) {
  const router = useRouter();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+61");

  useEffect(() => {
    if (user) {
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "";
      setName(fullName);
      if (user.email) {
        setEmail(user.email);
      }
      if (user.user_metadata?.phone) {
        setPhone(user.user_metadata.phone);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const checkoutToast = toast.loading("Redirecting to trusted Stripe payment page...", {
      id: "stripe-checkout"
    });

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId: program.id,
          name,
          email,
          phone: `${countryCode}${phone}`,
          userId: user?.id || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to initiate payment session");
      }

      const { url } = await res.json();
      if (!url) {
        throw new Error("No payment session URL returned from server.");
      }

      toast.success("Redirecting to payment...", { id: "stripe-checkout" });
      window.location.href = url;
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error(err.message || "An unexpected error occurred during checkout.", { id: "stripe-checkout" });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full space-y-2.5 lg:space-y-3">
      <div className="space-y-2.5 lg:space-y-3">
        {/* Header */}
        <div className="border-b border-[#c4b19f]/60 pb-1.5 lg:pb-2">
          <h2 className="font-display text-xl sm:text-2xl lg:text-2xl xl:text-2.5xl font-medium text-[#1a1e18]">
            Billing Details
          </h2>
          <p className="text-[10px] sm:text-[11px] text-[#1a1e18]/70 mt-0.5">
            Enter your contact info to proceed to trusted payment processing.
          </p>
        </div>

        {/* Compact Input Fields */}
        <div className="space-y-2 lg:space-y-2.5">
          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a1e18]/80 mb-0.5">
              Full Name <span className="text-[#b38c50]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full bg-white/90 border border-[#c4b19f] p-1.5 lg:p-2 text-xs text-[#1a1e18] placeholder:text-[#1a1e18]/30 focus:border-[#b38c50] focus:ring-1 focus:ring-[#b38c50] focus:outline-none rounded-none transition-colors"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a1e18]/80 mb-0.5">
              Email Address <span className="text-[#b38c50]">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@example.com"
              className="w-full bg-white/90 border border-[#c4b19f] p-1.5 lg:p-2 text-xs text-[#1a1e18] placeholder:text-[#1a1e18]/30 focus:border-[#b38c50] focus:ring-1 focus:ring-[#b38c50] focus:outline-none rounded-none transition-colors"
            />
          </div>

          {/* Phone Number Grid */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a1e18]/80 mb-0.5">
              Phone Number <span className="text-[#b38c50]">*</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="col-span-1 bg-white/90 border border-[#c4b19f] p-1.5 lg:p-2 text-[10px] sm:text-[11px] font-semibold text-[#1a1e18] focus:border-[#b38c50] focus:outline-none rounded-none cursor-pointer"
              >
                <option value="+61">AUS (+61)</option>
                <option value="+1">USA (+1)</option>
                <option value="+44">UK (+44)</option>
                <option value="+64">NZ (+64)</option>
                <option value="+91">IND (+91)</option>
              </select>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9\s-]/g, ""))}
                placeholder="400 000 000"
                className="col-span-3 bg-white/90 border border-[#c4b19f] p-1.5 lg:p-2 text-xs text-[#1a1e18] placeholder:text-[#1a1e18]/30 focus:border-[#b38c50] focus:ring-1 focus:ring-[#b38c50] focus:outline-none rounded-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* POWERED BY STRIPE TRUST BOX WITH LOCAL SVG & TRUSTED BADGE */}
        <div className="bg-white/90 border border-[#c4b19f] p-2 lg:p-2.5 rounded-none space-y-1 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#c4b19f]/40 pb-1">
            <PoweredByStripeBadge className="h-5 lg:h-5.5" />
            <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
              TRUSTED
            </div>
          </div>

          <p className="text-[10px] text-[#1a1e18]/75 leading-relaxed">
            Your payment details are processed with banking-grade security via Stripe. SyncWellnessCo never sees or stores your full credit card credentials.
          </p>

          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-1">
              <VisaLogo className="h-3 border border-black/10" />
              <MastercardLogo className="h-3 border border-black/10" />
              <AmexLogo className="h-3 border border-black/10" />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-[#1a1e18]/60 bg-[#f4f2f0] px-1.5 py-0.5 border border-[#c4b19f]">
              Apple & GPay
            </span>
          </div>
        </div>

        {/* IMPORTANT NOTES (GREYED OUT BULLETED NOTES WITH SMALL HEADING) */}
        <div className="pt-0.5 space-y-1">
          <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-widest text-[#1a1e18]/60 block">
            Important Notes:
          </span>
          <ul className="space-y-0.5 text-[9px] sm:text-[9.5px] text-[#1a1e18]/60 leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="text-[#1a1e18]/40 font-bold select-none">•</span>
              <span>This is a single one-time payment with no auto-renewing subscriptions or hidden charges. Instant access credentials and welcome materials will be sent directly to your email upon payment confirmation.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#1a1e18]/40 font-bold select-none">•</span>
              <span>A Client Coaching Agreement will be completed upon initial portal login to confirm your customized program goals and practitioner check-in schedule.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#1a1e18]/40 font-bold select-none">•</span>
              <span>Payments are non-refundable once coaching services or digital portal access have commenced. 1:1 session cancellations with less than 48 hours notice are forfeited, with one emergency reschedule permitted.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#1a1e18]/40 font-bold select-none">•</span>
              <span>All coaching provides evidence-based nutrition and lifestyle guidance and does not replace licensed medical diagnosis or treatment. Timelines may be extended for verified personal emergencies.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#1a1e18]/40 font-bold select-none">•</span>
              <span>Your personal information is protected with SSL 256-bit encryption and handled with strict practitioner data confidentiality.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Side-by-Side CTA Buttons: CANCEL & PROCEED (No Icons) */}
      <div className="pt-1.5 space-y-2">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => router.push(`/programs/${program.slug || program.id}`)}
            className="w-full bg-transparent text-[#1a1e18] hover:bg-[#1a1e18] hover:text-[#efe8df] uppercase tracking-[0.14em] text-[10px] sm:text-[11px] font-bold py-3 lg:py-3.5 px-3 lg:px-4 transition-all duration-300 rounded-none border border-[#c4b19f] cursor-pointer text-center"
          >
            CANCEL
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1e18] text-[#efe8df] hover:bg-[#b38c50] hover:text-white uppercase tracking-[0.14em] text-[10px] sm:text-[11px] font-bold py-3 lg:py-3.5 px-3 lg:px-4 transition-all duration-300 disabled:opacity-70 flex items-center justify-center rounded-none border border-[#1a1e18] cursor-pointer shadow-md group relative overflow-hidden text-center"
          >
            {loading ? (
              <>
                <Spinner className="h-3.5 w-3.5 text-white animate-spin mr-1.5" />
                <span>PREPARING...</span>
              </>
            ) : (
              <span>PROCEED TO PAYMENT</span>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[9px] uppercase font-bold tracking-widest text-[#1a1e18]/60 flex-wrap">
          <span>Trusted</span>
          <span>•</span>
          <span>Powered by Stripe</span>
          <span>•</span>
          <span>Instant Access</span>
        </div>
      </div>
    </form>
  );
}

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const programId = searchParams.get("programId");
  const { user, purchasedPrograms } = useUserStore();

  const [program, setProgram] = useState<ProgramDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!programId) {
      setError("No program specified for checkout.");
      setLoading(false);
      return;
    }

    if (user === undefined) return;

    if (!user) {
      const currentPath = window.location.pathname + window.location.search;
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    const fetchProgramAndCheckConsultation = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/programs/${programId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch program information.");
        }
        const data = await res.json();
        setProgram(data);
      } catch (err: any) {
        console.error("Checkout page error fetching program:", err);
        setError(err.message || "Failed to load program details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgramAndCheckConsultation();
  }, [programId, user, router]);

  useEffect(() => {
    if (program && purchasedPrograms.includes(program.id)) {
      toast.success(`You are already enrolled. Redirecting to your course...`);
      router.replace(`/programs/${program.slug || program.id}/course`);
    }
  }, [program, purchasedPrograms, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4 py-20 bg-[#efe8df]">
        <div className="p-8 border border-[#c4b19f] bg-white/50 text-center rounded-none shadow-sm space-y-4">
          <Spinner className="h-8 w-8 text-[#b38c50] animate-spin mx-auto" />
          <p className="text-[#1a1e18]/70 text-xs font-bold uppercase tracking-widest animate-pulse">
            Loading Your Trusted Checkout...
          </p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    const isConsultationError = error === "A completed 1:1 consultation is required before purchasing this program.";

    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4 py-20 bg-[#efe8df]">
        <div className="max-w-md mx-auto text-center p-8 bg-white border border-[#c4b19f] rounded-none shadow-sm space-y-6">
          <div className="inline-flex items-center justify-center h-12 w-12 border border-[#c4b19f] bg-[#f4f2f0] rounded-none text-[#b38c50] font-bold">
            !
          </div>
          <div>
            <h2 className="font-display text-2xl font-medium text-[#1a1e18] mb-2">Checkout Required Action</h2>
            <p className="text-xs text-[#1a1e18]/70 leading-relaxed">{error || "The requested program could not be loaded."}</p>
          </div>
          {isConsultationError ? (
            <button
              onClick={() => {
                if (program) {
                  router.push(`/programs/${program.slug || program.id}`);
                } else {
                  router.push("/programs");
                }
              }}
              className="w-full bg-[#b38c50] text-white hover:bg-[#1a1e18] uppercase tracking-widest text-xs font-bold py-4 px-8 transition-colors rounded-none cursor-pointer border border-[#b38c50]"
            >
              Book Free Consultation
            </button>
          ) : (
            <button
              onClick={() => router.push("/programs")}
              className="w-full bg-[#1a1e18] text-[#efe8df] hover:bg-[#b38c50] hover:text-white uppercase tracking-widest text-xs font-bold py-4 px-8 transition-colors rounded-none cursor-pointer border border-[#1a1e18]"
            >
              View All Programs
            </button>
          )}
        </div>
      </div>
    );
  }

  const price = program.pricing?.salePrice !== undefined && program.pricing.salePrice !== null
    ? program.pricing.salePrice
    : (program.pricing?.price || 599);

  const listPrice = program.pricing?.price;
  const showDiscount = program.pricing?.salePrice && listPrice && listPrice > program.pricing.salePrice;

  return (
    <div className="w-full bg-[#efe8df] flex-1 flex flex-col min-h-0">
      {/* Main Split Body: 
          - PC (lg:): Left = Expanded Program Details (lg:col-span-7, lg:order-1), Right = Compact Checkout Form (lg:col-span-5, lg:order-2)
          - Mobile: Order Summary on Top (order-1), Checkout Form below (order-2)
      */}
      <div className="grid lg:grid-cols-12 flex-1 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-[#c4b19f] overflow-y-auto lg:overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

        {/* EXPANDED PROGRAM DETAILS / ORDER SUMMARY (LEFT ON PC lg:col-span-7 lg:order-1, TOP ON MOBILE order-1) */}
        <div className="order-1 lg:order-1 lg:col-span-7 bg-[#f4f2f0] p-4 sm:p-5 lg:p-4 xl:p-5 flex flex-col justify-between overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-none text-[#1a1e18]">
          <div className="space-y-2.5 sm:space-y-3 lg:space-y-3">
            {/* Header */}
            <div className="border-b border-[#c4b19f]/60 pb-1.5 lg:pb-2 pt-0.5">
              <h1 className="font-display text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-medium text-[#1a1e18] leading-tight">
                {program.title}
              </h1>
              {(program.shortDescription || program.description) && (
                <p className="text-xs sm:text-xs lg:text-xs xl:text-sm text-[#3a342e]/85 leading-relaxed mt-0.5">
                  {program.shortDescription || program.description}
                </p>
              )}
            </div>

            {/* Program Highlights & Inclusions Grid */}
            <div className="border border-[#c4b19f] bg-[#efe8df]/80 p-2.5 sm:p-3 lg:p-3 xl:p-4 rounded-none space-y-2.5">
              <span className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-widest text-[#b38c50] block border-b border-[#c4b19f]/40 pb-0.5 flex items-center justify-between">
                <span>Program Highlights & Inclusions</span>
                <span className="text-[8.5px] sm:text-[9px] text-[#1a1e18]/50 font-normal">EVIDENCE-BASED PROTOCOLS</span>
              </span>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 lg:gap-1.5 xl:gap-2 text-xs sm:text-xs xl:text-sm text-[#1a1e18]/80">
                <li className="flex items-start gap-1.5">
                  <div className="h-3.5 w-3.5 bg-[#b38c50] text-white flex items-center justify-center shrink-0 mt-0.5 rounded-none">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span className="leading-tight text-[11px] sm:text-xs">1-on-1 Clinical Guidance & Protocol Customization</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="h-3.5 w-3.5 bg-[#b38c50] text-white flex items-center justify-center shrink-0 mt-0.5 rounded-none">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span className="leading-tight text-[11px] sm:text-xs">Evidence-Based Hormone & Metabolic Support</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="h-3.5 w-3.5 bg-[#b38c50] text-white flex items-center justify-center shrink-0 mt-0.5 rounded-none">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span className="leading-tight text-[11px] sm:text-xs">Instant Unlimited Access to Portal & Workbooks</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="h-3.5 w-3.5 bg-[#b38c50] text-white flex items-center justify-center shrink-0 mt-0.5 rounded-none">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span className="leading-tight text-[11px] sm:text-xs">Practitioner Messaging & Direct Check-Ins</span>
                </li>
              </ul>

              {/* What You Receive Upon Enrolment (Nested Inside Highlights) */}
              <div className="border-t border-[#c4b19f]/40 pt-2 space-y-1.5">
                <span className="text-[9px] sm:text-[9.5px] font-bold uppercase tracking-wider text-[#1a1e18]/60 block">
                  What You Receive Upon Enrolment:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-[#b38c50] shrink-0" />
                    <h4 className="text-[10.5px] sm:text-[11px] font-normal text-[#1a1e18]/85 leading-snug">Personalized Clinical Protocol</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-[#b38c50] shrink-0" />
                    <h4 className="text-[10.5px] sm:text-[11px] font-normal text-[#1a1e18]/85 leading-snug">Practitioner Messaging</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-[#b38c50] shrink-0" />
                    <h4 className="text-[10.5px] sm:text-[11px] font-normal text-[#1a1e18]/85 leading-snug">Digital Workbooks & Trackers</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#b38c50] shrink-0" />
                    <h4 className="text-[10.5px] sm:text-[11px] font-normal text-[#1a1e18]/85 leading-snug">Coaching Agreement & Check-Ins</h4>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-[#c4b19f]/40 pt-1.5 text-xs">
                <div>
                  <span className="text-[9px] sm:text-[9.5px] font-bold uppercase text-[#1a1e18]/50 block">Duration</span>
                  <span className="font-semibold text-[#1a1e18] text-[11px] sm:text-xs">{program.duration || "14 Days"}</span>
                </div>
                <div>
                  <span className="text-[9px] sm:text-[9.5px] font-bold uppercase text-[#1a1e18]/50 block">Format</span>
                  <span className="font-semibold text-[#1a1e18] text-[11px] sm:text-xs">{program.format || "Online Guided"}</span>
                </div>
                <div>
                  <span className="text-[9px] sm:text-[9.5px] font-bold uppercase text-[#1a1e18]/50 block">Portal Access</span>
                  <span className="font-semibold text-[#1a1e18] text-[11px] sm:text-xs">Instant / Unlimited</span>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border border-[#c4b19f] bg-white/80 p-2.5 sm:p-3 lg:p-3 xl:p-4 rounded-none space-y-1">
              <span className="text-[9px] sm:text-[10px] lg:text-[10px] xl:text-[11px] font-bold uppercase tracking-widest text-[#1a1e18]/60 block">
                Investment Summary
              </span>

              {showDiscount && (
                <div className="flex justify-between items-center text-xs text-[#1a1e18]/60">
                  <span>Regular List Price</span>
                  <span className="line-through">${listPrice.toFixed(2)} AUD</span>
                </div>
              )}

              {showDiscount && (
                <div className="flex justify-between items-center text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded-none">
                  <span>Special Enrolment Savings</span>
                  <span>-${(listPrice - price).toFixed(2)} AUD</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-[#1a1e18]/70">
                <span>Payment Type</span>
                <span className="font-medium text-[#1a1e18]">One-Time Full Access</span>
              </div>

              <div className="border-t border-[#c4b19f] pt-1.5 mt-0.5 flex items-baseline justify-between">
                <div>
                  <span className="text-[9px] sm:text-[10px] lg:text-[10px] xl:text-[11px] font-bold uppercase tracking-widest text-[#1a1e18]/70 block">
                    Total Investment
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#1a1e18]/50 font-semibold uppercase">Inclusive of all portal content</span>
                </div>
                <div className="text-right">
                  <span className="font-display text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-semibold text-[#b38c50]">
                    ${price.toFixed(2)}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-[#1a1e18]/60 uppercase ml-1">AUD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guarantee Badge Box */}
          <div className="mt-2 pt-1.5 border-t border-[#c4b19f]/60">
            <div className="bg-[#1a1e18] text-[#efe8df] p-2.5 lg:p-2.5 xl:p-3 rounded-none border border-[#1a1e18] flex items-start gap-2">
              <Award className="h-4 w-4 text-[#b38c50] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-bold text-[#efe8df] uppercase tracking-wider text-[9px] sm:text-[10px] mb-0.5">
                  Clinical Quality Guarantee
                </p>
                <p className="text-[#efe8df]/70 text-[10px] sm:text-[11px]">
                  All SyncWellnessCo programs are backed by evidence-based nutrition protocols and dedicated clinical coaching.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COMPACT CHECKOUT FORM (RIGHT ON PC lg:col-span-5 lg:order-2, BOTTOM ON MOBILE order-2) */}
        <div className="order-2 lg:order-2 lg:col-span-5 bg-[#efe8df] p-4 sm:p-6 lg:p-4 xl:p-5 pb-10 lg:pb-4 flex flex-col justify-between overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-none">
          <CheckoutForm program={program} />
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <PageShell className="pt-[72px] sm:pt-[80px] lg:pt-16 lg:h-screen lg:max-h-screen lg:overflow-hidden flex flex-col px-0 pb-0">
      <Suspense fallback={
        <div className="min-h-screen bg-[#efe8df] flex flex-col justify-center items-center gap-4 pt-32 pb-24">
          <Spinner className="h-8 w-8 text-[#b38c50] animate-spin" />
          <p className="text-[#1a1e18]/60 text-xs font-bold tracking-widest uppercase">LOADING CHECKOUT...</p>
        </div>
      }>
        <CheckoutPageContent />
      </Suspense>
    </PageShell>
  );
}
