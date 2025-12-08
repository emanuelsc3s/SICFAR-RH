/**
 * Hook para gerenciar curtidas de aniversariantes
 */

import { useState, useEffect, useCallback } from 'react';
import { birthdayStorage } from '@/services/birthdayStorage';
import { useCurrentUser } from './useCurrentUser';
import { useToast } from './use-toast';

interface UseBirthdayLikesReturn {
  totalLikes: number;
  isLiked: boolean;
  toggleLike: () => Promise<void>;
  isLoading: boolean;
}

export function useBirthdayLikes(funcionarioMatricula: string): UseBirthdayLikesReturn {
  const { matricula: autorMatricula, isLoggedIn } = useCurrentUser();
  const { toast } = useToast();
  const [totalLikes, setTotalLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadLikes = useCallback(() => {
    try {
      const likes = birthdayStorage.getLikes(funcionarioMatricula);
      setTotalLikes(likes.length);

      if (autorMatricula) {
        const userLiked = likes.some(
          like => like.autorMatricula === autorMatricula
        );
        setIsLiked(userLiked);
      } else {
        setIsLiked(false);
      }
    } catch (error) {
      console.error('Erro ao carregar curtidas:', error);
    }
  }, [funcionarioMatricula, autorMatricula]);

  // Carregar curtidas ao montar e quando mudar o funcionário ou usuário
  useEffect(() => {
    loadLikes();
  }, [loadLikes]);

  const toggleLike = async () => {
    if (!isLoggedIn || !autorMatricula) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para parabenizar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLiked) {
        await birthdayStorage.removeLike(funcionarioMatricula, autorMatricula);
        toast({
          title: "Curtida removida",
          description: "Você removeu sua felicitação",
        });
      } else {
        await birthdayStorage.addLike(funcionarioMatricula, autorMatricula);
        toast({
          title: "Parabéns enviado!",
          description: "Sua felicitação foi registrada",
        });
      }

      loadLikes();
    } catch (error) {
      console.error('Erro ao processar curtida:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar sua ação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { totalLikes, isLiked, toggleLike, isLoading };
}

