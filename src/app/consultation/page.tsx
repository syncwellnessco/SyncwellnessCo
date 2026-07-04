import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { ConsultationPageContent } from "@/components/pages/consultation-page-content";

export const metadata: Metadata = {
  title: "Book a Consultation",
  description: "Book your free discovery call with SyncWellnessCo.",
};

export default function ConsultationPage() {
  return (
    <PageShell>
      <ConsultationPageContent />
    </PageShell>
  );
}
