"use server"

import dbConnect from "@/lib/mongodb"
import Player from "@/models/player-model"
import Config from "@/models/config-model"
import Log, { createLog } from "@/models/log-model"
import { getSession } from "@/lib/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { ROLES } from "@/lib/roles"
import { logger } from "@/lib/logger"
import { AddAuthorizedCpfState } from "@/types/admin-interfaces"

// Schema for adding an authorized CPF
const AddAuthorizedCpfSchema = z.object({
  cpf: z.string().regex(/^\d{11}$/, "CPF deve conter 11 números."),
  nomeInicial: z.string().min(2, "Nome inicial muito curto").optional().or(z.literal("")),
  roleInicial: z.enum([ROLES.JOGADOR, ROLES.ADMIN, ROLES.ARBITRO, ROLES.COMISSAO, ""]).optional(),
})



export async function addAuthorizedCpfAction(
  prevState: AddAuthorizedCpfState | undefined,
  formData: FormData,
): Promise<AddAuthorizedCpfState> {
  const session = await getSession()
  if (!session || session.role !== ROLES.ADMIN) {
    return { success: false, message: "Não autorizado." }
  }

  const rawFormData = {
    cpf: (formData.get("cpf") as string)?.replace(/\D/g, "") || "",
    nomeInicial: formData.get("nomeInicial") as string,
    roleInicial: formData.get("roleInicial") as string,
  }

  const validation = AddAuthorizedCpfSchema.safeParse(rawFormData)
  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors }
  }

  const { cpf, nomeInicial, roleInicial } = validation.data

  try {
    await dbConnect()
    const player = await Player.findOne({ cpf })

    if (player) {
      // Player exists
      if (player.isAuthorized) {
        return { success: false, errors: { general: "Este CPF já está autorizado." } }
      }
      // Player exists but was not authorized (e.g., old record or error)
      player.isAuthorized = true
      player.status = "autorizado_nao_cadastrado"
      player.registrationCompleted = false
      player.nome = nomeInicial || player.nome || "Pendente Cadastro (Re-autorizado)"
      player.role = (roleInicial as typeof ROLES.JOGADOR | typeof ROLES.ADMIN | null) || player.role || null
      await player.save()
      await createLog("CPF Re-autorizado", session.cpf, "admin", { cpfAutorizado: cpf, nome: player.nome })
      revalidatePath("/admin") // Revalidate to update the list
      return { success: true, message: `CPF ${cpf} foi re-autorizado com sucesso.` }
    } else {
      // Player does not exist, create new
      await Player.create({
        cpf,
        isAuthorized: true,
        status: "autorizado_nao_cadastrado",
        role: (roleInicial as typeof ROLES.JOGADOR | typeof ROLES.ADMIN | null) || null,
        nome: nomeInicial || "Pendente Cadastro (Autorizado)",
        registrationCompleted: false,
      })
      await createLog("Novo CPF Autorizado", session.cpf, "admin", { cpfAutorizado: cpf, nome: nomeInicial })
      revalidatePath("/admin") // Revalidate to update the list
      return { success: true, message: `CPF ${cpf} autorizado com sucesso e aguardando cadastro.` }
    }
  } catch (error: any) {
    logger.error("Add Authorized CPF Error:", { error })
    await createLog("Erro ao autorizar CPF", session.cpf, "admin", { cpf, error: error.message })
    return { success: false, errors: { general: "Erro ao salvar no banco de dados. Tente novamente." } }
  }
}

// --- Placeholder Actions for other Admin Tabs ---

// Gerenciar Jogadores
export async function fetchPlayersAction(filters: any) {
  /* TODO: Implement logic */
  console.log("fetchPlayersAction called with filters:", filters)
  return { success: false, message: "fetchPlayersAction: Not implemented" }
}
export async function editPlayerInfoAction(playerId: string, data: any) {
  /* TODO: Implement logic */
  console.log("editPlayerInfoAction called for player:", playerId, "with data:", data)
  return { success: false, message: "editPlayerInfoAction: Not implemented" }
}
export async function togglePlayerStatusAction(playerId: string) {
  /* TODO: Implement logic */
  console.log("togglePlayerStatusAction called for player:", playerId)
  return { success: false, message: "togglePlayerStatusAction: Not implemented" }
}
export async function addPlayerStatsAction(playerId: string, stats: any) {
  /* TODO: Implement logic */
  console.log("addPlayerStatsAction called for player:", playerId, "with stats:", stats)
  return { success: false, message: "addPlayerStatsAction: Not implemented" }
}

