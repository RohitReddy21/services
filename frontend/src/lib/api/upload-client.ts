import { API_BASE_URL } from "@/lib/api/api-base";

export interface UploadedFileResult {
  name: string;
  url: string;
}

/**
 * Uploads a single file to the real backend (Supabase Storage when
 * configured, local disk fallback otherwise — see backend/src/lib/storage.ts).
 * Uses XMLHttpRequest instead of fetch so we get real upload progress events.
 */
export function uploadFile(
  file: File,
  bucket: string,
  onProgress: (percent: number) => void
): Promise<UploadedFileResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/uploads`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const body = JSON.parse(xhr.responseText) as { files: UploadedFileResult[] };
          const uploaded = body.files[0];
          if (uploaded) resolve(uploaded);
          else reject(new Error("Upload succeeded but no file was returned."));
        } catch {
          reject(new Error("Unexpected response from upload server."));
        }
      } else {
        try {
          const body = JSON.parse(xhr.responseText) as { error?: string };
          reject(new Error(body.error ?? `Upload failed (${xhr.status}).`));
        } catch {
          reject(new Error(`Upload failed (${xhr.status}).`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error while uploading."));

    const formData = new FormData();
    formData.append("bucket", bucket);
    formData.append("files", file);
    xhr.send(formData);
  });
}
