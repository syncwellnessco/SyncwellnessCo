"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProgramsManager } from "./programs-manager";
import { EnquiriesManager } from "./enquiries-manager";
import { EbooksManager } from "./ebooks-manager";
import { ReviewsManager } from "./reviews-manager";
import { VideoTestimonialsManager } from "./video-testimonials-manager";
import { OverviewTab } from "./overview-tab";

export function AdminDashboardClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "overview";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl text-charcoal mb-2">Dashboard</h1>
        <p className="text-charcoal/60">Manage your website content, programs, and user requests.</p>
      </div>

      <div className="bg-white p-6 rounded-md shadow-sm border border-[#EBE3DB] min-h-[500px]">
        {activeTab === "overview" && <OverviewTab />}

        {activeTab === "enquiries" && <EnquiriesManager />}
        {activeTab === "ebooks" && <EbooksManager />}
        {activeTab === "programs" && <ProgramsManager />}
        {activeTab === "reviews" && <ReviewsManager />}
        {activeTab === "videos" && <VideoTestimonialsManager />}
      </div>
    </div>
  );
}
