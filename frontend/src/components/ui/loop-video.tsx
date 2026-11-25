"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoopVideoProps {
  /** Path without extension — expects `<src>.mp4` and a `<src>.jpg` poster in /public. */
  src: string;
  className?: string;
}

/**
 * Muted, looping decorative video. Visitors who prefer reduced motion get the
 * still poster frame instead, and the video never takes pointer events or
 * screen-reader attention (it is purely atmospheric).
 */
export default function LoopVideo({ src, className }: LoopVideoProps) {
  const reducedMotion = useReducedMotion();
  const base = cn("pointer-events-none absolute inset-0 size-full object-cover", className);

  if (reducedMotion) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`${src}.jpg`} alt="" aria-hidden="true" className={base} />;
  }

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={`${src}.jpg`}
      className={base}
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={`${src}.mp4`} type="video/mp4" />
    </video>
  );
}
