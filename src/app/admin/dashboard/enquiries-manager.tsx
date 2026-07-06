"use client";

import { useState, useEffect } from "react";
import { ContactEnquiry } from "@/types/dashboard";
import { Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export function EnquiriesManager() {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const res = await fetch("/api/enquiries");
      const data = await res.json();
      if (Array.isArray(data)) setEnquiries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const markAsRead = async (id: string) => {
    try {
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: 'read' } : e));
      await fetch(`/api/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' })
      });
      toast.success("Enquiry marked as read");
    } catch (e) {
      toast.error("Failed to mark as read");
      console.error(e);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      setEnquiries(prev => prev.filter(e => e.id !== deleteConfirmId));
      await fetch(`/api/enquiries/${deleteConfirmId}`, { method: 'DELETE' });
      toast.success("Enquiry deleted");
    } catch (e) {
      toast.error("Failed to delete enquiry");
      console.error(e);
    }
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-display text-charcoal mb-6">Contact Enquiries</h2>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-5 border border-[#EBE3DB] rounded-md bg-[#FAF8F5] flex gap-6">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-3/4 mt-4" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="w-32 space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-display text-charcoal mb-6">Contact Enquiries</h2>
      
      <div className="space-y-4">
        {enquiries.length === 0 ? (
          <p className="text-charcoal/50">No enquiries found.</p>
        ) : (
          enquiries.map((enquiry) => (
            <div key={enquiry.id} className="p-5 border border-[#EBE3DB] rounded-md bg-[#FAF8F5] flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-charcoal">{enquiry.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold rounded-sm ${enquiry.status === 'new' ? 'bg-[#8C6D40] text-white' : 'bg-charcoal/10 text-charcoal/60'}`}>
                    {enquiry.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-charcoal/60 mb-4">
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {enquiry.email}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(enquiry.createdAt).toLocaleDateString()}</span>
                </div>
                {enquiry.subject && <p className="font-medium text-sm text-charcoal mb-1">Subject: {enquiry.subject}</p>}
                <p className="text-sm text-charcoal/80 leading-relaxed">{enquiry.message}</p>
              </div>
              <div className="flex flex-col gap-2 justify-start sm:w-32 shrink-0">
                {enquiry.status === 'new' && (
                  <Button 
                    onClick={() => markAsRead(enquiry.id)}
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                  >
                    Mark as Read
                  </Button>
                )}
                <Button onClick={() => setDeleteConfirmId(enquiry.id)} variant="ghost" size="sm" className="w-full text-xs text-charcoal/50 hover:text-red-500">
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={executeDelete}
        title="Delete Enquiry"
        message="Are you sure you want to delete this enquiry? This action cannot be undone."
      />
    </div>
  );
}
