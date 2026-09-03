"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, User, X, ChevronDown, LayoutDashboard, LogOut, Shield } from "lucide-react";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { user, logout } = useUserStore();
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const heroNav = isHome && !isScrolled;
  const isTransparent = heroNav && !mobileOpen;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY <= 10) {
        setIsScrolled(false);
        return;
      }
      const heroEl = document.getElementById("hero-section");
      const threshold = heroEl ? Math.max(heroEl.offsetHeight - 64, 100) : 350;
      setIsScrolled(window.scrollY > threshold);
    };

    const handleResize = () => {
      handleScroll();
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
    logout();
    router.push("/");
    router.refresh();
  };

  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || "Account";
  const fullUserName = user?.user_metadata?.full_name || "User Account";
  const userInitial = user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  const isAdmin = user?.user_metadata?.role === 'admin';

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,border-color] duration-200",
        mobileOpen
          ? "bg-[#f4f2f0]"
          : heroNav
            ? "bg-transparent"
            : "bg-cream/95 shadow-xs backdrop-blur-md"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user ? (
            <div className="flex items-center gap-2 lg:hidden">
              <Link
                href="/profile"
                className={cn(
                  "inline-flex items-center justify-center transition-colors",
                  user.user_metadata?.avatar_url && !imgError
                    ? "h-8 w-8 overflow-hidden rounded-full ring-1 ring-gold/40"
                    : isTransparent
                      ? "text-cream"
                      : "text-charcoal"
                )}
                aria-label="Profile"
              >
                {user.user_metadata?.avatar_url && !imgError ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className={cn(
                "inline-flex items-center justify-center transition-colors lg:hidden",
                isTransparent ? "text-cream" : "text-charcoal"
              )}
              aria-label="Login"
            >
              <User className="h-5 w-5" />
            </Link>
          )}

          <div onClick={() => setMobileOpen(false)}>
            <Logo
              variant={isTransparent ? "light" : "default"}
              className="hidden lg:flex"
            />
          </div>
        </div>

        {/* Center: Mobile Logo / Desktop Navigation Links */}
        <div className="flex items-center justify-center flex-1">
          <div onClick={() => setMobileOpen(false)}>
            <Logo
              variant={isTransparent ? "light" : "default"}
              className="lg:hidden"
            />
          </div>

          <ul className="hidden items-center gap-4 xl:gap-6 lg:flex">
            {siteConfig.navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "relative text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors py-1",
                      isTransparent
                        ? "text-cream/90 hover:text-cream"
                        : isActive
                          ? "text-charcoal font-bold"
                          : "text-charcoal/80 hover:text-charcoal"
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <span
                        className={cn(
                          "absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full",
                          isTransparent ? "bg-cream" : "bg-gold"
                        )}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right: Actions / CTAs + Mobile Menu Toggle */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 flex-shrink-0">
          <div className="hidden items-center gap-4 sm:gap-5 lg:flex">
            {user ? (
              <div className="flex items-center gap-4">

                {/* Profile Badge with Dropdown — lighter, less boxed */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={cn(
                      "group flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors duration-200 cursor-pointer",
                      isTransparent
                        ? "text-cream hover:bg-white/10"
                        : "text-charcoal hover:bg-beige-100/70"
                    )}
                    aria-expanded={dropdownOpen}
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center overflow-hidden rounded-full font-semibold text-xs",
                        user.user_metadata?.avatar_url && !imgError
                          ? "ring-1 ring-gold/40"
                          : isTransparent
                            ? "bg-gold/25 text-cream ring-1 ring-cream/30"
                            : "bg-sage-100 text-sage-800 ring-1 ring-sage-400/30"
                      )}
                    >
                      {user.user_metadata?.avatar_url && !imgError ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="Profile"
                          className="h-full w-full object-cover"
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        <span>{userInitial}</span>
                      )}
                    </div>

                    <span className="text-xs font-semibold tracking-wide truncate max-w-[90px] xl:max-w-[125px] block">
                      {displayName}
                    </span>

                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 opacity-50 transition-transform duration-200",
                        dropdownOpen && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-56 rounded-xl border border-beige-200/80 bg-cream/95 p-1.5 shadow-lg backdrop-blur-md z-50 text-charcoal"
                      >
                        {/* User Header Info */}
                        <div className="flex items-center gap-3 p-2.5 border-b border-beige-200/70 mb-1">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold font-display text-base font-bold">
                            {userInitial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-charcoal truncate">
                              {fullUserName}
                            </p>
                            <p className="text-[11px] text-charcoal/55 truncate">
                              {user.email}
                            </p>
                            {isAdmin ? (
                              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">
                                <Shield className="h-2.5 w-2.5" /> Admin
                              </span>
                            ) : (
                              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-sage-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sage-800">
                                Member
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Menu Options */}
                        <div className="space-y-0.5">
                          {isAdmin && (
                            <Link
                              href="/admin/dashboard"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setDropdownOpen(false)}
                              className="block rounded-lg px-3 py-2 text-xs font-semibold text-charcoal/90 hover:bg-beige-100 hover:text-charcoal transition-colors"
                            >
                              Dashboard
                            </Link>
                          )}

                          <Link
                            href="/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-charcoal/90 hover:bg-beige-100 hover:text-charcoal transition-colors"
                          >
                            <User className="h-4 w-4 text-charcoal/60" />
                            <span>My Profile</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setDropdownOpen(false);
                              handleLogout();
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-700/80 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                          >
                            <LogOut className="h-4 w-4 text-red-600/70" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <>
                {/* Guest Visitor CTAs — one plain link, one solid button */}
                <Link
                  href="/login"
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors",
                    isTransparent
                      ? "text-cream/85 hover:text-cream"
                      : "text-charcoal/70 hover:text-charcoal"
                  )}
                >
                  Member Login
                </Link>
                <Link
                  href="/signup"
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200",
                    isTransparent
                      ? "bg-cream text-charcoal hover:bg-cream/90"
                      : "bg-gold text-white hover:bg-[#9b7842]"
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
              isTransparent ? "text-cream" : "text-charcoal"
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
                  {user && (
                    <div className="mb-6 flex items-center gap-3 px-2 pb-6 border-b border-beige-200">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold font-display text-lg font-bold">
                        {userInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold tracking-wide text-charcoal truncate">
                          {fullUserName}
                        </p>
                        <p className="text-xs text-charcoal/55 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  )}

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
                    <div className="space-y-2.5">
                      {user ? (
                        <>
                          {isAdmin && (
                            <Link
                              href="/admin/dashboard"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setMobileOpen(false)}
                              className="block w-full rounded-md py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] text-charcoal/80 transition-colors hover:bg-beige-100"
                            >
                              Dashboard
                            </Link>
                          )}
                          <Link
                            href="/profile"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-center gap-2 w-full rounded-md bg-gold py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-gold/90"
                          >
                            <User className="h-4 w-4 text-cream" />
                            My Profile
                          </Link>
                          <button
                            onClick={() => {
                              setMobileOpen(false);
                              handleLogout();
                            }}
                            className="flex items-center justify-center gap-2 w-full rounded-md py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] text-red-700/80 transition-colors hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4 text-red-600/80" />
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            onClick={() => setMobileOpen(false)}
                            className="block w-full rounded-md py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] text-charcoal/80 transition-colors hover:bg-beige-100"
                          >
                            Member Login
                          </Link>
                          <Link
                            href="/signup"
                            onClick={() => setMobileOpen(false)}
                            className="block w-full rounded-md bg-gold py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-gold/90"
                          >
                            Join
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