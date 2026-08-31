import { amountHero, detailRow, detailTable, emailLayout, noteBox } from "../lib/email-layout";
import { env } from "../config/env";
import type { SubscriptionInvoiceInput } from "../lib/pdf";

function money(amount: number, currency: string) {
  const symbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : `${currency} `;
  return `${symbol}${amount.toFixed(2)}`;
}

const gb = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function subscriptionInvoiceEmail(input: SubscriptionInvoiceInput) {
  const subject = `Your AGS invoice ${input.invoiceNumber} — ${money(input.amount, input.currency)}`;

  const firstName = input.customerName.split(" ")[0] || "there";

  const rows = [
    detailRow("Invoice no.", input.invoiceNumber),
    detailRow("Plan", input.planName),
    detailRow("Equipment", input.equipmentLabel),
    detailRow(
      "Services",
      `${input.servicesPerCycle} over ${input.billingCycleMonths} month${input.billingCycleMonths > 1 ? "s" : ""}`
    ),
    detailRow("Billing period", `${gb(input.periodStart)} – ${gb(input.periodEnd)}`),
    input.couponCode && input.originalAmount != null
      ? detailRow(
          "Voucher applied",
          `${input.couponCode} · was ${money(input.originalAmount, input.currency)}`
        )
      : "",
    detailRow("Service address", input.address),
  ].join("");

  const html = emailLayout({
    preheader: `Invoice ${input.invoiceNumber} for your AGS Care Plan — PDF attached.`,
    heading: "Your Care Plan invoice",
    bodyHtml: `
      <p>Hi ${firstName}, thanks for joining an AGS Care Plan. Here's your invoice — the full PDF is attached to this email for your records.</p>
      ${amountHero({
        label: "Total paid",
        amount: money(input.amount, input.currency),
        meta: `${input.invoiceNumber} · issued ${gb(input.issuedAt)}`,
      })}
      ${detailTable(rows)}
      ${noteBox(
        `<strong style="color:#0b1b33;">Invoice PDF attached.</strong> Keep it for your records — you can also download it any time from your account.`
      )}
      <p style="margin-top:18px;">Our team will be in touch to confirm your first visit date. Every visit covers a full unit inspection, filter clean, airflow check, a heating &amp; cooling test and a compressor gas-pressure check — with the call-out charge included.</p>
    `,
    ctaLabel: "View my Care Plans",
    ctaUrl: `${env.frontendUrl}/account/subscriptions`,
  });

  return { subject, html };
}
