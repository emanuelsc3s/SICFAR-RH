/**
 * Funções auxiliares para funcionalidade de aniversariantes
 */

import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Gerar iniciais do nome (primeiras letras)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Formatar data relativa (ex: "há 2 horas", "há 3 dias")
 */
export function formatRelativeDate(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch {
    return 'Data inválida';
  }
}

/**
 * Formatar data absoluta (ex: "15/01/2025 às 14:30")
 */
export function formatAbsoluteDate(dateString: string): string {
  try {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", {
      locale: ptBR,
    });
  } catch {
    return 'Data inválida';
  }
}

/**
 * Validar mensagem de comentário
 */
export function validateMessage(message: string): { valid: boolean; error?: string } {
  const trimmed = message.trim();

  if (!trimmed) {
    return { valid: false, error: 'Mensagem não pode estar vazia' };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: 'Mensagem muito longa (máx. 500 caracteres)' };
  }

  return { valid: true };
}

/**
 * Truncar texto com reticências
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Formatar número plural (ex: "1 curtida", "5 curtidas")
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}

