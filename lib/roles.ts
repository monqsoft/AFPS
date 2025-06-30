export const ROLES = {
  ADMIN: "admin",
  JOGADOR: "jogador",
  ARBITRO: "arbitro",
  COMISSAO: "comissao",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];