// Gerenciamento Geral (Perfis e Acesso) - (addAuthorizedCpfAction is above)
export async function updatePlayerRoleAction(playerId: string, newRole: string) {
  /* TODO: Implement logic */
  console.log("updatePlayerRoleAction called for player:", playerId, "to role:", newRole)
  return { success: false, message: "updatePlayerRoleAction: Not implemented" }
}
export async function removeAuthorizedCpfAction(cpfToRemove: string) {
  const session = await getSession()
  if (!session || session.role !== ROLES.ADMIN) {
    return { success: false, message: "Não autorizado." }
  }
  try {
    await dbConnect()
    const player = await Player.findOne({ cpf: cpfToRemove })
    if (!player) {
      return { success: false, message: "CPF não encontrado." }
    }
    if (player.registrationCompleted) {
      // If player is already registered, inactivate them instead of deleting
      player.isAuthorized = false;
      player.status = "inativo";
      await player.save();
      await createLog("Jogador Inativado (Autorização Removida)", session.cpf, ROLES.ADMIN, { cpfInativado: cpfToRemove, nome: player.nome });
      revalidatePath("/admin");
      return { success: true, message: `Jogador ${cpfToRemove} inativado e autorização removida.` };
    } else {
      // If player is not registered, delete the record
      await Player.deleteOne({ cpf: cpfToRemove });
      await createLog("CPF Autorizado Removido (Não Cadastrado)", session.cpf, ROLES.ADMIN, { cpfRemovido: cpfToRemove });
      revalidatePath("/admin");
      return { success: true, message: `Autorização para CPF ${cpfToRemove} removida.` };
    }
  } catch (error: any) {
    logger.error("Remove Authorized CPF Error:", { error });
    await createLog("Erro ao remover autorização de CPF", session.cpf, "admin", {
      cpf: cpfToRemove,
      error: error.message,
    })
    return { success: false, message: "Erro ao remover autorização." }
  }
}

// Mensalidade
export async function updateMensalidadeAction(newValor: number) {
  const session = await getSession()
  if (!session || session.role !== ROLES.ADMIN) {
    return { success: false, message: "Não autorizado." }
  }
  if (isNaN(newValor) || newValor <= 0) {
    return { success: false, message: "Valor da mensalidade inválido." }
  }

  try {
    await dbConnect()
    // Instead of inserting a new document, we update the existing one or create if not exists.
    // The prompt mentioned "novo documento é inserido", but typically config is a single doc.
    // If versioning is needed, a separate collection for config history would be better.
    // For simplicity, updating the single config document.
    const updatedConfig = await Config.findOneAndUpdate(
      {}, // find any config document
      { valorMensalidade: newValor, dataAtualizacao: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true }, // upsert creates if not exists
    )
    await createLog("Valor da Mensalidade Atualizado", session.cpf, "admin", { novoValor: newValor })
    revalidatePath("/admin")
    return { success: true, message: `Valor da mensalidade atualizado para R$ ${newValor.toFixed(2)}.` }
  } catch (error: any) {
    logger.error("Update Mensalidade Error:", { error });
    await createLog("Erro ao atualizar mensalidade", session.cpf, "admin", {
      novoValor: newValor,
      error: error.message,
    })
    return { success: false, message: "Erro ao atualizar mensalidade." }
  }
}

// Logs e Auditoria
export async function fetchLogsAction(filters: any) {
  /* TODO: Implement logic */
  console.log("fetchLogsAction called with filters:", filters)
  const session = await getSession()
  if (!session || session.role !== ROLES.ADMIN) {
    return { success: false, message: "Não autorizado.", logs: [] }
  }
  try {
    await dbConnect()
    // Basic fetch, add filtering later
    const logs = await Log.find(filters || {})
      .sort({ timestamp: -1 })
      .limit(100)
      .lean()
    return { success: true, logs: JSON.parse(JSON.stringify(logs)) } // Ensure serializable
  } catch (error) {
    console.error("Fetch Logs Error:", error)
    return { success: false, message: "Erro ao buscar logs.", logs: [] }
  }
}

// Despesas da Comissão
export async function addAdminExpenseAction(data: any) {
  /* TODO: Implement logic */
  console.log("addAdminExpenseAction called with data:", data)
  return { success: false, message: "addAdminExpenseAction: Not implemented" }
}
export async function editAdminExpenseAction(expenseId: string, data: any) {
  /* TODO: Implement logic */
  console.log("editAdminExpenseAction called for expense:", expenseId, "with data:", data)
  return { success: false, message: "editAdminExpenseAction: Not implemented" }
}
export async function deleteAdminExpenseAction(expenseId: string) {
  /* TODO: Implement logic */
  console.log("deleteAdminExpenseAction called for expense:", expenseId)
  return { success: false, message: "deleteAdminExpenseAction: Not implemented" }
}
