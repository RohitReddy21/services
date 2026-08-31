"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * Gentle scroll-linked vertical parallax. Wrap an absolutely-positioned image
 * layer; it drifts as the section moves through the viewport. No-op under
 * reduced-motion.
 */
export default function Parallax({
  children,
  /** Total travel in px across the scroll range. Positive = moves down slower. */
  amount = 60,
  className,
  style,
}: {
  children: ReactNode;
  amount?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [-amount, amount]), {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  if (reduce) {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} className={className} style={{ ...style, y }}>
      {children}
    </motion.div>
  );
}
