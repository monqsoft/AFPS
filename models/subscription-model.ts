import mongoose, { Schema, type Document, models, type Model } from "mongoose"

export interface ISubscription extends Document {
  jogadorCpf: string
  mesReferencia: string // e.g., "2024-07"
  dataPagamento?: Date
  valor: number
  status: "pendente" | "pago" | "atrasado"
  transactionId?: string // For PIX reconciliation
}

const SubscriptionSchema: Schema<ISubscription> = new Schema(
  {
    jogadorCpf: { type: String, required: true, index: true },
    mesReferencia: { type: String, required: true },
    dataPagamento: { type: Date },
    valor: { type: Number, required: true },
    status: { type: String, enum: ["pendente", "pago", "atrasado"], default: "pendente" },
    transactionId: { type: String },
  },
  { timestamps: true },
)

const Subscription: Model<ISubscription> =
  models.Subscription || mongoose.model<ISubscription>("Subscription", SubscriptionSchema)
export default Subscription
