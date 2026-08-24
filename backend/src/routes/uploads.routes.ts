import { Router } from "express";
import multer from "multer";
import { ApiError } from "../middleware/errorHandler";
import { uploadFile, type StorageBucket } from "../lib/storage";

export const uploadsRouter = Router();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 6 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new ApiError(400, `Unsupported file type: ${file.mimetype}. Use JPG, PNG or WEBP.`));
      return;
    }
    cb(null, true);
  },
});

const VALID_BUCKETS: StorageBucket[] = [
  "service-images",
  "customer-uploads",
  "profile-images",
  "review-images",
];

// No auth required — the booking flow supports guest checkout, so a
// signed-out customer must still be able to attach photos. Abuse is
// mitigated by strict file-type/size/count limits plus the global API
// rate limiter in app.ts.
uploadsRouter.post("/", upload.array("files", 6), async (req, res) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    throw new ApiError(400, "No files were uploaded.");
  }

  const bucketParam = typeof req.body?.bucket === "string" ? req.body.bucket : "customer-uploads";
  const bucket = VALID_BUCKETS.includes(bucketParam as StorageBucket)
    ? (bucketParam as StorageBucket)
    : "customer-uploads";

  const uploaded = await Promise.all(
    files.map(async (file) => {
      const result = await uploadFile(bucket, file.buffer, file.originalname, file.mimetype);
      return { name: file.originalname, url: result.url };
    })
  );

  res.status(201).json({ files: uploaded });
});
