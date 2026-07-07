"use client";

import { useState } from "react";
import { BookOpen, Download } from "lucide-react";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { useUserStore } from "@/store/user-store";
import { useRouter } from "next/navigation";

export function ResourcesPageContent() {
  const [submitted, setSubmitted] = useState(false);
  const [duplicateError, setDuplicateError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please log in or sign up to download the eBook.");
      router.push("/login?redirect=/resources");
      return;
    }

    setLoading(true);
    
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const phoneNumber = (form.elements.namedItem('phoneNumber') as HTMLInputElement).value;
    const countryCode = (form.elements.namedItem('countryCode') as HTMLSelectElement).value;
    
    try {
      const res = await fetch("/api/ebook-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ebookName: "Hormone Balance & Burn", name, phoneNumber, countryCode })
      });
      if (res.ok) {
        setSubmitted(true);
        toast.success("Ebook request successful!");
      } else if (res.status === 409) {
        setDuplicateError(true);
        toast.error("Duplicate request detected.");
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "There was an error processing your request.");
      }
    } catch (err) {
      toast.error("There was an error connecting to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="pt-20 pb-16 bg-cream min-h-screen">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 lg:pb-20">
        
        {/* Top Header */}
        <div className="max-w-4xl mx-auto text-center mb-16 lg:mb-24">
          <span className="mb-6 inline-block text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8C6D40]">
            Free Guide
          </span>
          <h1 className="font-display text-4xl lg:text-5xl xl:text-6xl font-normal text-charcoal mb-6 leading-tight">
            This Ebook Reveals The Secret To <br className="hidden lg:block" />
            <span className="italic text-[#8C6D40]">Reduce Belly Fat & Cravings</span>
          </h1>
          <p className="text-sm lg:text-base uppercase tracking-[0.25em] font-semibold mb-6 text-charcoal/60">
            In Just 4 Weeks (For Women 35+)
          </p>
          <p className="text-[16px] lg:text-[18px] leading-relaxed text-charcoal max-w-2xl mx-auto">
            A simple, protein-based reset that helps balance hormones, control hunger, and kickstart fat loss without dieting or intense workouts.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
          
          {/* Left Column - Large Image */}
          <div className="lg:col-span-5 flex justify-center lg:sticky lg:top-24">
            <div className="relative w-full max-w-sm lg:max-w-none flex items-center justify-center">
              <div className="absolute inset-0 bg-[#8C6D40]/10 transform translate-x-4 translate-y-4 rounded-sm"></div>
              <img 
                src="https://res.cloudinary.com/daw1tscqr/image/upload/e_trim/v1783333186/NehaEbookMockup_3pjf7_1280_ip08ks.webp" 
                alt="Hormone Balance and Burn Guide" 
                className="relative w-full h-auto object-cover drop-shadow-2xl z-10" 
              />
            </div>
          </div>

          {/* Right Column - Details and Form Card */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-white border border-[#EBE3DB] shadow-lg p-8 lg:p-12 rounded-sm relative overflow-hidden">
              {/* Decorative top border */}
              <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-[#8C6D40] to-[#B8955F]"></div>

              <h3 className="font-display text-3xl lg:text-4xl font-medium text-charcoal mb-2 mt-2">
                Hormone Balance & Burn
              </h3>
              <p className="text-[#8C6D40] text-[11px] font-bold uppercase tracking-[0.2em] mb-10">
                This Changes Everything
              </p>

              <ul className="space-y-5 text-[15px] lg:text-[16px] text-charcoal mb-12">
                <li className="flex items-start gap-4">
                  <span className="text-[#8C6D40] font-bold text-xl leading-none mt-0.5">✓</span>
                  <span className="leading-relaxed">Reduce your sugar cravings within the first 3 days</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[#8C6D40] font-bold text-xl leading-none mt-0.5">✓</span>
                  <span className="leading-relaxed">Flatten stubborn belly bloat by fixing your eating pattern</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[#8C6D40] font-bold text-xl leading-none mt-0.5">✓</span>
                  <span className="leading-relaxed">Follow a simple daily structure designed for busy women (no guesswork)</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[#8C6D40] font-bold text-xl leading-none mt-0.5">✓</span>
                  <span className="leading-relaxed">Know exactly what to eat to support hormones and fat loss</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[#8C6D40] font-bold text-xl leading-none mt-0.5">✓</span>
                  <span className="leading-relaxed">Stop energy crashes and feel more stable throughout the day</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[#8C6D40] font-bold text-xl leading-none mt-0.5">✓</span>
                  <span className="leading-relaxed">Eat in a way that works with your body, not against it</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[#8C6D40] font-bold text-xl leading-none mt-0.5">✓</span>
                  <span className="leading-relaxed">Build a routine you can actually stick to without dieting</span>
                </li>
              </ul>

              <div className="border-t border-[#EBE3DB] pt-10">
                <h4 className="font-display text-2xl font-medium text-charcoal mb-8 text-center">
                  Download Your Copy For Free
                </h4>
                
                {submitted ? (
                  <div className="bg-[#FAF8F5] p-8 border border-[#EBE3DB] rounded-sm text-center">
                    <p className="text-[#8C6D40] font-display text-2xl mb-2">Check your inbox!</p>
                    <p className="text-charcoal text-sm mb-3">Your free eBook download link is on its way.</p>
                    <p className="text-charcoal/70 text-xs italic">
                      (Note: Please check your spam or promotions folder if you don't receive it within a few minutes!)
                    </p>
                  </div>
                ) : duplicateError ? (
                  <div className="bg-[#FAF8F5] p-8 border border-[#EBE3DB] rounded-sm text-center">
                    <p className="text-[#8C6D40] font-display text-2xl mb-2">Check your inbox!</p>
                    <p className="text-charcoal text-sm mb-3">Sorry, we have already sent you the eBook. Please contact support if you didn't receive it.</p>
                    <p className="text-charcoal/70 text-xs italic">
                      (Note: Don't forget to check your spam or promotions folder!)
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="relative">
                        <input 
                          type="text" 
                          id="name" 
                          name="name"
                          required 
                          placeholder="*First Name"
                          className="w-full bg-transparent border-0 border-b border-[#DCD3C6] py-3 px-0 text-charcoal placeholder:text-slate-400 focus:ring-0 focus:border-[#A8895C] text-[15px] transition-colors"
                        />
                      </div>
                      
                      <div className="relative">
                        <input 
                          type="email" 
                          id="email" 
                          name="email"
                          required 
                          placeholder="*Email Address"
                          className="w-full bg-transparent border-0 border-b border-[#DCD3C6] py-3 px-0 text-charcoal placeholder:text-slate-400 focus:ring-0 focus:border-[#A8895C] text-[15px] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="relative flex items-end gap-4">
                      <div className="w-24 shrink-0">
                        <select 
                          id="countryCode" 
                          name="countryCode"
                          className="w-full bg-transparent border-0 border-b border-[#DCD3C6] py-3 px-0 text-charcoal focus:ring-0 focus:border-[#A8895C] text-[15px] transition-colors appearance-none cursor-pointer"
                          defaultValue="+61"
                        >
                          <option value="+61">AU (+61)</option>
                          <option value="+91">IN (+91)</option>
                          <option value="+1">US (+1)</option>
                          <option value="+44">UK (+44)</option>
                          <option value="+971">UAE (+971)</option>
                          <option value="+1">CA (+1)</option>
                          <option value="+65">SG (+65)</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <input 
                          type="tel" 
                          id="phoneNumber" 
                          name="phoneNumber"
                          required 
                          placeholder="*Phone Number"
                          className="w-full bg-transparent border-0 border-b border-[#DCD3C6] py-3 px-0 text-charcoal placeholder:text-slate-400 focus:ring-0 focus:border-[#A8895C] text-[15px] transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-6">
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-charcoal text-white hover:bg-[#8C6D40] uppercase tracking-[0.15em] text-[11px] md:text-[12px] font-medium py-5 px-12 transition-colors duration-300 rounded-sm disabled:opacity-70 w-full"
                      >
                        {loading ? <Spinner className="h-4 w-4" /> : (
                          <>
                            <Download className="h-4 w-4" />
                            GET ACCESS NOW FOR FREE
                          </>
                        )}
                      </button>
                      <p className="text-[11px] text-charcoal/60 mt-4 leading-relaxed text-center">
                        🔒 By providing us with your information you are consenting to the collection and use of your information in accordance with our Terms of Service and Privacy Policy.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>
    </article>
  );
}
