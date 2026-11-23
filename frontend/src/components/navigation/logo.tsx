import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** "inverted" sits directly on a dark surface; "default" adds its own black plate for light surfaces. */
  variant?: "default" | "inverted";
  /** Kept for API compatibility — the artwork already contains the full company name. */
  showTagline?: boolean;
}

export default function Logo({ className, variant = "default" }: LogoProps) {
  const onDark = variant === "inverted";

  return (
    <Link
      href="/"
      className={cn("inline-flex shrink-0 items-center", className)}
      aria-label="AGS Air Conditioning & Refrigeration Ltd, home"
    >
      <Image
        src="/images/logo.webp"
        alt="AGS Air Conditioning & Refrigeration Ltd"
        width={1100}
        height={610}
        priority
        sizes="120px"
        className={cn(
          "h-14 w-auto select-none",
          onDark ? "mix-blend-lighten" : "rounded-xl bg-black px-1.5 py-0.5"
        )}
      />
    </Link>
  );
}
