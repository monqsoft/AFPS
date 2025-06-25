import { cookies } from "next/headers"
import type { IPlayer } from "@/models/player-model"

const SESSION_COOKIE_NAME = "afps_session"

interface SessionData {
  cpf: string
  role: "jogador" | "admin"
  nome: string
}

export async function createSession(player: IPlayer) {
  const sessionData: SessionData = {
    cpf: player.cpf,
    role: player.role,
    nome: player.nome,
  }
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  cookies().set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    path: "/",
    sameSite: "lax",
  })
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
  if (sessionCookie?.value) {
    try {
      return JSON.parse(sessionCookie.value) as SessionData
    } catch (error) {
      console.error("Failed to parse session cookie:", error)
      return null
    }
  }
  return null
}

export async function clearSession() {
  cookies().delete(SESSION_COOKIE_NAME)
}
