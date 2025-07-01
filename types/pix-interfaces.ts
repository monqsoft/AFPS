export interface PixData {
  payload: string; // Copia e Cola
  qrCodeBase64: string; // Base64 for QR Code image
  valor: number;
  descricao: string;
  chavePix: string;
}

export interface PixGenerationState {
  pixData?: PixData;
  error?: string;
}
