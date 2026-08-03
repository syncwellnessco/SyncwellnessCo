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
        fetchUserPrograms(session.user.id, session.user.email);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserPrograms(session.user.id, session.user.email);
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

  const fetchUserPrograms = async (userId: string, email?: string) => {
    try {
      // 1. Fetch by user_id
      const { data: userIdData, error: userIdError } = await supabase
        .from('purchases')
        .select('id, program_id, user_id')
        .eq('user_id', userId);

      let purchasesList = userIdData || [];

      // 2. Fetch by email if email is present (handles guest checkouts before account creation)
      if (email) {
        const { data: emailData } = await supabase
          .from('purchases')
          .select('id, program_id, user_id')
          .eq('email', email);

        if (emailData && emailData.length > 0) {
          // Merge purchases
          const existingIds = new Set(purchasesList.map(p => p.id));
          for (const item of emailData) {
            if (!existingIds.has(item.id)) {
              purchasesList.push(item);
            }
            // Retroactively link user_id if null
            if (!item.user_id) {
              supabase
                .from('purchases')
                .update({ user_id: userId })
                .eq('id', item.id)
                .then(({ error: linkErr }) => {
                  if (linkErr) console.warn('Could not retroactively link user_id to purchase:', linkErr.message);
                });
            }
          }
        }
      }

      if (userIdError && purchasesList.length === 0) {
        console.warn('Could not fetch user purchases from database:', userIdError.message);
        return;
      }

      if (purchasesList.length > 0) {
        const programIds = Array.from(new Set(purchasesList.map((p: any) => p.program_id)));
        setPurchasedPrograms(programIds);
      }
    } catch (err) {
      console.warn('Error fetching user purchases:', err);
    }
  };

  return <>{children}</>;
}
