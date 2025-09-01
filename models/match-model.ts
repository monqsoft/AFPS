import mongoose, { Schema, type Document, models, type Model } from 'mongoose';

export interface IGoal {
  jogadorCpf: string;
  jogadorNome: string;
  minuto: number;
  tipo: 'gol' | 'gol_contra' | 'penalti';
}

export interface ICard {
  jogadorCpf: string;
  jogadorNome: string;
  minuto: number;
  tipo: 'amarelo' | 'vermelho';
  motivo?: string;
}

export interface ITeam {
  nome: string;
  jogadores: {
    cpf: string;
    nome: string;
    numero?: number;
    posicao?: string;
  }[];
  gols: IGoal[];
  cartoes: ICard[];
}

export interface IMatch extends Document {
  data: Date;
  horario: string;
  local?: string;
  timeA: ITeam;
  timeB: ITeam;
  placarFinal: {
    timeA: number;
    timeB: number;
  };
  status: 'agendada' | 'em_andamento' | 'finalizada' | 'cancelada';
  observacoes?: string;
  arbitro?: {
    cpf: string;
    nome: string;
  };
  registradoPor: string; // CPF do admin que registrou
  createdAt?: Date;
  updatedAt?: Date;
}

const GoalSchema = new Schema({
  jogadorCpf: { type: String, required: true },
  jogadorNome: { type: String, required: true },
  minuto: { type: Number, required: true, min: 0, max: 120 },
  tipo: {
    type: String,
    enum: ['gol', 'gol_contra', 'penalti'],
    default: 'gol',
  },
});

const CardSchema = new Schema({
  jogadorCpf: { type: String, required: true },
  jogadorNome: { type: String, required: true },
  minuto: { type: Number, required: true, min: 0, max: 120 },
  tipo: { type: String, enum: ['amarelo', 'vermelho'], required: true },
  motivo: { type: String },
});

const TeamSchema = new Schema({
  nome: { type: String, required: true },
  jogadores: [
    {
      cpf: { type: String, required: true },
      nome: { type: String, required: true },
      numero: { type: Number },
      posicao: { type: String },
    },
  ],
  gols: [GoalSchema],
  cartoes: [CardSchema],
});

const MatchSchema: Schema<IMatch> = new Schema(
  {
    data: { type: Date, required: true },
    horario: { type: String, required: true },
    local: { type: String },
    timeA: { type: TeamSchema, required: true },
    timeB: { type: TeamSchema, required: true },
    placarFinal: {
      timeA: { type: Number, default: 0 },
      timeB: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['agendada', 'em_andamento', 'finalizada', 'cancelada'],
      default: 'agendada',
    },
    observacoes: { type: String },
    arbitro: {
      cpf: { type: String },
      nome: { type: String },
    },
    registradoPor: { type: String, required: true },
  },
  { timestamps: true }
);

// Index for better query performance
MatchSchema.index({ data: -1 });
MatchSchema.index({ 'timeA.jogadores.cpf': 1 });
MatchSchema.index({ 'timeB.jogadores.cpf': 1 });
MatchSchema.index({ status: 1 });

const Match: Model<IMatch> =
  models.Match || mongoose.model<IMatch>('Match', MatchSchema);
export default Match;
