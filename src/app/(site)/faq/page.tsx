import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { FAQPageContent } from "@/components/pages/faq-page-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about SyncwellnessCo coaching programs.",
};

export default function FAQPage() {
  return (
    <PageShell>
      <FAQPageContent />
    </PageShell>
  );
}
