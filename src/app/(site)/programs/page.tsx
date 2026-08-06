import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { ProgramsPageContent } from "@/components/pages/programs-page-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Explore SyncwellnessCo signature programs: Hormone Harmony, Gut Cleanse, and Metabolic Fat Loss coaching.",
};

export default function ProgramsPage() {
  return (
    <PageShell>
      <ProgramsPageContent />
    </PageShell>
  );
}

