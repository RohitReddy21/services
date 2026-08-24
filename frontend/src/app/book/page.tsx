import type { Metadata } from "next";
import BookingFlow from "@/components/booking/booking-flow";
import type { ServiceCategoryId } from "@/types/service";

export const metadata: Metadata = {
  title: "Book a Service",
  description: "Book an air conditioning or refrigeration service with AGS.",
};

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  const params = await searchParams;
  const categoryParam = Array.isArray(params.category) ? params.category[0] : params.category;
  const initialCategory: ServiceCategoryId | undefined =
    categoryParam === "air-conditioning" || categoryParam === "refrigeration"
      ? categoryParam
      : undefined;

  return (
    <div className="bg-slate-25 min-h-[calc(100vh-4.5rem)]">
      <BookingFlow initialCategory={initialCategory} />
    </div>
  );
}
