import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | SyncwellnessCo",
};

export default function DisclaimerPage() {
  return (
    <article className="pt-32 pb-20 bg-cream min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <span className="mb-4 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8C6D40]">
          Legal
        </span>
        <h1 className="font-display text-4xl lg:text-5xl font-normal text-charcoal mb-10">
          Disclaimer
        </h1>
        <div className="space-y-6 text-[15px] lg:text-[16px] leading-relaxed text-charcoal/90 bg-white p-8 lg:p-12 shadow-sm border border-[#EBE3DB] rounded-sm">
          <p>The information provided on this website is for educational and informational purposes only.</p>
          
          <div className="bg-cream p-6 border-l-4 border-[#8C6D40] my-8">
            <p className="font-medium text-charcoal italic">
              The coaching services offered do not replace medical advice, diagnosis, or treatment. Clients should consult qualified healthcare professionals regarding medical concerns.
            </p>
          </div>

          <ul className="list-disc pl-6 space-y-4 text-charcoal/80">
            <li>Results vary from person to person and cannot be guaranteed.</li>
            <li>Participation in coaching programs is voluntary and undertaken at the client's own discretion.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
