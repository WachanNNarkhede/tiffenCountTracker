import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

const SubscriptionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, default: "My tiffin plan" },
    totalMeals: { type: Number, required: true, min: 1, default: 30 },
    startDate: { type: String, required: true }, // YYYY-MM-DD
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export type SubscriptionDoc = InferSchemaType<typeof SubscriptionSchema>;

// Guard against model recompilation during Next.js hot reload.
export const SubscriptionModel: Model<SubscriptionDoc> =
  (mongoose.models.Subscription as Model<SubscriptionDoc>) ||
  mongoose.model<SubscriptionDoc>("Subscription", SubscriptionSchema);
