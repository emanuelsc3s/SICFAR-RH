// Interface para notificações de solicitações de autoatendimento
export interface NotificacaoSolicitacao {
  id: string;
  matricula: string;
  colaborador: string;
  solicitacao: 'Férias' | 'Atestado Médico' | 'Declaração' | 'Alteração de Dados' | 'Saída Antecipada' | 'Transferência' | 'Mudança de Horário' | 'Vale-Transporte' | 'Benefícios';
  status: 'Aprovada' | 'Pendente' | 'Rejeitada';
  datasolicitacao: string;
  lida: boolean;
}

// Função para gerar notificações de exemplo
export const gerarNotificacoesExemplo = (): NotificacaoSolicitacao[] => {
  return [
    {
      id: '1',
      matricula: '001234',
      colaborador: 'Emanuel Silva',
      solicitacao: 'Férias',
      status: 'Aprovada',
      datasolicitacao: '2024-01-15',
      lida: false
    },
    {
      id: '2',
      matricula: '001235',
      colaborador: 'Maria Santos',
      solicitacao: 'Atestado Médico',
      status: 'Pendente',
      datasolicitacao: '2024-01-18',
      lida: false
    },
    {
      id: '3',
      matricula: '001236',
      colaborador: 'João Oliveira',
      solicitacao: 'Saída Antecipada',
      status: 'Aprovada',
      datasolicitacao: '2024-01-20',
      lida: true
    },
    {
      id: '4',
      matricula: '001237',
      colaborador: 'Ana Costa',
      solicitacao: 'Transferência',
      status: 'Pendente',
      datasolicitacao: '2024-01-22',
      lida: false
    },
    {
      id: '5',
      matricula: '001238',
      colaborador: 'Carlos Pereira',
      solicitacao: 'Mudança de Horário',
      status: 'Rejeitada',
      datasolicitacao: '2024-01-23',
      lida: true
    },
    {
      id: '6',
      matricula: '001239',
      colaborador: 'Juliana Alves',
      solicitacao: 'Declaração',
      status: 'Aprovada',
      datasolicitacao: '2024-01-24',
      lida: false
    },
    {
      id: '7',
      matricula: '001240',
      colaborador: 'Roberto Lima',
      solicitacao: 'Benefícios',
      status: 'Pendente',
      datasolicitacao: '2024-01-25',
      lida: false
    },
    {
      id: '8',
      matricula: '001241',
      colaborador: 'Fernanda Souza',
      solicitacao: 'Alteração de Dados',
      status: 'Aprovada',
      datasolicitacao: '2024-01-26',
      lida: true
    },
    {
      id: '9',
      matricula: '001242',
      colaborador: 'Paulo Rodrigues',
      solicitacao: 'Vale-Transporte',
      status: 'Pendente',
      datasolicitacao: '2024-01-27',
      lida: false
    },
    {
      id: '10',
      matricula: '001243',
      colaborador: 'Beatriz Martins',
      solicitacao: 'Férias',
      status: 'Rejeitada',
      datasolicitacao: '2024-01-28',
      lida: false
    }
  ];
};

