import mongoose, { Schema, type Document, models, type Model } from "mongoose"

export interface ILog extends Document {
  acao: string
  usuarioCpf?: string // CPF of the user performing the action
  role?: "jogador" | "admin" | "system"
  timestamp: Date
  detalhes?: object // Store any relevant details as a JSON object
}

const LogSchema: Schema<ILog> = new Schema(
  {
    acao: { type: String, required: true },
    usuarioCpf: { type: String },
    role: { type: String, enum: ["jogador", "admin", "system"] },
    timestamp: { type: Date, default: Date.now },
    detalhes: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
)

const Log: Model<ILog> = models.Log || mongoose.model<ILog>("Log", LogSchema)
export default Log

export async function createLog(
  acao: string,
  usuarioCpf?: string,
  role?: "jogador" | "admin" | "system",
  detalhes?: object,
) {
  try {
    await dbConnect()
    await Log.create({ acao, usuarioCpf, role, timestamp: new Date(), detalhes })
  } catch (error) {
    console.error("Failed to create log:", error)
  }
}
