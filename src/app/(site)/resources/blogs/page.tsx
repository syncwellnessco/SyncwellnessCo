import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { BlogPageContent } from "@/components/pages/blog-page-content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description: "Wellness insights on hormones, gut health, and sustainable nutrition.",
};

export default function BlogPage() {
  return (
    <PageShell>
      <BlogPageContent />
    </PageShell>
  );
}
