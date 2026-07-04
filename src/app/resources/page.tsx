import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { ResourcesPageContent } from "@/components/pages/resources-page-content";

export const metadata: Metadata = {
  title: "Resources",
  description: "Free wellness resources, eBooks, and guides from SyncWellnessCo.",
};

export default function ResourcesPage() {
  return (
    <PageShell>
      <ResourcesPageContent />
    </PageShell>
  );
}
