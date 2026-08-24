import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "inverted";
  showTagline?: boolean;
}

export default function Logo({
  className,
  variant = "default",
  showTagline = true,
}: LogoProps) {
  const isInverted = variant === "inverted";

  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5 shrink-0", className)}
      aria-label="AGS - Advanced Gas Solutions, home"
    >
      <LogoMark inverted={isInverted} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-extrabold text-xl tracking-tight",
            isInverted ? "text-white" : "text-navy-900"
          )}
        >
          AGS
        </span>
        {showTagline && (
          <span
            className={cn(
              "text-[9px] font-semibold tracking-[0.14em] uppercase mt-0.5",
              isInverted ? "text-brand-200" : "text-brand-600"
            )}
          >
            Advanced Gas Solutions
          </span>
        )}
      </span>
    </Link>
  );
}

function LogoMark({ inverted }: { inverted: boolean }) {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <circle cx="20" cy="20" r="19" fill={inverted ? "#122a4d" : "#0b1b33"} />
      <circle cx="20" cy="20" r="19" stroke="#cf9f3d" strokeWidth="0.75" />
      <path
        d="M20 8c-3.5 4-6 8.2-6 11.8A6 6 0 0 0 20 26a6 6 0 0 0 6-6.2C26 16.2 23.5 12 20 8Z"
        fill="#2b6bf0"
      />
      <path
        d="M20 13.5c-1.8 2.3-3 4.4-3 6.1A3 3 0 0 0 20 22.5a3 3 0 0 0 3-2.9c0-1.7-1.2-3.8-3-6.1Z"
        fill="#eef4ff"
      />
      <path
        d="M12.5 27.5c1.9-1.6 4.6-2.6 7.5-2.6s5.6 1 7.5 2.6"
        stroke="#16a066"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
