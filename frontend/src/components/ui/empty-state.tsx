import { type ComponentType } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  message: string;
  icon?: ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  variant?: "inline" | "card";
  className?: string;
}

export function EmptyState({ message, icon: Icon, action, variant = "inline", className }: EmptyStateProps) {
  if (variant === "card") {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-25 p-8 text-center",
          className
        )}
      >
        {Icon && <Icon className="size-8 text-slate-300" />}
        <p className="text-sm text-slate-500">{message}</p>
        {action}
      </div>
    );
  }

  if (!Icon && !action) {
    return <p className={cn("text-sm text-slate-500", className)}>{message}</p>;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Icon && <Icon className="size-4 text-slate-300" />}
      <p className="text-sm text-slate-500">{message}</p>
      {action}
    </div>
  );
}
