"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * A drop-in replacement for framer-motion's `whileInView` that can't get
 * stuck invisible.
 *
 * The problem it solves: when a page is opened in a background tab (or the tab
 * is hidden while it hydrates), the browser never delivers an
 * IntersectionObserver callback, so anything gated on `whileInView` stays at
 * its `initial` (hidden) state. Coming back to the tab doesn't fire a fresh
 * intersection for elements that are already on screen, so the content only
 * appears after a manual reload.
 *
 * This hook adds two safety nets on top of the observer:
 *  - re-checks on `visibilitychange` / `pageshow` (bfcache restore), and
 *  - a one-shot deferred check after mount,
 * both of which reveal the element if it is actually on screen.
 */
export function useRevealInView<T extends Element = HTMLDivElement>(
  options: {
    /** Accepted for call-site compatibility; the observer always uses a
     *  0 threshold and tunes the trigger point with `rootMargin` instead. */
    amount?: number;
    once?: boolean;
    rootMargin?: string;
  } = {}
): [RefObject<T | null>, boolean] {
  const { once = true, rootMargin = "0px 0px -8% 0px" } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (inView && once) return;

    let settled = false;

    const isOnScreen = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const vw = window.innerWidth || document.documentElement.clientWidth;
      return r.top < vh && r.bottom > 0 && r.left < vw && r.right > 0;
    };

    const reveal = () => {
      if (settled) return;
      settled = true;
      setInView(true);
      teardown();
    };

    // Always trigger on "any pixel visible" and let `rootMargin` decide how
    // early the reveal fires. A fractional threshold is unusable here: an
    // element taller than the viewport can never reach it (a 3700px card grid
    // on an 844px phone tops out around 0.22), and heights aren't even known
    // up front because images are still loading — which left whole card grids
    // stuck at opacity 0.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) reveal();
          else if (!once) setInView(false);
        }
      },
      { threshold: 0, rootMargin }
    );
    observer.observe(el);

    const recheck = () => {
      if (document.visibilityState === "visible" && isOnScreen()) reveal();
    };
    document.addEventListener("visibilitychange", recheck);
    window.addEventListener("pageshow", recheck);
    const timer = window.setTimeout(recheck, 250);

    function teardown() {
      observer.disconnect();
      document.removeEventListener("visibilitychange", recheck);
      window.removeEventListener("pageshow", recheck);
      window.clearTimeout(timer);
    }

    return teardown;
  }, [once, rootMargin, inView]);

  return [ref, inView];
}
