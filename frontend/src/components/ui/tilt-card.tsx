"use client";

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Maximum rotation on each axis, in degrees. */
  max?: number;
  /** Show a moving specular highlight while pointing at the card. */
  glare?: boolean;
  /** Extra classes for the inner tilting body (where the shadow/radius live). */
  bodyClassName?: string;
}

/**
 * Pointer-driven 3D tilt wrapper. The outer element owns the perspective; the
 * inner `.ags-tilt__body` rotates toward the cursor and exposes CSS custom
 * properties (`--ags-rx/ry`, `--ags-mx/my`) that children and the glare layer
 * read. Tilt is automatically disabled for coarse pointers and reduced motion
 * (handled in globals.css).
 */
export default function TiltCard({
  max = 9,
  glare = false,
  className,
  bodyClassName,
  children,
  ...props
}: TiltCardProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const [active, setActive] = useState(false);

  const apply = useCallback(
    (rx: number, ry: number, mx: number, my: number) => {
      const el = bodyRef.current;
      if (!el) return;
      el.style.setProperty("--ags-rx", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--ags-ry", `${ry.toFixed(2)}deg`);
      if (glare) {
        el.style.setProperty("--ags-mx", `${mx.toFixed(1)}%`);
        el.style.setProperty("--ags-my", `${my.toFixed(1)}%`);
      }
    },
    [glare]
  );

  const handleMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "touch") return;
      const el = bodyRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const ry = (px - 0.5) * max * 2;
      const rx = (0.5 - py) * max * 2;
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => apply(rx, ry, px * 100, py * 100));
    },
    [apply, max]
  );

  const handleEnter = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    setActive(true);
  }, []);

  const handleLeave = useCallback(() => {
    if (frame.current) cancelAnimationFrame(frame.current);
    setActive(false);
    apply(0, 0, 50, 50);
  }, [apply]);

  return (
    <div
      className={cn("ags-tilt", className)}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      {...props}
    >
      <div
        ref={bodyRef}
        data-active={active}
        className={cn("ags-tilt__body relative", bodyClassName)}
        style={{ "--ags-z": "42px" } as CSSProperties}
      >
        {children}
        {glare && <span className="ags-glare" aria-hidden="true" />}
      </div>
    </div>
  );
}
