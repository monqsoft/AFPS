'use server';

import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Player from '@/models/player-model';
import PayableItem from '@/models/payable-item-model';
import { getAppConfig } from '@/models/config-model';
import { startOfMonth, differenceInCalendarMonths, addMonths, format } from 'date-fns';

import { MercadoPagoConfig, Payment } from 'mercadopago';
import Transaction from '@/models/transaction-model';

/**
 * Generates any missing monthly dues for the logged-in player.
 * This is called on-demand when the player visits their finance page.
 */
export async function generatePlayerDuesAction() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, message: 'Usuário não autenticado' };
    }

    await dbConnect();
    const player = await Player.findOne({ cpf: session.cpf });
    if (!player) {
      return { success: false, message: 'Jogador não encontrado' };
    }

    const appConfig = await getAppConfig();
    const monthlyFee = appConfig.valorMensalidade;

    const startDate = startOfMonth(player.createdAt || new Date());
    const endDate = startOfMonth(new Date());

    const monthsToGenerate = differenceInCalendarMonths(endDate, startDate) + 1;

    for (let i = 0; i < monthsToGenerate; i++) {
      const referenceMonth = startOfMonth(addMonths(startDate, i));
      const referenceMonthString = format(referenceMonth, 'yyyy-MM');

      // Check if a due for this month already exists
      const existingDue = await PayableItem.findOne({
        playerCpf: player.cpf,
        type: 'MENSALIDADE',
        description: `Mensalidade - ${referenceMonthString}`,
      });

      if (!existingDue) {
        await PayableItem.create({
          playerCpf: player.cpf,
          type: 'MENSALIDADE',
          description: `Mensalidade - ${referenceMonthString}`,
          amount: monthlyFee,
          status: 'PENDENTE',
          referenceDate: referenceMonth,
        });
      }
    }

    return { success: true };

  } catch (error) {
    console.error('Error generating player dues:', error);
    return { success: false, message: 'Erro ao gerar mensalidades.' };
  }
}

/**
 * Creates a checkout transaction and generates a PIX payment for selected items.
 */
export async function createCheckoutPixPayment(itemIds: string[]) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'Usuário não autenticado.' };
    }

    if (!itemIds || itemIds.length === 0) {
      return { error: 'Nenhum item selecionado para pagamento.' };
    }

    await dbConnect();
    const player = await Player.findOne({ cpf: session.cpf });
    if (!player) {
      return { error: 'Jogador não encontrado.' };
    }

    const itemsToPay = await PayableItem.find({ 
      _id: { $in: itemIds },
      playerCpf: session.cpf, // Ensure items belong to the player
      status: 'PENDENTE', // Ensure only pending items are paid
    });

    if (itemsToPay.length !== itemIds.length) {
      return { error: 'Alguns itens selecionados não são válidos ou já foram pagos.' };
    }

    const totalAmount = itemsToPay.reduce((sum, item) => sum + item.amount, 0);

    // Create a transaction record
    const newTransaction = await Transaction.create({
      playerCpf: session.cpf,
      items: itemsToPay.map(item => item._id),
      totalAmount,
      paymentMethod: 'PIX',
    });

    const mpAccessToken = process.env.MP_ACCESS_TOKEN;
    const notificationUrl = process.env.MP_WEBHOOK_URL;

    if (!mpAccessToken || !notificationUrl) {
      console.error('Variáveis de ambiente do Mercado Pago não configuradas.');
      return { error: 'O sistema de pagamento está temporariamente indisponível.' };
    }

    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 30);
    const formattedExpirationDate = format(expirationDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

    const client = new MercadoPagoConfig({ accessToken: mpAccessToken });

    const paymentResponse = await new Payment(client).create({
      body: {
        transaction_amount: totalAmount,
        description: `Pagamento de débitos AFPS - ${itemIds.length} item(s)`,
        payment_method_id: 'pix',
        external_reference: newTransaction._id.toString(), // Use Transaction ID as reference
        date_of_expiration: formattedExpirationDate,
        payer: {
          email: player.email || 'pagamento@afps.com',
          first_name: player.nome.split(' ')[0],
          last_name: player.nome.split(' ').slice(1).join(' ') || '.',
          identification: { type: 'CPF', number: player.cpf.replace(/\D/g, '') },
        },
        notification_url: notificationUrl,
      },
    });

    const paymentId = paymentResponse.id;
    const pixData = paymentResponse.point_of_interaction?.transaction_data;

    if (!paymentId || !pixData) {
      console.error('Resposta inválida da API do Mercado Pago:', paymentResponse);
      // Rollback transaction creation if MP fails
      await Transaction.findByIdAndDelete(newTransaction._id);
      return { error: 'Não foi possível gerar o QR Code. Tente novamente mais tarde.' };
    }

    // Update transaction with Mercado Pago payment ID
    await Transaction.findByIdAndUpdate(newTransaction._id, { $set: { mercadoPagoPaymentId: paymentId } });

    return {
      success: true,
      qrCode: `data:image/png;base64,${pixData.qr_code_base64}`,
      payload: pixData.qr_code,
    };

  } catch (error: any) {
    console.error('Erro ao criar pagamento PIX:', error);
    return { error: 'Não foi possível gerar o QR Code. Tente novamente mais tarde.' };
  }
}
