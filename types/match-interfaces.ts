export interface MatchFormState {
  message?: string;
  success: boolean;
  errors?: { [key: string]: string[] };
}

export interface PlayerStats {
  cpf: string;
  nome: string;
  partidasJogadas: number;
  gols: number;
  cartoesAmarelos: number;
  cartoesVermelhos: number;
  golsContra: number;
  penaltis: number;
}

export interface MatchFilters {
  dataInicio?: Date;
  dataFim?: Date;
  jogadorCpf?: string;
  status?: 'agendada' | 'em_andamento' | 'finalizada' | 'cancelada';
  local?: string;
}

export interface MatchSummary {
  _id: string;
  data: Date;
  horario: string;
  local?: string;
  timeA: {
    nome: string;
    gols: number;
  };
  timeB: {
    nome: string;
    gols: number;
  };
  status: string;
}
