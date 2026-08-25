import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { attachUser } from "./middleware/auth";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth.routes";
import { availabilityRouter, slotsRouter } from "./routes/availability.routes";
import { bookingsRouter } from "./routes/bookings.routes";
import { accountRouter } from "./routes/account.routes";
import { reviewsRouter } from "./routes/reviews.routes";
import { supportRouter } from "./routes/support.routes";
import { subscriptionsRouter } from "./routes/subscriptions.routes";
import { uploadsRouter } from "./routes/uploads.routes";
import { equipmentRouter } from "./routes/equipment.routes";
import { loyaltyRouter } from "./routes/loyalty.routes";
import { referralsRouter } from "./routes/referrals.routes";
import { adminRouter } from "./routes/admin.routes";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());
  app.use(morgan(env.isProd ? "combined" : "dev"));

  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", apiLimiter);

  app.use(attachUser);

  // Local-disk storage fallback (see lib/storage.ts) — served publicly so
  // the frontend can display uploaded photos when Supabase isn't configured.
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.get("/health", (_req, res) => res.json({ status: "ok", uptime: process.uptime() }));

  // Note: a stricter brute-force limiter is applied inside auth.routes.ts,
  // scoped only to credential-guessing-sensitive endpoints (login, register,
  // password reset) — NOT to /me or /refresh, which fire on every page load.
  app.use("/api/auth", authRouter);
  app.use("/api/availability", availabilityRouter);
  app.use("/api/slots", slotsRouter);
  app.use("/api/bookings", bookingsRouter);
  app.use("/api/account", accountRouter);
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/support", supportRouter);
  app.use("/api/subscriptions", subscriptionsRouter);
  app.use("/api/uploads", uploadsRouter);
  app.use("/api/equipment", equipmentRouter);
  app.use("/api/loyalty", loyaltyRouter);
  app.use("/api/referrals", referralsRouter);
  app.use("/api/admin", adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
