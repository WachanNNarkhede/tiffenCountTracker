import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

const DeliverySchema = new Schema({
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: "Subscription",
    required: true,
    index: true,
  },
  date: { type: String, required: true }, // YYYY-MM-DD
  count: { type: Number, required: true, enum: [1, 2], default: 1 },
  note: { type: String, trim: true, default: "" },
});

// One delivery record per subscription per calendar date.
DeliverySchema.index({ subscriptionId: 1, date: 1 }, { unique: true });

export type DeliveryDoc = InferSchemaType<typeof DeliverySchema>;

export const DeliveryModel: Model<DeliveryDoc> =
  (mongoose.models.Delivery as Model<DeliveryDoc>) ||
  mongoose.model<DeliveryDoc>("Delivery", DeliverySchema);
