"use client";

import { useState, useEffect } from "react";
import { StatsCardSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { Users, BookOpen, MessageSquare, Star, ArrowRight, DollarSign, HardDrive, AlertTriangle } from "lucide-react";
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
        <CardSkeleton hasImage={false} className="h-24" />
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

  // Media Storage metrics & 80% capacity alert calculation
  const mediaStorage = data?.mediaStorage;
  const totalMediaBytes = mediaStorage?.totalBytes || 0;
  const totalMediaSize = mediaStorage?.formattedTotalSize || "0 B";
  const images = mediaStorage?.images || { count: 0, bytes: 0, formattedSize: "0 B" };
  const videos = mediaStorage?.videos || { count: 0, bytes: 0, formattedSize: "0 B" };

  const FREE_TIER_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB
  const quotaPercent = Math.min(100, Math.max(0, (totalMediaBytes / FREE_TIER_BYTES) * 100));
  const isStorageHigh = quotaPercent >= 80;

  const imageWidth = totalMediaBytes > 0 ? (images.bytes / totalMediaBytes) * 100 : 0;
  const videoWidth = totalMediaBytes > 0 ? (videos.bytes / totalMediaBytes) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* 80% Storage Quota Alert Banner */}
      {isStorageHigh && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Storage Alert: {quotaPercent.toFixed(1)}% Quota Filled
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                You have consumed {totalMediaSize} of your 10 GB Cloudflare R2 standard storage quota.
              </p>
            </div>
          </div>
          <Link
            href="?tab=media"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors self-start sm:self-auto whitespace-nowrap"
          >
            Manage Storage
          </Link>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Revenue" count={`$${totalRevenue.toFixed(0)}`} icon={<DollarSign className="h-5 w-5" />} color="bg-emerald-50 text-emerald-700" />
        <StatCard title="New Enquiries" count={enquiriesCount} icon={<MessageSquare className="h-5 w-5" />} color="bg-blue-50 text-blue-700" />
        <StatCard title="Pending Ebooks" count={ebooksCount} icon={<BookOpen className="h-5 w-5" />} color="bg-purple-50 text-purple-700" />
        <StatCard title="Active Programs" count={activeProgramsCount} icon={<Users className="h-5 w-5" />} color="bg-green-50 text-green-700" />
        <StatCard title="Pending Reviews" count={pendingReviewsCount} icon={<Star className="h-5 w-5" />} color="bg-yellow-50 text-yellow-700" />
      </div>

      {/* Minimal & Premium Storage Glimpse */}
      <div className="bg-[#FAF8F5] border border-[#EBE3DB] rounded-md p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#8C6D40]/10 text-[#8C6D40] rounded-sm">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/50">
                Media Storage Glimpse
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                <span className="w-1 h-1 rounded-full bg-emerald-500"></span> R2
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-display font-semibold text-charcoal">
                {totalMediaSize}
              </span>
              <span className="text-xs text-charcoal/60">
                used ({quotaPercent.toFixed(1)}% of 10 GB)
              </span>
            </div>
          </div>
        </div>

        {/* Proportional Mini Bar */}
        <div className="flex-1 max-w-md w-full">
          <div className="w-full bg-[#EBE3DB] rounded-full h-2 overflow-hidden flex shadow-inner">
            {totalMediaBytes === 0 ? (
              <div className="w-full h-full bg-[#EBE3DB]/60" />
            ) : (
              <>
                {imageWidth > 0 && (
                  <div
                    style={{ width: `${imageWidth}%` }}
                    className="bg-amber-600 h-full"
                    title={`Images: ${images.formattedSize}`}
                  />
                )}
                {videoWidth > 0 && (
                  <div
                    style={{ width: `${videoWidth}%` }}
                    className="bg-indigo-600 h-full"
                    title={`Videos: ${videos.formattedSize}`}
                  />
                )}
              </>
            )}
          </div>
          <div className="flex justify-between items-center text-[10px] text-charcoal/60 mt-1.5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              <strong className="text-charcoal">{images.count}</strong> images ({images.formattedSize})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              <strong className="text-charcoal">{videos.count}</strong> videos ({videos.formattedSize})
            </span>
          </div>
        </div>

        {/* Link to Full Tab */}
        <Link
          href="?tab=media"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-[#EBE3DB] hover:border-[#8C6D40] text-charcoal hover:text-[#8C6D40] text-xs font-semibold uppercase tracking-wider rounded-sm shadow-2xs transition-colors self-start md:self-auto whitespace-nowrap"
        >
          <span>View Details</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
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
