import { randomBytes } from "crypto";
import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

/**
 * Storage abstraction (Phase 9). When SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * are set, uploads go to Supabase Storage (the intended production backend).
 * Without them, files are saved to local disk under /uploads and served
 * statically — a fully working fallback for local development that keeps
 * the same interface, so adding real credentials later requires no
 * frontend or route changes.
 */

export type StorageBucket = "service-images" | "customer-uploads" | "profile-images" | "review-images";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

const supabase =
  env.supabaseUrl && env.supabaseServiceRoleKey
    ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey)
    : null;

export const storageMode: "supabase" | "local" = supabase ? "supabase" : "local";

function safeExtension(originalName: string) {
  const ext = path.extname(originalName).toLowerCase();
  return /^\.[a-z0-9]{2,5}$/.test(ext) ? ext : "";
}

export async function uploadFile(
  bucket: StorageBucket,
  buffer: Buffer,
  originalName: string,
  mimetype: string
): Promise<{ url: string; path: string }> {
  const filename = `${Date.now()}_${randomBytes(8).toString("hex")}${safeExtension(originalName)}`;

  if (supabase) {
    const objectPath = `${bucket}/${filename}`;
    const { error } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
      contentType: mimetype,
      upsert: false,
    });
    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    return { url: data.publicUrl, path: objectPath };
  }

  // Local disk fallback
  const dir = path.join(UPLOAD_ROOT, bucket);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, filename);
  await writeFile(filePath, buffer);

  const publicPath = `/uploads/${bucket}/${filename}`;
  return { url: `${env.publicUrl}${publicPath}`, path: publicPath };
}
