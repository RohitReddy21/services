import type { Metadata } from "next";
import BookingFlow from "@/components/booking/booking-flow";
import type { ServiceCategoryId } from "@/types/service";

export const metadata: Metadata = {
  title: "Book a Service",
  description: "Book an air conditioning or refrigeration service with AGS.",
  // Sits behind auth and redirects unauthenticated visitors — keep it out of
  // the index but let link equity flow to public pages it links to.
  robots: { index: false, follow: true },
};

// Auth is gated in middleware.ts (fast, cookie-only) and again client-side in
// BookingFlow via useAuth — this page does no backend round-trip of its own, so
// navigating here is instant even when the API is cold.
export default async function BookPage({ searchParams }: PageProps<"/book">) {
  const params = await searchParams;
  const categoryParam = Array.isArray(params.category) ? params.category[0] : params.category;
  const initialCategory: ServiceCategoryId | undefined =
    categoryParam === "air-conditioning" ||
    categoryParam === "refrigeration" ||
    categoryParam === "electrical"
      ? categoryParam
      : undefined;

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-linear-to-b from-sky-50 via-white to-slate-25">
      <BookingFlow initialCategory={initialCategory} />
    </div>
  );
}
