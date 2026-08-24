"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/components/auth/auth-context";
import { BookingProvider, useBooking } from "@/components/booking/booking-context";
import BookingStepper from "@/components/booking/booking-stepper";
import ReservationTimer from "@/components/booking/reservation-timer";
import BookingConfirmation from "@/components/booking/booking-confirmation";
import StepCategory from "@/components/booking/steps/step-category";
import StepEquipment from "@/components/booking/steps/step-equipment";
import StepRequirement from "@/components/booking/steps/step-requirement";
import StepPhotos from "@/components/booking/steps/step-photos";
import StepDate from "@/components/booking/steps/step-date";
import StepTime from "@/components/booking/steps/step-time";
import StepDetails from "@/components/booking/steps/step-details";
import StepAddress from "@/components/booking/steps/step-address";
import StepReview from "@/components/booking/steps/step-review";
import type { ServiceCategoryId } from "@/types/service";

const stepComponents = [
  StepCategory,
  StepEquipment,
  StepRequirement,
  StepPhotos,
  StepDate,
  StepTime,
  StepDetails,
  StepAddress,
  StepReview,
];

function BookingFlowInner() {
  const { step, direction, bookingResult, form, setField } = useBooking();
  const { user } = useAuth();
  const reducedMotion = useReducedMotion();

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

  if (bookingResult) {
    return (
      <motion.div
        className="container-ags py-12 lg:py-16"
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: "easeOut" }}
      >
        <BookingConfirmation record={bookingResult} />
      </motion.div>
    );
  }

  const StepComponent = stepComponents[step];

  return (
    <div className="container-ags py-10 lg:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="text-center sm:text-left">
          <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
            AGS booking
          </span>
          <h1 className="mt-3 font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">
            Book a Service
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Share the job details now so the engineer arrives better prepared.
          </p>
        </div>
        <div className="mt-6">
          <BookingStepper />
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-brand-100 bg-white p-5 shadow-xl shadow-navy-900/10 sm:p-8">
          <ReservationTimer />
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={{
                enter: (value: number) => ({
                  x: reducedMotion ? 0 : value > 0 ? 42 : -42,
                  opacity: reducedMotion ? 1 : 0,
                }),
                center: { x: 0, opacity: 1 },
                exit: (value: number) => ({
                  x: reducedMotion ? 0 : value > 0 ? -42 : 42,
                  opacity: reducedMotion ? 1 : 0,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          You can change your selection later.
        </p>
      </div>
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
