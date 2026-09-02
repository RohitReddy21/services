"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import FadeInImage from "@/components/ui/fade-in-image";

const reviews = [
  {
    text: "AGS provided an excellent service. Our cold room is working perfectly and the engineer was very professional.",
    author: "Sarah J.",
    role: "Restaurant Owner",
  },
  {
    text: "Quick response for an emergency repair and the engineer explained the issue clearly before fixing it.",
    author: "Amelia R.",
    role: "Home Customer",
  },
  {
    text: "Reliable maintenance contract for our restaurant sites. The visits are tidy, documented and on time.",
    author: "Tom W.",
    role: "Operations Manager",
  },
];

export default function Testimonials() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container-ags grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-90px" }}
          transition={{ duration: 0.58, ease: "easeOut" }}
        >
          <div className="relative aspect-4/5 overflow-hidden rounded-[2rem] shadow-2xl shadow-navy-900/15 sm:aspect-16/10 lg:aspect-4/5">
            <FadeInImage
              src="/images/services/display-fridge.webp"
              alt="Display refrigeration installed in a commercial environment"
              fill
              sizes="(min-width: 1024px) 40vw, 92vw"
              className="object-cover ags-image-reveal"
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink-950/55 via-transparent to-transparent" />
          </div>
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-90px" }}
          transition={{ duration: 0.58, ease: "easeOut" }}
        >
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-5 fill-accent-gold-500 text-accent-gold-500" />
            ))}
          </div>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            4.9/5 from customers who need systems to keep working.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Reviews focus on the practical details: punctual engineers, clear
            explanations, tidy work and reliable equipment after the visit.
          </p>

          <div className="mt-7 grid gap-4">
            {reviews.map((review, index) => (
              <motion.blockquote
                key={review.author}
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.38, delay: index * 0.06 }}
                className="rounded-2xl border border-slate-200 bg-slate-25 p-5"
              >
                <Quote className="size-5 text-brand-500" />
                <p className="mt-3 text-sm italic leading-relaxed text-navy-800">
                  &ldquo;{review.text}&rdquo;
                </p>
                <footer className="mt-4 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {review.author.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{review.author}</p>
                    <p className="text-xs text-slate-500">{review.role}</p>
                  </div>
                </footer>
              </motion.blockquote>
            ))}
          </div>

          <ButtonLink href="/services" variant="secondary" size="md" className="mt-6">
            View All Reviews
          </ButtonLink>
        </motion.div>
      </div>
    </section>
  );
}
