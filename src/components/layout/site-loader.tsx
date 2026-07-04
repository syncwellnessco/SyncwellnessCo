"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const lines = [
  "Balance Hormones.",
  "Heal Your Gut.",
  "Feel Strong Again.",
];

export function SiteLoader({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(true);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const rotate = window.setInterval(() => {
      setLineIndex((prev) => (prev + 1) % lines.length);
    }, 420);

    const hide = window.setTimeout(() => {
      setShowLoader(false);
      window.clearInterval(rotate);
    }, 1400);

    return () => {
      window.clearTimeout(hide);
      window.clearInterval(rotate);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45 } }}
            className="fixed inset-0 z-[999] isolate flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#f5eee7] via-[#f1e6dd] to-[#e8dbcf]"
          >
            {/* Soft pastel blobs similar to IAFHH palette */}
            <div className="pointer-events-none absolute -top-24 -left-16 z-0 h-64 w-64 rounded-full bg-[#f0d9cf]/60 blur-3xl sm:h-72 sm:w-72" />
            <div className="pointer-events-none absolute -right-24 top-1/3 z-0 h-72 w-72 rounded-full bg-[#e3d2c3]/55 blur-3xl sm:h-80 sm:w-80" />
            <div className="pointer-events-none absolute -bottom-10 left-1/3 z-0 h-52 w-52 rounded-full bg-[#e4f0e4]/55 blur-3xl sm:h-60 sm:w-60" />
            <div className="relative z-10 px-6 text-center">
              <p className="font-display text-4xl tracking-tight text-charcoal sm:text-5xl">
                SyncwellnessCo
              </p>
              <motion.p
                key={lineIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-xs uppercase tracking-[0.16em] text-charcoal sm:text-sm"
              >
                {lines[lineIndex]}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
