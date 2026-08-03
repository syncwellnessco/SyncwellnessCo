"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Check,
  Award,
  FileText,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Spinner } from "@/components/ui/spinner";
import { useUserStore } from "@/store/user-store";
import { CountryCodeSelect } from "@/components/ui/country-code-select";
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

function PoweredByStripeBadge({ className = "h-4" }: { className?: string }) {
  return (
    <img
      src="/icons/stripe_badge.svg"
      alt="Powered by Stripe"
      className={className}
    />
  );
}

function VisaLogo({ className = "h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="2" fill="#1434CB" />
      <path d="M19.4 20.9h-2.7l1.7-10.4h2.7l-1.7 10.4zm11.2-10.1c-.5-.2-1.4-.4-2.4-.4-2.7 0-4.6 1.4-4.6 3.4 0 1.5 1.3 2.3 2.3 2.8 1.1.5 1.4.8 1.4 1.3 0 .7-.9 1.1-1.7 1.1-1.1 0-1.8-.2-2.7-.6l-.4-.2-.4 2.6c.7.3 2.1.6 3.5.6 3.3 0 5.4-1.6 5.4-3.7 0-1.2-.7-2.2-2.3-2.9-.9-.5-1.5-.8-1.5-1.3 0-.4.5-.9 1.6-.9.9 0 1.6.2 2.1.4l.3.1.4-2.3zm7.6 0h-2.1c-.6 0-1.1.2-1.3.8l-3.8 9.3h2.8l.6-1.6h3.4l.3 1.6h2.5l-2.4-10.1zm-2.7 6.3l1.4-3.8.8 3.8h-2.2zM14.3 10.5l-2.5 7.1-.3-1.4c-.5-1.6-1.9-3.4-3.6-4.3l2.3 8.9h2.8l4.2-10.3h-2.9z" fill="white" />
    </svg>
  );
}

function MastercardLogo({ className = "h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="2" fill="#0A0A0A" />
      <circle cx="19" cy="16" r="9" fill="#EB001B" />
      <circle cx="29" cy="16" r="9" fill="#F79E1B" />
      <path d="M24 9.8a8.95 8.95 0 0 0-3.3 6.2 8.95 8.95 0 0 0 3.3 6.2 8.95 8.95 0 0 0 3.3-6.2c0-2.4-1-4.6-2.7-5.8A8.9 8.9 0 0 0 24 9.8z" fill="#FF5F00" />
    </svg>
  );
}

