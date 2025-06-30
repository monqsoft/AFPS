import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidCpf(cpf: string): boolean {
  cpf = cpf.replace(/[.\-]/g, "") // Remove dots and hyphens

  if (cpf.length !== 11 || !/^[0-9]+$/.test(cpf)) {
    return false
  }

  // Check for known invalid CPFs (all digits are the same)
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false
  }

  let sum = 0
  let remainder

  // Validate first digit
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i)
  }
  remainder = (sum * 10) % 11

  if (remainder === 10 || remainder === 11) {
    remainder = 0
  }
  if (remainder !== parseInt(cpf.substring(9, 10))) {
    return false
  }

  sum = 0
  // Validate second digit
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i)
  }
  remainder = (sum * 10) % 11

  if (remainder === 10 || remainder === 11) {
    remainder = 0
  }
  if (remainder !== parseInt(cpf.substring(10, 11))) {
    return false
  }

  return true
}