export interface NoticiaInterna {
  id: string;
  titulo: string;
  conteudo: string;
  resumo: string;
  categoria: 'RH' | 'TI' | 'Corporativo' | 'Comunicados' | 'Eventos';
  prioridade: 'baixa' | 'media' | 'alta';
  status: 'rascunho' | 'publicado' | 'arquivado';
  autor: string;
  dataPublicacao: string;
  dataCriacao: string;
  dataAtualizacao: string;
  visualizacoes: number;
  imagem?: string;
}

export interface FiltrosComunicacao {
  categoria?: string;
  prioridade?: string;
  status?: string;
  busca?: string;
}