function AmexLogo({ className = "h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="2" fill="#006FCF" />
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
    <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full space-y-3.5">
      <div className="space-y-3">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-[#8C6D40] bg-[#8C6D40]/10 px-2.5 py-0.5 rounded-md mb-0.5">
            <Lock className="w-3 h-3" />
            <span>Secure Payment</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-charcoal">
            Billing Details
          </h2>
          <p className="text-xs text-charcoal/70 mt-0.5">
            Enter your details to proceed to trusted checkout processing.
          </p>
        </div>

        {/* Input Fields */}
        <div className="space-y-2">
          {/* Full Name */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-charcoal/80 mb-0.5">
              Full Name <span className="text-[#8C6D40]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full bg-[#FAF9F7] focus:bg-white px-3 py-2 text-xs text-charcoal placeholder:text-charcoal/40 focus:ring-1 focus:ring-[#8C6D40] focus:outline-none rounded-md transition-all border-none"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-charcoal/80 mb-0.5">
              Email Address <span className="text-[#8C6D40]">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@example.com"
              className="w-full bg-[#FAF9F7] focus:bg-white px-3 py-2 text-xs text-charcoal placeholder:text-charcoal/40 focus:ring-1 focus:ring-[#8C6D40] focus:outline-none rounded-md transition-all border-none"
            />
          </div>

          {/* Phone Number Grid */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-charcoal/80 mb-0.5">
              Phone Number <span className="text-[#8C6D40]">*</span>
            </label>
            <div className="flex gap-2 items-center">
              <div className="w-32 shrink-0">
                <CountryCodeSelect
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full bg-transparent px-1.5 py-2 text-xs font-semibold text-charcoal focus:outline-none transition-all cursor-pointer"
                />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9\s-]/g, ""))}
                placeholder="400 000 000"
                className="flex-1 min-w-0 bg-[#FAF9F7] focus:bg-white px-3 py-2 text-xs text-charcoal placeholder:text-charcoal/40 focus:ring-1 focus:ring-[#8C6D40] focus:outline-none rounded-md border border-[#EBE3DB] transition-all"
              />
            </div>
          </div>
        </div>

        {/* POWERED BY STRIPE TRUST BOX */}
        <div className="bg-[#FAF9F7] p-2.5 rounded-lg space-y-1">
          <div className="flex items-center justify-between">
            <PoweredByStripeBadge className="h-4" />
            <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md">
              TRUSTED
            </div>
          </div>

          <p className="text-[10.5px] text-charcoal/75 leading-relaxed">
            Your payment is processed with banking-grade SSL security via Stripe. SyncwellnessCo never stores your card credentials.
          </p>

          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-1.5">
              <VisaLogo className="h-3 rounded-sm overflow-hidden" />
              <MastercardLogo className="h-3 rounded-sm overflow-hidden" />
              <AmexLogo className="h-3 rounded-sm overflow-hidden" />
            </div>
            <span className="text-[8.5px] font-bold uppercase tracking-wider text-charcoal/70 bg-white px-2 py-0.5 rounded-md shadow-2xs">
              Apple & GPay
            </span>
          </div>
        </div>

        {/* IMPORTANT NOTES */}
        <div className="bg-[#FAF9F7]/70 p-2.5 rounded-lg space-y-1">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-charcoal/70 block">
            Important Notes:
          </span>
          <ul className="space-y-0.5 text-[9.5px] text-charcoal/65 leading-tight">
            <li className="flex items-start gap-1">
              <span className="text-charcoal/40 font-bold select-none">•</span>
              <span>One-time payment with no recurring hidden fees. Instant access materials sent to your email.</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-charcoal/40 font-bold select-none">•</span>
              <span>Client Agreement completed on initial portal login to confirm goal parameters.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Side-by-Side CTA Buttons */}
      <div className="pt-2 space-y-2">
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={() => router.push(`/programs/${program.slug || program.id}`)}
            className="col-span-2 bg-[#FAF9F7] hover:bg-beige-100 text-charcoal uppercase tracking-wider text-[11px] sm:text-xs font-bold py-2.5 px-3.5 transition-all rounded-md cursor-pointer text-center border-none whitespace-nowrap"
          >
            CANCEL
          </button>

          <button
            type="submit"
            disabled={loading}
            className="col-span-3 bg-charcoal text-white hover:bg-charcoal/90 uppercase tracking-wider text-[11px] sm:text-xs font-bold py-2.5 px-3.5 transition-all disabled:opacity-70 flex items-center justify-center rounded-md cursor-pointer shadow-md group relative overflow-hidden text-center border-none whitespace-nowrap"
          >
            {loading ? (
              <>
                <Spinner className="h-3.5 w-3.5 text-white animate-spin mr-1.5 shrink-0" />
                <span className="whitespace-nowrap">PREPARING...</span>
              </>
            ) : (
              <span className="whitespace-nowrap">PROCEED TO PAYMENT</span>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[8.5px] sm:text-[9px] uppercase font-bold tracking-widest text-charcoal/50 flex-wrap pt-0.5">
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
      <div className="w-full min-h-screen flex-1 flex flex-col justify-center items-center gap-4 bg-[#FAF9F7] pt-16">
        <Spinner className="h-8 w-8 text-[#8C6D40] animate-spin" />
        <p className="text-charcoal/80 text-xs font-bold uppercase tracking-widest animate-pulse text-center">
          Loading Your Trusted Checkout...
        </p>
      </div>
    );
  }

  if (error || !program) {
    const isConsultationError = error === "A completed 1:1 consultation is required before purchasing this program.";

    return (
      <div className="w-full min-h-screen flex-1 flex flex-col justify-center items-center gap-6 bg-[#FAF9F7] pt-16 px-4">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-lg shadow-lg space-y-6">
          <div className="inline-flex items-center justify-center h-12 w-12 bg-[#FAF9F7] rounded-md text-[#8C6D40] font-bold text-lg mx-auto">
            !
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-charcoal mb-2">Checkout Required Action</h2>
            <p className="text-xs text-charcoal/70 leading-relaxed">{error || "The requested program could not be loaded."}</p>
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
              className="w-full bg-[#8C6D40] text-white hover:bg-charcoal uppercase tracking-widest text-xs font-bold py-3.5 px-8 transition-all rounded-md shadow-md cursor-pointer border-none whitespace-nowrap"
            >
              Book Free Consultation
            </button>
          ) : (
            <button
              onClick={() => router.push("/programs")}
              className="w-full bg-charcoal text-white hover:bg-charcoal/90 uppercase tracking-widest text-xs font-bold py-3.5 px-8 transition-all rounded-md shadow-md cursor-pointer border-none whitespace-nowrap"
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
    <div className="w-full flex-1 min-h-screen bg-white flex flex-col pt-[64px] overflow-y-auto">
      {/* FULL SCREEN PARENT CONTAINER - SCROLLABLE ON PC AND MOBILE WITH ZERO OVERFLOW LOCKS */}
      <div className="grid lg:grid-cols-12 flex-1 w-full divide-y lg:divide-y-0 lg:divide-x divide-charcoal/10 min-h-0">

        {/* LEFT PARTITION: PROGRAM DETAILS & SUMMARY */}
        <div className="lg:col-span-7 bg-[#FAF9F7] pt-3 px-5 pb-6 sm:px-6 lg:pt-4 lg:px-7 lg:pb-6 xl:px-8 flex flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#8C6D40] bg-[#8C6D40]/10 px-2 py-0.5 rounded-md mb-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>Selected Program</span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-semibold text-charcoal leading-tight">
                {program.title}
              </h1>
              {(program.shortDescription || program.description) && (
                <p className="text-[11px] sm:text-xs text-charcoal/75 leading-relaxed mt-0.5 line-clamp-2">
                  {program.shortDescription || program.description}
                </p>
              )}
            </div>

            {/* Program Highlights & Inclusions Grid */}
            <div className="bg-white p-3 sm:p-3.5 rounded-lg space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C6D40]">
                  Program Highlights & Inclusions
                </span>
                <span className="text-[8.5px] text-charcoal/50 font-semibold tracking-wide uppercase">EVIDENCE-BASED</span>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-charcoal/80">
                <li className="flex items-start gap-2">
                  <div className="h-4 w-4 bg-[#8C6D40] text-white flex items-center justify-center shrink-0 mt-0.5 rounded-full">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span className="leading-tight text-[11px] sm:text-xs">1-on-1 Clinical Guidance</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-4 w-4 bg-[#8C6D40] text-white flex items-center justify-center shrink-0 mt-0.5 rounded-full">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span className="leading-tight text-[11px] sm:text-xs">Hormone & Metabolic Support</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-4 w-4 bg-[#8C6D40] text-white flex items-center justify-center shrink-0 mt-0.5 rounded-full">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span className="leading-tight text-[11px] sm:text-xs">Portal & Workbook Access</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-4 w-4 bg-[#8C6D40] text-white flex items-center justify-center shrink-0 mt-0.5 rounded-full">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span className="leading-tight text-[11px] sm:text-xs">Practitioner Check-Ins</span>
                </li>
              </ul>

              {/* What You Receive */}
              <div className="pt-1 space-y-1">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-charcoal/60 block">
                  Included Enrolment Features:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-center gap-1.5 bg-[#FAF9F7] px-2 py-1 rounded-md text-[11px] font-medium text-charcoal/85">
                    <FileText className="h-3.5 w-3.5 text-[#8C6D40] shrink-0" />
                    <span>Clinical Protocol</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#FAF9F7] px-2 py-1 rounded-md text-[11px] font-medium text-charcoal/85">
                    <MessageSquare className="h-3.5 w-3.5 text-[#8C6D40] shrink-0" />
                    <span>Practitioner Messaging</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#FAF9F7] px-2 py-1 rounded-md text-[11px] font-medium text-charcoal/85">
                    <BookOpen className="h-3.5 w-3.5 text-[#8C6D40] shrink-0" />
                    <span>Digital Workbooks</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#FAF9F7] px-2 py-1 rounded-md text-[11px] font-medium text-charcoal/85">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#8C6D40] shrink-0" />
                    <span>Coaching Agreement</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                <div className="bg-[#FAF9F7] p-1.5 rounded-md text-center">
                  <span className="text-[8.5px] font-bold uppercase text-charcoal/50 block">Duration</span>
                  <span className="font-semibold text-charcoal text-[11px]">{program.duration || "14 Days"}</span>
                </div>
                <div className="bg-[#FAF9F7] p-1.5 rounded-md text-center">
                  <span className="text-[8.5px] font-bold uppercase text-charcoal/50 block">Format</span>
                  <span className="font-semibold text-charcoal text-[11px]">{program.format || "Online Guided"}</span>
                </div>
                <div className="bg-[#FAF9F7] p-1.5 rounded-md text-center">
                  <span className="text-[8.5px] font-bold uppercase text-charcoal/50 block">Portal Access</span>
                  <span className="font-semibold text-charcoal text-[11px]">Instant / Unlimited</span>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white p-3 sm:p-3.5 rounded-lg space-y-1 shadow-2xs">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-charcoal/60 block">
                Investment Summary
              </span>

              {showDiscount && (
                <div className="flex justify-between items-center text-xs text-charcoal/60">
                  <span>Regular List Price</span>
                  <span className="line-through">${listPrice.toFixed(2)} AUD</span>
                </div>
              )}

              {showDiscount && (
                <div className="flex justify-between items-center text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  <span>Special Enrolment Savings</span>
                  <span>-${(listPrice - price).toFixed(2)} AUD</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-charcoal/70">
                <span>Payment Type</span>
                <span className="font-semibold text-charcoal">One-Time Full Access</span>
              </div>

              <div className="pt-0.5 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/80 block">
                    Total Investment
                  </span>
                  <span className="text-[9px] text-charcoal/50 font-semibold uppercase">Inclusive of all portal content</span>
                </div>
                <div className="text-right">
                  <span className="font-display text-2.5xl sm:text-3xl font-bold text-charcoal">
                    ${price.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-bold text-charcoal/60 uppercase ml-1">AUD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Quality Guarantee */}
          <div className="pt-1 sm:pt-0.5">
            <div className="bg-[#8C6D40]/10 border border-[#8C6D40]/20 p-2.5 rounded-lg flex items-center gap-2.5 text-charcoal">
              <Award className="h-4 w-4 text-[#8C6D40] shrink-0" />
              <p className="text-[11px] text-charcoal/85 leading-snug">
                <strong className="font-bold text-[#8C6D40] uppercase tracking-wider text-[9.5px] mr-1 inline">Clinical Quality Guarantee:</strong>
                Backed by evidence-based nutrition protocols & clinical coaching.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PARTITION: CHECKOUT FORM */}
        <div className="lg:col-span-5 bg-white pt-3 px-5 pb-8 sm:px-6 lg:pt-4 lg:px-7 lg:pb-6 xl:px-8 flex flex-col justify-between">
          <CheckoutForm program={program} />
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <PageShell noPadding={true} className="flex flex-col min-h-screen px-0 pb-0">
      <Suspense fallback={
        <div className="w-full min-h-screen flex-1 flex flex-col justify-center items-center gap-4 bg-[#FAF9F7] pt-16">
          <Spinner className="h-8 w-8 text-[#8C6D40] animate-spin" />
          <p className="text-charcoal/80 text-xs font-bold uppercase tracking-widest animate-pulse text-center">
            Loading Your Trusted Checkout...
          </p>
        </div>
      }>
        <CheckoutPageContent />
      </Suspense>
    </PageShell>
  );
}
