import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "brand" | "success" | "warning" | "danger" | "info" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  brand: "bg-brand-50 text-brand-700",
  success: "bg-accent-green-50 text-accent-green-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-purple-50 text-purple-700",
  neutral: "bg-slate-100 text-slate-500",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-[11px]",
} as const;

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone: BadgeTone;
  size?: keyof typeof sizeClasses;
}

export function StatusBadge({ tone, size = "md", className, children, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn("rounded-full font-semibold", toneClasses[tone], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </span>
  );
}
