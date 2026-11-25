import Link from "next/link";
import type { ReactNode } from "react";
import FadeInImage from "@/components/ui/fade-in-image";
import Reveal from "@/components/ui/reveal";

interface PageHeroProps {
  /** Label for the current page in the breadcrumb. */
  crumb: string;
  eyebrow?: string;
  title: ReactNode;
  /** Optional trailing words in the title rendered with the brand gradient. */
  highlight?: string;
  description?: ReactNode;
  /** Optional supporting image shown on large screens. */
  image?: { src: string; alt: string };
  /** Extra content under the description (actions, badges, search...). */
  children?: ReactNode;
}

/**
 * Shared header for inner pages: dark blueprint band, breadcrumb, eyebrow,
 * oversized title and optional image. Keeps every page opening the same way as
 * the homepage hero so the whole site reads as one product.
 */
export default function PageHero({
  crumb,
  eyebrow,
  title,
  highlight,
  description,
  image,
  children,
}: PageHeroProps) {
  return (
    <header className="relative overflow-hidden bg-ink-950 text-white">
      <div aria-hidden="true" className="ags-blueprint absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 size-120 rounded-full bg-brand-500/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 right-0 size-96 rounded-full bg-accent-gold-500/10 blur-3xl"
      />

      <div className="container-ags relative py-12 lg:py-20">
        <nav aria-label="Breadcrumb" className="text-xs font-medium text-slate-400">
          <Link href="/" className="transition-colors hover:text-white">
            Home
          </Link>
          <span className="mx-2 text-slate-600">/</span>
          <span className="text-slate-200">{crumb}</span>
        </nav>

        <div
          className={
            image
              ? "mt-8 grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center"
              : "mt-8"
          }
        >
          <Reveal className="max-w-3xl">
            {eyebrow && <span className="ags-eyebrow text-brand-300">{eyebrow}</span>}
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {title}
              {highlight && (
                <>
                  {" "}
                  <span className="ags-gradient-text">{highlight}</span>
                </>
              )}
            </h1>
            {description && (
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {description}
              </p>
            )}
            {children && <div className="mt-8">{children}</div>}
          </Reveal>

          {image && (
            <Reveal
              variant="right"
              delay={0.1}
              className="relative hidden aspect-16/10 overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40 lg:block"
            >
              <FadeInImage
                src={image.src}
                alt={image.alt}
                fill
                priority
                sizes="420px"
                className="object-cover ags-image-reveal"
              />
              <div className="absolute inset-0 bg-ink-950/40" />
            </Reveal>
          )}
        </div>
      </div>
    </header>
  );
}
