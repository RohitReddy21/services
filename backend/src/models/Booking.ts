import { Schema, model } from "mongoose";
import { withJsonId } from "../lib/schema-plugin";

const BOOKING_STATUSES = [
  "BOOKING_RECEIVED",
  "CONFIRMED",
  "TECHNICIAN_ASSIGNED",
  "TECHNICIAN_ARRIVING",
  "SERVICE_STARTED",
  "COMPLETED",
  "CANCELLED",
] as const;

const timeSlotSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false }
);

const photoSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const bookingSchema = new Schema(
  {
    bookingReference: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    status: { type: String, enum: BOOKING_STATUSES, default: "BOOKING_RECEIVED" },
    statusHistory: [
      {
        status: { type: String, enum: BOOKING_STATUSES, required: true },
        at: { type: Date, required: true },
        _id: false,
      },
    ],

    categoryId: { type: String, enum: ["air-conditioning", "refrigeration"], required: true },
    equipmentId: { type: String, required: true },
    equipmentLabel: { type: String, required: true },
    requirement: { type: String, required: true },
    description: { type: String, default: "" },
    photos: { type: [photoSchema], default: [] },

    date: { type: String, required: true },
    timeSlot: { type: timeSlotSchema, required: true },

    customer: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      preferredContact: { type: String, enum: ["phone", "email", "sms"], default: "phone" },
    },

    address: {
      houseNumber: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      postcode: { type: String, required: true },
      instructions: { type: String, default: "" },
    },

    rescheduleRequested: { type: Boolean, default: false },
    rescheduleNote: { type: String, default: null },

    technicianId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

withJsonId(bookingSchema);

export const Booking = model("Booking", bookingSchema);
