"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, DollarSign, User, ShieldCheck, Mail, Phone, Calendar, X, FileText, Globe, Laptop } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Purchase {
  id: string;
  user_id: string | null;
  program_id: string;
  amount: number;
  currency: string;
  status: string;
  stripe_session_id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
  
  // Coaching Agreement fields
  agreementToken?: string | null;
  agreementStatus?: string | null;
  agreementAcceptedAt?: string | null;
  agreementIp?: string | null;
  agreementUserAgent?: string | null;
  agreementVersion?: number | null;
}
import { CoachingAgreementPrintable } from "@/components/CoachingAgreementPrintable";
export function PurchasesManager() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [agreementFilter, setAgreementFilter] = useState("all");
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printPurchase, setPrintPurchase] = useState<Purchase | null>(null);

  const handleResendAgreement = async (purchaseId: string) => {
    setIsResending(true);
    try {
      const res = await fetch(`/api/purchases/${purchaseId}/resend`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resend agreement email");
      }
      toast.success("Agreement email automation triggered successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to resend agreement email.");
    } finally {
      setIsResending(false);
    }
  };

  const reviewAgreement = (purchase: Purchase) => {
    setPrintPurchase(purchase);
    setShowPrintModal(true);
  };

  useEffect(() => {
    fetchPurchases(true);
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await fetch("/api/programs");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPrograms(data);
        }
      }
    } catch (err) {
      console.error("Failed to load programs list:", err);
    }
  };

  const fetchPurchases = async (showSkeleton = true) => {
    const shouldShowSkeleton = showSkeleton === true;
    if (shouldShowSkeleton) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const res = await fetch(`/api/purchases?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to fetch purchases");
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setPurchases(data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load purchases from database.");
    } finally {
      if (shouldShowSkeleton) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const filteredPurchases = purchases.filter((purchase) => {
    const matchingProgram = programs.find(p => p.id === purchase.program_id || p.slug === purchase.program_id);
    const programTitle = matchingProgram?.title || purchase.program_id || "";

    const matchesSearch = 
      (purchase.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (purchase.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      programTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      purchase.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesAgreement = 
      agreementFilter === "all" || 
      (purchase.agreementStatus || "Pending").toLowerCase() === agreementFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesAgreement;
  });

  const totalRevenue = purchases
    .filter(p => p.status === "completed" || p.status === "succeeded")
    .reduce((sum, p) => sum + (p.amount / 100), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-6">
        <div>
          <h2 className="text-2xl font-display text-charcoal">Program Purchases</h2>
          <p className="text-charcoal/60 text-xs mt-1">Track and manage enrollment purchases from your Stripe gateway.</p>
        </div>
        <button
          onClick={() => fetchPurchases(false)}
          disabled={refreshing}
          className="text-xs text-[#8C6D40] hover:underline font-bold uppercase tracking-wider self-start sm:self-center disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
        >
          {refreshing ? (
            <>
              <span className="animate-spin h-3 w-3 border-2 border-[#8C6D40] border-t-transparent rounded-full"></span>
              Refreshing...
            </>
          ) : (
            "Refresh Data"
          )}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FAF8F5] border border-[#EBE3DB] p-5 rounded-sm shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-full">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-charcoal/50">Total Revenue</h4>
            <p className="text-2xl font-display text-charcoal font-semibold mt-1">${totalRevenue.toFixed(2)} AUD</p>
          </div>
        </div>

        <div className="bg-[#FAF8F5] border border-[#EBE3DB] p-5 rounded-sm shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-full">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-charcoal/50">Total Enrollments</h4>
            <p className="text-2xl font-display text-charcoal font-semibold mt-1">{purchases.length}</p>
          </div>
        </div>

        <div className="bg-[#FAF8F5] border border-[#EBE3DB] p-5 rounded-sm shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#8C6D40]/10 text-[#8C6D40] rounded-full">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-charcoal/50">Unique Customers</h4>
            <p className="text-2xl font-display text-charcoal font-semibold mt-1">
              {new Set(purchases.map(p => p.email)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, program..."
            className="w-full bg-[#FAF8F5] border border-[#EBE3DB] pl-9 pr-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-[#8C6D40] rounded-sm transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <div className="flex gap-2 items-center">
            <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60 whitespace-nowrap">Filter Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF8F5] border border-[#EBE3DB] px-3 py-2 text-xs font-semibold text-charcoal focus:outline-none focus:border-[#8C6D40] rounded-sm"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="succeeded">Succeeded</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60 whitespace-nowrap">Agreement:</label>
            <select
              value={agreementFilter}
              onChange={(e) => setAgreementFilter(e.target.value)}
              className="bg-[#FAF8F5] border border-[#EBE3DB] px-3 py-2 text-xs font-semibold text-charcoal focus:outline-none focus:border-[#8C6D40] rounded-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white border border-[#EBE3DB] rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#EBE3DB] text-[10px] uppercase font-bold tracking-wider text-charcoal/60">
                <th className="p-4">Customer Details</th>
                <th className="p-4">Program</th>
                <th className="p-4">Amount Paid</th>
                <th className="p-4">Date & Session</th>
                <th className="p-4">Agreement</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]/60">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-charcoal/40 italic">
                    No matching purchases found.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr 
                    key={purchase.id} 
                    onClick={() => setSelectedPurchase(purchase)}
                    className="hover:bg-[#FAF8F5]/30 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-charcoal flex items-center gap-1.5">
                        {purchase.name || "Guest Checkout"}
                      </div>
                      <div className="text-xs text-charcoal/60 mt-1 flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-charcoal/40" /> {purchase.email || "No email"}
                      </div>
                      {purchase.phone && (
                        <div className="text-xs text-charcoal/60 mt-0.5 flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-charcoal/40" /> {purchase.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-xs font-semibold text-charcoal/80">
                      {programs.find(p => p.id === purchase.program_id || p.slug === purchase.program_id)?.title || purchase.program_id}
                    </td>
                    <td className="p-4 font-semibold text-[#8C6D40]">
                      ${(purchase.amount / 100).toFixed(2)} <span className="text-[10px] font-bold uppercase">AUD</span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-charcoal flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-charcoal/40" />
                        {new Date(purchase.createdAt).toLocaleDateString()} at {new Date(purchase.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[9px] font-mono text-charcoal/40 mt-1.5 truncate max-w-[150px]" title={purchase.stripe_session_id}>
                        Ref: {purchase.stripe_session_id}
                      </div>
                    </td>
                    <td className="p-4">
                      {purchase.agreementStatus === "Accepted" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-sm">
                          🟢 Accepted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-sm">
                          🟠 Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                        purchase.status === "completed" || purchase.status === "succeeded"
                          ? "bg-green-50 text-green-700 border border-green-100"
                          : purchase.status === "pending"
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                          : "bg-red-50 text-red-700 border border-red-100"
                      }`}>
                        {purchase.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal Drawer */}
      <AnimatePresence>
        {selectedPurchase && (() => {
          const matchingSelectedProgram = programs.find(p => p.id === selectedPurchase.program_id || p.slug === selectedPurchase.program_id);
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setSelectedPurchase(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-sm w-full max-w-xl shadow-2xl relative border border-[#EBE3DB] max-h-[90vh] flex flex-col overflow-hidden"
              >
                {/* Decorative top border */}
                <div className="absolute top-0 left-0 right-0 h-[5px] bg-gradient-to-r from-[#8C6D40] to-[#B8955F] z-30"></div>

                <button
                  onClick={() => setSelectedPurchase(null)}
                  className="absolute top-4 right-4 z-30 p-1.5 rounded-full text-charcoal/60 hover:text-charcoal bg-white/80 hover:bg-white backdrop-blur-md transition-all shadow-sm border border-[#EBE3DB] cursor-pointer"
                  title="Close"
                >
                  <X className="h-5 w-5 text-charcoal/60" />
                </button>

                <div className="p-6 overflow-y-auto flex-1">
                  <div className="mb-6 pr-8">
                    <h3 className="font-display text-2xl text-charcoal">Purchase Details</h3>
                    <p className="text-xs text-charcoal/60">Reference and coaching agreement metadata.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Customer Information */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 border-b border-[#EBE3DB] pb-1 mb-2">Customer & Program</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-charcoal/50 block">Name</span>
                          <span className="font-semibold text-charcoal">{selectedPurchase.name || "Guest Checkout"}</span>
                        </div>
                        <div>
                          <span className="text-charcoal/50 block">Email</span>
                          <span className="font-semibold text-charcoal">{selectedPurchase.email || "No Email"}</span>
                        </div>
                        <div>
                          <span className="text-charcoal/50 block">Phone</span>
                          <span className="font-semibold text-charcoal">{selectedPurchase.phone || "No Phone"}</span>
                        </div>
                        <div>
                          <span className="text-charcoal/50 block">Program</span>
                          <span className="font-semibold text-charcoal">{matchingSelectedProgram?.title || selectedPurchase.program_id}</span>
                        </div>
                        <div>
                          <span className="text-charcoal/50 block">Duration</span>
                          <span className="font-semibold text-charcoal">{matchingSelectedProgram?.duration || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                  {/* Payment Details */}
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 border-b border-[#EBE3DB] pb-1 mb-2">Transaction Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-charcoal/50 block">Amount Paid</span>
                        <span className="font-semibold text-[#8C6D40]">${(selectedPurchase.amount / 100).toFixed(2)} {selectedPurchase.currency.toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="text-charcoal/50 block">Status</span>
                        <span className="font-semibold text-charcoal uppercase">{selectedPurchase.status}</span>
                      </div>
                      <div>
                        <span className="text-charcoal/50 block">Purchased At</span>
                        <span className="font-semibold text-charcoal">
                          {new Date(selectedPurchase.createdAt).toLocaleDateString()} at {new Date(selectedPurchase.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-charcoal/50 block">Stripe Session Ref</span>
                        <span className="font-semibold text-charcoal font-mono text-[10px] truncate block max-w-[200px]" title={selectedPurchase.stripe_session_id}>
                          {selectedPurchase.stripe_session_id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Agreement Details */}
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 border-b border-[#EBE3DB] pb-1 mb-2">Coaching Agreement Status</h4>
                    <div className="space-y-3.5 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-charcoal/50 block">Agreement Status</span>
                          <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                            selectedPurchase.agreementStatus === "Accepted"
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-yellow-50 text-yellow-700 border border-yellow-100"
                          }`}>
                            {selectedPurchase.agreementStatus || "Pending"}
                          </span>
                        </div>
                        <div>
                          <span className="text-charcoal/50 block">Agreement Version</span>
                          <span className="font-semibold text-charcoal">Version {selectedPurchase.agreementVersion || 1}</span>
                        </div>
                      </div>

                      {selectedPurchase.agreementStatus === "Accepted" && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-charcoal/50 block">Accepted Date</span>
                              <span className="font-semibold text-charcoal">
                                {selectedPurchase.agreementAcceptedAt 
                                  ? new Date(selectedPurchase.agreementAcceptedAt).toLocaleDateString() + " at " + new Date(selectedPurchase.agreementAcceptedAt).toLocaleTimeString()
                                  : "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-charcoal/50 block">Signed from IP</span>
                              <span className="font-semibold text-charcoal font-mono flex items-center gap-1">
                                <Globe className="h-3 w-3 text-charcoal/40" /> {selectedPurchase.agreementIp || "N/A"}
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className="text-charcoal/50 block mb-1">User Agent / Browser</span>
                            <span className="font-semibold text-charcoal font-mono text-[10px] leading-relaxed p-2 bg-[#FAF8F5] border border-[#EBE3DB] rounded-sm block select-all flex items-start gap-1.5">
                              <Laptop className="h-3.5 w-3.5 text-charcoal/40 shrink-0 mt-0.5" />
                              {selectedPurchase.agreementUserAgent || "N/A"}
                            </span>
                          </div>
                        </>
                      )}

                      {selectedPurchase.agreementToken && (
                        <div>
                          <span className="text-charcoal/50 block mb-1">Client Agreement Link</span>
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              readOnly
                              value={`${typeof window !== "undefined" ? window.location.origin : ""}/agreement/${selectedPurchase.agreementToken}`}
                              className="w-full bg-[#FAF8F5] border border-[#EBE3DB] px-2 py-1.5 font-mono text-[10px] text-charcoal rounded-sm focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/agreement/${selectedPurchase.agreementToken}`);
                                toast.success("Copied to clipboard!");
                              }}
                              className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] hover:underline whitespace-nowrap px-2 py-1.5 bg-transparent border-0 outline-none cursor-pointer"
                            >
                              Copy Link
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-[#EBE3DB] flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => reviewAgreement(selectedPurchase)}
                          className="flex-1 py-2.5 px-4 bg-[#FAF8F5] hover:bg-[#EBE3DB]/40 border border-[#EBE3DB] text-xs font-semibold text-charcoal rounded-sm transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <FileText className="h-4 w-4 text-[#8C6D40]" /> Review & Print Agreement
                        </button>
                        {selectedPurchase.agreementStatus !== "Accepted" && (
                          <button
                            onClick={() => handleResendAgreement(selectedPurchase.id)}
                            disabled={isResending}
                            className="flex-1 py-2.5 px-4 bg-charcoal hover:bg-[#8C6D40] disabled:bg-charcoal/40 text-xs font-semibold text-white rounded-sm transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {isResending ? (
                              <>
                                <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                                Resending...
                              </>
                            ) : (
                              "Resend Agreement"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )})()}
      </AnimatePresence>
      {showPrintModal && printPurchase && (() => {
        const matchingProgram = programs.find(p => p.id === printPurchase.program_id || p.slug === printPurchase.program_id);
        const programTitle = matchingProgram?.title || printPurchase.program_id || "our coaching program";
        const programDuration = matchingProgram?.duration || "3 months";
        const programIncluded = matchingProgram?.included || [];
        return (
          <CoachingAgreementPrintable
            name={printPurchase.name || "Guest Checkout"}
            programTitle={programTitle}
            programDuration={programDuration}
            programIncluded={programIncluded}
            purchaseDate={new Date(printPurchase.createdAt).toLocaleDateString()}
            status={printPurchase.agreementStatus || "Pending"}
            acceptedAt={printPurchase.agreementAcceptedAt}
            ip={printPurchase.agreementIp}
            userAgent={printPurchase.agreementUserAgent}
            onClose={() => {
              setShowPrintModal(false);
              setPrintPurchase(null);
            }}
          />
        );
      })()}
    </div>
  );
}
