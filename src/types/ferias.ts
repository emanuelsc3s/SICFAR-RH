// Interface para histórico de férias
export interface HistoricoFerias {
  id: string;
  colaborador: string;
  dataInicio: string;
  dataFim: string;
  diasUtilizados: number;
  status: 'Aprovada' | 'Pendente' | 'Rejeitada';
  dataSolicitacao: string;
  observacoes?: string;
  justificativaRejeicao?: string;
}

// Interface para período aquisitivo de férias
export interface PeriodoAquisitivo {
  id: string;
  dataInicio: string;
  dataFim: string;
  diasDisponiveis: number;
  diasUtilizados: number;
  saldoRestante: number;
  periodoConcessivoInicio: string;
  periodoConcessivoFim: string;
}

// Interface para saldo de férias do colaborador
export interface SaldoFerias {
  colaborador: string;
  periodosAquisitivos: PeriodoAquisitivo[];
  totalDiasDisponiveis: number;
  totalDiasUtilizados: number;
  totalSaldoRestante: number;
  proximoVencimento?: {
    dataLimite: string;
    diasRestantes: number;
    diasAVencer: number;
  };
}

// Função para gerar dados de exemplo de histórico de férias
export const gerarHistoricoFeriasExemplo = (): HistoricoFerias[] => {
  return [
    {
      id: '1',
      colaborador: 'Emanuel Silva',
      dataInicio: '2024-01-15',
      dataFim: '2024-01-29',
      diasUtilizados: 15,
      status: 'Aprovada',
      dataSolicitacao: '2023-12-10',
      observacoes: 'Férias de final de ano'
    },
    {
      id: '2',
      colaborador: 'Emanuel Silva',
      dataInicio: '2023-07-01',
      dataFim: '2023-07-15',
      diasUtilizados: 15,
      status: 'Aprovada',
      dataSolicitacao: '2023-06-01',
      observacoes: 'Férias de meio de ano'
    },
    {
      id: '3',
      colaborador: 'Emanuel Silva',
      dataInicio: '2025-02-10',
      dataFim: '2025-02-19',
      diasUtilizados: 10,
      status: 'Pendente',
      dataSolicitacao: '2025-01-20',
      observacoes: 'Férias de carnaval'
    }
  ];
};

// Função para gerar dados de exemplo de saldo de férias
export const gerarSaldoFeriasExemplo = (): SaldoFerias => {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  
  return {
    colaborador: 'Emanuel Silva',
    periodosAquisitivos: [
      {
        id: '1',
        dataInicio: `${anoAtual - 1}-03-01`,
        dataFim: `${anoAtual}-02-28`,
        diasDisponiveis: 30,
        diasUtilizados: 30,
        saldoRestante: 0,
        periodoConcessivoInicio: `${anoAtual}-03-01`,
        periodoConcessivoFim: `${anoAtual + 1}-02-28`
      },
      {
        id: '2',
        dataInicio: `${anoAtual}-03-01`,
        dataFim: `${anoAtual + 1}-02-28`,
        diasDisponiveis: 30,
        diasUtilizados: 10,
        saldoRestante: 20,
        periodoConcessivoInicio: `${anoAtual + 1}-03-01`,
        periodoConcessivoFim: `${anoAtual + 2}-02-28`
      }
    ],
    totalDiasDisponiveis: 60,
    totalDiasUtilizados: 40,
    totalSaldoRestante: 20,
    proximoVencimento: {
      dataLimite: `${anoAtual + 1}-02-28`,
      diasRestantes: 20,
      diasAVencer: 20
    }
  };
};

// Função para calcular dias entre duas datas
export const calcularDiasEntreDatas = (dataInicio: string, dataFim: string): number => {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const diffTime = Math.abs(fim.getTime() - inicio.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// Função para calcular dias até uma data
export const calcularDiasAteData = (dataLimite: string): number => {
  const hoje = new Date();
  const limite = new Date(dataLimite);
  const diffTime = limite.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Função para formatar data no padrão brasileiro
export const formatarDataBR = (data: string): string => {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
};

