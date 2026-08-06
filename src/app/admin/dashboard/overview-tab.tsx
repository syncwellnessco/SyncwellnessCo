"use client";

import { useState, useEffect } from "react";
import { StatsCardSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { Users, BookOpen, MessageSquare, Star, ArrowRight, DollarSign } from "lucide-react";
import Link from "next/link";

export function OverviewTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/summary");
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard summary");
        }
        const summary = await res.json();
        setData(summary);
      } catch (e) {
        console.error("Failed to load overview data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => <StatsCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardSkeleton hasImage={false} className="h-64" />
          <CardSkeleton hasImage={false} className="h-64" />
          <CardSkeleton hasImage={false} className="h-64" />
        </div>
      </div>
    );
  }

  const enquiriesCount = data?.counts?.enquiries || 0;
  const ebooksCount = data?.counts?.ebooks || 0;
  const activeProgramsCount = data?.counts?.programs || 0;
  const pendingReviewsCount = data?.counts?.reviews || 0;
  const totalRevenue = data?.counts?.revenue || 0;

  const purchases = data?.recent?.purchases || [];
  const enquiries = data?.recent?.enquiries || [];
  const ebooks = data?.recent?.ebooks || [];

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Revenue" count={`$${totalRevenue.toFixed(0)}`} icon={<DollarSign className="h-5 w-5" />} color="bg-emerald-50 text-emerald-700" />
        <StatCard title="New Enquiries" count={enquiriesCount} icon={<MessageSquare className="h-5 w-5" />} color="bg-blue-50 text-blue-700" />
        <StatCard title="Pending Ebooks" count={ebooksCount} icon={<BookOpen className="h-5 w-5" />} color="bg-purple-50 text-purple-700" />
        <StatCard title="Active Programs" count={activeProgramsCount} icon={<Users className="h-5 w-5" />} color="bg-green-50 text-green-700" />
        <StatCard title="Pending Reviews" count={pendingReviewsCount} icon={<Star className="h-5 w-5" />} color="bg-yellow-50 text-yellow-700" />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Purchases */}
        <div className="bg-white border border-[#EBE3DB] rounded-md shadow-sm flex flex-col h-full">
          <div className="p-4 border-b border-[#EBE3DB] flex justify-between items-center bg-[#FAF8F5]">
            <h3 className="font-semibold text-charcoal text-xs uppercase tracking-wider">Recent Purchases</h3>
            <Link href="?tab=purchases" className="text-xs text-[#8C6D40] hover:underline flex items-center gap-1 font-bold uppercase tracking-wider text-[10px]">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-0 flex-1">
            {purchases.length === 0 ? (
              <div className="p-6 text-center text-xs text-charcoal/40 italic">No purchases yet.</div>
            ) : (
              <div className="divide-y divide-[#EBE3DB]/60">
                {purchases.map((p: any) => (
                  <div key={p.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <p className="font-semibold text-xs text-charcoal truncate">{p.name || "Guest Checkout"}</p>
                    <p className="text-[11px] text-charcoal/60 truncate mt-1">Program: <span className="font-mono uppercase">{p.program_id}</span></p>
                    <div className="flex justify-between items-center mt-2 text-[10px]">
                      <span className="text-[#8C6D40] font-bold">${(p.amount / 100).toFixed(2)}</span>
                      <span className="text-charcoal/40">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="bg-white border border-[#EBE3DB] rounded-md shadow-sm flex flex-col h-full">
          <div className="p-4 border-b border-[#EBE3DB] flex justify-between items-center bg-[#FAF8F5]">
            <h3 className="font-semibold text-charcoal text-xs uppercase tracking-wider">Recent Enquiries</h3>
            <Link href="?tab=enquiries" className="text-xs text-[#8C6D40] hover:underline flex items-center gap-1 font-bold uppercase tracking-wider text-[10px]">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-0 flex-1">
            {enquiries.length === 0 ? (
              <div className="p-6 text-center text-xs text-charcoal/40 italic">No new enquiries.</div>
            ) : (
              <div className="divide-y divide-[#EBE3DB]/60">
                {enquiries.map((enq: any) => (
                  <div key={enq.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <p className="font-semibold text-xs text-charcoal truncate">{enq.name}</p>
                    <p className="text-[11px] text-charcoal/60 truncate mt-1">{enq.subject || "No subject"}</p>
                    <p className="text-[10px] text-charcoal/40 mt-2">{new Date(enq.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Ebook Requests */}
        <div className="bg-white border border-[#EBE3DB] rounded-md shadow-sm flex flex-col h-full">
          <div className="p-4 border-b border-[#EBE3DB] flex justify-between items-center bg-[#FAF8F5]">
            <h3 className="font-semibold text-charcoal text-xs uppercase tracking-wider">Ebook Requests</h3>
            <Link href="?tab=ebooks" className="text-xs text-[#8C6D40] hover:underline flex items-center gap-1 font-bold uppercase tracking-wider text-[10px]">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-0 flex-1">
            {ebooks.length === 0 ? (
              <div className="p-6 text-center text-xs text-charcoal/40 italic">No pending requests.</div>
            ) : (
              <div className="divide-y divide-[#EBE3DB]/60">
                {ebooks.map((req: any) => (
                  <div key={req.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <p className="font-semibold text-xs text-charcoal truncate">{req.email}</p>
                    <p className="text-[11px] text-charcoal/60 truncate mt-1">Guide: {req.ebookName}</p>
                    <p className="text-[10px] text-charcoal/40 mt-2">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, count, icon, color }: { title: string, count: number | string, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-[#FAF8F5] p-5 rounded-sm border border-[#EBE3DB] shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-[9px] font-bold uppercase tracking-wider text-charcoal/50">{title}</h4>
        <p className="text-2xl font-display text-charcoal font-semibold mt-1">{count}</p>
      </div>
    </div>
  );
}
