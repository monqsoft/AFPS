import mongoose, { Schema, models, type Model } from "mongoose";
import type { ISubscription } from "@/types/subscription-interfaces";

const SubscriptionSchema: Schema<ISubscription> = new Schema(
  {
    jogadorCpf: { type: String, required: true, index: true },
    mesReferencia: { type: String, required: true },
    dataPagamento: { type: Date },
    valor: { type: Number, required: true },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    paymentId: { type: Number, index: true },
  },
  { timestamps: true },
)

const Subscription: Model<ISubscription> =
  models.Subscription || mongoose.model<ISubscription>("Subscription", SubscriptionSchema)
export default Subscription
