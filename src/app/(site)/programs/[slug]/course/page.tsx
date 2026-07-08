import { PageShell } from "@/components/layout/page-shell";

type CoursePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  return (
    <PageShell>
      <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 flex flex-col items-center justify-center text-center">
        <h1 className="font-display text-4xl md:text-5xl text-charcoal mb-6">Course Content Coming Soon</h1>
        <p className="text-lg text-charcoal/80 max-w-2xl">
          We are currently setting up the course modules for this program. Check back later to access your materials!
        </p>
      </div>
    </PageShell>
  );
}
