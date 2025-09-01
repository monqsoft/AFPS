'use server';

import { getSession } from '@/lib/auth';
import { ROLES } from '@/lib/roles';
import dbConnect from '@/lib/mongodb';
import Match, { type IMatch } from '@/models/match-model';
import Player from '@/models/player-model';
import { createLog } from '@/models/log-model';
import { revalidatePath } from 'next/cache';

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
      registrationCompleted: true,
    })
      .select('cpf nome apelido numero posicao')
      .sort({ nome: 1 })
      .lean();

    return { success: true, players };
  } catch (error) {
    console.error('Error fetching players:', error);
    return { success: false, message: 'Erro ao buscar jogadores' };
  }
}
