"use client";

import { useState, useEffect } from "react";
import { EbookRequest } from "@/types/dashboard";
import { Mail, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { TableSkeleton } from "@/components/ui/skeleton";

export function EbooksManager() {
  const [requests, setRequests] = useState<EbookRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/ebook-requests");
      const data = await res.json();
      if (Array.isArray(data)) setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const markAsSent = async (id: string) => {
    try {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'sent' } : r));
      await fetch(`/api/ebook-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sent' })
      });
      toast.success("Ebook marked as sent");
    } catch (e) {
      toast.error("Failed to mark as sent");
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-display text-charcoal mb-6">Ebook Requests</h2>
        <TableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-display text-charcoal mb-6">Ebook Requests</h2>
      
      <div className="overflow-x-auto border border-[#EBE3DB] rounded-md shadow-sm">
        <table className="w-full text-left text-sm text-charcoal">
          <thead className="bg-[#FAF8F5] text-charcoal/60 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-md">Contact Info</th>
              <th className="px-4 py-3 font-semibold">Ebook Requested</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right rounded-tr-md">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE3DB]">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-charcoal/50 bg-white">
                  No ebook requests found.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-[#FAF8F5]/50 transition-colors bg-white">
                  <td className="px-4 py-4 font-medium">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-3 w-3 text-charcoal/40" /> 
                      <span>{req.email}</span>
                    </div>
                    {(req.phone_number) && (
                      <div className="flex items-center gap-2 text-xs text-charcoal/60">
                        <span className="font-mono">{req.country_code || '+61'} {req.phone_number}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Download className="h-3 w-3 text-[#8C6D40]" />
                      {req.ebookName || "General Guide"}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-charcoal/60">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] px-2 py-1 uppercase tracking-wider font-bold rounded-sm ${
                      req.status === 'pending' ? 'bg-[#8C6D40]/10 text-[#8C6D40]' : 
                      req.status === 'sent' ? 'bg-green-100 text-green-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {req.status.startsWith('failed') ? 'FAILED' : req.status}
                    </span>
                    {req.status.startsWith('failed') && (
                      <div className="mt-1.5 text-[10px] text-red-600/80 max-w-[180px] leading-tight" title={req.status}>
                        Reason: {req.status.replace('failed: ', '')}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {req.status !== 'sent' && (
                      <Button 
                        onClick={() => markAsSent(req.id)}
                        variant="outline" 
                        size="sm" 
                        className="text-[10px] h-7 px-3 uppercase tracking-wider"
                      >
                        Mark Sent
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
