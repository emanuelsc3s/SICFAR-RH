/**
 * Hook para gerenciar dados do usuário logado
 */

import { useState, useEffect } from 'react';
import type { CurrentUser } from '@/types/aniversariante';

interface UseCurrentUserReturn {
  user: CurrentUser | null;
  isLoggedIn: boolean;
  matricula: string | null;
  nome: string | null;
}

export function useCurrentUser(): UseCurrentUserReturn {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem('colaborador');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setUser(null);
      }
    };

    loadUser();

    // Listener para mudanças no localStorage (login/logout em outras abas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'colaborador') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    user,
    isLoggedIn: !!user,
    matricula: user?.matricula || null,
    nome: user?.nome || null,
  };
}

