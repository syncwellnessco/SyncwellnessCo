"use client";

import { ReactNode, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Calendar, LayoutDashboard, MessageSquare, ExternalLink, CreditCard, ClipboardList, LogOut, HardDrive } from "lucide-react";
import { useUserStore } from "@/store/user-store";
import { Spinner } from "@/components/ui/spinner";
import { AdminPresence } from "@/components/admin/AdminPresence";
import { createClient } from "@/lib/supabase-client";

const navItems = [
  { label: "Overview", tab: "overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Purchases", tab: "purchases", href: "/admin/dashboard?tab=purchases", icon: CreditCard },
  { label: "Bookings & Enquiries", tab: "enquiries", href: "/admin/dashboard?tab=enquiries", icon: MessageSquare },
  { label: "Ebook Requests", tab: "ebooks", href: "/admin/dashboard?tab=ebooks", icon: BookOpen },
  { label: "Quiz Responses", tab: "quiz", href: "/admin/dashboard?tab=quiz", icon: ClipboardList },
  { label: "Programs", tab: "programs", href: "/admin/dashboard?tab=programs", icon: Calendar },
  { label: "Resources", tab: "resources", href: "/admin/dashboard?tab=resources", icon: BookOpen, altTabs: ["blogs"] },
  { label: "Testimonials", tab: "testimonials", href: "/admin/dashboard?tab=testimonials", icon: MessageSquare },
  { label: "Media Storage", tab: "media", href: "/admin/dashboard?tab=media", icon: HardDrive },
];

function AdminSidebarNav() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  return (
    <nav className="space-y-1.5 flex-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = currentTab === item.tab || (item.altTabs && item.altTabs.includes(currentTab));
        return (
          <Link
            key={item.tab}
            href={item.href}
            className={`group flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-all ${
              active
                ? "bg-[#8C6D40] text-white font-semibold shadow-sm"
                : "text-charcoal/80 hover:bg-[#EBE3DB]/40 hover:text-charcoal font-medium"
            }`}
          >
            <Icon className={`h-4.5 w-4.5 transition-colors ${active ? "text-white" : "text-charcoal/50 group-hover:text-charcoal"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function AdminNavFallback() {
  return (
    <nav className="space-y-1.5 flex-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.tab}
            href={item.href}
            className="group flex items-center gap-3 px-4 py-2.5 rounded-md text-sm text-charcoal/80 hover:bg-[#EBE3DB]/40 transition-all font-medium"
          >
            <Icon className="h-4.5 w-4.5 text-charcoal/50" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useUserStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (user === undefined) return; // Still loading from store

    if (!user) {
      router.push("/login?redirect=/admin/dashboard");
      return;
    }

    if (user.user_metadata?.role !== "admin") {
      router.push("/"); // Redirect non-admins to home
      return;
    }

    setIsChecking(false);
  }, [user, router]);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
    logout();
    router.push("/login");
    router.refresh();
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <>
      {/* Mobile Protector */}
      <div className="lg:hidden min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 shadow-sm border border-[#EBE3DB] max-w-sm w-full">
          <div className="flex flex-col items-center">
            <span className="text-[#8C6D40] text-xs font-bold tracking-[0.2em] uppercase mb-4">Admin Panel</span>
            <h2 className="font-display text-3xl font-semibold text-charcoal mb-5">Desktop Only</h2>
            <div className="w-12 h-px bg-[#DCD3C6] mb-6"></div>
          </div>
          <p className="text-charcoal/80 text-[15px] mb-10 leading-relaxed">
            The Admin Dashboard requires a larger screen for the best content management experience. Please access this page from a desktop device.
          </p>
          <Link href="/" className="inline-flex items-center justify-center w-full px-6 py-4 bg-[#8C6D40] text-white text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-[#B8955F] transition-colors">
            RETURN TO WEBSITE
          </Link>
        </div>
      </div>

      {/* Desktop Dashboard */}
      <div className="hidden lg:flex min-h-screen bg-[#FAF8F5]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-[#EBE3DB] fixed h-screen overflow-y-auto shadow-sm">
          <div className="p-6 h-full flex flex-col">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#8C6D40] mb-6">Admin Panel</h2>
            <Suspense fallback={<AdminNavFallback />}>
              <AdminSidebarNav />
            </Suspense>
            
            <div className="mt-auto pt-4 border-t border-[#EBE3DB] space-y-3.5">
              <div className="space-y-2">
                <Link 
                  href="/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-[#8C6D40] text-[#8C6D40] hover:bg-[#8C6D40] hover:text-white transition-colors text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm w-full"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Website
                </Link>
                <button 
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 bg-red-50/50 text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm w-full cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log Out
                </button>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB]/60">
                <Suspense fallback={null}>
                  <AdminPresence />
                </Suspense>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8 lg:p-12">
          {children}
        </main>
      </div>
    </>
  );
}
