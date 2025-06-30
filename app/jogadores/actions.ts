"use server"
import dbConnect from "@/lib/mongodb"
import { getAppConfig } from "@/models/config-model"
import Player, { type IPlayer } from "@/models/player-model"
import { createLog } from "@/models/log-model"
import { QrCodePix } from "qrcode-pix" // Ensure this lib is compatible with Next.js Edge/Serverless if applicable
import { ROLES } from "@/lib/roles"

export interface PixData {
  payload: string // Copia e Cola
  qrCodeBase64: string // Base64 for QR Code image
  valor: number
  descricao: string
  chavePix: string
}

export interface PixGenerationState {
  pixData?: PixData
  error?: string
}

export async function generatePixPayment(jogadorCpf: string): Promise<PixGenerationState> {
  try {
    await dbConnect()
    const config = await getAppConfig()
    const player = (await Player.findOne({ cpf: jogadorCpf }).lean()) as IPlayer | null

    if (!player) {
      await createLog("Falha na geração de PIX", jogadorCpf, "system", { motivo: "Jogador não encontrado" })
      return { error: "Jogador não encontrado." }
    }

    const nomeOuApelido = player.apelido || player.nome.split(" ")[0]
    const mesAtual = new Date().toLocaleString("pt-BR", { month: "long" })
    const transactionId = `MENS-${jogadorCpf}-${Date.now()}`.substring(0, 25).toUpperCase() // Max 25 chars for transactionId in BRCode

    const descricaoPix = `Mensalidade ${mesAtual} - ${nomeOuApelido}`

    const pixParams = {
      version: "01" as const, // BRCode version
      key: config.chavePix, // PIX key (CPF, CNPJ, Phone, Email, EVP)
      name: config.nomeAssociacao || "AFPS", // Payee name (max 25 chars)
      city: config.cidadeAssociacao || "PORTO DOS SANTOS", // Payee city (max 15 chars)
      transactionId: transactionId, // Unique transaction ID (max 25 chars)
      message: descricaoPix.substring(0, 72), // Optional message (max 72 chars for EMV an max 140 for BRCODE)
      value: config.valorMensalidade,
      cep: undefined, // Optional: CEP of payee
      timer: undefined, // Optional: expiration timer in seconds
      currency: 986, // Optional: currency code (986 for BRL)
      countryCode: "BR", // Optional: country code (BR for Brazil)
    }

    const pix = QrCodePix(pixParams)

    const payload = pix.payload()
    const qrCodeBase64 = await pix.base64() // Returns data:image/png;base64,...

    await createLog("Geração de PIX", jogadorCpf, player.role || ROLES.JOGADOR, {
      valor: config.valorMensalidade,
      descricao: descricaoPix,
    })

    return {
      pixData: {
        payload,
        qrCodeBase64,
        valor: config.valorMensalidade,
        descricao: descricaoPix,
        chavePix: config.chavePix,
      },
    }
  } catch (error) {
    console.error("PIX Generation Error:", error)
    await createLog("Erro na geração de PIX", jogadorCpf, "system", { erro: (error as Error).message })
    return { error: "Erro ao gerar PIX. Tente novamente." }
  }
}
