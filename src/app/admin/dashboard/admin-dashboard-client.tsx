"use client";

import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { StatsCardSkeleton, TableSkeleton } from "@/components/ui/skeleton";

// Reusable elegant loader fallback skeleton structure while lazy loading tabs
const LoadingFallback = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
    </div>
    <TableSkeleton rows={4} columns={4} />
  </div>
);

// Lazy-load dashboard components using dynamic imports (improves page speed & bundle splitting)
const OverviewTab = dynamic(() => import("./overview-tab").then(m => m.OverviewTab), {
  loading: LoadingFallback,
  ssr: false
});
const PurchasesManager = dynamic(() => import("./purchases-manager").then(m => m.PurchasesManager), {
  loading: LoadingFallback,
  ssr: false
});
const EnquiriesManager = dynamic(() => import("./enquiries-manager").then(m => m.EnquiriesManager), {
  loading: LoadingFallback,
  ssr: false
});
const EbooksManager = dynamic(() => import("./ebooks-manager").then(m => m.EbooksManager), {
  loading: LoadingFallback,
  ssr: false
});
const QuizManager = dynamic(() => import("./quiz-manager").then(m => m.QuizManager), {
  loading: LoadingFallback,
  ssr: false
});
const ProgramsManager = dynamic(() => import("./programs-manager").then(m => m.ProgramsManager), {
  loading: LoadingFallback,
  ssr: false
});
const TestimonialsManager = dynamic(() => import("./testimonials-manager").then(m => m.TestimonialsManager), {
  loading: LoadingFallback,
  ssr: false
});
const ResourcesManager = dynamic(() => import("./resources-manager").then(m => m.ResourcesManager), {
  loading: LoadingFallback,
  ssr: false
});
const MediaManager = dynamic(() => import("./media-manager").then(m => m.MediaManager), {
  loading: LoadingFallback,
  ssr: false
});

export function AdminDashboardClient() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl text-charcoal mb-2">Dashboard</h1>
        <p className="text-charcoal/60">Manage your website content, programs, and user requests.</p>
      </div>

      <div className="bg-white p-6 rounded-md shadow-sm border border-[#EBE3DB] min-h-[500px]">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "purchases" && <PurchasesManager />}
        {activeTab === "enquiries" && <EnquiriesManager />}
        {activeTab === "ebooks" && <EbooksManager />}
        {activeTab === "quiz" && <QuizManager />}
        {activeTab === "programs" && <ProgramsManager />}
        {activeTab === "testimonials" && <TestimonialsManager />}
        {(activeTab === "resources" || activeTab === "blogs") && <ResourcesManager />}
        {activeTab === "media" && <MediaManager />}
      </div>
    </div>
  );
}
