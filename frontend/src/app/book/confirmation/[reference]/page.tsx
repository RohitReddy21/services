import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookingConfirmation from "@/components/booking/booking-confirmation";
import { serverFetch } from "@/lib/server/backend-fetch";
import { mapBookingDoc } from "@/lib/api/booking-mapper";

export const metadata: Metadata = {
  title: "Booking Confirmation",
};

export default async function BookingConfirmationPage({
  params,
}: PageProps<"/book/confirmation/[reference]">) {
  const { reference } = await params;
  const res = await serverFetch(`/api/bookings?reference=${encodeURIComponent(reference)}`);

  if (!res.ok) notFound();
  const doc = (await res.json()) as Record<string, unknown>;
  const record = mapBookingDoc(doc);

  return (
    <div className="bg-slate-25 min-h-[calc(100vh-4.5rem)] py-12 lg:py-16">
      <div className="container-ags">
        <BookingConfirmation record={record} />
      </div>
    </div>
  );
}
