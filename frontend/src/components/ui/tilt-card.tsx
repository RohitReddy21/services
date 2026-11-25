import type { HTMLAttributes } from "react";

interface TiltCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Kept so existing call sites compile; the tilt effect has been retired. */
  max?: number;
  glare?: boolean;
  /** Classes for the inner body (where the border, radius and shadow live). */
  bodyClassName?: string;
}

/**
 * Plain card wrapper. This used to tilt toward the cursor with a specular
 * glare; that read as a template effect, so it now just lays out its body.
 */
export default function TiltCard({
  max: _max,
  glare: _glare,
  className,
  bodyClassName,
  children,
  ...props
}: TiltCardProps) {
  return (
    <div className={className} {...props}>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
