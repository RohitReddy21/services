import type { Schema } from "mongoose";

/** Normalizes every model's JSON output to `id` (string) instead of `_id`/`__v`. */
export function withJsonId(schema: Schema) {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = String(ret._id);
      delete ret._id;
      return ret;
    },
  });
}
