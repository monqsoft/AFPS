"use server"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/mongodb"
import Player, { type IPlayer } from "@/models/player-model"
import { clearSession, createSession } from "@/lib/auth"

export interface LoginFormState {
  message: string | null
  success: boolean
}

export async function loginAction(_prevState: LoginFormState, formData: FormData): Promise<LoginFormState> {
  await dbConnect()

  const cpf = formData.get("cpf")?.toString().replace(/\D/g, "")
  if (!cpf || cpf.length !== 11) {
    return {
      message: "Por favor, insira um CPF válido.",
      success: false,
    }
  }

  try {
    const player = await Player.findOne({ cpf }).lean() as IPlayer | null
    if (!player) {
      return {
        message: "CPF não encontrado ou não autorizado.",
        success: false,
      }
    }

    if (!player.isAuthorized) {
      return {
        message: "Este CPF não está autorizado para acessar o sistema.",
        success: false,
      }
    }

    await createSession(player)
    redirect("/dashboard") // Server-side redirect after successful login
  } catch (error) {
    console.error("Login error:", error)
    return {
      message: "Ocorreu um erro durante o login. Tente novamente.",
      success: false,
    }
  }
}

export async function logoutAction() {
  await clearSession()
  redirect("/login")
}
