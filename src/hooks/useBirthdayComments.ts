/**
 * Hook para gerenciar comentários de aniversariantes
 */

import { useState, useEffect, useCallback } from 'react';
import { birthdayStorage } from '@/services/birthdayStorage';
import { useCurrentUser } from './useCurrentUser';
import { useToast } from './use-toast';
import type { ComentarioAniversario } from '@/types/aniversariante';

interface UseBirthdayCommentsReturn {
  comments: ComentarioAniversario[];
  addComment: (mensagem: string) => Promise<void>;
  removeComment: (commentId: string) => Promise<void>;
  isLoading: boolean;
}

export function useBirthdayComments(funcionarioMatricula: string): UseBirthdayCommentsReturn {
  const { user, isLoggedIn } = useCurrentUser();
  const { toast } = useToast();
  const [comments, setComments] = useState<ComentarioAniversario[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadComments = useCallback(() => {
    try {
      const allComments = birthdayStorage.getComments(funcionarioMatricula);
      setComments(allComments);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
  }, [funcionarioMatricula]);

  // Carregar comentários ao montar e quando mudar o funcionário
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const addComment = async (mensagem: string) => {
    if (!isLoggedIn || !user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para comentar",
        variant: "destructive",
      });
      return;
    }

    const trimmedMessage = mensagem.trim();

    if (!trimmedMessage) {
      toast({
        title: "Erro",
        description: "O comentário não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    if (trimmedMessage.length > 500) {
      toast({
        title: "Erro",
        description: "O comentário não pode ter mais de 500 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await birthdayStorage.addComment({
        funcionarioMatricula,
        autorMatricula: user.matricula,
        autorNome: user.nome,
        mensagem: trimmedMessage,
      });

      loadComments();

      toast({
        title: "Felicitação enviada!",
        description: "Seu comentário foi adicionado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar comentário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeComment = async (commentId: string) => {
    if (!isLoggedIn || !user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await birthdayStorage.removeComment(commentId, user.matricula);
      loadComments();

      toast({
        title: "Comentário removido",
        description: "Seu comentário foi removido com sucesso",
      });
    } catch (error) {
      console.error('Erro ao remover comentário:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao remover comentário",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { comments, addComment, removeComment, isLoading };
}

