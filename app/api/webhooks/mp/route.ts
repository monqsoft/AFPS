/**
 * app/api/webhooks/mp/route.ts
 * 
 * Este arquivo define o endpoint de API (Route Handler) que recebe as notificações
 * de webhook do Mercado Pago para confirmar o status dos pagamentos.
 */

import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import Transaction from '@/models/transaction-model';
import PayableItem from '@/models/payable-item-model';
import mongoose from 'mongoose';

/**
 * Webhook do Mercado Pago - API Route
 * Recebe notificações de pagamento e atualiza o status da transação e dos itens associados.
 */
export async function POST(req: NextRequest) {
  console.log('🔔 Webhook de Transação recebido do Mercado Pago');

  try {
    const notification = await req.json();
    console.log('📦 Payload:', JSON.stringify(notification, null, 2));

    if (notification.type !== 'payment') {
      console.log('ℹ️ Não é notificação de pagamento:', notification.type);
      return NextResponse.json({ success: true, message: 'Not a payment notification' });
    }

    const paymentId = notification.data.id;
    if (!paymentId) {
      console.log('❌ Payment ID não encontrado no payload');
      return NextResponse.json({ error: 'Payment ID not found' }, { status: 400 });
    }

    const mpAccessToken = process.env.MP_ACCESS_TOKEN;
    if (!mpAccessToken) {
      console.error('❌ MP_ACCESS_TOKEN não configurado no servidor');
      return NextResponse.json({ error: 'Internal server configuration error' }, { status: 500 });
    }

    const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
    const paymentInfo = await new Payment(client).get({ id: paymentId });
    
    console.log('💰 Status do pagamento no MP:', paymentInfo.status);

    if (paymentInfo.status === 'approved') {
      const transactionId = paymentInfo.external_reference;
      console.log('🔗 ID da Transação interna:', transactionId);
      
      if (!transactionId || !ObjectId.isValid(transactionId)) {
        console.error('❌ external_reference (ID da Transação) inválido ou ausente:', transactionId);
        return NextResponse.json({ error: 'Invalid or missing external_reference' }, { status: 200 });
      }

      await dbConnect();
      const dbSession = await mongoose.startSession();

      try {
        await dbSession.withTransaction(async () => {
          const transaction = await Transaction.findById(transactionId).session(dbSession);

          if (!transaction) {
            console.log('⚠️ Transação não encontrada:', transactionId);
            return;
          }

          // Update all payable items linked to this transaction
          const updateResult = await PayableItem.updateMany(
            { _id: { $in: transaction.items } },
            { $set: { status: 'PAGO', paymentDate: new Date(), paymentMethod: 'PIX' } },
            { session: dbSession }
          );

          if (updateResult.modifiedCount === 0) {
            console.log('⚠️ Nenhum item de pagamento foi atualizado para a transação:', transactionId);
            // This might not be an error if the webhook is received multiple times.
          }

          console.log(`✅ Sucesso: ${updateResult.modifiedCount} item(s) da transação ${transactionId} atualizados para PAGO.`);
        });
      } finally {
        await dbSession.endSession();
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('💥 Erro inesperado no webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
