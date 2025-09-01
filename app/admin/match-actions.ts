'use server';

import { getSession } from '@/lib/auth';
import { ROLES } from '@/lib/roles';
import dbConnect from '@/lib/mongodb';
import Match, { type IMatch } from '@/models/match-model';
import Player from '@/models/player-model';
import { createLog } from '@/models/log-model';
import { revalidatePath } from 'next/cache';

import { getAppConfig } from '@/models/config-model';
import PayableItem from '@/models/payable-item-model';

export async function createMatchAction(matchData: Partial<IMatch>) {
  try {
    const session = await getSession();
    if (!session || session.role !== ROLES.ADMIN) {
      return { success: false, message: 'Acesso negado' };
    }

    await dbConnect();

    const newMatch = await Match.create({
      ...matchData,
      registradoPor: session.cpf,
    });

    await createLog('Partida criada', session.cpf, 'admin', {
      matchId: newMatch._id,
      teams: `${matchData.timeA?.nome} vs ${matchData.timeB?.nome}`,
    });

    revalidatePath('/admin');
    return { success: true, match: newMatch };
  } catch (error) {
    console.error('Error creating match:', error);
    return { success: false, message: 'Erro ao criar partida' };
  }
}

export async function updateMatchAction(
  matchId: string,
  matchData: Partial<IMatch>
) {
  try {
    const session = await getSession();
    if (!session || session.role !== ROLES.ADMIN) {
      return { success: false, message: 'Acesso negado' };
    }

    await dbConnect();

    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      { ...matchData, registradoPor: session.cpf },
      { new: true }
    );

    if (!updatedMatch) {
      return { success: false, message: 'Partida não encontrada' };
    }

    // Se a partida for finalizada, gerar débitos para os cartões de forma idempotente
    if (matchData.status === 'finalizada') { // Use matchData.status here
      const config = await getAppConfig();
      // Usar matchData como a fonte da verdade para os cartões
      const allCardsInForm = [
        ...(matchData.timeA?.cartoes || []),
        ...(matchData.timeB?.cartoes || []),
      ];

      const existingFines = await PayableItem.find({ 
        relatedMatchId: updatedMatch._id, 
        type: { $in: ['CARTAO_AMARELO', 'CARTAO_VERMELHO'] } 
      });

      for (const card of allCardsInForm) {
        const cardEventIdentifier = `${card.jogadorCpf}-${card.minuto}`;
        const fineAlreadyExists = existingFines.some(fine => 
          fine.description.includes(`[${cardEventIdentifier}]`)
        );

        if (!fineAlreadyExists) {
          const amount = card.tipo === 'amarelo' ? config.valorCartaoAmarelo : config.valorCartaoVermelho;
          const description = `Cartão ${card.tipo} (minuto ${card.minuto}) na partida ${matchData.timeA?.nome} vs ${matchData.timeB?.nome} [${cardEventIdentifier}]`;
          
          await PayableItem.create({
            playerCpf: card.jogadorCpf,
            type: card.tipo === 'amarelo' ? 'CARTAO_AMARELO' : 'CARTAO_VERMELHO',
            description,
            amount,
            status: 'PENDENTE',
            referenceDate: updatedMatch.data,
            relatedMatchId: updatedMatch._id,
          });
        }
      }
    }

    await createLog('Partida atualizada', session.cpf, 'admin', {
      matchId,
      teams: `${matchData.timeA?.nome} vs ${matchData.timeB?.nome}`,
    });

    revalidatePath('/admin');
    return { success: true, match: updatedMatch };
  } catch (error) {
    console.error('Error updating match:', error);
    return { success: false, message: 'Erro ao atualizar partida' };
  }
}

export async function deleteMatchAction(matchId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== ROLES.ADMIN) {
      return { success: false, message: 'Acesso negado' };
    }

    await dbConnect();

    const match = await Match.findByIdAndDelete(matchId);
    if (!match) {
      return { success: false, message: 'Partida não encontrada' };
    }

    await createLog('Partida excluída', session.cpf, 'admin', {
      matchId,
      teams: `${match.timeA.nome} vs ${match.timeB.nome}`,
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting match:', error);
    return { success: false, message: 'Erro ao excluir partida' };
  }
}

export async function fetchMatchesAction(filters: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  playerCpf?: string;
}) {
  try {
    const session = await getSession();
    if (!session || session.role !== ROLES.ADMIN) {
      return { success: false, message: 'Acesso negado' };
    }

    await dbConnect();

    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.data = {};
      if (filters.dateFrom) {
        query.data.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.data.$lte = new Date(filters.dateTo);
      }
    }

    if (filters.playerCpf) {
      query.$or = [
        { 'timeA.jogadores.cpf': filters.playerCpf },
        { 'timeB.jogadores.cpf': filters.playerCpf },
      ];
    }

    const matches = await Match.find(query).sort({ data: -1 }).lean();

    return { success: true, matches };
  } catch (error) {
    console.error('Error fetching matches:', error);
    return { success: false, message: 'Erro ao buscar partidas' };
  }
}

export async function fetchPlayersAction() {
  try {
    const session = await getSession();
    if (!session || session.role !== ROLES.ADMIN) {
      return { success: false, message: 'Acesso negado' };
    }

    await dbConnect();

    const players = await Player.find({
      status: 'ativo',
      // registrationCompleted: true, // Temporarily removed for broader selection
    })
      .select('cpf nome apelido numero posicao status')
      .sort({ nome: 1 })
      .lean();

    return { success: true, players };
  } catch (error) {
    console.error('Error fetching players:', error);
    return { success: false, message: 'Erro ao buscar jogadores' };
  }
}