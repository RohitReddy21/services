"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { emptyBookingForm, type BookingFormData, type BookingRecord } from "@/types/booking";
import { reserveSlot as apiReserveSlot, submitBooking as apiSubmitBooking } from "@/lib/api/booking-client";

export const STEP_LABELS = [
  "Service",
  "Equipment",
  "Requirement",
  "Photos",
  "Date",
  "Time",
  "Details",
  "Address",
  "Review",
] as const;

interface BookingContextValue {
  step: number;
  direction: 1 | -1;
  form: BookingFormData;
  reservation: { id: string; expiresAt: number } | null;
  submitting: boolean;
  error: string | null;
  bookingResult: BookingRecord | null;
  setField: <K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) => void;
  addPhotos: (photos: BookingFormData["photos"]) => void;
  updatePhoto: (id: string, patch: Partial<BookingFormData["photos"][number]>) => void;
  removePhoto: (id: string) => void;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: number) => void;
  reserve: (date: string, slotId: string) => Promise<boolean>;
  submit: () => Promise<boolean>;
  clearError: () => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({
  children,
  initial,
  initialStep = 0,
}: {
  children: ReactNode;
  initial?: Partial<BookingFormData>;
  initialStep?: number;
}) {
  const [step, setStep] = useState(initialStep);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [form, setForm] = useState<BookingFormData>({ ...emptyBookingForm, ...initial });
  const [reservation, setReservation] = useState<{ id: string; expiresAt: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingRecord | null>(null);

  const setField = useCallback(
    <K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const addPhotos = useCallback((photos: BookingFormData["photos"]) => {
    setForm((prev) => ({ ...prev, photos: [...prev.photos, ...photos] }));
  }, []);

  const updatePhoto = useCallback((id: string, patch: Partial<BookingFormData["photos"][number]>) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, []);

  const removePhoto = useCallback((id: string) => {
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((p) => p.id !== id) }));
  }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }, []);
  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);
  const goToStep = useCallback((s: number) => {
    setDirection(s >= step ? 1 : -1);
    setStep(s);
  }, [step]);
  const clearError = useCallback(() => setError(null), []);

  const reserve = useCallback(
    async (date: string, slotId: string) => {
      setError(null);
      try {
        const result = await apiReserveSlot(
          date,
          slotId,
          form.categoryId ?? "",
          form.equipmentId ?? ""
        );
        setReservation({ id: result.reservationId, expiresAt: result.expiresAt });
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "That slot is no longer available.");
        return false;
      }
    },
    [form.categoryId, form.equipmentId]
  );

  const submit = useCallback(async () => {
    if (!reservation) {
      setError("Your time slot reservation has expired. Please choose a new time.");
      return false;
    }
    setSubmitting(true);
    setError(null);
    try {
      const record = await apiSubmitBooking(reservation.id, form);
      setBookingResult(record);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't submit your booking.");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [reservation, form]);

  const value = useMemo(
    () => ({
      step,
      direction,
      form,
      reservation,
      submitting,
      error,
      bookingResult,
      setField,
      addPhotos,
      updatePhoto,
      removePhoto,
      goNext,
      goBack,
      goToStep,
      reserve,
      submit,
      clearError,
    }),
    [step, direction, form, reservation, submitting, error, bookingResult, setField, addPhotos, updatePhoto, removePhoto, goNext, goBack, goToStep, reserve, submit, clearError]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within a BookingProvider");
  return ctx;
}
