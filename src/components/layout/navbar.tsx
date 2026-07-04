"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, User, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";
import { createClient } from "@/lib/supabase-client";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useUserStore();
  const supabase = createClient();

  const heroNav = isHome && !isScrolled;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.push("/");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        heroNav
          ? "bg-transparent"
          : "border-b border-beige-200/80 bg-cream/95 shadow-sm backdrop-blur-md"
      )}
    >
      <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: brand */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/profile"
              className={cn(
                "inline-flex h-10 w-10 overflow-hidden items-center justify-center rounded-full border transition-colors lg:hidden",
                heroNav
                  ? "border-cream/50 text-cream hover:bg-cream/10"
                  : "border-charcoal/20 text-charcoal hover:bg-charcoal/5"
              )}
              aria-label="Profile"
            >
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </Link>
          ) : (
            <button
              type="button"
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors lg:hidden",
                heroNav
                  ? "border-cream/50 text-cream hover:bg-cream/10"
                  : "border-charcoal/20 text-charcoal hover:bg-charcoal/5"
              )}
              aria-label="Profile placeholder"
            >
              <User className="h-5 w-5" />
            </button>
          )}

          <Logo
            variant={heroNav ? "light" : "default"}
            className="hidden lg:flex"
          />
        </div>

        {/* Center: nav tabs (desktop) / logo (mobile) */}
        <div className="flex justify-center">
          <Logo
            variant={heroNav ? "light" : "default"}
            className="lg:hidden"
          />

          <ul className="hidden items-center gap-5 xl:gap-7 lg:flex">
            {siteConfig.navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
                      heroNav
                        ? "text-cream/90 hover:text-cream"
                        : isActive
                          ? "text-charcoal"
                          : "text-sage-700 hover:text-charcoal"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right: CTAs + mobile menu */}
        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 sm:gap-3 lg:flex">
            {user ? (
              <div className="flex items-center gap-3">
                {user.user_metadata?.role === 'admin' && (
                  <Link
                    href="/dashboard"
                    className={cn(
                      "rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all",
                      heroNav
                        ? "border-cream/60 text-cream hover:bg-cream/10"
                        : "border-charcoal/30 text-charcoal hover:bg-charcoal/5"
                    )}
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/profile"
                  className={cn(
                    "inline-flex h-10 w-10 overflow-hidden items-center justify-center rounded-full border transition-colors",
                    heroNav
                      ? "border-cream/50 text-cream hover:bg-cream/10"
                      : "border-charcoal/20 text-charcoal hover:bg-charcoal/5"
                  )}
                  aria-label="Profile"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all",
                    heroNav
                      ? "border-cream/60 text-cream hover:bg-cream/10"
                      : "border-charcoal/30 text-charcoal hover:bg-charcoal/5"
                  )}
                >
                  Member
                </Link>
                <Link
                  href="/signup"
                  className={cn(
                    "rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all",
                    heroNav
                      ? "bg-cream text-charcoal hover:bg-cream/90"
                      : "bg-gold text-cream hover:bg-gold/90"
                  )}
                >
                  Join
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-lg p-2 lg:hidden",
              heroNav ? "text-cream" : "text-charcoal"
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
              className="fixed top-16 right-0 bottom-0 left-0 z-40 bg-charcoal/30 backdrop-blur-[2px] lg:hidden"
              aria-label="Close menu overlay"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-16 right-0 z-40 h-[calc(100svh-4rem)] w-[86%] max-w-sm border-l border-beige-200 bg-[#f4f2f0] shadow-2xl lg:hidden"
            >
              <div className="flex h-full flex-col">
                <div className="flex-1 overflow-y-auto px-5 py-5">
                  <ul className="space-y-1">
                    {siteConfig.navLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-md px-2 py-3 text-[15px] font-medium uppercase tracking-[0.16em] text-charcoal transition-colors hover:bg-beige-100"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 border-t border-beige-200 pt-6">
                    <div className="space-y-3">
                      {user ? (
                        <>
                          {user.user_metadata?.role === 'admin' && (
                            <Link
                              href="/dashboard"
                              onClick={() => setMobileOpen(false)}
                              className="block w-full rounded-md border border-charcoal/20 bg-beige-100 py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] text-charcoal transition-colors hover:bg-beige-200"
                            >
                              Dashboard
                            </Link>
                          )}
                          <Link
                            href="/profile"
                            onClick={() => setMobileOpen(false)}
                            className="block w-full rounded-md bg-gold py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-gold/90"
                          >
                            My Profile
                          </Link>
                          <button
                            onClick={() => {
                              setMobileOpen(false);
                              handleLogout();
                            }}
                            className="block w-full rounded-md border border-charcoal/20 bg-beige-100 py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] text-charcoal transition-colors hover:bg-beige-200"
                          >
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/signup"
                            onClick={() => setMobileOpen(false)}
                            className="block w-full rounded-md border border-charcoal/20 bg-beige-100 py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] text-charcoal transition-colors hover:bg-beige-200"
                          >
                            Join
                          </Link>
                          <Link
                            href="/login"
                            onClick={() => setMobileOpen(false)}
                            className="block w-full rounded-md bg-gold py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-gold/90"
                          >
                            Member Login
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
