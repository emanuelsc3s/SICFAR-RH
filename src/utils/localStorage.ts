import { NoticiaInterna } from '@/types/comunicacao';

const NOTICIAS_KEY = 'noticias_internas';

export const getNoticiasInternas = (): NoticiaInterna[] => {
  try {
    const data = localStorage.getItem(NOTICIAS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao carregar notícias:', error);
    return [];
  }
};

export const salvarNoticiaInterna = (noticia: NoticiaInterna): void => {
  try {
    const noticias = getNoticiasInternas();
    const index = noticias.findIndex(n => n.id === noticia.id);
    
    if (index >= 0) {
      noticias[index] = { ...noticia, dataAtualizacao: new Date().toISOString() };
    } else {
      noticias.push(noticia);
    }
    
    localStorage.setItem(NOTICIAS_KEY, JSON.stringify(noticias));
  } catch (error) {
    console.error('Erro ao salvar notícia:', error);
  }
};

export const deletarNoticiaInterna = (id: string): void => {
  try {
    const noticias = getNoticiasInternas().filter(n => n.id !== id);
    localStorage.setItem(NOTICIAS_KEY, JSON.stringify(noticias));
  } catch (error) {
    console.error('Erro ao deletar notícia:', error);
  }
};

export const incrementarVisualizacao = (id: string): void => {
  try {
    const noticias = getNoticiasInternas();
    const index = noticias.findIndex(n => n.id === id);
    
    if (index >= 0) {
      noticias[index].visualizacoes += 1;
      localStorage.setItem(NOTICIAS_KEY, JSON.stringify(noticias));
    }
  } catch (error) {
    console.error('Erro ao incrementar visualização:', error);
  }
};