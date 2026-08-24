"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronDown, LogOut, Menu, User, X } from "lucide-react";
import Logo from "@/components/navigation/logo";
import { ButtonLink } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-context";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "All Services", href: "/services" },
      { label: "Air Conditioning", href: "/services?category=air-conditioning" },
      { label: "Refrigeration", href: "/services?category=refrigeration" },
    ],
  },
  { label: "Care Plans", href: "/subscriptions" },
  { label: "About Us", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Service Areas", href: "/service-areas" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    setAccountOpen(false);
    await logout();
    router.push("/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("?")[0]);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-slate-200 bg-white/90 shadow-sm shadow-navy-900/5 backdrop-blur-xl"
          : "border-transparent bg-white/72 backdrop-blur-md"
      )}
    >
      <div
        className={cn(
          "container-ags flex items-center justify-between gap-6 transition-all duration-300",
          scrolled ? "h-16 py-2" : "h-18 py-3"
        )}
      >
        <Logo />

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) =>
            link.children ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "ags-focus group relative flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "text-brand-700"
                      : "text-navy-800 hover:text-brand-600"
                  )}
                >
                  {link.label}
                  <ChevronDown className="size-3.5" />
                  <span
                    className={cn(
                      "absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-brand-500 transition-transform",
                      isActive(link.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </Link>
                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute left-0 top-full pt-2 w-56"
                    >
                      <div className="rounded-xl border border-brand-100 bg-white p-2 shadow-xl shadow-navy-900/10">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="ags-focus block rounded-lg px-3 py-2 text-sm font-medium text-navy-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "ags-focus group relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "text-brand-700"
                    : "text-navy-800 hover:text-brand-600"
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-brand-500 transition-transform",
                    isActive(link.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </Link>
            )
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {!loading && !user && (
            <>
              <Link
                href="/login"
                className="ags-focus rounded-lg px-3 py-2 text-sm font-medium text-navy-800 transition-colors hover:bg-slate-100"
              >
                Log In
              </Link>
              <ButtonLink href="/register" variant="secondary" size="md">
                Sign Up
              </ButtonLink>
            </>
          )}
          {!loading && user && (
            <div
              className="relative"
              onMouseEnter={() => setAccountOpen(true)}
              onMouseLeave={() => setAccountOpen(false)}
            >
              <button
                type="button"
                aria-expanded={accountOpen}
                className="ags-focus flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-navy-800 transition-colors hover:bg-slate-100"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                {user.name.split(" ")[0]}
                <ChevronDown className="size-3.5" />
              </button>
              <AnimatePresence>
                {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute right-0 top-full pt-2 w-52"
                    >
                    <div className="rounded-xl border border-brand-100 bg-white p-2 shadow-xl shadow-navy-900/10">
                      <Link
                        href="/account"
                        className="ags-focus flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
                      >
                        <User className="size-4" />
                        My Account
                      </Link>
                      <Link
                        href="/account/bookings"
                        className="ags-focus flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
                      >
                        <Calendar className="size-4" />
                        My Bookings
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="ags-focus flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="size-4" />
                        Log Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <ButtonLink href="/book" size="md">
            Book a Service
          </ButtonLink>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="ags-focus lg:hidden inline-flex size-10 items-center justify-center rounded-lg text-navy-800 hover:bg-slate-100"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="overflow-hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl lg:hidden"
          >
            <div className="container-ags flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "ags-focus rounded-lg px-3 py-2.5 text-sm font-medium",
                      isActive(link.href)
                        ? "bg-brand-50 text-brand-700"
                        : "text-navy-800 hover:bg-slate-100"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              {!loading && !user && (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium text-navy-800 rounded-lg hover:bg-slate-100"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium text-navy-800 rounded-lg hover:bg-slate-100"
                  >
                    Sign Up
                  </Link>
                </>
              )}
              {!loading && user && (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium text-navy-800 rounded-lg hover:bg-slate-100"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/account/bookings"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium text-navy-800 rounded-lg hover:bg-slate-100"
                  >
                    My Bookings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-2.5 text-left text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
                  >
                    Log Out
                  </button>
                </>
              )}
              <ButtonLink
                href="/book"
                size="md"
                className="mt-2 w-full"
                onClick={() => setMobileOpen(false)}
              >
                Book a Service
              </ButtonLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
