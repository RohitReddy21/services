import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB() {
  mongoose.set("strictQuery", true);

  await mongoose.connect(env.mongodbUri, { dbName: env.mongodbDbName });

  const { connection } = mongoose;
  console.log(`[db] connected to MongoDB: ${connection.name}`);

  connection.on("error", (err) => {
    console.error("[db] connection error:", err);
  });

  return connection;
}
