import { type ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const variantStyles = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 ags-extrude",
  secondary:
    "bg-white text-navy-900 border border-slate-200 hover:border-brand-300 hover:bg-brand-50 ags-depth-sm ags-lift-sm",
  outline:
    "bg-transparent text-white border border-white/40 hover:bg-white/10 hover:shadow-lg hover:shadow-white/10",
  ghost: "bg-transparent text-navy-700 hover:bg-slate-100 hover:text-brand-700",
  gold: "bg-accent-gold-500 text-navy-950 hover:bg-accent-gold-600 ags-extrude ags-extrude-gold",
} as const;

const sizeStyles = {
  sm: "h-9 px-4 text-sm rounded-lg",
  md: "h-11 px-5 text-sm rounded-lg",
  lg: "h-12 px-6 text-base rounded-xl",
} as const;

interface ButtonBaseProps {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  className?: string;
}

type ButtonProps = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

interface ButtonLinkProps extends ButtonBaseProps {
  href: string;
  children?: React.ReactNode;
  target?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "ags-focus inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  href,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "ags-focus inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
