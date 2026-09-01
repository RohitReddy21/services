"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { emptyBookingForm, type BookingFormData, type BookingRecord } from "@/types/booking";
import { reserveSlot as apiReserveSlot, submitBooking as apiSubmitBooking } from "@/lib/api/booking-client";

// --- Draft persistence -------------------------------------------------------
// The wizard keeps its state in memory, so a page reload (or an accidental
// refresh mid-booking) would otherwise send the user back to step 1. We mirror
// the in-progress draft into sessionStorage and rehydrate it on mount so the
// booking resumes exactly where it left off.
const DRAFT_KEY = "ags:booking-draft:v1";
const DRAFT_MAX_AGE_MS = 6 * 60 * 60 * 1000; // safety cap; sessionStorage clears on tab close anyway

type PersistedDraft = {
  step: number;
  form: BookingFormData;
  reservation: { id: string; expiresAt: number } | null;
  savedAt: number;
};

/**
 * Blob preview URLs (`blob:`) and in-flight uploads can't survive a reload, so
 * only photos that finished uploading (and have a real remote URL) are kept.
 */
function draftSafeForm(form: BookingFormData): BookingFormData {
  return {
    ...form,
    photos: form.photos
      .filter((p) => p.status === "done" && p.remoteUrl)
      .map((p) => ({
        ...p,
        previewUrl: p.remoteUrl as string,
        status: "done" as const,
        progress: 100,
      })),
  };
}

function readDraft(): PersistedDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedDraft;
    if (!parsed || typeof parsed.savedAt !== "number") return null;
    if (Date.now() - parsed.savedAt > DRAFT_MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore storage failures (private mode, quota, etc.)
  }
}

export const STEP_LABELS = [
  "Service",
  "Details",
  "Date & Time",
  "Address & Contact",
  "Review",
  "Confirmation",
] as const;

export const FORM_STEP_COUNT = STEP_LABELS.length - 1;

export const BOOKING_STAGES = [
  {
    label: "Service",
    description: "Choose service category",
    start: 0,
    end: 0,
  },
  {
    label: "Details",
    description: "Equipment and requirement",
    start: 1,
    end: 1,
  },
  {
    label: "Date & Time",
    description: "Appointment date and slot",
    start: 2,
    end: 2,
  },
  {
    label: "Address & Contact",
    description: "Visit and contact details",
    start: 3,
    end: 3,
  },
  {
    label: "Review",
    description: "Check before submitting",
    start: 4,
    end: 4,
  },
  {
    label: "Confirmation",
    description: "Request received",
    start: 5,
    end: 5,
  },
] as const;

interface BookingContextValue {
  step: number;
  direction: 1 | -1;
  form: BookingFormData;
  reservation: { id: string; expiresAt: number } | null;
  submitting: boolean;
  error: string | null;
  bookingResult: BookingRecord | null;
  /** False until the persisted draft (if any) has been rehydrated on the client. */
  hydrated: boolean;
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
  /** Discard the saved draft and start a fresh booking. */
  reset: () => void;
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
  const freshStep = Math.max(0, Math.min(initialStep, FORM_STEP_COUNT - 1));

  const [step, setStep] = useState(freshStep);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [form, setForm] = useState<BookingFormData>({ ...emptyBookingForm, ...initial });
  const [reservation, setReservation] = useState<{ id: string; expiresAt: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingRecord | null>(null);
  const [hydrated, setHydrated] = useState(false);

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
    setStep((s) => Math.min(s + 1, FORM_STEP_COUNT - 1));
  }, []);
  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);
  const goToStep = useCallback((s: number) => {
    const nextStep = Math.max(0, Math.min(s, FORM_STEP_COUNT - 1));
    setDirection(nextStep >= step ? 1 : -1);
    setStep(nextStep);
  }, [step]);
  const clearError = useCallback(() => setError(null), []);

  const reset = useCallback(() => {
    clearDraft();
    setForm({ ...emptyBookingForm, ...initial });
    setStep(freshStep);
    setDirection(-1);
    setReservation(null);
    setBookingResult(null);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freshStep]);

  // Rehydrate a saved draft on mount. Deferred to an animation frame (rather
  // than run synchronously in the effect body) so it doesn't cascade renders
  // during hydration; the flow UI shows a loader until `hydrated` flips.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const draft = readDraft();
      const requestedCategory = initial?.categoryId ?? null;
      const draftCategory = draft?.form?.categoryId ?? null;
      // If the URL asks for a different category than the saved draft, the user
      // is deliberately starting a new booking — drop the stale draft.
      const categoryConflict =
        requestedCategory !== null &&
        draftCategory !== null &&
        requestedCategory !== draftCategory;

      if (draft && !categoryConflict) {
        setForm({ ...emptyBookingForm, ...draft.form });
        setStep(Math.max(0, Math.min(draft.step ?? 0, FORM_STEP_COUNT - 1)));
        if (draft.reservation && draft.reservation.expiresAt > Date.now()) {
          setReservation(draft.reservation);
        }
      } else if (categoryConflict) {
        clearDraft();
      }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the draft on every change once hydrated; clear it once the booking
  // has been submitted successfully.
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    if (bookingResult) {
      clearDraft();
      return;
    }
    try {
      const payload: PersistedDraft = {
        step,
        form: draftSafeForm(form),
        reservation,
        savedAt: Date.now(),
      };
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage failures (private mode, quota, etc.)
    }
  }, [hydrated, step, form, reservation, bookingResult]);

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
      hydrated,
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
      reset,
    }),
    [step, direction, form, reservation, submitting, error, bookingResult, hydrated, setField, addPhotos, updatePhoto, removePhoto, goNext, goBack, goToStep, reserve, submit, clearError, reset]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within a BookingProvider");
  return ctx;
}
