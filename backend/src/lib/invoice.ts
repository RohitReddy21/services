import type { SubscriptionInvoiceInput } from "./pdf";

/**
 * Minimal shapes needed to build an invoice — kept structural so callers can
 * pass a hydrated Mongoose document or a plain object without wrestling with
 * model generics.
 */
interface SubscriptionLike {
  id: string;
  startDate: Date | string;
  planName: string;
  equipmentLabel: string;
  servicesPerCycle?: number | null;
  originalAmount?: number | null;
  couponCode?: string | null;
  price?: {
    amount?: number | null;
    currency?: string | null;
    billingCycleMonths?: number | null;
  } | null;
  address?: {
    houseNumber?: string | null;
    street?: string | null;
    city?: string | null;
    postcode?: string | null;
  } | null;
}

interface UserLike {
  name?: string | null;
  email?: string | null;
}

/**
 * Derives invoice fields (number, billing period for the current cycle,
 * formatted address) from a subscription + its owner. Used by the customer
 * download route, the automatic email on sign-up and the admin re-send action
 * so all three produce an identical document.
 */
export function buildSubscriptionInvoiceData(
  subscription: SubscriptionLike,
  user: UserLike | null
): SubscriptionInvoiceInput {
  const months = subscription.price?.billingCycleMonths ?? 3;
  const start = new Date(subscription.startDate);
  const now = new Date();
  const monthsSinceStart =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  const cycleIndex = Math.max(0, Math.floor(monthsSinceStart / months));

  const periodStart = new Date(start);
  periodStart.setMonth(periodStart.getMonth() + cycleIndex * months);
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + months);

  const address = [
    subscription.address?.houseNumber,
    subscription.address?.street,
    subscription.address?.city,
    subscription.address?.postcode,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    invoiceNumber: `AGS-INV-${String(subscription.id).slice(-8).toUpperCase()}-${cycleIndex + 1}`,
    issuedAt: new Date(),
    customerName: user?.name ?? "Customer",
    customerEmail: user?.email ?? "",
    planName: subscription.planName,
    billingCycleMonths: months,
    servicesPerCycle: subscription.servicesPerCycle ?? 0,
    amount: subscription.price?.amount ?? 0,
    currency: subscription.price?.currency ?? "GBP",
    periodStart,
    periodEnd,
    equipmentLabel: subscription.equipmentLabel,
    address,
    originalAmount: subscription.originalAmount ?? null,
    couponCode: subscription.couponCode ?? null,
  };
}
