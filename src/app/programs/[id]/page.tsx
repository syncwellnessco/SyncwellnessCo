import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { ProgramDetailContent } from "@/components/pages/program-detail-content";
import { getAllPrograms } from "@/lib/programs";

type PageProps = {
  params: Promise<{ id: string }>;
};


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const programs = await getAllPrograms();
  const program = programs.find((p) => p.id === id);

  return {
    title: program?.title ?? "Program",
    description: program?.description,
  };
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <PageShell>
      <ProgramDetailContent id={id} />
    </PageShell>
  );
}
