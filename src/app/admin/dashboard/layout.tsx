"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Calendar, LayoutDashboard, Mail, MessageSquare, Users, ExternalLink, CreditCard, ClipboardList } from "lucide-react";
import { useUserStore } from "@/store/user-store";
import { Spinner } from "@/components/ui/spinner";
import { AdminPresence } from "@/components/admin/AdminPresence";
import { Suspense } from "react";


export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useUserStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (user === undefined) return; // Still loading from store

    if (process.env.NODE_ENV === "development") {
      setIsChecking(false);
      return;
    }

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
        <aside className="w-64 bg-white border-r border-[#EBE3DB] fixed h-screen overflow-hidden shadow-sm">
          <div className="p-6 h-full flex flex-col">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#8C6D40] mb-6">Admin Panel</h2>
            <nav className="space-y-2 flex-1">
              <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-md text-charcoal hover:bg-[#EBE3DB]/40 transition-colors">
                <LayoutDashboard className="h-5 w-5 text-charcoal/50" />
                <span className="text-sm font-medium">Overview</span>
              </Link>
              <Link href="/admin/dashboard?tab=purchases" className="flex items-center gap-3 px-4 py-3 rounded-md text-charcoal hover:bg-[#EBE3DB]/40 transition-colors">
                <CreditCard className="h-5 w-5 text-charcoal/50" />
                <span className="text-sm font-medium">Purchases</span>
              </Link>
              <Link href="/admin/dashboard?tab=enquiries" className="flex items-center gap-3 px-4 py-3 rounded-md text-charcoal hover:bg-[#EBE3DB]/40 transition-colors">
                <MessageSquare className="h-5 w-5 text-charcoal/50" />
                <span className="text-sm font-medium">Bookings & Enquiries</span>
              </Link>

              <Link href="/admin/dashboard?tab=ebooks" className="flex items-center gap-3 px-4 py-3 rounded-md text-charcoal hover:bg-[#EBE3DB]/40 transition-colors">
                <BookOpen className="h-5 w-5 text-charcoal/50" />
                <span className="text-sm font-medium">Ebook Requests</span>
              </Link>
              <Link href="/admin/dashboard?tab=quiz" className="flex items-center gap-3 px-4 py-3 rounded-md text-charcoal hover:bg-[#EBE3DB]/40 transition-colors">
                <ClipboardList className="h-5 w-5 text-charcoal/50" />
                <span className="text-sm font-medium">Quiz Responses</span>
              </Link>
              <Link href="/admin/dashboard?tab=programs" className="flex items-center gap-3 px-4 py-3 rounded-md text-charcoal hover:bg-[#EBE3DB]/40 transition-colors">
                <Calendar className="h-5 w-5 text-charcoal/50" />
                <span className="text-sm font-medium">Programs</span>
              </Link>
              <Link href="/admin/dashboard?tab=resources" className="flex items-center gap-3 px-4 py-3 rounded-md text-charcoal hover:bg-[#EBE3DB]/40 transition-colors">
                <BookOpen className="h-5 w-5 text-charcoal/50" />
                <span className="text-sm font-medium">Resources</span>
              </Link>
              <Link href="/admin/dashboard?tab=testimonials" className="flex items-center gap-3 px-4 py-3 rounded-md text-charcoal hover:bg-[#EBE3DB]/40 transition-colors">
                <MessageSquare className="h-5 w-5 text-charcoal/50" />
                <span className="text-sm font-medium">Testimonials</span>
              </Link>
            </nav>
            
            <div className="mt-auto pt-6 border-t border-[#EBE3DB]">
              <Link 
                href="/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#8C6D40] text-[#8C6D40] hover:bg-[#8C6D40] hover:text-white transition-colors text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Website
              </Link>
            </div>
            
            <div className="mt-4">
              <Suspense fallback={null}>
                <AdminPresence />
              </Suspense>
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
