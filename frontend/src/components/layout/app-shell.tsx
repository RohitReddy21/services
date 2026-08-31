"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { PageLoader } from "@/components/ui/loaders";
import ScrollProgress from "@/components/ui/scroll-progress";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [booting, setBooting] = useState(true);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 720);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setNavigating(false));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    let fallbackTimer: number | undefined;

    const beginNavigation = () => {
      window.clearTimeout(fallbackTimer);
      setNavigating(true);
      fallbackTimer = window.setTimeout(() => setNavigating(false), 1800);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      if (nextUrl.origin !== currentUrl.origin || nextUrl.hash && nextUrl.pathname === currentUrl.pathname) {
        return;
      }

      if (nextUrl.pathname !== currentUrl.pathname || nextUrl.search !== currentUrl.search) {
        beginNavigation();
      }
    };

    window.addEventListener("click", onClick, true);
    window.addEventListener("popstate", beginNavigation);

    return () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", beginNavigation);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {!booting && <ScrollProgress />}

      <AnimatePresence>
        {booting && (
          <motion.div
            key="ags-page-loader"
            className="fixed inset-0 z-[100] bg-white"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.32 }}
          >
            <PageLoader />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {navigating && !booting && (
          <motion.div
            key="ags-route-progress"
            className="fixed inset-x-0 top-0 z-[110] h-1 overflow-hidden bg-brand-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.16 }}
            role="status"
            aria-label="Loading page"
          >
            <motion.div
              className="h-full rounded-r-full bg-brand-500 shadow-lg shadow-brand-500/30"
              initial={{ width: "12%" }}
              animate={{ width: ["12%", "68%", "92%"] }}
              transition={{
                duration: reducedMotion ? 0 : 1.2,
                ease: [0.22, 1, 0.36, 1],
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
