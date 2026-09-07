import { env } from "./config/env";
import { connectDB } from "./config/db";
import { createApp } from "./app";
import { bootstrapInitialAdmin } from "./lib/bootstrap-admin";

async function main() {
  await connectDB();
  await bootstrapInitialAdmin();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[server] AGS backend listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});
