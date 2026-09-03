import type { BookingRecord } from "@/types/booking";

/**
 * The Express/MongoDB backend returns a flat booking document (natural Mongo
 * shape). The frontend was built around a `{ bookingReference, status, data: {...} }`
 * shape, so this adapts one to the other without touching every consumer.
 */
export function mapBookingDoc(doc: Record<string, unknown>): BookingRecord {
  const photos = Array.isArray(doc.photos) ? (doc.photos as { name: string; url: string }[]) : [];

  return {
    bookingReference: doc.bookingReference as string,
    status: doc.status as BookingRecord["status"],
    customerId: (doc.customerId as string | null) ?? null,
    statusHistory: (doc.statusHistory as BookingRecord["statusHistory"]) ?? [],
    rescheduleRequested: !!doc.rescheduleRequested,
    rescheduleNote: (doc.rescheduleNote as string | null) ?? null,
    technicianId: (doc.technicianId as string | null) ?? null,
    technicianName: (doc.technicianName as string | null) ?? null,
    technicianPhone: (doc.technicianPhone as string | null) ?? null,
    completionNotes: (doc.completionNotes as string) ?? "",
    completionPhotos: Array.isArray(doc.completionPhotos)
      ? (doc.completionPhotos as { name: string; url: string }[])
      : [],
    completedAt: (doc.completedAt as string | null) ?? null,
    issueNote: (doc.issueNote as string | null) ?? null,
    issueReportedAt: (doc.issueReportedAt as string | null) ?? null,
    engineer: (doc.engineer as BookingRecord["engineer"]) ?? null,
    deletedAt: (doc.deletedAt as string | null) ?? null,
    createdAt: doc.createdAt as string,
    updatedAt: doc.updatedAt as string,
    data: {
      categoryId: doc.categoryId as BookingRecord["data"]["categoryId"],
      equipmentId: doc.equipmentId as string,
      equipmentLabel: doc.equipmentLabel as string,
      requirement: doc.requirement as BookingRecord["data"]["requirement"],
      description: (doc.description as string) ?? "",
      photos: photos.map((p, index) => ({
        id: `photo_${index}`,
        name: p.name,
        previewUrl: p.url,
        remoteUrl: p.url,
        status: "done" as const,
        progress: 100,
      })),
      date: doc.date as string,
      timeSlot: doc.timeSlot as BookingRecord["data"]["timeSlot"],
      customer: doc.customer as BookingRecord["data"]["customer"],
      address: doc.address as BookingRecord["data"]["address"],
    },
  };
}
