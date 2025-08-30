/**
 * app/api/webhooks/mp/route.ts
 * 
 * Este arquivo define o endpoint de API (Route Handler) que recebe as notificações
 * de webhook do Mercado Pago para confirmar o status dos pagamentos.
 */

import { MercadoPagoConfig, Payment } from 'mercadopago'
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import Subscription from '@/models/subscription-model'
import mongoose from 'mongoose'

/**
 * Webhook do Mercado Pago - API Route
 * Recebe notificações de pagamento e atualiza o status da subscrição no banco de dados.
 */
export async function POST(req: NextRequest) {
  console.log('🔔 Webhook recebido do Mercado Pago')

  try {
    const notification = await req.json()
    console.log('📦 Payload:', JSON.stringify(notification, null, 2))

    if (notification.type !== 'payment') {
      console.log('ℹ️ Não é notificação de pagamento:', notification.type)
      return NextResponse.json({ success: true, message: 'Not a payment notification' })
    }

    const paymentId = notification.data.id
    if (!paymentId) {
      console.log('❌ Payment ID não encontrado no payload')
      return NextResponse.json({ error: 'Payment ID not found' }, { status: 400 })
    }

    const mpAccessToken = process.env.MP_ACCESS_TOKEN
    if (!mpAccessToken) {
      console.error('❌ MP_ACCESS_TOKEN não configurado no servidor')
      return NextResponse.json({ error: 'Internal server configuration error' }, { status: 500 })
    }

    // Buscar informações do pagamento na API do Mercado Pago
    const client = new MercadoPagoConfig({ accessToken: mpAccessToken })
    const paymentInfo = await new Payment(client).get({ id: paymentId })
    
    console.log('💰 Status do pagamento no MP:', paymentInfo.status)

    if (paymentInfo.status === 'approved') {
      const internalSubscriptionId = paymentInfo.external_reference
      console.log('🔗 ID da subscrição interna:', internalSubscriptionId)
      
      if (!internalSubscriptionId || !ObjectId.isValid(internalSubscriptionId)) {
        console.error('❌ external_reference (ID da subscrição) inválido ou ausente:', internalSubscriptionId)
        // Retornar 200 para o MP não reenviar a notificação de um erro que não pode ser resolvido
        return NextResponse.json({ error: 'Invalid or missing external_reference' }, { status: 200 })
      }

      await dbConnect()
      const session = await mongoose.startSession()

      try {
        await session.withTransaction(async () => {
          const subscription = await Subscription.findOne(
            { _id: new ObjectId(internalSubscriptionId), status: 'PENDING' },
            { session }
          )

          if (!subscription) {
            console.log('⚠️ Subscrição não encontrada, já processada ou com status diferente de PENDING:', internalSubscriptionId)
            return // Finaliza a transação, pois não há o que fazer
          }

          // Atualizar status da subscrição para APROVADO
          const updateResult = await Subscription.updateOne(
            { _id: subscription._id },
            { $set: { status: 'APPROVED', dataPagamento: new Date(), updatedAt: new Date() } },
            { session }
          )

          if (updateResult.modifiedCount === 0) {
            throw new Error(`Falha ao atualizar o status da subscrição ${subscription._id}`)
          }

          console.log(`✅ Sucesso: Subscrição ${subscription._id} atualizada para APPROVED.`)
        })
      } finally {
        await session.endSession()
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('💥 Erro inesperado no webhook:', error)
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 })
  }
}
