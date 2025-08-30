/**
 * payment-actions.ts
 * 
 * Este arquivo contém as Server Actions relacionadas à lógica de pagamento,
 * como a criação de cobranças PIX utilizando o Mercado Pago.
 */
'use server'

import { MercadoPagoConfig, Payment } from 'mercadopago'
import { format } from 'date-fns' 
import dbConnect from '@/lib/mongodb'
import { getSession } from '@/lib/auth'
import { getAppConfig } from '@/models/config-model'
import Player from '@/models/player-model'
import Subscription from '@/models/subscription-model'

/**
 * Cria uma nova subscrição no banco de dados e gera um pagamento PIX via Mercado Pago.
 */
export async function createPixPayment() {
  try {
    // 1. Obter dados da sessão e configuração
    const session = await getSession()
    if (!session) {
      return { error: 'Usuário não autenticado.' }
    }

    const appConfig = await getAppConfig()
    const player = await Player.findOne({ cpf: session.cpf })

    if (!player) {
      return { error: 'Jogador não encontrado.' }
    }

    const mpAccessToken = process.env.MP_ACCESS_TOKEN
    const notificationUrl = process.env.MP_WEBHOOK_URL

    if (!mpAccessToken || !notificationUrl) {
      console.error('Variáveis de ambiente do Mercado Pago não configuradas.')
      return { error: 'O sistema de pagamento está temporariamente indisponível.' }
    }

    const value = appConfig.valorMensalidade
    const mesReferencia = format(new Date(), 'yyyy-MM')

    // 2. Criar a subscrição no nosso DB primeiro para ter um ID
    await dbConnect()
    const newSubscription = await Subscription.create({
      jogadorCpf: player.cpf,
      mesReferencia,
      valor: value,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const internalSubscriptionId = newSubscription._id

    // 3. Preparar e criar o pagamento no Mercado Pago
    const expirationDate = new Date()
    expirationDate.setMinutes(expirationDate.getMinutes() + 30) // Expira em 30 minutos
    const formattedExpirationDate = format(expirationDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")

    const client = new MercadoPagoConfig({ accessToken: mpAccessToken })

    const nameParts = player.nome.split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '.'

    const description = `Mensalidade AFPS - ${mesReferencia}`;

    const paymentResponse = await new Payment(client).create({
      body: {
        transaction_amount: value,
        description: description, // Usar a variável aqui
        payment_method_id: 'pix',
        external_reference: internalSubscriptionId.toString(),
        date_of_expiration: formattedExpirationDate,
        payer: {
          email: player.email,
          first_name: firstName,
          last_name: lastName,
          identification: {
            type: 'CPF',
            number: player.cpf.replace(/\D/g, ''),
          },
          address: {
            zip_code: '48903-455',
            street_name: 'Praça da Sé',
            street_number: 's/n',
            neighborhood: 'Centro',
            city: 'Juazeiro',
            federal_unit: 'BA',
          },
        },
        notification_url: notificationUrl,
      },
    })

    const paymentId = paymentResponse.id
    const pixData = paymentResponse.point_of_interaction?.transaction_data

    if (!paymentId || !pixData) {
      console.error('Resposta inválida da API do Mercado Pago:', paymentResponse)
      await Subscription.deleteOne({ _id: internalSubscriptionId })
      return { error: 'Não foi possível gerar o QR Code. Tente novamente mais tarde.' }
    }

    // 4. Atualizar nossa subscrição com o ID do pagamento do MP
    await Subscription.findByIdAndUpdate(internalSubscriptionId, { $set: { paymentId: paymentId } })

    return {
      success: true,
      qrCode: `data:image/png;base64,${pixData.qr_code_base64}`,
      payload: pixData.qr_code,
      value,
      description, // Retornar a descrição
      subscriptionId: internalSubscriptionId.toString(),
    }
  } catch (error: any) {
    console.error('Erro ao criar pagamento PIX:', error)
    const errorMessage = error.cause?.message || 'Não foi possível gerar o QR Code. Tente novamente mais tarde.'
    return { error: errorMessage }
  }
}
