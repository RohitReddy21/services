import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, ClipboardCheck, MessageSquare, Wrench } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How It Works",
  description: "How booking an air conditioning or refrigeration service with AGS works, from request to completion.",
};

const steps = [
  {
    icon: ClipboardCheck,
    title: "Tell Us What You Need",
    description:
      "Browse our air conditioning and refrigeration services, or head straight to booking. Select your equipment, the type of work needed, and add photos if it helps.",
  },
  {
    icon: CalendarCheck,
    title: "Pick a Date & Time",
    description:
      "Choose a date and time slot that works for you from our live availability — no back-and-forth needed.",
  },
  {
    icon: MessageSquare,
    title: "We Confirm the Details",
    description:
      "Our team reviews your request and gets in touch to confirm the appointment and any details before the visit — including any applicable charges.",
  },
  {
    icon: Wrench,
    title: "Our Engineer Attends",
    description:
      "A certified AGS engineer carries out the work, and you can track the status of your booking from request through to completion in My Account.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-sky-50">
        <div className="container-ags py-4 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-navy-700">How It Works</span>
        </div>
      </div>

      <div className="container-ags py-12 lg:py-20">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            How It Works
          </h1>
          <p className="mt-3 text-slate-600">
            Booking a service with AGS is straightforward, from your first
            request through to a completed job.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <ol className="space-y-10">
            {steps.map((step, index) => (
              <li key={step.title} className="relative flex gap-5">
                {index < steps.length - 1 && (
                  <span className="absolute left-6 top-14 h-[calc(100%-1.5rem)] w-0.5 bg-slate-200" />
                )}
                <span className="z-10 flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm shadow-brand-600/20">
                  <step.icon className="size-5" />
                </span>
                <div className="pt-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                    Step {index + 1}
                  </p>
                  <h2 className="mt-1 font-display text-lg font-bold text-navy-900">
                    {step.title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-slate-200 bg-slate-25 p-6 text-center">
          <p className="text-sm text-slate-600">Ready to get started?</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/book" size="lg">Book a Service</ButtonLink>
            <ButtonLink href="/services" variant="secondary" size="lg">Explore Services</ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
