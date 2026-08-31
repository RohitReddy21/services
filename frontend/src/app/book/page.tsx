import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BookingFlow from "@/components/booking/booking-flow";
import { getCurrentUser } from "@/lib/server/current-user";
import type { ServiceCategoryId } from "@/types/service";

export const metadata: Metadata = {
  title: "Book a Service",
  description: "Book an air conditioning or refrigeration service with AGS.",
  // Sits behind auth and redirects unauthenticated visitors — keep it out of
  // the index but let link equity flow to public pages it links to.
  robots: { index: false, follow: true },
};

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  const params = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    const redirectParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        value.forEach((item) => redirectParams.append(key, item));
      } else if (typeof value === "string") {
        redirectParams.set(key, value);
      }
    }

    const returnTo = `/book${redirectParams.size ? `?${redirectParams.toString()}` : ""}`;
    redirect(`/login?redirect=${encodeURIComponent(returnTo)}`);
  }

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
