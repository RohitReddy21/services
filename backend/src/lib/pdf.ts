import PDFDocument from "pdfkit";
import type { Response } from "express";

const BRAND = "#1a4fd1";
const NAVY = "#0b1b33";
const SLATE = "#64748b";
const GOLD = "#cf9f3d";

function header(doc: PDFKit.PDFDocument, title: string, subtitle: string) {
  doc.rect(0, 0, doc.page.width, 96).fill(NAVY);
  // Gold accent rule along the base of the header band.
  doc.rect(0, 96, doc.page.width, 3).fill(GOLD);
  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(20)
    .text("AGS", 50, 28)
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#a8c4ff")
    .text("ADVANCED GAS SOLUTIONS", 50, 52);

  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(title, 0, 30, { align: "right", width: doc.page.width - 50 })
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#a8c4ff")
    .text(subtitle, 0, 52, { align: "right", width: doc.page.width - 50 });

  doc.y = 130;
}

function footer(doc: PDFKit.PDFDocument) {
  // Leave enough clearance above the bottom margin for two wrapped lines —
  // too close to the edge and PDFKit silently starts a blank second page.
  const y = doc.page.height - 110;
  doc
    .moveTo(50, y)
    .lineTo(doc.page.width - 50, y)
    .strokeColor("#e2e8f0")
    .stroke();
  doc
    .fontSize(8)
    .fillColor(SLATE)
    .font("Helvetica")
    .text(
      "AGS — Advanced Gas Solutions · Service details and any applicable charges are confirmed directly with our team.",
      50,
      y + 12,
      { width: doc.page.width - 100, align: "center" }
    );
}

function detailRow(doc: PDFKit.PDFDocument, label: string, value: string, x: number, width: number) {
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(SLATE)
    .text(label.toUpperCase(), x, doc.y, { width, continued: false });
  doc.font("Helvetica-Bold").fontSize(11).fillColor(NAVY).text(value, x, doc.y + 2, { width });
  doc.moveDown(0.9);
}

export interface SubscriptionInvoiceInput {
  invoiceNumber: string;
  issuedAt: Date;
  customerName: string;
  customerEmail: string;
  planName: string;
  billingCycleMonths: number;
  servicesPerCycle: number;
  amount: number;
  currency: string;
  periodStart: Date;
  periodEnd: Date;
  equipmentLabel: string;
  address: string;
  originalAmount?: number | null;
  couponCode?: string | null;
}

const gbDate = (d: Date) => d.toLocaleDateString("en-GB");

function drawSubscriptionInvoice(doc: PDFKit.PDFDocument, input: SubscriptionInvoiceInput) {
  header(doc, "INVOICE", input.invoiceNumber);

  // Status chip — Care Plans are paid up front, so the invoice is a receipt.
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("PAID IN FULL", 50, doc.y, { characterSpacing: 1.5 });
  doc.moveDown(1.1);

  const colWidth = (doc.page.width - 100 - 20) / 2;
  const leftX = 50;
  const rightX = 50 + colWidth + 20;
  const topY = doc.y;

  detailRow(doc, "Billed to", input.customerName, leftX, colWidth);
  doc.y = topY;
  detailRow(doc, "Invoice date", gbDate(input.issuedAt), rightX, colWidth);

  detailRow(doc, "Email", input.customerEmail, leftX, colWidth);
  doc.y = topY + 40;
  detailRow(
    doc,
    "Billing period",
    `${gbDate(input.periodStart)} - ${gbDate(input.periodEnd)}`,
    rightX,
    colWidth
  );

  doc.moveDown(1);
  doc
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .strokeColor("#e2e8f0")
    .stroke();
  doc.moveDown(1);

  const tableTop = doc.y;
  doc.font("Helvetica-Bold").fontSize(10).fillColor(SLATE);
  doc.text("PLAN", 50, tableTop);
  doc.text("DETAILS", 250, tableTop);
  doc.text("AMOUNT", 0, tableTop, { align: "right", width: doc.page.width - 50 });
  doc.moveDown(0.8);
  doc
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .strokeColor("#e2e8f0")
    .stroke();
  doc.moveDown(0.8);

  const rowY = doc.y;
  doc.font("Helvetica-Bold").fontSize(11).fillColor(NAVY).text(input.planName, 50, rowY, { width: 190 });
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(SLATE)
    .text(
      `${input.servicesPerCycle} services / ${input.billingCycleMonths} months · ${input.equipmentLabel}`,
      250,
      rowY,
      { width: 200 }
    );
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(NAVY)
    .text(formatMoney(input.amount, input.currency), 0, rowY, { align: "right", width: doc.page.width - 50 });

  doc.moveDown(1.2);
  if (input.originalAmount != null && input.couponCode) {
    const savedRowY = doc.y;
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(SLATE)
      .text(`Coupon applied: ${input.couponCode}`, 50, savedRowY, { width: 200 });
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(SLATE)
      .text(
        `Original price: ${formatMoney(input.originalAmount, input.currency)}`,
        0,
        savedRowY,
        { align: "right", width: doc.page.width - 50 }
      );
    doc.moveDown(1.4);
  } else {
    doc.moveDown(1.6);
  }

  // Themed total band.
  const totalY = doc.y;
  const bandX = 300;
  doc.roundedRect(bandX, totalY - 4, doc.page.width - 50 - bandX, 28, 5).fill("#eef4ff");
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(SLATE)
    .text("Total paid", bandX + 12, totalY + 4, { width: 120 });
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor(BRAND)
    .text(formatMoney(input.amount, input.currency), 0, totalY + 3, {
      align: "right",
      width: doc.page.width - 62,
    });
  doc.y = totalY + 28;

  doc.moveDown(2.2);
  doc.font("Helvetica").fontSize(9).fillColor(SLATE).text("Service address", 50, doc.y);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(NAVY).text(input.address, 50, doc.y + 2, { width: 300 });

  footer(doc);
}

