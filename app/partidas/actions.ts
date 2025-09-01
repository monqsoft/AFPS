'use server';

import { getSession } from '@/lib/auth';
import { ROLES } from '@/lib/roles';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/match-model';
import Player from '@/models/player-model';
import type { PlayerStats } from '@/types/match-interfaces';

export async function fetchPublicMatchesAction(filters: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  playerCpf?: string;
  local?: string;
}) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, message: 'Acesso negado' };
    }

    // Allow access to all authenticated users
    const allowedRoles = [
      ROLES.ADMIN,
      ROLES.JOGADOR,
      ROLES.ARBITRO,
      ROLES.COMISSAO,
    ];
    if (!allowedRoles.includes(session.role)) {
      return { success: false, message: 'Acesso negado' };
    }

    await dbConnect();

    const query: any = {};

    if (filters.status && filters.status !== 'all') {
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

    if (filters.local) {
      query.local = { $regex: filters.local, $options: 'i' };
    }

    const matchesData = await Match.find(query).sort({ data: -1 }).lean();
    const matches = JSON.parse(JSON.stringify(matchesData));

    return { success: true, matches };
  } catch (error) {
    console.error('Error fetching public matches:', error);
    return { success: false, message: 'Erro ao buscar partidas' };
  }
}

export async function fetchPlayerStatsAction(): Promise<{
  success: boolean;
  stats?: PlayerStats[];
  message?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, message: 'Acesso negado' };
    }

    // Allow access to all authenticated users
    const allowedRoles = [
      ROLES.ADMIN,
      ROLES.JOGADOR,
      ROLES.ARBITRO,
      ROLES.COMISSAO,
    ];
    if (!allowedRoles.includes(session.role)) {
      return { success: false, message: 'Acesso negado' };
    }

    await dbConnect();

    // Get all matches
    const matches = await Match.find({ status: 'finalizada' }).lean();

    // Get all active players
    const players = await Player.find({
      status: 'ativo',
      registrationCompleted: true,
    })
      .select('cpf nome')
      .lean();

    // Calculate stats for each player
    const playerStats: PlayerStats[] = players.map((player) => {
      let partidasJogadas = 0;
      let gols = 0;
      let cartoesAmarelos = 0;
      let cartoesVermelhos = 0;
      let golsContra = 0;
      let penaltis = 0;

      matches.forEach((match) => {
        // Check if player participated in this match
        const playedInTeamA = match.timeA.jogadores.some(
          (j: any) => j.cpf === player.cpf
        );
        const playedInTeamB = match.timeB.jogadores.some(
          (j: any) => j.cpf === player.cpf
        );

        if (playedInTeamA || playedInTeamB) {
          partidasJogadas++;

          // Count goals
          if (playedInTeamA) {
            match.timeA.gols.forEach((gol: any) => {
              if (gol.jogadorCpf === player.cpf) {
                if (gol.tipo === 'gol_contra') {
                  golsContra++;
                } else if (gol.tipo === 'penalti') {
                  penaltis++;
                  gols++;
                } else {
                  gols++;
                }
              }
            });

            // Count cards
            match.timeA.cartoes.forEach((cartao: any) => {
              if (cartao.jogadorCpf === player.cpf) {
                if (cartao.tipo === 'amarelo') {
                  cartoesAmarelos++;
                } else if (cartao.tipo === 'vermelho') {
                  cartoesVermelhos++;
                }
              }
            });
          }

          if (playedInTeamB) {
            match.timeB.gols.forEach((gol: any) => {
              if (gol.jogadorCpf === player.cpf) {
                if (gol.tipo === 'gol_contra') {
                  golsContra++;
                } else if (gol.tipo === 'penalti') {
                  penaltis++;
                  gols++;
                } else {
                  gols++;
                }
              }
            });

            // Count cards
            match.timeB.cartoes.forEach((cartao: any) => {
              if (cartao.jogadorCpf === player.cpf) {
                if (cartao.tipo === 'amarelo') {
                  cartoesAmarelos++;
                } else if (cartao.tipo === 'vermelho') {
                  cartoesVermelhos++;
                }
              }
            });
          }
        }
      });

      return {
        cpf: player.cpf,
        nome: player.nome,
        partidasJogadas,
        gols,
        cartoesAmarelos,
        cartoesVermelhos,
        golsContra,
        penaltis,
      };
    });

    // Filter out players with no participation
    const activeStats = playerStats.filter(
      (stats) => stats.partidasJogadas > 0
    );

    return { success: true, stats: JSON.parse(JSON.stringify(activeStats)) };
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return { success: false, message: 'Erro ao buscar estatísticas' };
  }
}

export async function fetchPlayersForFilterAction() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, message: 'Acesso negado' };
    }

    const allowedRoles = [
      ROLES.ADMIN,
      ROLES.JOGADOR,
      ROLES.ARBITRO,
      ROLES.COMISSAO,
    ];
    if (!allowedRoles.includes(session.role)) {
      return { success: false, message: 'Acesso negado' };
    }

    await dbConnect();

    const players = await Player.find({
      status: 'ativo',
      registrationCompleted: true,
    })
      .select('cpf nome')
      .sort({ nome: 1 })
      .lean();

    return { success: true, players };
  } catch (error) {
    console.error('Error fetching players for filter:', error);
    return { success: false, message: 'Erro ao buscar jogadores' };
  }
}
