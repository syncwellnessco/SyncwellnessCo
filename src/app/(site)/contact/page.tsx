import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { ContactPageContent } from "@/components/pages/contact-page-content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with SyncWellnessCo via social media and contact form.",
};

export default function ContactPage() {
  return (
    <PageShell>
      <ContactPageContent />
    </PageShell>
  );
}
