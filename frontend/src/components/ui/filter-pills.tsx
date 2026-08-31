import { cn } from "@/lib/utils";

interface FilterPillsOption<T extends string> {
  value: T;
  label: string;
}

interface FilterPillsProps<T extends string> {
  options: FilterPillsOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function FilterPills<T extends string>({ options, value, onChange, className }: FilterPillsProps<T>) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "ags-focus rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
            value === option.value
              ? "border-brand-500 bg-brand-50 text-brand-700"
              : "border-slate-200 text-slate-500 hover:border-slate-300"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
