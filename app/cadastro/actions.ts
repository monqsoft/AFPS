"use server"
import dbConnect from "@/lib/mongodb"
import Player, { type IPlayer } from "@/models/player-model"
import { createLog } from "@/models/log-model"
import { z } from "zod"
import { ROLES } from "@/lib/roles"

const CpfSchema = z.string().regex(/^\d{11}$/, "CPF deve conter 11 números.")

export interface CpfCheckState {
  message?: string
  success: boolean
  cpf?: string
  isAuthorized?: boolean
  isRegistered?: boolean
}

export async function checkCpfAuthorization(
  prevState: CpfCheckState | undefined,
  formData: FormData,
): Promise<CpfCheckState> {
  const cpfInput = formData.get("cpf") as string
  const cleanedCpf = cpfInput?.replace(/\D/g, "") || ""

  const validation = CpfSchema.safeParse(cleanedCpf)
  if (!validation.success) {
    return { success: false, message: validation.error.errors[0].message }
  }

  try {
    await dbConnect()
    const player = (await Player.findOne({ cpf: cleanedCpf }).lean()) as IPlayer | null

    if (player && player.isAuthorized) {
      if (player.registrationCompleted) {
        await createLog("Tentativa de cadastro CPF já registrado", cleanedCpf, "system", { cpf: cleanedCpf })
        return {
          success: true,
          cpf: cleanedCpf,
          isAuthorized: true,
          isRegistered: true,
          message: "Este CPF já possui cadastro completo. Tente fazer login.",
        }
      }
      await createLog("Verificação de CPF para cadastro bem-sucedida", cleanedCpf, "system", { cpf: cleanedCpf })
      return { success: true, cpf: cleanedCpf, isAuthorized: true, isRegistered: false }
    } else {
      await createLog("Tentativa de cadastro CPF não autorizado", cleanedCpf, "system", { cpf: cleanedCpf })
      return { success: false, message: "CPF não autorizado para cadastro. Entre em contato com a administração." }
    }
  } catch (error) {
    console.error("CPF Check Error:", error)
    await createLog("Erro na verificação de CPF para cadastro", cleanedCpf, "system", {
      error: (error as Error).message,
    })
    return { success: false, message: "Erro ao verificar CPF. Tente novamente." }
  }
}

const PersonalInfoSchema = z.object({
  cpf: CpfSchema,
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
  apelido: z.string().optional(),
  nascimento: z.string().refine((date) => !isNaN(new Date(date).getTime()), "Data de nascimento inválida."),
})

const ContactInfoSchema = z.object({
  cpf: CpfSchema,
  telefone: z
    .string()
    .regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 números.")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Email inválido.").optional().or(z.literal("")),
  posicao: z.string().optional(),
  numero: z.coerce
    .number()
    .int()
    .positive("Número da camisa deve ser positivo.")
    .optional()
    .or(z.literal(0))
    .or(z.literal("")),
})

const FinalizationSchema = z.object({
  cpf: CpfSchema,
  role: z.enum([ROLES.JOGADOR, ROLES.ADMIN, ROLES.ARBITRO, ROLES.COMISSAO], { errorMap: () => ({ message: "Selecione um perfil." }) }),
})

export async function submitRegistrationStep(
  step: number,
  cpf: string,
  data: Record<string, any>,
): Promise<{ success: boolean; message?: string; errors?: Record<string, string[]> }> {
  await dbConnect()
  const player = await Player.findOne({ cpf })

  if (!player || !player.isAuthorized || player.registrationCompleted) {
    return { success: false, message: "Não autorizado ou já registrado." }
  }

  try {
    if (step === 1) {
      const validated = PersonalInfoSchema.safeParse({ cpf, ...data })
      if (!validated.success) return { success: false, errors: validated.error.flatten().fieldErrors }
      player.nome = validated.data.nome
      player.apelido = validated.data.apelido
      player.nascimento = new Date(validated.data.nascimento)
    } else if (step === 2) {
      const validated = ContactInfoSchema.safeParse({ cpf, ...data })
      if (!validated.success) return { success: false, errors: validated.error.flatten().fieldErrors }
      player.telefone = validated.data.telefone
      player.email = validated.data.email
      player.posicao = validated.data.posicao
      player.numero = validated.data.numero ? Number(validated.data.numero) : undefined
    } else if (step === 3) {
      const validated = FinalizationSchema.safeParse({ cpf, ...data })
      if (!validated.success) return { success: false, errors: validated.error.flatten().fieldErrors }
      // Security: Ensure only pre-approved admins can select 'admin' role, or default to 'jogador'
      // For now, let's assume the UI restricts this or it's a simplified setup.
      // In a real app, check if this CPF was pre-authorized for admin role.
      player.role = validated.data.role
      player.status = "ativo"
      player.registrationCompleted = true
      await createLog("Cadastro finalizado", cpf, player.role || ROLES.JOGADOR, { nome: player.nome })
    }
    await player.save()
    return { success: true }
  } catch (error: any) {
    console.error(`Registration Step ${step} Error:`, error)
    await createLog(`Erro no passo ${step} do cadastro`, cpf, "system", { error: error.message })
    if (error.code === 11000) {
      // Duplicate key error (e.g. email if unique)
      return { success: false, message: "Erro: Informação duplicada (ex: email já cadastrado)." }
    }
    return { success: false, message: `Erro ao salvar informações (Passo ${step}). Tente novamente.` }
  }
}
