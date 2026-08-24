"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitSupportTicketRequest } from "@/lib/api/account-client";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError("Please complete all required fields.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await submitSupportTicketRequest({
        category: "general_enquiry",
        subject: `${subject} (from ${name}${phone ? `, ${phone}` : ""})`,
        message,
        email,
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-accent-green-200 bg-accent-green-50 p-8 text-center">
        <CheckCircle2 className="mx-auto size-8 text-accent-green-600" />
        <p className="mt-3 text-sm font-semibold text-accent-green-800">Message sent</p>
        <p className="mt-1 text-sm text-accent-green-700">
          Thanks for reaching out — our team will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-navy-800">Full Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            className="input-field mt-1.5"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-800">Phone (optional)</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07123 456789"
            className="input-field mt-1.5"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-navy-800">Email Address</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className="input-field mt-1.5"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-navy-800">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="How can we help?"
            className="input-field mt-1.5"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-navy-800">Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Tell us a little about what you need..."
            className="input-field mt-1.5"
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-5" disabled={submitting}>
        {submitting && <Loader2 className="size-4 animate-spin" />}
        Send Message
      </Button>
    </form>
  );
}
