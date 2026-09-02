"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock,
  History,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Wrench,
} from "lucide-react";
import {
  clearIssueRequest,
  completeJobRequest,
  fetchJobHistory,
  fetchTechnicianJob,
  nextStatus,
  reportIssueRequest,
  updateJobStatusRequest,
  NEXT_STATUS_LABEL,
  type PastVisit,
} from "@/lib/api/technician-client";
import { uploadFile } from "@/lib/api/upload-client";
import { statusMeta } from "@/lib/data/booking-status";
import type { BookingRecord } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loaders";
import { addressLine } from "@/components/technician/job-card";

export default function JobDetail({ reference }: { reference: string }) {
  const [job, setJob] = useState<BookingRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<{ name: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const [showIssue, setShowIssue] = useState(false);
  const [issueNote, setIssueNote] = useState("");
  const [needsRevisit, setNeedsRevisit] = useState(true);

  const [history, setHistory] = useState<PastVisit[] | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const load = useCallback(
    () =>
      fetchTechnicianJob(reference)
        .then((res) => {
          setJob(res);
          setNotes(res.completionNotes ?? "");
        })
        .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load this job.")),
    [reference]
  );

  useEffect(() => {
    fetchJobHistory(reference)
      .then((res) => setHistory(res.history))
      .catch(() => setHistory([]));
  }, [reference]);

  useEffect(() => {
    load();
  }, [load]);

  const advance = async () => {
    if (!job) return;
    const next = nextStatus(job.status);
    if (!next) return;

    setBusy(true);
    setError(null);
    try {
      if (next === "COMPLETED") {
        setJob(await completeJobRequest(reference, { notes: notes.trim(), photos }));
        setPhotos([]);
      } else {
        setJob(await updateJobStatusRequest(reference, next));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update this job.");
    } finally {
      setBusy(false);
    }
  };

  const submitIssue = async () => {
    if (issueNote.trim().length < 3) {
      setError("Tell the office what the problem is.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setJob(await reportIssueRequest(reference, { note: issueNote.trim(), needsRevisit }));
      setShowIssue(false);
      setIssueNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't report the issue.");
    } finally {
      setBusy(false);
    }
  };

  const clearIssue = async () => {
    setBusy(true);
    setError(null);
    try {
      setJob(await clearIssueRequest(reference));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't clear the issue.");
    } finally {
      setBusy(false);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const uploaded = await uploadFile(file, "bookings", () => {});
        setPhotos((prev) => [...prev, uploaded]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upload that photo.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  if (!job) {
    return error ? (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
        <Link href="/technician" className="mt-4 inline-block text-sm font-semibold text-brand-600">
          Back to my jobs
        </Link>
      </main>
    ) : (
      <PageLoader compact label="Loading job" />
    );
  }

  const next = nextStatus(job.status);
  const canReportIssue = job.status !== "COMPLETED" && job.status !== "CANCELLED";
  const address = addressLine(job.data.address);
  const meta = statusMeta[job.status];
  const showCompletionForm = job.status === "SERVICE_STARTED";

  return (
    <main className="mx-auto max-w-3xl px-4 pb-32 pt-5">
      <Link
        href="/technician"
        className="ags-focus inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-800"
      >
        <ArrowLeft className="size-4" />
        My jobs
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge tone={job.status === "COMPLETED" ? "success" : "brand"} size="sm">
          {meta?.label ?? job.status}
        </StatusBadge>
        <span className="font-mono text-xs font-semibold text-slate-400">
          {job.bookingReference}
        </span>
      </div>

      <h1 className="mt-2 font-display text-2xl font-extrabold text-navy-900">
        {job.data.customer.fullName}
      </h1>
      <p className="text-sm text-slate-600">
        {job.data.equipmentLabel} · {job.data.requirement}
      </p>

      {job.issueNote && (
        <section className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-amber-900">
            <AlertTriangle className="size-4" />
            Issue reported
            {job.issueReportedAt && (
              <span className="font-normal text-amber-700">
                {new Date(job.issueReportedAt).toLocaleString("en-GB")}
              </span>
            )}
          </h2>
          <p className="mt-1.5 text-sm text-amber-900">{job.issueNote}</p>
          {job.rescheduleRequested && (
            <p className="mt-1 text-xs font-semibold text-amber-700">
              Flagged as needing another visit.
            </p>
          )}
          <button
            type="button"
            onClick={clearIssue}
            disabled={busy}
            className="ags-focus mt-3 text-xs font-semibold text-amber-800 underline disabled:opacity-50"
          >
            Clear — I&apos;m back on it
          </button>
        </section>
      )}

      <section className="mt-5 space-y-2">
        <a
          href={`tel:${job.data.customer.phone}`}
          className="ags-focus flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 active:bg-slate-50"
        >
          <Phone className="size-4 shrink-0 text-brand-600" />
          <span className="font-semibold text-navy-900">{job.data.customer.phone}</span>
          <span className="ml-auto text-xs font-semibold text-brand-600">Call</span>
        </a>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ags-focus flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 active:bg-slate-50"
        >
          <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" />
          <span className="min-w-0 text-sm text-navy-900">{address}</span>
          <span className="ml-auto shrink-0 text-xs font-semibold text-brand-600">Map</span>
        </a>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
          <Clock className="size-4 shrink-0 text-slate-400" />
          <span className="text-sm text-navy-900">
            {job.data.date} · {job.data.timeSlot?.label}
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
          <Mail className="size-4 shrink-0 text-slate-400" />
          <span className="min-w-0 truncate text-sm text-navy-900">{job.data.customer.email}</span>
        </div>
      </section>

      {(job.data.description || job.data.address.instructions) && (
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
            <Wrench className="size-3.5" />
            Job notes
          </h2>
          {job.data.description && (
            <p className="mt-2 text-sm text-slate-700">{job.data.description}</p>
          )}
          {job.data.address.instructions && (
            <p className="mt-2 text-sm text-slate-500">
              <span className="font-semibold">Access:</span> {job.data.address.instructions}
            </p>
          )}
        </section>
      )}

      {job.data.photos.length > 0 && (
        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Customer photos
          </h2>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {job.data.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
              >
                <Image
                  src={photo.previewUrl}
                  alt={photo.name}
                  fill
                  sizes="33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {showCompletionForm && (
        <section className="mt-5 rounded-xl border border-brand-200 bg-brand-50/40 p-4">
          <h2 className="text-sm font-bold text-navy-900">Complete this job</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            What did you do? The customer gets a confirmation email when you finish.
          </p>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="e.g. Replaced the run capacitor, re-gassed and tested airflow."
            className="input-field mt-3 min-h-24"
          />

          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="ags-focus mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-300 bg-white py-3 text-sm font-semibold text-brand-700 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            {uploading ? "Uploading…" : "Add photos"}
          </button>

          {photos.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <div
                  key={photo.url}
                  className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white"
                >
                  <Image src={photo.url} alt={photo.name} fill sizes="33vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {job.status === "COMPLETED" && (
        <section className="mt-5 rounded-xl border border-accent-green-200 bg-accent-green-50 p-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-accent-green-800">
            <CheckCircle2 className="size-4" />
            Completed
            {job.completedAt && (
              <span className="font-normal text-accent-green-700">
                {new Date(job.completedAt).toLocaleString("en-GB")}
              </span>
            )}
          </h2>
          {job.completionNotes && (
            <p className="mt-2 text-sm text-accent-green-900">{job.completionNotes}</p>
          )}
        </section>
      )}

      {/* What happened on this job, straight from the status history. */}
      {job.statusHistory.length > 0 && (
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Timeline</h2>
          <ol className="mt-2 space-y-2">
            {job.statusHistory.map((entry, i) => (
              <li key={`${entry.status}-${i}`} className="flex items-baseline gap-3 text-sm">
                <span className="w-32 shrink-0 text-xs text-slate-400">
                  {new Date(entry.at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-navy-800">
                  {statusMeta[entry.status]?.label ?? entry.status}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {history && history.length > 0 && (
        <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="ags-focus flex w-full items-center gap-2 p-4 text-left"
          >
            <History className="size-4 shrink-0 text-slate-400" />
            <span className="flex-1 text-sm font-bold text-navy-900">
              Previous visits ({history.length})
            </span>
            <ChevronDown
              className={`size-4 text-slate-400 transition-transform ${historyOpen ? "rotate-180" : ""}`}
            />
          </button>
          {historyOpen && (
            <ul className="space-y-3 border-t border-slate-100 p-4">
              {history.map((visit) => (
                <li key={visit.id} className="text-sm">
                  <p className="font-semibold text-navy-900">
                    {visit.date} · {visit.equipmentLabel}
                  </p>
                  <p className="text-xs text-slate-500">
                    {visit.requirement} · {statusMeta[visit.status]?.label ?? visit.status}
                    {visit.technicianName ? ` · ${visit.technicianName}` : ""}
                  </p>
                  {visit.completionNotes && (
                    <p className="mt-1 text-xs text-slate-600">{visit.completionNotes}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {showIssue && (
        <section className="mt-4 rounded-xl border border-amber-300 bg-amber-50/60 p-4">
          <h2 className="text-sm font-bold text-navy-900">What&apos;s the problem?</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            This goes straight to the office. It doesn&apos;t change the job&apos;s status.
          </p>
          <textarea
            value={issueNote}
            onChange={(e) => setIssueNote(e.target.value)}
            rows={3}
            placeholder="e.g. No access — nobody on site. Or: needs a replacement fan motor, not on the van."
            className="input-field mt-3 min-h-20"
          />
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={needsRevisit}
              onChange={(e) => setNeedsRevisit(e.target.checked)}
              className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-200"
            />
            This job needs another visit
          </label>
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowIssue(false)}
            >
              Cancel
            </Button>
            <Button type="button" size="sm" className="flex-1" disabled={busy} onClick={submitIssue}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              Send to office
            </Button>
          </div>
        </section>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {(next || canReportIssue) && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-3xl gap-2">
            {canReportIssue && !showIssue && (
              <Button
                type="button"
                size="lg"
                variant="secondary"
                className={next ? "shrink-0" : "flex-1"}
                onClick={() => {
                  setError(null);
                  setShowIssue(true);
                }}
              >
                <AlertTriangle className="size-4" />
                Issue
              </Button>
            )}
            {next && (
              <Button
                type="button"
                size="lg"
                className="flex-1"
                disabled={busy || uploading}
                onClick={advance}
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                {NEXT_STATUS_LABEL[next]}
              </Button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
