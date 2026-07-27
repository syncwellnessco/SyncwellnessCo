"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase-client";
import { useUserStore } from "@/store/user-store";
import { useSearchParams } from "next/navigation";
import { User } from "lucide-react";

interface OnlineAdmin {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  currentTab: string;
}

export function AdminPresence() {
  const { user } = useUserStore();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab") || "overview";
  const [onlineAdmins, setOnlineAdmins] = useState<OnlineAdmin[]>([]);
  
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!user || user.user_metadata?.role !== "admin") return;

    const supabase = createClient();
    const channel = supabase.channel('admin-presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const admins: OnlineAdmin[] = [];
        
        Object.keys(state).forEach(key => {
          const presences = state[key] as any[];
          if (presences.length > 0) {
            admins.push(presences[0] as OnlineAdmin);
          }
        });
        
        // Remove duplicates just in case the same user has multiple tabs open
        // We could also show them multiple times, but merging by ID is cleaner
        const uniqueAdmins = Array.from(new Map(admins.map(a => [a.id, a])).values());
        setOnlineAdmins(uniqueAdmins);
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
          await channel.track({
            id: user.id,
            name: user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.name || 'Admin',
            email: user.email,
            avatar_url: user.user_metadata?.avatar_url,
            currentTab,
          });
        }
      });

    return () => {
      isSubscribedRef.current = false;
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user?.id]);

  useEffect(() => {
    if (channelRef.current && isSubscribedRef.current && user) {
      channelRef.current.track({
        id: user.id,
        name: user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.name || 'Admin',
        email: user.email,
        avatar_url: user.user_metadata?.avatar_url,
        currentTab,
      });
    }
  }, [currentTab, user]);

  if (onlineAdmins.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-[#EBE3DB]">
      <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C6D40] mb-4 px-4">
        Active Admins ({onlineAdmins.length})
      </h3>
      <div className="space-y-4 px-4 pb-4">
        {onlineAdmins.map(admin => (
          <div key={admin.id} className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              {admin.avatar_url ? (
                <img 
                  src={admin.avatar_url} 
                  alt={admin.name} 
                  className="h-8 w-8 rounded-full object-cover border border-[#EBE3DB]"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`h-8 w-8 rounded-full bg-[#FAF8F5] items-center justify-center text-charcoal/40 border border-[#EBE3DB] ${admin.avatar_url ? 'hidden flex' : 'flex'}`}>
                <User className="h-4 w-4" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></div>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[13px] font-semibold text-charcoal truncate">
                {admin.name} {admin.id === user?.id ? "(You)" : ""}
              </span>
              <span className="text-[10px] text-charcoal/60 capitalize truncate">
                Viewing: {admin.currentTab.replace('-', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
