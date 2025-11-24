// Interface para os dados do atestado médico
export interface AtestadoMedico {
  id: string;                          // ID único do atestado
  funcionario: string;                 // Nome do funcionário
  cpf: string;                         // CPF do funcionário
  dataInicio: string;                  // Data de início do afastamento (YYYY-MM-DD)
  dataFim: string;                     // Data de fim do afastamento (YYYY-MM-DD)
  motivo: string;                      // Motivo do atestado
  observacoes?: string;                // Observações adicionais (opcional)
  arquivoPdf: string;                  // PDF em base64
  nomeArquivo: string;                 // Nome original do arquivo
  tamanhoArquivo: number;              // Tamanho do arquivo em bytes
  status: 'pendente' | 'aprovado' | 'rejeitado';  // Status do atestado
  dataEnvio: string;                   // Data de envio (ISO string)
  dataAnalise?: string;                // Data de análise (ISO string, opcional)
  analisadoPor?: string;               // Nome de quem analisou (opcional)
  motivoRejeicao?: string;             // Motivo da rejeição (opcional)
}

// Interface para filtros de atestados
export interface FiltrosAtestado {
  status?: 'pendente' | 'aprovado' | 'rejeitado' | 'todos';
  dataInicio?: string;
  dataFim?: string;
  busca?: string;
}

// Opções de motivo para o atestado
export const motivosAtestado = [
  { value: 'doenca', label: 'Doença' },
  { value: 'acidente', label: 'Acidente' },
  { value: 'consulta-medica', label: 'Consulta médica' },
  { value: 'exame', label: 'Exame médico' },
  { value: 'cirurgia', label: 'Cirurgia' },
  { value: 'acompanhamento-familiar', label: 'Acompanhamento familiar' },
  { value: 'outros', label: 'Outros' },
] as const;

