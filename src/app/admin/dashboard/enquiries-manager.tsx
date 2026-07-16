"use client";

import { useState, useEffect } from "react";
import { ContactEnquiry } from "@/types/dashboard";
import { Mail, Clock, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type SubTab = "bookings" | "contact";

interface CalendlyBooking {
  id: string;
  invitee_uri: string;
  event_uri: string | null;
  event_name: string | null;
  name: string;
  email: string;
  timezone: string | null;
  start_time: string | null;
  end_time: string | null;
  join_url: string | null;
  completed: boolean;
  created_at: string;
}

export function EnquiriesManager() {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [bookings, setBookings] = useState<CalendlyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<SubTab>("bookings");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enquiriesRes, bookingsRes] = await Promise.all([
        fetch("/api/enquiries"),
        fetch("/api/bookings")
      ]);
      const enquiriesData = await enquiriesRes.json();
      const bookingsData = await bookingsRes.json();

      if (Array.isArray(enquiriesData)) setEnquiries(enquiriesData);
      if (Array.isArray(bookingsData)) setBookings(bookingsData);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

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
      fetchData();
    }
  };

  const toggleBookingCompleted = async (id: string, currentCompleted: boolean) => {
    try {
      const newCompleted = !currentCompleted;
      
      // Optimistically update
      setBookings(prev => prev.map(b => b.id === id ? { ...b, completed: newCompleted } : b));

      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newCompleted })
      });

      if (!res.ok) {
        throw new Error("Failed to update booking status");
      }

      toast.success(newCompleted ? "Consultation marked as completed!" : "Consultation marked as pending.");
    } catch (e) {
      toast.error("Failed to update booking status");
      console.error(e);
      fetchData();
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      if (subTab === "bookings") {
        setBookings(prev => prev.filter(b => b.id !== deleteConfirmId));
        await fetch(`/api/bookings/${deleteConfirmId}`, { method: 'DELETE' });
      } else {
        setEnquiries(prev => prev.filter(e => e.id !== deleteConfirmId));
        await fetch(`/api/enquiries/${deleteConfirmId}`, { method: 'DELETE' });
      }
      toast.success("Record deleted");
    } catch (e) {
      toast.error("Failed to delete record");
      console.error(e);
      fetchData();
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Filter out any booking-related records that might remain in enquiries from old schema
  const enquiriesList = enquiries.filter(e => !e.subject?.startsWith("Calendly Booking:"));

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-display text-charcoal mb-6">Enquiries & Bookings</h2>
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
      <h2 className="text-2xl font-display text-charcoal mb-6">Enquiries & Bookings</h2>

      {/* Sub-tab selector */}
      <div className="flex gap-2 border-b border-[#EBE3DB] mb-8">
        <button 
          onClick={() => setSubTab("bookings")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors -mb-px ${subTab === "bookings" ? "border-[#8C6D40] text-[#8C6D40]" : "border-transparent text-charcoal/60 hover:text-charcoal"}`}
        >
          <Calendar className="h-4 w-4" />
          Consultation Bookings
        </button>
        <button 
          onClick={() => setSubTab("contact")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors -mb-px ${subTab === "contact" ? "border-[#8C6D40] text-[#8C6D40]" : "border-transparent text-charcoal/60 hover:text-charcoal"}`}
        >
          <Mail className="h-4 w-4" />
          Contact Enquiries
        </button>
      </div>
      
      <div className="space-y-4">
        {subTab === "bookings" ? (
          bookings.length === 0 ? (
            <p className="text-charcoal/50">No consultation bookings found.</p>
          ) : (
            bookings.map((booking) => {
              const dateStr = booking.start_time
                ? new Date(booking.start_time).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })
                : "";

              const completed = booking.completed === true;

              return (
                <div key={booking.id} className="p-5 border border-[#EBE3DB] rounded-md bg-[#FAF8F5] flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-charcoal flex items-center gap-1.5">
                        <User className="h-4 w-4 text-charcoal/40" />
                        {booking.name}
                      </h3>
                      <span className={`text-[9px] px-2 py-0.5 uppercase tracking-wider font-bold rounded-sm ${completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {completed ? 'Consultation Completed' : 'Pending Call'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal/60">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {booking.email}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Booked on {new Date(booking.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-3 bg-white p-4 rounded border border-[#EBE3DB] space-y-2 max-w-xl">
                      <div className="text-[10px] font-bold text-[#8C6D40] uppercase tracking-wider">Scheduled Details</div>
                      <div className="text-sm font-semibold text-charcoal">{booking.event_name || "1:1 Consultation Call"}</div>
                      {dateStr && <div className="text-xs text-charcoal/70"><strong>Time:</strong> {dateStr} ({booking.timezone || "UTC"})</div>}
                      {booking.join_url && (
                        <div className="text-xs text-charcoal/70">
                          <strong>Join Link:</strong>{" "}
                          <a href={booking.join_url} target="_blank" rel="noopener noreferrer" className="text-[#8C6D40] hover:underline font-medium break-all">
                            {booking.join_url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-row lg:flex-col gap-2.5 justify-end w-full lg:w-auto shrink-0 mt-4 lg:mt-0">
                    <button
                      onClick={() => toggleBookingCompleted(booking.id, booking.completed)}
                      className={`h-9 px-4 text-xs font-bold uppercase tracking-wider transition-colors duration-200 border rounded-sm w-full sm:w-36 text-center ${
                        completed 
                          ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" 
                          : "bg-emerald-600 text-white border-transparent hover:bg-emerald-700"
                      }`}
                    >
                      {completed ? "Mark Pending" : "Mark Done"}
                    </button>
                    <Button 
                      onClick={() => setDeleteConfirmId(booking.id)} 
                      variant="ghost" 
                      size="sm" 
                      className="w-full sm:w-36 text-xs text-charcoal/50 hover:text-red-500 border border-charcoal/10 lg:border-transparent rounded-sm h-9"
                    >
                      Delete Booking
                    </Button>
                  </div>
                </div>
              );
            })
          )
        ) : (
          enquiriesList.length === 0 ? (
            <p className="text-charcoal/50">No contact enquiries found.</p>
          ) : (
            enquiriesList.map((enquiry) => (
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
          )
        )}
      </div>
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={executeDelete}
        title={subTab === "bookings" ? "Delete Booking" : "Delete Enquiry"}
        message={`Are you sure you want to delete this ${subTab === "bookings" ? "booking" : "enquiry"}? This action cannot be undone.`}
      />
    </div>
  );
}

