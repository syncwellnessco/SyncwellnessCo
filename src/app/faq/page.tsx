import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { FAQPageContent } from "@/components/pages/faq-page-content";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about SyncWellnessCo coaching programs.",
};

export default function FAQPage() {
  return (
    <PageShell>
      <FAQPageContent />
    </PageShell>
  );
}
