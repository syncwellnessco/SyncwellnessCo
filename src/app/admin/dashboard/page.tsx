import { Suspense } from "react";
import { AdminDashboardClient } from "./admin-dashboard-client";
import { StatsCardSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
        <TableSkeleton rows={4} columns={4} />
      </div>
    }>
      <AdminDashboardClient />
    </Suspense>
  );
}
