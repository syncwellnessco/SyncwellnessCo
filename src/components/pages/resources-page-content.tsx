"use client";

import { useState } from "react";
import { BookOpen, Download } from "lucide-react";

export function ResourcesPageContent() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <article className="pt-24 pb-16 bg-cream min-h-screen">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Left Column - Ebook Info & Placeholder */}
          <div className="flex flex-col">
            <h1 className="font-display text-4xl lg:text-5xl font-normal text-charcoal mb-6">
              Free Hormone Balance eBook
            </h1>
            <p className="text-[15px] leading-relaxed text-charcoal mb-10 max-w-lg">
              Discover the 7 foundational principles for balancing hormones naturally — without restrictive diets or overwhelming protocols.
            </p>
            
            <div className="relative w-full aspect-[3/4] max-w-sm rounded-sm overflow-hidden shadow-sm border border-[#EBE3DB] bg-[#FAF8F5] flex flex-col items-center justify-center p-8">
              <BookOpen className="h-12 w-12 text-[#B8955F] mb-6" />
              <h3 className="font-display text-2xl font-medium text-center text-charcoal mb-6">
                The Hormone Balance Guide
              </h3>
              <ul className="space-y-3 text-sm text-charcoal w-full">
                <li className="border-b border-[#EBE3DB] pb-3 text-center tracking-wide">• Cycle-synced nutrition basics</li>
                <li className="border-b border-[#EBE3DB] pb-3 text-center tracking-wide">• Gut-hormone connection</li>
                <li className="border-b border-[#EBE3DB] pb-3 text-center tracking-wide">• Stress & sleep optimization</li>
                <li className="border-b border-[#EBE3DB] pb-3 text-center tracking-wide">• Supplement starter guide</li>
                <li className="text-center tracking-wide pb-1">• 7-day meal plan template</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="flex flex-col pt-2 lg:pt-4">
            <h2 className="font-display text-2xl font-normal text-charcoal mb-8">
              Download Your Copy
            </h2>
            
            {submitted ? (
              <div className="bg-[#FAF8F5] p-8 border border-[#EBE3DB] rounded-sm">
                <p className="text-[#B8955F] font-display text-2xl mb-2">Check your inbox!</p>
                <p className="text-charcoal text-sm">Your free eBook download link is on its way.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full max-w-md">
                <div className="relative">
                  <input 
                    type="text" 
                    id="name" 
                    required 
                    placeholder="*First Name"
                    className="w-full bg-transparent border-0 border-b border-[#DCD3C6] py-3 px-0 text-charcoal placeholder:text-slate-400 focus:ring-0 focus:border-[#A8895C] text-[15px] transition-colors"
                  />
                </div>
                
                <div className="relative">
                  <input 
                    type="email" 
                    id="email" 
                    required 
                    placeholder="*Email Address"
                    className="w-full bg-transparent border-0 border-b border-[#DCD3C6] py-3 px-0 text-charcoal placeholder:text-slate-400 focus:ring-0 focus:border-[#A8895C] text-[15px] transition-colors"
                  />
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-[#B8955F] text-white hover:bg-[#967246] uppercase tracking-[0.15em] text-[11px] font-semibold py-4 px-12 transition-colors disabled:opacity-70 w-full sm:w-auto"
                  >
                    {loading ? "SENDING..." : (
                      <>
                        <Download className="h-4 w-4" />
                        DOWNLOAD EBOOK
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>
    </article>
  );
}
