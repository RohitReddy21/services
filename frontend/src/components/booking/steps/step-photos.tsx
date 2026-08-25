"use client";

import { useRef } from "react";
import { AlertCircle, RotateCcw, Trash2, Upload } from "lucide-react";
import StepShell from "@/components/booking/step-shell";
import { useBooking } from "@/components/booking/booking-context";
import FadeInImage from "@/components/ui/fade-in-image";
import { uploadFile } from "@/lib/api/upload-client";
import type { UploadedPhoto } from "@/types/booking";

const MAX_PHOTOS = 6;
const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

function runUpload(
  file: File,
  onUpdate: (patch: Partial<UploadedPhoto>) => void
) {
  uploadFile(file, "customer-uploads", (progress) => onUpdate({ progress, status: "uploading" }))
    .then((result) => onUpdate({ progress: 100, status: "done", remoteUrl: result.url }))
    .catch(() => onUpdate({ status: "error" }));
}

export default function StepPhotos({ embedded = false }: { embedded?: boolean }) {
  const { form, addPhotos, updatePhoto, removePhoto } = useBooking();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const remainingSlots = MAX_PHOTOS - form.photos.length;
    const files = Array.from(fileList).slice(0, remainingSlots);

    const accepted: { file: File; photo: UploadedPhoto }[] = [];
    files.forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_SIZE_MB * 1024 * 1024) return;
      const id = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const previewUrl = URL.createObjectURL(file);
      accepted.push({
        file,
        photo: {
          id,
          name: file.name,
          previewUrl,
          remoteUrl: null,
          status: "uploading",
          progress: 0,
        },
      });
    });

    if (accepted.length === 0) return;
    addPhotos(accepted.map((a) => a.photo));

    accepted.forEach(({ file, photo }) => {
      runUpload(file, (patch) => updatePhoto(photo.id, patch));
    });
  };

  const content = (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={form.photos.length >= MAX_PHOTOS}
        className="ags-focus flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-5 py-8 text-center transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Upload className="size-6 text-brand-500" />
        <p className="text-xs font-semibold text-navy-800">Click to upload photos</p>
        <p className="text-xs text-slate-500">
          JPG, PNG, WEBP or HEIC up to {MAX_SIZE_MB}MB &middot; up to {MAX_PHOTOS} files
        </p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {form.photos.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {form.photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
            >
              <FadeInImage
                src={photo.previewUrl}
                alt={photo.name}
                fill
                className="object-cover"
                unoptimized
              />

              {photo.status === "uploading" && (
                <div className="absolute inset-x-0 bottom-0 bg-navy-950/70 px-2 py-1.5">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/25">
                    <div
                      className="h-full rounded-full bg-brand-400 transition-all"
                      style={{ width: `${photo.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {photo.status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-navy-950/75 text-white">
                  <AlertCircle className="size-5 text-red-300" />
                  <span className="text-[11px] font-medium">Upload failed</span>
                  <RetryButton photoId={photo.id} onUpdate={updatePhoto} />
                </div>
              )}

              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                aria-label="Remove photo"
                className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-md bg-navy-950/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );

  if (embedded) {
    return <div>{content}</div>;
  }

  return (
    <StepShell
      title="Upload Photos"
      description="Photos of the equipment, fault or error code help our engineers prepare (optional)."
      canContinue
    >
      {content}
    </StepShell>
  );
}

function RetryButton({
  photoId,
  onUpdate,
}: {
  photoId: string;
  onUpdate: (id: string, patch: Partial<UploadedPhoto>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) runUpload(file, (patch) => onUpdate(photoId, patch));
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1 rounded-md bg-white/15 px-2.5 py-1 text-[11px] font-semibold hover:bg-white/25"
      >
        <RotateCcw className="size-3" />
        Retry
      </button>
    </>
  );
}
