"use server"
import dbConnect from "@/lib/mongodb"
import Player, { type IPlayer } from "@/models/player-model"
import { createSession, clearSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createLog } from "@/models/log-model"

export interface LoginFormState {
  message: string | null
  success: boolean
}

export async function loginAction(prevState: LoginFormState | undefined, formData: FormData): Promise<LoginFormState> {
  const cpf = formData.get("cpf") as string

  if (!cpf || !/^\d{11}$/.test(cpf.replace(/\D/g, ""))) {
    return { message: "CPF inválido. Use apenas números, 11 dígitos.", success: false }
  }
  const cleanedCpf = cpf.replace(/\D/g, "")

  try {
    await dbConnect()
    const player = (await Player.findOne({ cpf: cleanedCpf }).lean()) as IPlayer | null

    if (!player) {
      await createLog("Tentativa de login falhou", cleanedCpf, "system", {
        motivo: "CPF não encontrado ou não autorizado",
      })
      return { message: "CPF não encontrado ou não autorizado.", success: false }
    }

    // For now, any player found is considered "authorized"
    // The "status" field will differentiate between fully registered and just authorized
    await createSession(player)
    await createLog("Login bem-sucedido", player.cpf, player.role, { nome: player.nome })

    if (player.status === "autorizado_nao_cadastrado") {
      // TODO: redirect('/cadastro'); // Implement cadastro page later
      redirect("/dashboard") // For now, redirect to dashboard
    } else {
      redirect("/dashboard")
    }
    // Redirect is handled by Next.js, this return is for type consistency but won't be reached.
    return { message: "Login bem-sucedido!", success: true }
  } catch (error) {
    console.error("Login error:", error)
    await createLog("Erro no login", cleanedCpf, "system", { erro: (error as Error).message })
    return { message: "Erro ao tentar fazer login. Tente novamente.", success: false }
  }
}

export async function logoutAction() {
  const session = await getSession()
  if (session) {
    await createLog("Logout", session.cpf, session.role)
  }
  await clearSession()
  redirect("/login")
}
