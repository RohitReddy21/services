"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-context";
import { submitSupportTicketRequest } from "@/lib/api/account-client";
import type { SupportCategory } from "@/types/account";

const categories: { id: SupportCategory; label: string }[] = [
  { id: "booking_help", label: "Booking Help" },
  { id: "reschedule_help", label: "Reschedule Help" },
  { id: "cancellation_help", label: "Cancellation Help" },
  { id: "service_questions", label: "Service Questions" },
  { id: "technical_questions", label: "Technical Questions" },
  { id: "general_enquiry", label: "General Enquiry" },
];

export default function SupportForm() {
  const { user } = useAuth();
  const [category, setCategory] = useState<SupportCategory>("general_enquiry");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || !email.trim()) {
      setError("Please complete all fields.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await submitSupportTicketRequest({ category, subject, message, email });
      setSent(true);
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-accent-green-200 bg-accent-green-50 p-6 text-center">
        <CheckCircle2 className="mx-auto size-8 text-accent-green-600" />
        <p className="mt-3 text-sm font-semibold text-accent-green-800">
          Your message has been sent.
        </p>
        <p className="mt-1 text-xs text-accent-green-700">
          Our support team will get back to you shortly.
        </p>
        <Button size="sm" variant="secondary" className="mt-4" onClick={() => setSent(false)}>
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <p className="text-sm font-semibold text-navy-800">What can we help with?</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`rounded-lg border-2 px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              category === c.id
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-slate-200 text-slate-500"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-navy-800">Email Address</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field mt-1.5"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-800">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="input-field mt-1.5"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-800">Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="input-field mt-1.5"
          />
        </label>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

      <Button type="submit" size="lg" className="mt-5" disabled={submitting}>
        {submitting && <Loader2 className="size-4 animate-spin" />}
        Send Message
      </Button>
    </form>
  );
}
