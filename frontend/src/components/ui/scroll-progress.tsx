"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/**
 * Thin reading-progress bar pinned under the header. Fills left-to-right as the
 * page scrolls. Hidden entirely under reduced-motion.
 */
export default function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-0.5 origin-left bg-linear-to-r from-brand-500 via-brand-400 to-accent-gold-400"
      style={{ scaleX }}
    />
  );
}
