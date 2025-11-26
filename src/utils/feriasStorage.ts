import { HistoricoFerias, SaldoFerias, gerarHistoricoFeriasExemplo, gerarSaldoFeriasExemplo } from '@/types/ferias';

// Chaves para armazenamento no localStorage
const HISTORICO_FERIAS_KEY = 'sicfar_historico_ferias';
const SALDO_FERIAS_KEY = 'sicfar_saldo_ferias';

/**
 * Carrega o histórico de férias do localStorage
 * Se não houver dados salvos, retorna os dados de exemplo
 */
export const carregarHistoricoFerias = (): HistoricoFerias[] => {
  try {
    const dadosSalvos = localStorage.getItem(HISTORICO_FERIAS_KEY);
    
    if (dadosSalvos) {
      const historico = JSON.parse(dadosSalvos) as HistoricoFerias[];
      return historico;
    }
    
    // Se não houver dados salvos, inicializa com dados de exemplo
    const dadosExemplo = gerarHistoricoFeriasExemplo();
    salvarHistoricoFerias(dadosExemplo);
    return dadosExemplo;
  } catch (error) {
    console.error('Erro ao carregar histórico de férias do localStorage:', error);
    return gerarHistoricoFeriasExemplo();
  }
};

/**
 * Salva o histórico de férias no localStorage
 */
export const salvarHistoricoFerias = (historico: HistoricoFerias[]): void => {
  try {
    localStorage.setItem(HISTORICO_FERIAS_KEY, JSON.stringify(historico));
    
    // Dispara um evento customizado para notificar outros componentes
    window.dispatchEvent(new CustomEvent('historicoFeriasAtualizado', { 
      detail: { historico } 
    }));
  } catch (error) {
    console.error('Erro ao salvar histórico de férias no localStorage:', error);
  }
};

/**
 * Adiciona uma nova solicitação de férias ao histórico
 */
export const adicionarSolicitacaoFerias = (
  novaSolicitacao: Omit<HistoricoFerias, 'id'>
): void => {
  const historico = carregarHistoricoFerias();
  
  // Gera um ID único baseado no timestamp e um número aleatório
  const novoId = `FER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const solicitacaoCompleta: HistoricoFerias = {
    ...novaSolicitacao,
    id: novoId,
  };
  
  // Adiciona a nova solicitação no início do array (mais recente primeiro)
  const historicoAtualizado = [solicitacaoCompleta, ...historico];
  salvarHistoricoFerias(historicoAtualizado);
};

/**
 * Carrega o saldo de férias do localStorage
 * Se não houver dados salvos, retorna os dados de exemplo
 */
export const carregarSaldoFerias = (): SaldoFerias => {
  try {
    const dadosSalvos = localStorage.getItem(SALDO_FERIAS_KEY);
    
    if (dadosSalvos) {
      const saldo = JSON.parse(dadosSalvos) as SaldoFerias;
      return saldo;
    }
    
    // Se não houver dados salvos, inicializa com dados de exemplo
    const dadosExemplo = gerarSaldoFeriasExemplo();
    salvarSaldoFerias(dadosExemplo);
    return dadosExemplo;
  } catch (error) {
    console.error('Erro ao carregar saldo de férias do localStorage:', error);
    return gerarSaldoFeriasExemplo();
  }
};

/**
 * Salva o saldo de férias no localStorage
 */
export const salvarSaldoFerias = (saldo: SaldoFerias): void => {
  try {
    localStorage.setItem(SALDO_FERIAS_KEY, JSON.stringify(saldo));
    
    // Dispara um evento customizado para notificar outros componentes
    window.dispatchEvent(new CustomEvent('saldoFeriasAtualizado', { 
      detail: { saldo } 
    }));
  } catch (error) {
    console.error('Erro ao salvar saldo de férias no localStorage:', error);
  }
};

/**
 * Atualiza o saldo de férias após uma solicitação
 */
export const atualizarSaldoAposSolicitacao = (diasSolicitados: number): boolean => {
  try {
    const saldo = carregarSaldoFerias();
    
    // Verifica se há saldo suficiente
    if (saldo.totalSaldoRestante < diasSolicitados) {
      return false;
    }
    
    // Atualiza o período aquisitivo mais recente com saldo disponível
    for (let i = 0; i < saldo.periodosAquisitivos.length; i++) {
      const periodo = saldo.periodosAquisitivos[i];
      
      if (periodo.saldoRestante > 0) {
        const diasADescontar = Math.min(diasSolicitados, periodo.saldoRestante);
        periodo.diasUtilizados += diasADescontar;
        periodo.saldoRestante -= diasADescontar;
        diasSolicitados -= diasADescontar;
        
        if (diasSolicitados === 0) break;
      }
    }
    
    // Recalcula os totais
    saldo.totalDiasUtilizados = saldo.periodosAquisitivos.reduce(
      (total, p) => total + p.diasUtilizados, 0
    );
    saldo.totalSaldoRestante = saldo.periodosAquisitivos.reduce(
      (total, p) => total + p.saldoRestante, 0
    );
    
    // Atualiza o próximo vencimento
    const periodoComSaldo = saldo.periodosAquisitivos.find(p => p.saldoRestante > 0);
    if (periodoComSaldo) {
      const hoje = new Date();
      const dataLimite = new Date(periodoComSaldo.periodoConcessivoFim);
      const diffTime = dataLimite.getTime() - hoje.getTime();
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      saldo.proximoVencimento = {
        dataLimite: periodoComSaldo.periodoConcessivoFim,
        diasRestantes: diasRestantes,
        diasAVencer: periodoComSaldo.saldoRestante
      };
    } else {
      saldo.proximoVencimento = undefined;
    }
    
    salvarSaldoFerias(saldo);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar saldo de férias:', error);
    return false;
  }
};

/**
 * Verifica se há férias pendentes de aprovação
 */
export const verificarFeriasPendentes = (): boolean => {
  const historico = carregarHistoricoFerias();
  return historico.some(f => f.status === 'Pendente');
};

/**
 * Obtém as últimas férias (limitado a N registros)
 */
export const obterUltimasFerias = (limite: number = 5): HistoricoFerias[] => {
  const historico = carregarHistoricoFerias();
  return historico.slice(0, limite);
};

