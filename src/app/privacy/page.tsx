import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | SyncwellnessCo",
};

export default function PrivacyPolicyPage() {
  return (
    <article className="pt-32 pb-20 bg-cream min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <span className="mb-4 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8C6D40]">
          Legal
        </span>
        <h1 className="font-display text-4xl lg:text-5xl font-normal text-charcoal mb-10">
          Privacy Policy
        </h1>
        <div className="space-y-6 text-[15px] lg:text-[16px] leading-relaxed text-charcoal/90 bg-white p-8 lg:p-12 shadow-sm border border-[#EBE3DB] rounded-sm">
          <p>We respect your privacy and are committed to protecting your personal information.</p>
          
          <h3 className="font-display text-2xl text-charcoal mt-10 mb-4">Information we may collect includes:</h3>
          <ul className="list-disc pl-6 space-y-2 text-charcoal/80">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Information submitted through forms</li>
            <li>Website usage data</li>
          </ul>

          <h3 className="font-display text-2xl text-charcoal mt-10 mb-4">We use this information to:</h3>
          <ul className="list-disc pl-6 space-y-2 text-charcoal/80">
            <li>Respond to inquiries</li>
            <li>Provide coaching services</li>
            <li>Improve website functionality</li>
            <li>Send requested communications</li>
          </ul>

          <p className="mt-8 font-medium">We do not sell personal information to third parties.</p>
          <p>Users may request access, correction, or deletion of personal information by contacting us directly.</p>
        </div>
      </div>
    </article>
  );
}
