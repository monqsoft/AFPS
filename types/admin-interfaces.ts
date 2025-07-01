export interface AddAuthorizedCpfState {
  message?: string;
  success: boolean;
  errors?: {
    cpf?: string[];
    nomeInicial?: string[];
    roleInicial?: string[];
    general?: string;
  };
}

export interface UpdateMensalidadeState {
  message?: string;
  success: boolean;
  errors?: {
    valor?: string[];
    general?: string;
  };
}
