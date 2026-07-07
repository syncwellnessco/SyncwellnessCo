import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | SyncwellnessCo",
};

export default function RefundPolicyPage() {
  return (
    <article className="pt-[88px] lg:pt-32 pb-20 bg-cream min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <span className="mb-4 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8C6D40]">
          Legal
        </span>
        <h1 className="font-display text-4xl lg:text-5xl font-normal text-charcoal mb-10">
          Refund Policy
        </h1>
        <div className="space-y-6 text-[15px] lg:text-[16px] leading-relaxed text-charcoal/90 bg-white p-8 lg:p-12 shadow-sm border border-[#EBE3DB] rounded-sm">
          <p className="text-xl text-charcoal font-medium">Payments are non-refundable after services have commenced.</p>
          <p className="text-charcoal/80">
            If you have any questions or concerns regarding our policy, please feel free to reach out to us before making a commitment to our coaching programs.
          </p>
        </div>
      </div>
    </article>
  );
}
