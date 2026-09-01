"use client";

import {
  Component,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Guards an expensive WebGL <Canvas> subtree so it can never take the page
 * down with it:
 *
 *  - It only mounts the canvas once it scrolls near the viewport, and
 *    unmounts it again when it's well out of view. Keeping at most one heavy
 *    canvas alive at a time avoids exhausting the browser's WebGL context
 *    budget, which was triggering repeated "THREE.WebGLRenderer: Context
 *    Lost" loops that froze the main thread (and blocked navigation).
 *  - If the 3D subtree throws (WebGL unavailable, driver crash, a hard
 *    context loss), the error boundary swaps in the static fallback instead
 *    of bubbling up and blanking the tree.
 */

class CanvasErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[CanvasGuard] 3D scene failed, showing fallback:", error);
    }
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

export default function CanvasGuard({
  children,
  fallback = null,
  /** Distance outside the viewport (px) at which the canvas mounts/unmounts. */
  rootMargin = "300px",
  className = "size-full",
}: {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  className?: string;
}) {
  const holderRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = holderRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setVisible(entry.isIntersecting);
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={holderRef} className={className}>
      {visible ? (
        <CanvasErrorBoundary fallback={fallback}>{children}</CanvasErrorBoundary>
      ) : (
        fallback
      )}
    </div>
  );
}
