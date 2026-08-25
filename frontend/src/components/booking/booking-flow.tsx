"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Clock, Headphones, PackageCheck, Phone, ShieldCheck } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { BookingProvider, STEP_LABELS, useBooking } from "@/components/booking/booking-context";
import BookingConfirmation from "@/components/booking/booking-confirmation";
import BookingStepper from "@/components/booking/booking-stepper";
import ReservationTimer from "@/components/booking/reservation-timer";
import StageAddressContact from "@/components/booking/stages/stage-address-contact";
import StageDateTime from "@/components/booking/stages/stage-date-time";
import StageDetails from "@/components/booking/stages/stage-details";
import StageService from "@/components/booking/stages/stage-service";
import StepReview from "@/components/booking/steps/step-review";
import { ButtonLink } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loaders";
import type { ServiceCategoryId } from "@/types/service";

const stepComponents = [
  StageService,
  StageDetails,
  StageDateTime,
  StageAddressContact,
  StepReview,
];

function BookingFlowInner() {
  const { step, direction, bookingResult, form, setField } = useBooking();
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (loading || user) return;
    const query = searchParams.toString();
    const returnTo = `${pathname}${query ? `?${query}` : ""}`;
    router.replace(`/login?redirect=${encodeURIComponent(returnTo)}`);
  }, [loading, pathname, router, searchParams, user]);

  useEffect(() => {
    if (user && !form.customer.fullName) {
      setField("customer", {
        ...form.customer,
        fullName: user.name,
        email: user.email,
        phone: user.phone,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading || !user) {
    return <PageLoader compact label="Checking sign in" />;
  }

  const StepComponent = stepComponents[step] ?? StageService;

  if (bookingResult) {
    return (
      <motion.div
        className="container-ags py-6 lg:py-8"
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: "easeOut" }}
      >
        <BookingHeader />
        <div className="mt-5 rounded-lg border border-brand-100 bg-white px-3 py-4 shadow-sm shadow-navy-900/5">
          <BookingStepper />
        </div>
        <div className="mt-6">
          <BookingConfirmation record={bookingResult} />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="container-ags py-6 lg:py-8">
      <BookingHeader />

      <div className="mt-5 rounded-lg border border-brand-100 bg-white px-3 py-4 shadow-sm shadow-navy-900/5">
        <BookingStepper />
      </div>

      <section className="mt-5 overflow-hidden rounded-lg border border-brand-100 bg-white shadow-xl shadow-navy-900/10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-25 px-4 py-3 text-xs font-semibold text-slate-500 sm:px-6">
          <span className="flex items-center gap-2 text-navy-800">
            <PackageCheck className="size-4 text-brand-600" />
            {STEP_LABELS[step]}
          </span>
          <span>Every day and listed time slot is available.</span>
        </div>

        <div className="p-4 sm:p-6 lg:p-7">
          <ReservationTimer />
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={{
                enter: (value: number) => ({
                  x: reducedMotion ? 0 : value > 0 ? 34 : -34,
                  opacity: reducedMotion ? 1 : 0,
                }),
                center: { x: 0, opacity: 1 },
                exit: (value: number) => ({
                  x: reducedMotion ? 0 : value > 0 ? -34 : 34,
                  opacity: reducedMotion ? 1 : 0,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <BookingTrustBar />
    </div>
  );
}

function BookingHeader() {
  return (
    <header className="grid gap-5 border-b border-brand-100 pb-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600">
          AGS service request
        </p>
        <h1 className="mt-2 font-display text-xl font-extrabold text-navy-900 sm:text-2xl">
          Book a Service
        </h1>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-500">
          Professional. Reliable. On Time.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs shadow-sm shadow-navy-900/5 md:min-w-64">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Need Help?</p>
        <a
          href="tel:02079460018"
          className="mt-2 flex items-center gap-2 font-bold text-navy-900 hover:text-brand-700"
        >
          <Phone className="size-4 text-brand-600" />
          020 7946 0018
        </a>
        <p className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Clock className="size-4 text-brand-600" />
          Mon - Sat: 8:00 AM - 6:00 PM
        </p>
      </div>
    </header>
  );
}

function BookingTrustBar() {
  return (
    <div className="mt-5 grid gap-3 rounded-lg border border-brand-100 bg-white p-3 shadow-sm shadow-navy-900/5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-center">
      <TrustItem icon={CheckCircle2} title="Certified Engineers" text="Highly trained professionals" />
      <TrustItem icon={Clock} title="Fast Response" text="Every day scheduling" />
      <TrustItem icon={ShieldCheck} title="Secure Booking" text="Your data is protected" />
      <ButtonLink href="/contact" variant="secondary" className="justify-center">
        <Headphones className="size-4" />
        Contact Support
      </ButtonLink>
    </div>
  );
}

function TrustItem({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof CheckCircle2;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 px-2 py-2">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="size-4" />
      </span>
      <span>
        <span className="block text-xs font-bold text-navy-900">{title}</span>
        <span className="text-xs text-slate-500">{text}</span>
      </span>
    </div>
  );
}

export default function BookingFlow({
  initialCategory,
}: {
  initialCategory?: ServiceCategoryId;
}) {
  return (
    <BookingProvider
      initial={initialCategory ? { categoryId: initialCategory } : undefined}
      initialStep={initialCategory ? 1 : 0}
    >
      <BookingFlowInner />
    </BookingProvider>
  );
}
