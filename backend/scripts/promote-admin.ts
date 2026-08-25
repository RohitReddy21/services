/**
 * One-time helper to grant a user ADMIN role so they can access the hidden
 * /admin dashboard. Run locally with your own account's email — never expose
 * this as an API endpoint, since anyone could otherwise self-promote.
 *
 * Usage: npm run promote-admin -- you@example.com
 */
import "dotenv/config";
import mongoose from "mongoose";
import { env } from "../src/config/env";
import { User } from "../src/models/User";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npm run promote-admin -- you@example.com");
    process.exit(1);
  }

  await mongoose.connect(env.mongodbUri, { dbName: env.mongodbDbName });

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: "ADMIN" },
    { returnDocument: "after" }
  );

  if (!user) {
    console.error(`No account found for ${email}`);
    process.exit(1);
  }

  console.log(`${user.email} is now an ADMIN. Visit /admin while logged in as this account.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
