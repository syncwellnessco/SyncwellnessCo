"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { useUserStore } from "@/store/user-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setPurchasedPrograms } = useUserStore();
  const supabase = createClient();

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserPrograms(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserPrograms(session.user.id);
      } else {
        setPurchasedPrograms([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setPurchasedPrograms, supabase.auth]);

  const fetchUserPrograms = async (userId: string) => {
    // In a real application, you would fetch from your database
    // For now, this is a placeholder where you'd query 'user_programs' or 'purchases'
    // const { data } = await supabase.from('purchases').select('program_id').eq('user_id', userId);
    // setPurchasedPrograms(data.map(p => p.program_id));
  };

  return <>{children}</>;
}
