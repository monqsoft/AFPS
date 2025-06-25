import dbConnect from "@/lib/mongodb"
import mongoose, { Schema, type Document, models, type Model } from "mongoose"

export interface IConfig extends Document {
  chavePix: string
  valorMensalidade: number
  dataAtualizacao: Date
  // Potentially other global settings
  nomeAssociacao?: string
  cidadeAssociacao?: string
}

const ConfigSchema: Schema<IConfig> = new Schema(
  {
    chavePix: { type: String, required: true },
    valorMensalidade: { type: Number, required: true },
    dataAtualizacao: { type: Date, default: Date.now },
    nomeAssociacao: { type: String, default: "AFPS" },
    cidadeAssociacao: { type: String, default: "Porto dos Santos" },
  },
  { timestamps: true },
)

const Config: Model<IConfig> = models.Config || mongoose.model<IConfig>("Config", ConfigSchema)
export default Config

// Function to get or create default config
export async function getAppConfig(): Promise<IConfig> {
  await dbConnect()
  let config = await Config.findOne()
  if (!config) {
    console.log("No config found, creating default config...")
    config = await Config.create({
      chavePix: "71992802951", // Default as per prompt
      valorMensalidade: 50.0, // Default as per prompt
      nomeAssociacao: "Associação de Futebol de Porto dos Santos",
      cidadeAssociacao: "PORTO DOS SANTOS", // BRCode typically uses uppercase for city
      dataAtualizacao: new Date(),
    })
    console.log("Default config created:", config)
  }
  return config
}
