"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronDown, LogOut, Menu, Search, User, X } from "lucide-react";
import Logo from "@/components/navigation/logo";
import NavSearch from "@/components/navigation/nav-search";
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
      { label: "Electrical", href: "/services?category=electrical" },
    ],
  },
  {
    label: "Company",
    href: "/about",
    children: [
      { label: "Care Plans", href: "/subscriptions" },
      { label: "About Us", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Service Areas", href: "/service-areas" },
      { label: "Help Center", href: "/help" },
    ],
  },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setMobileDropdown(null);
  };
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

  // Send people back to the page they were on after they log in, rather than
  // always dumping them on /account.
  const onAuthPage = ["/login", "/register", "/forgot-password", "/reset-password"].some((p) =>
    pathname.startsWith(p)
  );
  const loginHref =
    pathname && pathname !== "/" && !onAuthPage
      ? `/login?redirect=${encodeURIComponent(pathname)}`
      : "/login";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("?")[0]);
  };

  const isLinkActive = (link: (typeof navLinks)[number]) =>
    link.children ? link.children.some((child) => isActive(child.href)) : isActive(link.href);

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
                onMouseEnter={() => setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "ags-focus group relative flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                    isLinkActive(link)
                      ? "text-brand-700"
                      : "text-navy-800 hover:text-brand-600"
                  )}
                >
                  {link.label}
                  <ChevronDown className="size-3.5" />
                  <span
                    className={cn(
                      "absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-brand-500 transition-transform",
                      isLinkActive(link) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </Link>
                <AnimatePresence>
                  {openDropdown === link.label && (
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
                  isLinkActive(link)
                    ? "text-brand-700"
                    : "text-navy-800 hover:text-brand-600"
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-brand-500 transition-transform",
                    isLinkActive(link) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </Link>
            )
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <NavSearch />
          {!loading && !user && (
            <>
              <Link
                href={loginHref}
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
          className="ags-focus relative lg:hidden inline-flex size-10 items-center justify-center rounded-full text-navy-800 transition-colors hover:bg-slate-100 active:scale-95"
        >
          <AnimatePresence mode="wait" initial={false}>
            {mobileOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.16 }}
                className="flex"
              >
                <X className="size-6" />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.16 }}
                className="flex"
              >
                <Menu className="size-6" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="overflow-hidden border-t border-slate-200 bg-white/95 shadow-lg shadow-navy-900/5 backdrop-blur-xl lg:hidden"
          >
            <div className="container-ags flex max-h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto py-4">
              <MobileSearch onNavigate={closeMobileMenu} />

              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className="mb-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileDropdown((prev) => (prev === link.label ? null : link.label))
                      }
                      aria-expanded={mobileDropdown === link.label}
                      className={cn(
                        "ags-focus flex w-full items-center justify-between rounded-lg px-3 py-3 text-[15px] font-medium transition-colors",
                        isLinkActive(link)
                          ? "text-brand-700"
                          : "text-navy-800 hover:bg-slate-100"
                      )}
                    >
                      {link.label}
                      <ChevronDown
                        className={cn(
                          "size-4 text-slate-400 transition-transform duration-200",
                          mobileDropdown === link.label && "rotate-180 text-brand-600"
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {mobileDropdown === link.label && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mb-1 ml-2 space-y-0.5 rounded-xl border border-brand-100 bg-slate-25 p-2">
                            {link.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={closeMobileMenu}
                                className={cn(
                                  "ags-focus block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                  isActive(child.href)
                                    ? "bg-brand-50 text-brand-700"
                                    : "text-navy-700 hover:bg-white hover:text-brand-600"
                                )}
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
                    onClick={closeMobileMenu}
                    className={cn(
                      "ags-focus rounded-lg px-3 py-3 text-[15px] font-medium transition-colors",
                      isActive(link.href)
                        ? "bg-brand-50 text-brand-700"
                        : "text-navy-800 hover:bg-slate-100"
                    )}
                  >
                    {link.label}
                  </Link>
                )
              )}

              <div className="my-2 h-px bg-slate-200" />

              {!loading && user && (
                <div className="mb-1 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy-900">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
              )}

              {!loading && !user && (
                <div className="flex gap-2">
                  <Link
                    href={loginHref}
                    onClick={closeMobileMenu}
                    className="ags-focus flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-medium text-navy-800 transition-colors hover:bg-slate-100"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="ags-focus flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-center text-sm font-medium text-navy-800 transition-colors hover:bg-slate-100"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
              {!loading && user && (
                <>
                  <Link
                    href="/account"
                    onClick={closeMobileMenu}
                    className="ags-focus flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-800 transition-colors hover:bg-slate-100"
                  >
                    <User className="size-4 text-slate-400" />
                    My Account
                  </Link>
                  <Link
                    href="/account/bookings"
                    onClick={closeMobileMenu}
                    className="ags-focus flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-800 transition-colors hover:bg-slate-100"
                  >
                    <Calendar className="size-4 text-slate-400" />
                    My Bookings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      handleLogout();
                    }}
                    className="ags-focus flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="size-4" />
                    Log Out
                  </button>
                </>
              )}
              <ButtonLink
                href="/book"
                size="md"
                className="mt-2 w-full"
                onClick={closeMobileMenu}
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

function MobileSearch({ onNavigate }: { onNavigate: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/services?q=${encodeURIComponent(trimmed)}`);
    onNavigate();
  };

  return (
    <form onSubmit={handleSubmit} className="relative mb-2">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        type="text"
        placeholder="Search services..."
        aria-label="Search services"
        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-25 pl-9 pr-3 text-sm text-navy-900 placeholder:text-slate-400 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
      />
    </form>
  );
}
