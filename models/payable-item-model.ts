import mongoose, { Schema, type Document, models, type Model } from 'mongoose';

export interface IPayableItem extends Document {
  playerCpf: string;
  type: 'MENSALIDADE' | 'CARTAO_AMARELO' | 'CARTAO_VERMELHO';
  description: string;
  amount: number;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO';
  referenceDate: Date;
  paymentDate?: Date;
  paymentMethod?: 'PIX' | 'DINHEIRO';
  relatedMatchId?: Schema.Types.ObjectId;
}

const PayableItemSchema: Schema<IPayableItem> = new Schema(
  {
    playerCpf: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['MENSALIDADE', 'CARTAO_AMARELO', 'CARTAO_VERMELHO'],
      required: true,
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDENTE', 'PAGO', 'ATRASADO'],
      default: 'PENDENTE',
      index: true,
    },
    referenceDate: { type: Date, required: true },
    paymentDate: { type: Date },
    paymentMethod: { type: String, enum: ['PIX', 'DINHEIRO'] },
    relatedMatchId: { type: Schema.Types.ObjectId, ref: 'Match' },
  },
  { timestamps: true }
);

const PayableItem: Model<IPayableItem> = 
  models.PayableItem || mongoose.model<IPayableItem>('PayableItem', PayableItemSchema);

export default PayableItem;
