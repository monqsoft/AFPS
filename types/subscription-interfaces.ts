import type { Document } from "mongoose";

export interface ISubscription extends Document {
  jogadorCpf: string;
  mesReferencia: string; // e.g., "2024-07"
  dataPagamento?: Date;
  valor: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  paymentId?: number; // ID do pagamento retornado pelo Mercado Pago
}
