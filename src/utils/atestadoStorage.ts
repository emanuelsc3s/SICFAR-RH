import { AtestadoMedico } from '@/types/atestado';

// Chave para armazenamento no localStorage
const ATESTADOS_KEY = 'sicfar_atestados_medicos';

/**
 * Obtém todos os atestados médicos armazenados
 */
export const getAtestados = (): AtestadoMedico[] => {
  try {
    const atestadosJson = localStorage.getItem(ATESTADOS_KEY);
    if (!atestadosJson) {
      return [];
    }
    return JSON.parse(atestadosJson);
  } catch (error) {
    console.error('Erro ao carregar atestados:', error);
    return [];
  }
};

/**
 * Salva um novo atestado médico
 */
export const salvarAtestado = (atestado: AtestadoMedico): void => {
  try {
    const atestados = getAtestados();
    atestados.push(atestado);
    localStorage.setItem(ATESTADOS_KEY, JSON.stringify(atestados));
  } catch (error) {
    console.error('Erro ao salvar atestado:', error);
    throw new Error('Não foi possível salvar o atestado');
  }
};

/**
 * Atualiza um atestado existente
 */
export const atualizarAtestado = (id: string, dadosAtualizados: Partial<AtestadoMedico>): void => {
  try {
    const atestados = getAtestados();
    const index = atestados.findIndex(a => a.id === id);
    
    if (index === -1) {
      throw new Error('Atestado não encontrado');
    }
    
    atestados[index] = { ...atestados[index], ...dadosAtualizados };
    localStorage.setItem(ATESTADOS_KEY, JSON.stringify(atestados));
  } catch (error) {
    console.error('Erro ao atualizar atestado:', error);
    throw new Error('Não foi possível atualizar o atestado');
  }
};

/**
 * Obtém um atestado específico por ID
 */
export const getAtestadoPorId = (id: string): AtestadoMedico | null => {
  try {
    const atestados = getAtestados();
    return atestados.find(a => a.id === id) || null;
  } catch (error) {
    console.error('Erro ao buscar atestado:', error);
    return null;
  }
};

/**
 * Deleta um atestado
 */
export const deletarAtestado = (id: string): void => {
  try {
    const atestados = getAtestados();
    const atestadosFiltrados = atestados.filter(a => a.id !== id);
    localStorage.setItem(ATESTADOS_KEY, JSON.stringify(atestadosFiltrados));
  } catch (error) {
    console.error('Erro ao deletar atestado:', error);
    throw new Error('Não foi possível deletar o atestado');
  }
};

/**
 * Gera um ID único para o atestado
 */
export const gerarIdAtestado = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ATES${timestamp}${random}`;
};

/**
 * Formata o tamanho do arquivo para exibição
 */
export const formatarTamanhoArquivo = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Valida se o arquivo é um PDF válido
 */
export const validarPDF = (file: File): { valido: boolean; erro?: string } => {
  // Verifica o tipo do arquivo
  if (file.type !== 'application/pdf') {
    return { valido: false, erro: 'O arquivo deve ser um PDF' };
  }
  
  // Verifica o tamanho (máximo 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB em bytes
  if (file.size > maxSize) {
    return { valido: false, erro: 'O arquivo deve ter no máximo 10MB' };
  }
  
  return { valido: true };
};

/**
 * Converte arquivo para base64
 */
export const arquivoParaBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Calcula a quantidade de dias de afastamento
 */
export const calcularDiasAfastamento = (dataInicio: string, dataFim: string): number => {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const diffTime = Math.abs(fim.getTime() - inicio.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // +1 para incluir o dia inicial
};

