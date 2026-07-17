import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { AboutPageContent } from "@/components/pages/about-page-content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Neha Arora — Certified Women's Health Coach helping women balance hormones and achieve sustainable wellness.",
};

export default function AboutPage() {
  return (
    <PageShell className="bg-[#FAF8F5]">
      <AboutPageContent />
    </PageShell>
  );
}
