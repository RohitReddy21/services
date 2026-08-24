"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Fan } from "lucide-react";

const HvacFanMesh = dynamic(() => import("./hvac-fan-mesh"), {
  ssr: false,
  loading: () => <Fan className="size-10 animate-spin text-brand-300" />,
});

export default function Hero3DAccent({ className }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isSmallScreen = window.innerWidth < 640;
    const frame = window.requestAnimationFrame(() => {
      setEnabled(!reducedMotion && !isSmallScreen);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!enabled) {
    return (
      <div
        className={className}
        aria-hidden="true"
      >
        <Fan className="size-10 text-brand-300" />
      </div>
    );
  }

  return (
    <div className={className} aria-hidden="true">
      <HvacFanMesh />
    </div>
  );
}