export function streamSubscriptionInvoice(res: Response, input: SubscriptionInvoiceInput) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${input.invoiceNumber}.pdf"`);
  doc.pipe(res);
  drawSubscriptionInvoice(doc, input);
  doc.end();
}

/** Same invoice, returned as a Buffer so it can be attached to an email. */
export function renderSubscriptionInvoice(input: SubscriptionInvoiceInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    drawSubscriptionInvoice(doc, input);
    doc.end();
  });
}

export function streamBookingCertificate(
  res: Response,
  input: {
    bookingReference: string;
    issuedAt: Date;
    customerName: string;
    equipmentLabel: string;
    categoryLabel: string;
    completedDate: string;
    timeSlotLabel: string;
    address: string;
    requirementLabel: string;
  }
) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="AGS-Certificate-${input.bookingReference}.pdf"`
  );
  doc.pipe(res);

  header(doc, "SERVICE CERTIFICATE", input.bookingReference);

  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("COMPLETED", 50, doc.y, { characterSpacing: 1.5 });
  doc.moveDown(1);

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor(NAVY)
    .text(
      `This certifies that AGS completed the following service for ${input.customerName}.`,
      50,
      doc.y,
      { width: doc.page.width - 100 }
    );
  doc.moveDown(1.5);

  const colWidth = (doc.page.width - 100 - 20) / 2;
  const leftX = 50;
  const rightX = 50 + colWidth + 20;
  const topY = doc.y;

  detailRow(doc, "Service", `${input.categoryLabel} — ${input.equipmentLabel}`, leftX, colWidth);
  doc.y = topY;
  detailRow(doc, "Work type", input.requirementLabel, rightX, colWidth);

  detailRow(doc, "Date completed", input.completedDate, leftX, colWidth);
  doc.y = topY + 40;
  detailRow(doc, "Appointment window", input.timeSlotLabel, rightX, colWidth);

  doc.moveDown(0.5);
  doc.font("Helvetica").fontSize(9).fillColor(SLATE).text("Service address", 50, doc.y);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(NAVY).text(input.address, 50, doc.y + 2, { width: 400 });

  doc.moveDown(2);
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(SLATE)
    .text(
      "This certificate confirms the work completed. Service details and any applicable charges were confirmed directly with our team and are not itemised here.",
      50,
      doc.y,
      { width: doc.page.width - 100 }
    );

  doc.moveDown(1);
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(SLATE)
    .text(`Issued ${input.issuedAt.toLocaleDateString("en-GB")}`, 50, doc.y);

  footer(doc);
  doc.end();
}

function formatMoney(amount: number, currency: string) {
  const symbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : `${currency} `;
  return `${symbol}${amount.toFixed(2)}`;
}
