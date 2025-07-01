import { Role } from "@/lib/roles";

export interface CpfCheckState {
  message?: string;
  success: boolean;
  cpf?: string;
  isAuthorized?: boolean;
  isRegistered?: boolean;
}

export interface LoginFormState {
  message: string | null;
  success: boolean;
}

export interface SessionData {
  cpf: string;
  role: Role;
  nome: string;
}

export interface EditPlayerFormState {
  message?: string;
  success: boolean;
  errors?: { [key: string]: string[] };
}