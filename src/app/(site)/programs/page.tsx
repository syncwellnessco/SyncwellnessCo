import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { ProgramsPageContent } from "@/components/pages/programs-page-content";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Explore SyncWellnessCo signature programs — Hormone Harmony, Gut Cleanse, and Metabolic Fat Loss coaching.",
};

export default function ProgramsPage() {
  return (
    <PageShell>
      <ProgramsPageContent />
    </PageShell>
  );
}
