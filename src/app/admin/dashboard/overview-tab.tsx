"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, BookOpen, MessageSquare, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function OverviewTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enquiriesRes, ebooksRes, programsRes, reviewsRes] = await Promise.all([
          fetch("/api/enquiries").then(res => res.json()),
          fetch("/api/ebook-requests").then(res => res.json()),
          fetch("/api/programs").then(res => res.json()),
          fetch("/api/reviews").then(res => res.json())
        ]);

        const enquiries = Array.isArray(enquiriesRes) ? enquiriesRes : [];
        const ebooks = Array.isArray(ebooksRes) ? ebooksRes : [];
        const programs = Array.isArray(programsRes) ? programsRes : [];
        const reviews = Array.isArray(reviewsRes) ? reviewsRes : [];

        setData({ enquiries, ebooks, programs, reviews });
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const newEnquiries = data?.enquiries.filter((e: any) => e.status === 'new') || [];
  const pendingEbooks = data?.ebooks.filter((e: any) => e.status === 'pending') || [];
  const activePrograms = data?.programs.filter((p: any) => p.status === 'published') || [];
  const pendingReviews = data?.reviews.filter((r: any) => r.status === 'pending') || [];

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="New Enquiries" count={newEnquiries.length} icon={<MessageSquare className="h-5 w-5" />} color="bg-blue-50 text-blue-700" />
        <StatCard title="Pending Ebooks" count={pendingEbooks.length} icon={<BookOpen className="h-5 w-5" />} color="bg-purple-50 text-purple-700" />
        <StatCard title="Active Programs" count={activePrograms.length} icon={<Users className="h-5 w-5" />} color="bg-green-50 text-green-700" />
        <StatCard title="Pending Reviews" count={pendingReviews.length} icon={<Star className="h-5 w-5" />} color="bg-yellow-50 text-yellow-700" />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Enquiries */}
        <div className="bg-white border border-[#EBE3DB] rounded-md shadow-sm flex flex-col h-full">
          <div className="p-4 border-b border-[#EBE3DB] flex justify-between items-center bg-[#FAF8F5]">
            <h3 className="font-semibold text-charcoal">Recent Enquiries</h3>
            <Link href="?tab=enquiries" className="text-xs text-[#8C6D40] hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-0 flex-1">
            {newEnquiries.length === 0 ? (
              <div className="p-6 text-center text-sm text-charcoal/50">No new enquiries.</div>
            ) : (
              <div className="divide-y divide-[#EBE3DB]">
                {newEnquiries.slice(0, 4).map((enq: any) => (
                  <div key={enq.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <p className="font-medium text-sm text-charcoal truncate">{enq.name}</p>
                    <p className="text-xs text-charcoal/60 truncate mt-1">{enq.subject || "No subject"}</p>
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
            <h3 className="font-semibold text-charcoal">Ebook Requests</h3>
            <Link href="?tab=ebooks" className="text-xs text-[#8C6D40] hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-0 flex-1">
            {pendingEbooks.length === 0 ? (
              <div className="p-6 text-center text-sm text-charcoal/50">No pending requests.</div>
            ) : (
              <div className="divide-y divide-[#EBE3DB]">
                {pendingEbooks.slice(0, 4).map((req: any) => (
                  <div key={req.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <p className="font-medium text-sm text-charcoal truncate">{req.email}</p>
                    <p className="text-xs text-charcoal/60 truncate mt-1">Requested: {req.ebookName || "General Guide"}</p>
                    <p className="text-[10px] text-charcoal/40 mt-2">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white border border-[#EBE3DB] rounded-md shadow-sm flex flex-col h-full">
          <div className="p-4 border-b border-[#EBE3DB] flex justify-between items-center bg-[#FAF8F5]">
            <h3 className="font-semibold text-charcoal">Pending Reviews</h3>
            <Link href="?tab=reviews" className="text-xs text-[#8C6D40] hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-0 flex-1">
            {pendingReviews.length === 0 ? (
              <div className="p-6 text-center text-sm text-charcoal/50">No reviews pending approval.</div>
            ) : (
              <div className="divide-y divide-[#EBE3DB]">
                {pendingReviews.slice(0, 4).map((rev: any) => (
                  <div key={rev.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm text-charcoal truncate pr-2">{rev.name}</p>
                      <div className="flex text-gold">
                        {[...Array(rev.rating || 5)].map((_, i) => <Star key={i} className="h-2 w-2 fill-current" />)}
                      </div>
                    </div>
                    <p className="text-xs text-charcoal/60 line-clamp-2 italic">"{rev.testimonial}"</p>
                    <p className="text-[10px] text-charcoal/40 mt-2">{new Date(rev.created_at).toLocaleDateString()}</p>
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

function StatCard({ title, count, icon, color }: { title: string, count: number, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-5 rounded-md border border-[#EBE3DB] shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">{title}</h4>
        <p className="text-3xl font-display text-charcoal leading-none mt-1">{count}</p>
      </div>
    </div>
  );
}
