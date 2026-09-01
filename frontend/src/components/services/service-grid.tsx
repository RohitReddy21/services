"use client";

import { motion, useReducedMotion } from "framer-motion";
import ServiceCard from "@/components/services/service-card";
import type { ServiceSummary } from "@/types/service";
import { cn } from "@/lib/utils";
import { useRevealInView } from "@/hooks/use-reveal-in-view";

export default function ServiceGrid({
  services,
  className,
}: {
  services: ServiceSummary[];
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const [ref, inView] = useRevealInView<HTMLDivElement>({ once: true, rootMargin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className={cn("grid grid-cols-2 gap-4 [perspective:1200px] sm:grid-cols-3 lg:grid-cols-4", className)}
      initial={reducedMotion ? false : "hidden"}
      animate={reducedMotion || inView ? "show" : "hidden"}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.065,
          },
        },
      }}
    >
      {services.map((service) => (
        <motion.div
          key={service.id}
          className="h-full"
          variants={{
            hidden: { opacity: 0, y: 24, rotateX: 7, scale: 0.97 },
            show: { opacity: 1, y: 0, rotateX: 0, scale: 1 },
          }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          <ServiceCard service={service} />
        </motion.div>
      ))}
    </motion.div>
  );
}
