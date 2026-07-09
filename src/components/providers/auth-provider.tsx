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

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session?.user) {
            setUser(null);
            setPurchasedPrograms([]);
          }
        });
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setUser, setPurchasedPrograms]);

  const fetchUserPrograms = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('program_id')
        .eq('user_id', userId);

      if (error) {
        console.warn('Could not fetch user purchases from database:', error.message);
        return;
      }

      if (data) {
        setPurchasedPrograms(data.map((p: any) => p.program_id));
      }
    } catch (err) {
      console.warn('Error fetching user purchases:', err);
    }
  };

  return <>{children}</>;
}

