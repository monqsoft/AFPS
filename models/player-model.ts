import mongoose, { Schema, type Document, models, type Model } from "mongoose"

export interface IPlayer extends Document {
  nome: string // Will be filled during registration
  apelido?: string
  cpf: string // Used as login, key for authorization
  nascimento?: Date
  telefone?: string
  email?: string
  posicao?: string
  numero?: number
  role: "jogador" | "admin" | null // null for pre-authorized, not yet registered
  status: "ativo" | "inativo" | "autorizado_nao_cadastrado" | "pendente_aprovacao"
  // Fields for player dashboard
  mensalidadesPagas?: { mesReferencia: string; dataPagamento: Date }[]
  cartoesRecebidos?: { tipo: "amarelo" | "vermelho"; data: Date; pago?: boolean; valor?: number }[]
  golsMarcados?: number
  isAuthorized: boolean // Flag to mark if CPF is in the authorized list
  registrationCompleted: boolean // Flag to mark if full registration is done
  createdAt?: Date // Automatically managed by Mongoose
}

const PlayerSchema: Schema<IPlayer> = new Schema(
  {
    nome: { type: String, default: "Pendente Cadastro" }, // Default until registered
    apelido: { type: String },
    cpf: { type: String, required: true, unique: true, index: true },
    nascimento: { type: Date },
    telefone: { type: String },
    email: { type: String },
    posicao: { type: String },
    numero: { type: Number },
    role: { type: String, enum: ["jogador", "admin", null], default: null },
    status: {
      type: String,
      enum: ["ativo", "inativo", "autorizado_nao_cadastrado", "pendente_aprovacao"],
      required: true,
      default: "autorizado_nao_cadastrado",
    },
    mensalidadesPagas: [{ mesReferencia: String, dataPagamento: Date }],
    cartoesRecebidos: [{ tipo: String, data: Date, pago: Boolean, valor: Number }],
    golsMarcados: { type: Number, default: 0 },
    isAuthorized: { type: Boolean, default: false }, // Admins will set this to true
    registrationCompleted: { type: Boolean, default: false },
  },
  { timestamps: true },
)

PlayerSchema.path("cpf").validate(async function (value: string) {
  if (!this.isNew && !this.isModified("cpf")) return true
  const count = await mongoose.models.Player.countDocuments({ cpf: value })
  return !count
}, "CPF já cadastrado.")

const Player: Model<IPlayer> = models.Player || mongoose.model<IPlayer>("Player", PlayerSchema)
export default Player
