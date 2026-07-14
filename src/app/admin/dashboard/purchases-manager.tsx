"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, DollarSign, User, ShieldCheck, Mail, Phone, Calendar } from "lucide-react";
import toast from "react-hot-toast";

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
}

export function PurchasesManager() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/purchases");
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
      setLoading(false);
    }
  };

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch = 
      (purchase.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (purchase.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (purchase.program_id || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      purchase.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
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
          onClick={fetchPurchases}
          className="text-xs text-[#8C6D40] hover:underline font-bold uppercase tracking-wider self-start sm:self-center"
        >
          Refresh Data
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
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

        <div className="flex gap-2 items-center self-stretch sm:self-auto">
          <label className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60">Filter Status:</label>
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
      </div>

      {/* Purchases Table */}
      <div className="bg-white border border-[#EBE3DB] rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#EBE3DB] text-[10px] uppercase font-bold tracking-wider text-charcoal/60">
                <th className="p-4">Customer Details</th>
                <th className="p-4">Program ID</th>
                <th className="p-4">Amount Paid</th>
                <th className="p-4">Date & Session</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]/60">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-charcoal/40 italic">
                    No matching purchases found.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-[#FAF8F5]/30 transition-colors">
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
                    <td className="p-4 font-mono text-xs text-charcoal/80 uppercase">
                      {purchase.program_id}
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
    </div>
  );
}
