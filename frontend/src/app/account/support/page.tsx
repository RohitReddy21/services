import type { Metadata } from "next";
import SupportForm from "@/components/account/support-form";

export const metadata: Metadata = {
  title: "Support",
};

const faqs = [
  {
    question: "How do I reschedule a booking?",
    answer:
      "Open the booking from My Bookings and select \"Request Reschedule\". Our team will confirm a new time with you.",
  },
  {
    question: "Can I cancel a booking?",
    answer: "Yes, open the booking and select \"Cancel Request\" — this is available any time before the service is completed.",
  },
  {
    question: "How is pricing handled?",
    answer:
      "We don't display pricing online. Our team confirms service details and any applicable charges directly with you after your request is received.",
  },
  {
    question: "How quickly will I hear back?",
    answer: "Our team typically responds within one business day, and prioritises emergency requests.",
  },
];

export default function SupportPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">Support</h1>
      <p className="mt-1.5 text-sm text-slate-500">
        Get help with bookings, rescheduling, or general questions.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SupportForm />

        <div>
          <h2 className="font-display text-base font-bold text-navy-900">Frequently Asked Questions</h2>
          <div className="mt-3 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {faqs.map((faq) => (
              <details key={faq.question} className="p-4">
                <summary className="cursor-pointer text-sm font-semibold text-navy-900 marker:content-none">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
