export interface ConfigMensalidadeFormProps {
  currentValor: number;
}

export interface UpdateMensalidadeState {
  message?: string;
  success: boolean;
  errors?: {
    valor?: string[];
    general?: string;
  };
}
