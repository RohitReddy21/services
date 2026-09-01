"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRevealInView } from "@/hooks/use-reveal-in-view";

export type RevealVariant = "up" | "down" | "left" | "right" | "fade" | "scale" | "blur";

type RevealTag = "div" | "section" | "article" | "aside" | "ul" | "ol" | "li";

interface RevealProps {
  children: ReactNode;
  /** Element to render. Default: "div". */
  as?: RevealTag;
  /** Direction / style of the entrance. Default: "up". */
  variant?: RevealVariant;
  /** Seconds to wait before animating — use for manual stagger. */
  delay?: number;
  /** Travel distance in px for directional variants. Default: 24. */
  distance?: number;
  duration?: number;
  /** Animate only the first time it enters the viewport. Default: true. */
  once?: boolean;
  /** Fraction of the element that must be visible to trigger. Default: 0.2. */
  amount?: number;
  className?: string;
  style?: CSSProperties;
}

const EASE = [0.22, 1, 0.36, 1] as const;

function hidden(variant: RevealVariant, d: number) {
  switch (variant) {
    case "up":
      return { opacity: 0, y: d };
    case "down":
      return { opacity: 0, y: -d };
    case "left":
      return { opacity: 0, x: d };
    case "right":
      return { opacity: 0, x: -d };
    case "scale":
      return { opacity: 0, scale: 0.96 };
    case "blur":
      return { opacity: 0, filter: "blur(10px)" };
    case "fade":
    default:
      return { opacity: 0 };
  }
}

/**
 * Scroll-triggered entrance. A thin wrapper over framer-motion's `whileInView`
 * so every page reveals content the same way. Honours reduced-motion (renders
 * instantly, no transform).
 */
export default function Reveal({
  children,
  as = "div",
  variant = "up",
  delay = 0,
  distance = 24,
  duration = 0.6,
  once = true,
  amount = 0.2,
  className,
  style,
}: RevealProps) {
  const reduce = useReducedMotion();
  const [ref, inView] = useRevealInView<HTMLDivElement>({
    once,
    amount,
    rootMargin: "0px 0px -10% 0px",
  });
  const Tag = as;
  // Runtime picks the right tag; the cast keeps the prop types simple.
  const MotionTag = motion[as] as typeof motion.div;

  if (reduce) {
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    );
  }

  const shown = { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" };

  return (
    <MotionTag
      ref={ref}
      className={className}
      style={style}
      initial={hidden(variant, distance)}
      animate={inView ? shown : hidden(variant, distance)}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Container that staggers its <Reveal>-style children. Wrap items in
 * <RevealItem> — no per-item delay needed.
 */
export function RevealStagger({
  children,
  className,
  step = 0.08,
  once = true,
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  step?: number;
  once?: boolean;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  const [ref, inView] = useRevealInView<HTMLDivElement>({
    once,
    amount,
    rootMargin: "0px 0px -10% 0px",
  });
  if (reduce) return <div className={className}>{children}</div>;

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: step } },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={container}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  variant = "up",
  distance = 20,
  duration = 0.55,
  className,
  style,
}: {
  children: ReactNode;
  variant?: RevealVariant;
  distance?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const item: Variants = {
    hidden: hidden(variant, distance),
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration, ease: EASE },
    },
  };
  return (
    <motion.div className={cn(className)} style={style} variants={item}>
      {children}
    </motion.div>
  );
}
