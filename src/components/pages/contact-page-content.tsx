"use client";

import { useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/data/site";

export function ContactPageContent() {
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
      
      {/* Top Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Left Column */}
          <div className="flex flex-col">
            <h1 className="font-display text-4xl lg:text-5xl font-normal text-charcoal mb-6">
              Have A Question? We're Here To Help.
            </h1>
            <p className="text-[15px] leading-relaxed text-slate-700 mb-10 max-w-lg">
              Whether you're curious about our programs, health coaching, or collaboration opportunities — we're just a message away. Reach out and a member from our team will get back to you within 24-48 business hours.
            </p>
            
            <div className="relative w-full aspect-[4/3] rounded-sm overflow-hidden shadow-sm">
              <Image 
                src="https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80" 
                alt="Typing on laptop"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="flex flex-col pt-2 lg:pt-4">
            {submitted ? (
              <div className="bg-[#FAF8F5] p-8 border border-[#EBE3DB] rounded-sm">
                <p className="text-[#A8895C] font-display text-2xl mb-2">Message Sent</p>
                <p className="text-slate-600 text-sm">Thank you for reaching out! We will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full max-w-md">
                <div className="relative">
                  <input 
                    type="text" 
                    id="name" 
                    required 
                    placeholder="*Name"
                    className="w-full bg-transparent border-0 border-b border-[#DCD3C6] py-3 px-0 text-charcoal placeholder:text-slate-400 focus:ring-0 focus:border-[#A8895C] text-[15px] transition-colors"
                  />
                </div>
                
                <div className="relative">
                  <input 
                    type="email" 
                    id="email" 
                    required 
                    placeholder="*Email"
                    className="w-full bg-transparent border-0 border-b border-[#DCD3C6] py-3 px-0 text-charcoal placeholder:text-slate-400 focus:ring-0 focus:border-[#A8895C] text-[15px] transition-colors"
                  />
                </div>
                
                <div className="relative">
                  <input 
                    type="text" 
                    id="business" 
                    placeholder="Business Name (if applicable)"
                    className="w-full bg-transparent border-0 border-b border-[#DCD3C6] py-3 px-0 text-charcoal placeholder:text-slate-400 focus:ring-0 focus:border-[#A8895C] text-[15px] transition-colors"
                  />
                </div>
                
                <div className="relative pt-4">
                  <textarea 
                    id="message" 
                    required 
                    placeholder="In this space, please describe your reason for reaching out!"
                    rows={6}
                    className="w-full bg-transparent border border-[#DCD3C6] p-4 text-charcoal placeholder:text-slate-400 focus:ring-0 focus:border-[#A8895C] text-[15px] transition-colors resize-none rounded-sm"
                  />
                </div>
                
                <div className="relative">
                  <input 
                    type="text" 
                    id="source" 
                    placeholder="How did you hear about us? Instagram, Facebook, Referral, Other"
                    className="w-full bg-transparent border-0 border-b border-[#DCD3C6] py-3 px-0 text-charcoal placeholder:text-slate-400 focus:ring-0 focus:border-[#A8895C] text-[13px] transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#B38A58] text-white hover:bg-[#967246] uppercase tracking-[0.15em] text-[11px] font-semibold py-4 px-12 transition-colors disabled:opacity-70"
                  >
                    {loading ? "SENDING..." : "SUBMIT"}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* Founder Section */}
      <section className="mt-12 lg:mt-24 bg-[#F8F6F3] py-16 lg:py-24 border-t border-[#EBE3DB]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Founder Text */}
            <div className="order-2 lg:order-1 flex flex-col">
              <h2 className="font-display text-3xl lg:text-4xl font-normal text-charcoal mb-8">
                Connect with the Founder
              </h2>
              
              <div className="space-y-6 text-[15px] text-slate-700 leading-relaxed">
                <div>
                  <h3 className="font-display text-xl text-[#B38A58] italic mb-2">Interested in working together?</h3>
                  <p>
                    The best way to get started is to fill in the form above and leave detailed information about what type of support you are looking for.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-display text-xl text-[#B38A58] italic mb-2">Interested in connecting?</h3>
                  <p>
                    I am obsessed with sharing knowledge and would love to connect with you! I am open to blog interviews, guest features, joint ventures, affiliate relationships, speaking opportunities, and collaborations.
                  </p>
                </div>
              </div>
            </div>

            {/* Founder Image */}
            <div className="order-1 lg:order-2 relative w-full aspect-square max-w-md mx-auto rounded-sm overflow-hidden shadow-sm border border-[#EBE3DB]">
              <Image 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80" 
                alt="Founder Portrait"
                fill
                className="object-cover"
              />
            </div>
            
          </div>
        </div>
      </section>

    </article>
  );
}
