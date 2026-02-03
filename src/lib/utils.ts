import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um valor numérico ou Decimal do Prisma para moeda brasileira (BRL)
 * @param value - Número ou string representando o valor monetário
 * @returns String formatada como "R$ 50,00"
 */
export function formatPrice(value: number | string): string {
  const numberValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numberValue);
}

/**
 * Formata duração em minutos para formato legível
 * @param minutes - Duração em minutos
 * @returns String formatada como "30 min" ou "1h 30min"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Formata número de telefone para padrão brasileiro (XX) XXXXX-XXXX
 * @param phone - Número de telefone (com ou sem formatação)
 * @returns String formatada como "(21) 98765-4321" ou "(21) 3456-7890"
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  
  // Remove código do país se presente (55)
  const withoutCountryCode = cleaned.startsWith("55")
    ? cleaned.substring(2)
    : cleaned;

  // Formata para (XX) XXXXX-XXXX (celular)
  if (withoutCountryCode.length === 11) {
    return `(${withoutCountryCode.substring(0, 2)}) ${withoutCountryCode.substring(2, 7)}-${withoutCountryCode.substring(7)}`;
  }

  // Formata para (XX) XXXX-XXXX (telefone fixo)
  if (withoutCountryCode.length === 10) {
    return `(${withoutCountryCode.substring(0, 2)}) ${withoutCountryCode.substring(2, 6)}-${withoutCountryCode.substring(6)}`;
  }

  return phone; // Retorna original se não puder formatar
}
