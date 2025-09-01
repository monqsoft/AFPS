import mongoose, { Schema, type Document, models, type Model } from 'mongoose';

export interface ITransaction extends Document {
  playerCpf: string;
  items: Schema.Types.ObjectId[];
  totalAmount: number;
  paymentMethod: 'PIX' | 'DINHEIRO';
  paymentDate: Date;
  mercadoPagoPaymentId?: number;
}

const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    playerCpf: { type: String, required: true, index: true },
    items: [{ type: Schema.Types.ObjectId, ref: 'PayableItem', required: true }],
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['PIX', 'DINHEIRO'],
      required: true,
    },
    paymentDate: { type: Date, default: Date.now, required: true },
    mercadoPagoPaymentId: { type: Number, index: true },
  },
  { timestamps: true }
);

const Transaction: Model<ITransaction> = 
  models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
