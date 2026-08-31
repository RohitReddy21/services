import { type HTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type CardVariant = "flat" | "resting" | "interactive" | "glass" | "elevated";
export type CardPadding = "none" | "sm" | "md" | "lg" | "xl";

export const cardVariantClasses: Record<CardVariant, string> = {
  flat: "rounded-2xl border border-slate-200 bg-white",
  resting: "rounded-2xl border border-slate-200 bg-white ags-depth-sm",
  interactive:
    "rounded-2xl border border-slate-200 bg-white ags-depth-md ags-lift hover:border-brand-200",
  glass: "rounded-2xl border border-white/70 bg-white/90 ags-depth-md backdrop-blur",
  elevated: "rounded-2xl border border-slate-200 bg-white ags-depth-lg",
};

export const cardPaddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
  xl: "p-8",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

export function Card({ variant = "resting", padding = "none", className, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariantClasses[variant], cardPaddingClasses[padding], className)}
      {...props}
    />
  );
}

interface CardLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: CardVariant;
  padding?: CardPadding;
}

export function CardLink({
  href,
  variant = "interactive",
  padding = "md",
  className,
  children,
  ...props
}: CardLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "ags-focus block",
        cardVariantClasses[variant],
        cardPaddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
