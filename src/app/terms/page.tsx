import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | SyncwellnessCo",
};

export default function TermsPage() {
  return (
    <article className="pt-[88px] lg:pt-32 pb-20 bg-cream min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <span className="mb-4 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8C6D40]">
          Legal
        </span>
        <h1 className="font-display text-4xl lg:text-5xl font-normal text-charcoal mb-10">
          Terms & Conditions
        </h1>
        <div className="space-y-6 text-[15px] lg:text-[16px] leading-relaxed text-charcoal/90 bg-white p-8 lg:p-12 shadow-sm border border-[#EBE3DB] rounded-sm">
          <p>By using this website, you agree to these terms.</p>
          
          <h3 className="font-display text-2xl text-charcoal mt-10 mb-4">Users agree to:</h3>
          <ul className="list-disc pl-6 space-y-2 text-charcoal/80">
            <li>Provide accurate information</li>
            <li>Use the website lawfully</li>
            <li>Respect intellectual property rights</li>
          </ul>

          <p className="mt-10">We reserve the right to modify content, services, and pricing without notice.</p>
          <p>All content on this website is owned by the business unless otherwise stated.</p>
          <p className="font-medium text-[#8C6D40]">Unauthorized copying or distribution is prohibited.</p>
        </div>
      </div>
    </article>
  );
}
