import { sendGAEvent } from "@next/third-parties/google";

/** Conversion / engagement events worth measuring in GA4. */
export type AnalyticsEvent =
  | "postcode_check"
  | "book_service_click"
  | "booking_submitted"
  | "subscribe_click"
  | "subscription_submitted"
  | "contact_submitted"
  | "phone_click"
  | "service_view";

/**
 * Thin wrapper over GA4's event API. No-ops when GA isn't loaded (local /
 * preview / consent declined), so it's always safe to call.
 */
export function trackEvent(event: AnalyticsEvent, params: Record<string, string | number | boolean> = {}) {
  try {
    sendGAEvent("event", event, params);
  } catch {
    /* GA not present */
  }
}
