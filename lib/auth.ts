// lib/auth.ts
import type { IPlayer } from '@/models/player-model';
import { cookies } from 'next/headers';
import { ROLES } from './roles';
import type { SessionData } from '@/types/player-interfaces';

const SESSION_COOKIE_NAME = 'afps_session';

export async function createSession(player: IPlayer) {
  const sessionData: SessionData = {
    cpf: player.cpf,
    role: player.role ?? ROLES.JOGADOR,
    nome: player.nome,
  };
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    path: '/',
    sameSite: 'lax',
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (sessionCookie?.value) {
    try {
      return JSON.parse(sessionCookie.value) as SessionData;
    } catch (error) {
      console.error('Failed to parse session cookie:', error);
      return null;
    }
  }
  return null;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export const auth = {
  createSession,
  getSession,
  clearSession,
};
