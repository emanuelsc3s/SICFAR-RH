import { NotificacaoSolicitacao, gerarNotificacoesExemplo } from "@/types/notificacao";

// Chave única para armazenar as solicitações no localStorage
const STORAGE_KEY = "sicfar_solicitacoes_autoatendimento";

/**
 * Carrega as solicitações do localStorage
 * Se não houver dados salvos, retorna os dados de exemplo
 */
export const carregarSolicitacoes = (): NotificacaoSolicitacao[] => {
  try {
    const dadosSalvos = localStorage.getItem(STORAGE_KEY);
    
    if (dadosSalvos) {
      const solicitacoes = JSON.parse(dadosSalvos) as NotificacaoSolicitacao[];
      return solicitacoes;
    }
    
    // Se não houver dados salvos, inicializa com dados de exemplo
    const dadosExemplo = gerarNotificacoesExemplo();
    salvarSolicitacoes(dadosExemplo);
    return dadosExemplo;
  } catch (error) {
    console.error("Erro ao carregar solicitações do localStorage:", error);
    // Em caso de erro, retorna dados de exemplo
    return gerarNotificacoesExemplo();
  }
};

/**
 * Salva as solicitações no localStorage
 */
export const salvarSolicitacoes = (solicitacoes: NotificacaoSolicitacao[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitacoes));
    
    // Dispara um evento customizado para notificar outros componentes
    window.dispatchEvent(new CustomEvent("solicitacoesAtualizadas", { 
      detail: { solicitacoes } 
    }));
  } catch (error) {
    console.error("Erro ao salvar solicitações no localStorage:", error);
  }
};

/**
 * Atualiza uma solicitação específica
 */
export const atualizarSolicitacao = (
  id: string,
  atualizacao: Partial<NotificacaoSolicitacao>
): void => {
  const solicitacoes = carregarSolicitacoes();
  const solicitacoesAtualizadas = solicitacoes.map(s =>
    s.id === id ? { ...s, ...atualizacao } : s
  );
  salvarSolicitacoes(solicitacoesAtualizadas);
};

/**
 * Marca uma solicitação como lida
 */
export const marcarComoLida = (id: string): void => {
  atualizarSolicitacao(id, { lida: true });
};

/**
 * Marca todas as solicitações como lidas
 */
export const marcarTodasComoLidas = (): void => {
  const solicitacoes = carregarSolicitacoes();
  const solicitacoesAtualizadas = solicitacoes.map(s => ({ ...s, lida: true }));
  salvarSolicitacoes(solicitacoesAtualizadas);
};

/**
 * Aprova uma solicitação
 */
export const aprovarSolicitacao = (
  id: string,
  justificativa: string,
  avaliadorNome: string
): void => {
  const dataAtual = new Date().toISOString().split('T')[0];
  atualizarSolicitacao(id, {
    status: 'Aprovada',
    justificativaAvaliacao: justificativa,
    avaliadorNome,
    dataAvaliacao: dataAtual,
    lida: true, // Marca como lida ao avaliar
  });
};

/**
 * Rejeita uma solicitação
 */
export const rejeitarSolicitacao = (
  id: string,
  justificativa: string,
  avaliadorNome: string
): void => {
  const dataAtual = new Date().toISOString().split('T')[0];
  atualizarSolicitacao(id, {
    status: 'Rejeitada',
    justificativaAvaliacao: justificativa,
    avaliadorNome,
    dataAvaliacao: dataAtual,
    lida: true, // Marca como lida ao avaliar
  });
};

/**
 * Adiciona uma nova solicitação ao localStorage
 */
export const adicionarNovaSolicitacao = (
  novaSolicitacao: Omit<NotificacaoSolicitacao, 'id' | 'lida'>
): void => {
  const solicitacoes = carregarSolicitacoes();

  // Gera um ID único baseado no timestamp e um número aleatório
  const novoId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const solicitacaoCompleta: NotificacaoSolicitacao = {
    ...novaSolicitacao,
    id: novoId,
    lida: false, // Nova solicitação sempre começa como não lida
  };

  // Adiciona a nova solicitação no início do array (mais recente primeiro)
  const solicitacoesAtualizadas = [solicitacaoCompleta, ...solicitacoes];
  salvarSolicitacoes(solicitacoesAtualizadas);
};

/**
 * Reseta as solicitações para os dados de exemplo
 * Útil para testes e desenvolvimento
 */
export const resetarSolicitacoes = (): void => {
  const dadosExemplo = gerarNotificacoesExemplo();
  salvarSolicitacoes(dadosExemplo);
};

