/**
 * Serviço de armazenamento local (localStorage) para funcionalidade de aniversariantes
 * Estrutura compatível com futura migração para Supabase
 */

import type { CurtidaAniversario, ComentarioAniversario, NovoComentario } from '@/types/aniversariante';

const STORAGE_KEYS = {
  likes: `birthday_likes_${new Date().getFullYear()}`,
  comments: `birthday_comments_${new Date().getFullYear()}`,
};

class BirthdayStorage {
  // ==================== CURTIDAS ====================

  /**
   * Buscar todas as curtidas do localStorage
   */
  private _getAllLikes(): CurtidaAniversario[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.likes);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao buscar curtidas:', error);
      return [];
    }
  }

  /**
   * Salvar curtidas no localStorage
   */
  private _saveLikes(likes: CurtidaAniversario[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.likes, JSON.stringify(likes));
    } catch (error) {
      console.error('Erro ao salvar curtidas:', error);
      throw new Error('Erro ao salvar curtidas');
    }
  }

  /**
   * Buscar curtidas de um funcionário específico
   */
  getLikes(funcionarioMatricula: string): CurtidaAniversario[] {
    const allLikes = this._getAllLikes();
    return allLikes.filter(
      like => like.funcionarioMatricula === funcionarioMatricula
    );
  }

  /**
   * Adicionar curtida
   */
  async addLike(funcionarioMatricula: string, autorMatricula: string): Promise<void> {
    const allLikes = this._getAllLikes();
    const ano = new Date().getFullYear();

    // Verificar se já existe
    const exists = allLikes.some(
      like =>
        like.funcionarioMatricula === funcionarioMatricula &&
        like.autorMatricula === autorMatricula &&
        like.ano === ano
    );

    if (exists) {
      console.warn('Curtida já existe');
      return;
    }

    const newLike: CurtidaAniversario = {
      id: crypto.randomUUID(),
      funcionarioMatricula,
      autorMatricula,
      ano,
      createdAt: new Date().toISOString(),
    };

    allLikes.push(newLike);
    this._saveLikes(allLikes);
  }

  /**
   * Remover curtida
   */
  async removeLike(funcionarioMatricula: string, autorMatricula: string): Promise<void> {
    const allLikes = this._getAllLikes();
    const ano = new Date().getFullYear();

    const filteredLikes = allLikes.filter(
      like =>
        !(
          like.funcionarioMatricula === funcionarioMatricula &&
          like.autorMatricula === autorMatricula &&
          like.ano === ano
        )
    );

    this._saveLikes(filteredLikes);
  }

  // ==================== COMENTÁRIOS ====================

  /**
   * Buscar todos os comentários do localStorage
   */
  private _getAllComments(): ComentarioAniversario[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.comments);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      return [];
    }
  }

  /**
   * Salvar comentários no localStorage
   */
  private _saveComments(comments: ComentarioAniversario[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(comments));
    } catch (error) {
      console.error('Erro ao salvar comentários:', error);
      throw new Error('Erro ao salvar comentários');
    }
  }

  /**
   * Buscar comentários de um funcionário específico
   */
  getComments(funcionarioMatricula: string): ComentarioAniversario[] {
    const allComments = this._getAllComments();
    return allComments
      .filter(comment => comment.funcionarioMatricula === funcionarioMatricula)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Adicionar comentário
   */
  async addComment(data: NovoComentario): Promise<ComentarioAniversario> {
    const allComments = this._getAllComments();
    const ano = new Date().getFullYear();
    const now = new Date().toISOString();

    const newComment: ComentarioAniversario = {
      id: crypto.randomUUID(),
      funcionarioMatricula: data.funcionarioMatricula,
      autorMatricula: data.autorMatricula,
      autorNome: data.autorNome,
      autorAvatar: data.autorAvatar,
      mensagem: data.mensagem,
      ano,
      createdAt: now,
      updatedAt: now,
    };

    allComments.push(newComment);
    this._saveComments(allComments);

    return newComment;
  }

  /**
   * Remover comentário (apenas se for o autor)
   */
  async removeComment(commentId: string, autorMatricula: string): Promise<void> {
    const allComments = this._getAllComments();

    // Verificar se o comentário existe e se o usuário é o autor
    const comment = allComments.find(c => c.id === commentId);
    if (!comment) {
      throw new Error('Comentário não encontrado');
    }

    if (comment.autorMatricula !== autorMatricula) {
      throw new Error('Você não tem permissão para remover este comentário');
    }

    const filteredComments = allComments.filter(c => c.id !== commentId);
    this._saveComments(filteredComments);
  }
}

export const birthdayStorage = new BirthdayStorage();

