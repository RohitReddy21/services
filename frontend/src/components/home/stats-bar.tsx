"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";

const stats = [
  { value: "10+", target: 10, suffix: "+", label: "Years Experience" },
  { value: "500+", target: 500, suffix: "+", label: "Projects Completed" },
  { value: "1000+", target: 1000, suffix: "+", label: "Happy Customers" },
  { value: "24/7", target: null, suffix: "", label: "Emergency Support" },
];

export default function StatsBar() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="container-ags relative z-10 -mt-8 pb-6">
      <motion.div
        className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-brand-100 bg-brand-100 shadow-xl shadow-navy-900/10 sm:grid-cols-4"
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.48, ease: "easeOut" }}
      >
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white/95 px-6 py-7 text-center backdrop-blur">
            <AnimatedValue {...stat} />
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function AnimatedValue({
  value,
  target,
  suffix,
}: {
  value: string;
  target: number | null;
  suffix: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reducedMotion = useReducedMotion();
  const count = useMotionValue(0);
  const display = useTransform(count, (latest) => `${Math.round(latest)}${suffix}`);

  useEffect(() => {
    if (!inView || target === null || reducedMotion) return;
    const controls = animate(count, target, {
      duration: target > 100 ? 1.35 : 0.9,
      ease: "easeOut",
    });
    return controls.stop;
  }, [count, inView, reducedMotion, target]);

  if (target === null || reducedMotion) {
    return (
      <p ref={ref} className="font-display text-3xl font-extrabold text-brand-600 sm:text-4xl">
        {value}
      </p>
    );
  }

  return (
    <motion.p ref={ref} className="font-display text-3xl font-extrabold text-brand-600 sm:text-4xl">
      {display}
    </motion.p>
  );
}
