"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, RotateCcw, Star, Trash2 } from "lucide-react";
import {
  createReviewRequest,
  deleteReviewRequest,
  fetchAdminReviews,
  restoreReviewRequest,
  updateReviewRequest,
} from "@/lib/api/admin-client";
import type { Review } from "@/types/account";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  AdminModal,
  ArchiveToggle,
  Field,
  FieldGrid,
  PanelHeader,
  SkeletonRows,
} from "@/components/admin/panel-shell";

const emptyCreate = {
  userId: "",
  bookingReference: "",
  serviceName: "",
  rating: "5",
  text: "",
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? "size-3.5 fill-accent-gold-500 text-accent-gold-500"
              : "size-3.5 text-slate-200"
          }
        />
      ))}
    </div>
  );
}

export default function ReviewsPanel() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [creating, setCreating] = useState(false);

  const [editReview, setEditReview] = useState<Review | null>(null);
  const [editDraft, setEditDraft] = useState<{ serviceName: string; rating: string; text: string } | null>(
    null
  );

  const load = useCallback(
    () =>
      fetchAdminReviews({ includeArchived: showArchived }).then((res) => setReviews(res.reviews)),
    [showArchived]
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!createForm.userId.trim() || !createForm.bookingReference.trim() || !createForm.serviceName.trim()) {
      setError("Customer ID, booking reference and service name are required.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await createReviewRequest({
        userId: createForm.userId.trim(),
        bookingReference: createForm.bookingReference.trim(),
        serviceName: createForm.serviceName.trim(),
        rating: Number(createForm.rating),
        text: createForm.text.trim(),
      });
      setShowCreate(false);
      setCreateForm(emptyCreate);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the review.");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (r: Review) => {
    setError(null);
    setEditReview(r);
    setEditDraft({ serviceName: r.serviceName, rating: String(r.rating), text: r.text });
  };

  const saveEdit = async () => {
    if (!editReview || !editDraft) return;
    setBusyId(editReview.id);
    setError(null);
    try {
      await updateReviewRequest(editReview.id, {
        serviceName: editDraft.serviceName.trim(),
        rating: Number(editDraft.rating),
        text: editDraft.text.trim(),
      });
      setEditReview(null);
      setEditDraft(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save changes.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleArchive = async (r: Review) => {
    setBusyId(r.id);
    setError(null);
    try {
      if (r.deletedAt) await restoreReviewRequest(r.id);
      else await deleteReviewRequest(r.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update the review.");
    } finally {
      setBusyId(null);
    }
  };

  const active = (reviews ?? []).filter((r) => !r.deletedAt);
  const avg =
    active.length
      ? Math.round((active.reduce((s, r) => s + r.rating, 0) / active.length) * 10) / 10
      : 0;

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Reviews"
        subtitle={avg ? `${avg} ★ average` : "Customer feedback"}
        count={reviews?.length}
        onRefresh={refresh}
        refreshing={refreshing}
        actions={
          <div className="flex items-center gap-2">
            <ArchiveToggle value={showArchived} onChange={setShowArchived} />
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="size-4" />
              New
            </Button>
          </div>
        }
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
      )}

      {!reviews ? (
        <SkeletonRows />
      ) : reviews.length === 0 ? (
        <EmptyState message="No reviews yet." variant="card" />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className={`rounded-2xl border border-slate-200 bg-white p-4 ags-depth-sm ${
                r.deletedAt ? "opacity-55" : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <StarRow rating={r.rating} />
                    {r.deletedAt && (
                      <StatusBadge tone="neutral" size="sm">
                        Archived
                      </StatusBadge>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-bold text-navy-900">{r.serviceName}</p>
                  {r.text && <p className="mt-1 text-sm text-slate-600">{r.text}</p>}
                  <p className="mt-1 text-xs text-slate-400">
                    {r.bookingReference} · {new Date(r.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(r)}
                    disabled={busyId === r.id}
                    className="ags-focus flex size-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-700 disabled:opacity-50"
                    aria-label="Edit review"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => toggleArchive(r)}
                    className={`ags-focus flex size-9 items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${
                      r.deletedAt ? "text-brand-600 hover:bg-brand-50" : "text-red-500 hover:bg-red-50"
                    }`}
                    aria-label={r.deletedAt ? "Restore review" : "Archive review"}
                  >
                    {busyId === r.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : r.deletedAt ? (
                      <RotateCcw className="size-4" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <AdminModal
          title="New review"
          onClose={() => setShowCreate(false)}
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreate} disabled={creating}>
                {creating ? "Creating…" : "Create review"}
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <FieldGrid>
              <Field label="Customer ID" hint="The user's account ID.">
                <input
                  className="input-field h-9 text-sm"
                  value={createForm.userId}
                  onChange={(e) => setCreateForm((f) => ({ ...f, userId: e.target.value }))}
                />
              </Field>
              <Field label="Booking reference">
                <input
                  className="input-field h-9 text-sm"
                  value={createForm.bookingReference}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, bookingReference: e.target.value }))
                  }
                />
              </Field>
            </FieldGrid>
            <FieldGrid>
              <Field label="Service name">
                <input
                  className="input-field h-9 text-sm"
                  value={createForm.serviceName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, serviceName: e.target.value }))}
                />
              </Field>
              <Field label="Rating">
                <select
                  className="input-field h-9 text-sm"
                  value={createForm.rating}
                  onChange={(e) => setCreateForm((f) => ({ ...f, rating: e.target.value }))}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} ★
                    </option>
                  ))}
                </select>
              </Field>
            </FieldGrid>
            <Field label="Review text">
              <textarea
                className="input-field min-h-20 text-sm"
                value={createForm.text}
                onChange={(e) => setCreateForm((f) => ({ ...f, text: e.target.value }))}
              />
            </Field>
          </div>
        </AdminModal>
      )}

      {editReview && editDraft && (
        <AdminModal
          title="Edit review"
          onClose={() => {
            setEditReview(null);
            setEditDraft(null);
          }}
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditReview(null);
                  setEditDraft(null);
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={saveEdit} disabled={busyId === editReview.id}>
                Save changes
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <FieldGrid>
              <Field label="Service name">
                <input
                  className="input-field h-9 text-sm"
                  value={editDraft.serviceName}
                  onChange={(e) =>
                    setEditDraft((d) => d && { ...d, serviceName: e.target.value })
                  }
                />
              </Field>
              <Field label="Rating">
                <select
                  className="input-field h-9 text-sm"
                  value={editDraft.rating}
                  onChange={(e) => setEditDraft((d) => d && { ...d, rating: e.target.value })}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} ★
                    </option>
                  ))}
                </select>
              </Field>
            </FieldGrid>
            <Field label="Review text">
              <textarea
                className="input-field min-h-20 text-sm"
                value={editDraft.text}
                onChange={(e) => setEditDraft((d) => d && { ...d, text: e.target.value })}
              />
            </Field>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
