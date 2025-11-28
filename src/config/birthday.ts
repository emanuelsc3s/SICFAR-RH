/**
 * Configurações e constantes para funcionalidade de aniversariantes
 */

export const BIRTHDAY_CONFIG = {
  // Limites
  MAX_COMMENT_LENGTH: 500,
  COMMENTS_PER_PAGE: 20,
  
  // Storage
  STORAGE_YEAR: new Date().getFullYear(),
  
  // UI
  TOAST_DURATION: 3000,
  SCROLL_AREA_HEIGHT: 300,
  
  // Validações
  MIN_COMMENT_LENGTH: 1,
} as const;

export const BIRTHDAY_MESSAGES = {
  // Sucesso
  LIKE_SUCCESS: 'Parabéns enviado com sucesso!',
  LIKE_REMOVED: 'Curtida removida',
  COMMENT_SUCCESS: 'Felicitação adicionada!',
  COMMENT_REMOVED: 'Comentário removido',
  
  // Erros
  ERROR_NOT_LOGGED: 'Você precisa estar logado',
  ERROR_EMPTY_MESSAGE: 'Mensagem não pode estar vazia',
  ERROR_MESSAGE_TOO_LONG: 'Mensagem muito longa (máx. 500 caracteres)',
  ERROR_GENERIC: 'Erro ao processar sua ação. Tente novamente.',
  ERROR_PERMISSION_DENIED: 'Você não tem permissão para esta ação',
  
  // Informações
  INFO_NO_COMMENTS: 'Seja o primeiro a parabenizar! 🎉',
  INFO_LOADING: 'Carregando...',
} as const;

export const BIRTHDAY_STORAGE_KEYS = {
  LIKES: (year: number) => `birthday_likes_${year}`,
  COMMENTS: (year: number) => `birthday_comments_${year}`,
} as const;

