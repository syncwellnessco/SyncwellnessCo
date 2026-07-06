import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { ProgramDetailContent } from "@/components/pages/program-detail-content";
import { getProgramBySlug } from "@/lib/programs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);

  return {
    title: program?.title ?? "Program",
    description: program?.description,
  };
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <PageShell>
      <ProgramDetailContent slug={slug} />
    </PageShell>
  );
}
