"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft, CreditCard, Sparkles, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Spinner } from "@/components/ui/spinner";
import { useUserStore } from "@/store/user-store";
import toast from "react-hot-toast";

interface ProgramDetails {
  id: string;
  slug?: string;
  title: string;
  shortDescription?: string;
  duration?: string;
  format?: string;
  pricing?: {
    price: number;
    currency: string;
    salePrice?: number;
  };
}

function CheckoutForm({ program }: { program: ProgramDetails }) {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+61"); // Default Australian code

  // Prefill user details if logged in
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const price = program.pricing?.salePrice !== undefined && program.pricing.salePrice !== null
    ? program.pricing.salePrice
    : (program.pricing?.price || 599);

  const currencySymbol = "AUD $";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const checkoutToast = toast.loading("Redirecting to secure Stripe payment page...", {
      id: "stripe-checkout"
    });

    try {
      // Create Stripe Checkout Session
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

      // Redirect user to Stripe Checkout
      toast.success("Redirecting...", { id: "stripe-checkout" });
      window.location.href = url;
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error(err.message || "An unexpected error occurred during checkout.", { id: "stripe-checkout" });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full max-w-lg">
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-normal text-charcoal border-b border-[#DCD3C6] pb-4 mb-6">
          1. Billing Information
        </h2>
        
        <div className="relative">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="*Full Name"
            className="w-full bg-transparent border-0 border-b border-[#DCD3C6] py-3 px-3 text-charcoal placeholder:text-slate-400 focus:ring-0 focus:border-[#A8895C] text-[15px] transition-colors"
          />
        </div>

        <div className="relative">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="*Email Address"
            className="w-full bg-transparent border-0 border-b border-[#DCD3C6] py-3 px-3 text-charcoal placeholder:text-slate-400 focus:ring-0 focus:border-[#A8895C] text-[15px] transition-colors"
          />
        </div>

        <div className="grid grid-cols-4 gap-4 items-end">
          <div className="col-span-1 relative">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C6D40] block mb-1">Code</label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-[#DCD3C6] py-3 px-3 text-charcoal focus:ring-0 focus:border-[#A8895C] text-[15px] transition-colors appearance-none cursor-pointer"
            >
              <option value="+61">AUS (+61)</option>
              <option value="+1">USA (+1)</option>
              <option value="+44">UK (+44)</option>
              <option value="+64">NZ (+64)</option>
              <option value="+91">IND (+91)</option>
            </select>
          </div>
          <div className="col-span-3 relative">
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9\s-]/g, ""))}
              placeholder="*Phone Number"
              className="w-full bg-transparent border-0 border-b border-[#DCD3C6] py-3 px-3 text-charcoal placeholder:text-slate-400 focus:ring-0 focus:border-[#A8895C] text-[15px] transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 mt-4">
        <div className="flex items-center justify-between border-b border-[#DCD3C6] pb-4 mb-4">
          <h2 className="font-display text-2xl font-normal text-charcoal">
            2. Payment Method
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-sm">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure Checkout
          </div>
        </div>

        <div className="bg-[#FAF8F5] border border-[#EBE3DB] p-5 rounded-sm">
          <div className="flex items-start gap-3 text-xs text-charcoal/70 leading-relaxed">
            <CreditCard className="h-4 w-4 text-[#8C6D40] shrink-0 mt-0.5" /> 
            <span>You will be securely redirected to Stripe's encrypted payment gateway to finalize your registration details.</span>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#8C6D40] text-white hover:bg-[#B8955F] uppercase tracking-[0.15em] text-[11px] font-bold py-4.5 px-12 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 rounded-sm cursor-pointer shadow-sm"
        >
          {loading ? (
            <>
              <Spinner className="h-4 w-4 text-white animate-spin" /> REDIRECTING TO PAYMENT...
            </>
          ) : (
            `PROCEED TO STRIPE PAYMENT (${currencySymbol}${price.toFixed(2)})`
          )}
        </button>
      </div>

      <p className="text-center text-xs text-charcoal/50 leading-relaxed max-w-sm mx-auto">
        By clicking proceed, you authorize SyncWellnessCo to initiate a Stripe checkout session. Your connection and transaction are fully encrypted.
      </p>
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

    // Wait until user store finishes loading initial auth state (undefined)
    if (user === undefined) return;

    if (!user) {
      // Redirect to login page if user is not logged in
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

  // Check if user already purchased the program and redirect
  useEffect(() => {
    if (program && purchasedPrograms.includes(program.id)) {
      toast.success(`You are already enrolled. Redirecting to your course...`);
      router.replace(`/programs/${program.slug || program.id}/course`);
    }
  }, [program, purchasedPrograms, router]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4 py-16">
        <Spinner className="h-8 w-8 text-[#8C6D40] animate-spin" />
        <p className="text-charcoal/60 text-sm font-semibold tracking-wider animate-pulse">
          PREPARING YOUR CHECKOUT...
        </p>
      </div>
    );
  }

  if (error || !program) {
    const isConsultationError = error === "A completed 1:1 consultation is required before purchasing this program.";

    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4 py-16 border-t border-[#EBE3DB]">
        <div className="max-w-md mx-auto text-center py-16 px-4 bg-white border border-[#EBE3DB] rounded-sm p-8 shadow-sm">
          <h2 className="font-display text-2xl font-semibold text-charcoal mb-4">Checkout Error</h2>
          <p className="text-charcoal/70 mb-8">{error || "The requested program could not be loaded."}</p>
          {isConsultationError ? (
            <button
              onClick={() => {
                if (program) {
                  router.push(`/programs/${program.slug || program.id}`);
                } else {
                  router.push("/programs");
                }
              }}
              className="bg-[#8C6D40] text-white hover:bg-[#B8955F] uppercase tracking-wider text-[11px] font-bold py-4 px-8 transition-colors rounded-sm cursor-pointer"
            >
              Book Free Consultation
            </button>
          ) : (
            <button
              onClick={() => router.push("/programs")}
              className="bg-charcoal text-white hover:bg-[#8C6D40] uppercase tracking-wider text-[11px] font-bold py-4 px-8 transition-colors rounded-sm cursor-pointer"
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
    <div className="pb-24 pt-4 sm:pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-charcoal/60 hover:text-charcoal text-xs uppercase font-bold tracking-widest mb-12 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Program
        </button>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="max-w-lg mb-10">
              <h1 className="font-display text-4xl lg:text-5xl font-normal text-charcoal mb-4">
                Enroll in {program.title}
              </h1>
              <p className="text-[15px] leading-relaxed text-charcoal/80">
                Transform your health journey with expert-led clinical guidance and custom support. Complete your details below to enroll in this course.
              </p>
            </div>

            <CheckoutForm program={program} />
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 pt-4">
            <div className="bg-[#FAF8F5] border border-[#EBE3DB] p-8 rounded-sm shadow-sm relative overflow-hidden">
              {/* Decorative top border */}
              <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-[#8C6D40] to-[#B8955F]"></div>

              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#8C6D40] mb-6">
                <Sparkles className="h-3.5 w-3.5" /> Order Summary
              </div>
              
              <h3 className="font-display text-3xl font-normal text-charcoal mb-2">{program.title}</h3>
              {program.shortDescription && (
                <p className="text-xs text-charcoal/60 leading-relaxed mb-6 italic">{program.shortDescription}</p>
              )}

              <div className="space-y-4 border-t border-b border-[#EBE3DB] py-6 my-6 text-[14px]">
                <div className="flex justify-between items-center text-charcoal/70">
                  <span>Duration</span>
                  <span className="font-medium text-charcoal">{program.duration || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center text-charcoal/70">
                  <span>Format</span>
                  <span className="font-medium text-charcoal">{program.format || "Clinical Coaching"}</span>
                </div>
                <div className="flex justify-between items-center text-charcoal/70">
                  <span>Payment Schedule</span>
                  <span className="font-medium text-charcoal">One-time payment</span>
                </div>
              </div>

              <div className="space-y-3">
                {showDiscount && (
                  <div className="flex justify-between items-center text-sm text-charcoal/50">
                    <span>Regular Price</span>
                    <span className="line-through">${listPrice.toFixed(2)}</span>
                  </div>
                )}
                {showDiscount && (
                  <div className="flex justify-between items-center text-xs font-semibold text-emerald-700">
                    <span>Special Program Discount</span>
                    <span>-${(listPrice - price).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end border-t border-[#EBE3DB] pt-4 mt-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-charcoal/60 block mb-1">Total investment</span>
                    <span className="text-3xl font-display font-medium text-[#8C6D40]">
                      ${price.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs text-charcoal/50 font-bold uppercase tracking-wider mb-1">
                    AUD
                  </span>
                </div>
              </div>

              {/* Satisfaction / Info badge */}
              <div className="mt-8 flex items-start gap-3 p-5 bg-white border border-[#EBE3DB]/60 rounded-sm">
                <CheckCircle2 className="h-5 w-5 text-[#8C6D40] shrink-0 mt-0.5" />
                <div className="text-xs text-charcoal/70 leading-relaxed">
                  <p className="font-bold text-charcoal mb-0.5">Clinical Grade Quality</p>
                  All SyncWellnessCo programs are backed by evidence-based nutrition protocols and clinical coaching standards.
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <PageShell>
      <Suspense fallback={
        <div className="min-h-screen bg-cream flex flex-col justify-center items-center gap-4 pt-32 pb-24">
          <Spinner className="h-8 w-8 text-[#8C6D40] animate-spin" />
          <p className="text-charcoal/60 text-sm font-semibold tracking-wider">LOADING CHECKOUT...</p>
        </div>
      }>
        <CheckoutPageContent />
      </Suspense>
    </PageShell>
  );
}
