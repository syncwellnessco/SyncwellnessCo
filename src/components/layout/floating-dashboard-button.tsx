"use client";

import { useUserStore } from "@/store/user-store";
import Link from "next/link";
import { Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function FloatingDashboardButton() {
  const user = useUserStore((state) => state.user);
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isAdmin = user?.user_metadata?.role === "admin";

  if (!isAdmin) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Link
          href="/admin/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative flex h-12 items-center justify-center rounded-full 
                     bg-charcoal/85 hover:bg-charcoal/95 
                     backdrop-blur-xl 
                     border border-white/20 hover:border-[#8C6D40]/70 
                     shadow-[0_8px_32px_0_rgba(0,0,0,0.38)] 
                     hover:shadow-[0_12px_40px_0_rgba(140,109,64,0.45)] 
                     text-[#D4AF37] hover:text-white 
                     transition-colors duration-300 select-none overflow-hidden cursor-pointer"
          title="Open Admin Dashboard in a new tab"
          aria-label="Admin Dashboard"
        >
          {/* Animated layout pill */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex items-center px-3.5 h-full"
          >
            {/* Shield Icon */}
            <div className="flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-[#D4AF37] group-hover:text-gold transition-transform duration-300 group-hover:scale-110" />
            </div>

            {/* Expandable Label */}
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                  animate={{ opacity: 1, width: "auto", marginLeft: 10 }}
                  exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="overflow-hidden whitespace-nowrap text-xs font-bold uppercase tracking-[0.14em] text-cream"
                >
                  Admin Dashboard
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
