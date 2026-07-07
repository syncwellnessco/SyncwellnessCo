"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Edit } from "lucide-react";
import { createClient } from "@/lib/supabase-client";

export function BlogEditButton() {
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAdmin(true);
      }
    });
  }, []);

  if (!isAdmin) return null;

  return (
    <Link prefetch={false} 
      href="/admin/dashboard?tab=blogs"
      className="fixed bottom-6 right-6 flex items-center gap-2 bg-[#8C6D40] hover:bg-[#B8955F] text-white text-[11px] uppercase tracking-widest font-semibold px-6 py-3 rounded-sm shadow-lg transition-colors z-50"
    >
      <Edit className="h-4 w-4" /> Edit Article
    </Link>
  );
}
