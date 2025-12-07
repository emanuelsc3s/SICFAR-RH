/**
 * AuthContext - Contexto de Autenticação
 * 
 * Este contexto gerencia o estado de autenticação do usuário em toda a aplicação.
 * Ele busca e mantém os dados do usuário logado combinando informações de:
 * - auth.users (Supabase Auth)
 * - tbusuario (tabela de usuários)
 * - tbfuncionario (tabela de funcionários)
 * 
 * Uso:
 * ```tsx
 * // No componente
 * const { user, isLoading, isAuthenticated } = useAuth();
 * 
 * // Acessar dados
 * console.log(user?.nome);      // Nome completo do funcionário
 * console.log(user?.cargo);     // Cargo do funcionário
 * console.log(user?.email);     // Email do auth.users
 * console.log(user?.matricula); // Matrícula do funcionário
 * ```
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthContextType, UserProfile, SupabaseUserData } from '@/types/auth';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

// Valor inicial do contexto
const initialAuthState: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  refreshUserProfile: async () => {},
  logout: async () => {},
  clearError: () => {},
};

// Criação do contexto
const AuthContext = createContext<AuthContextType>(initialAuthState);

/**
 * Hook para acessar o contexto de autenticação
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Provider de autenticação que envolve a aplicação
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca os dados completos do perfil do usuário
   * Faz JOIN entre tbusuario e tbfuncionario, usando o session do auth.users
   */
  const fetchUserProfile = useCallback(async (session: Session | null): Promise<UserProfile | null> => {
    if (!session?.user) {
      return null;
    }

    try {
      // Query com JOIN para buscar dados de tbusuario e tbfuncionario
      const { data: usuarios, error: queryError } = await supabase
        .from('tbusuario')
        .select(`
          usuario_id,
          usuario,
          funcionario_id,
          perfil_id,
          deletado,
          tbfuncionario:funcionario_id (
            matricula,
            cargo,
            nome
          )
        `)
        .eq('user_id', session.user.id)
        .eq('deletado', 'N')
        .limit(1);

      if (queryError) {
        console.error('❌ Erro ao buscar perfil do usuário:', queryError);
        throw queryError;
      }

      // 🔍 DEBUG: Log da resposta completa da query
      console.log('🔍 DEBUG - Query response:', {
        totalUsuarios: usuarios?.length,
        primeiroUsuario: usuarios?.[0],
      });

      const usuario = usuarios?.[0] as SupabaseUserData | undefined;
      
      // O JOIN pode retornar um array ou objeto único, tratamos ambos casos
      const funcionarioData = usuario?.tbfuncionario;
      const funcionario = Array.isArray(funcionarioData)
        ? funcionarioData[0]
        : funcionarioData;

      // 🔍 DEBUG: Log dos dados do funcionário
      console.log('🔍 DEBUG - Dados do funcionário:', {
        funcionarioData,
        isArray: Array.isArray(funcionarioData),
        funcionario,
        funcionarioId: usuario?.funcionario_id,
      });

      // Monta o perfil completo do usuário
      const userProfile: UserProfile = {
        // Dados do auth.users
        id: session.user.id,
        email: session.user.email || '',
        
        // Dados de tbusuario
        usuarioId: usuario?.usuario_id,
        nomeUsuario: usuario?.usuario || session.user.email?.split('@')[0] || 'Usuário',
        perfilId: usuario?.perfil_id,
        funcionarioId: usuario?.funcionario_id,
        
        // Dados de tbfuncionario
        nome: funcionario?.nome || session.user.user_metadata?.nome || 'Usuário',
        matricula: funcionario?.matricula || session.user.user_metadata?.matricula || '',
        cargo: funcionario?.cargo || session.user.user_metadata?.cargo || 'Colaborador',
        
        // Metadados
        carregadoEm: new Date().toISOString(),
      };

      console.log('✅ Perfil do usuário carregado:', {
        nomeUsuario: userProfile.nomeUsuario,
        nome: userProfile.nome,
        cargo: userProfile.cargo,
        email: userProfile.email,
        matricula: userProfile.matricula,
      });

      return userProfile;
    } catch (err) {
      console.error('❌ Erro ao buscar perfil:', err);
      
      // Retorna perfil básico com dados do auth.users como fallback
      return {
        id: session.user.id,
        email: session.user.email || '',
        nomeUsuario: session.user.email?.split('@')[0] || 'Usuário',
        nome: session.user.user_metadata?.nome || 'Usuário',
        matricula: session.user.user_metadata?.matricula || '',
        cargo: session.user.user_metadata?.cargo || 'Colaborador',
        carregadoEm: new Date().toISOString(),
      };
    }
  }, []);

  /**
   * Carrega ou recarrega os dados do perfil do usuário
   */
  const refreshUserProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        setUser(null);
        return;
      }

      const profile = await fetchUserProfile(session);
      setUser(profile);
      
      // Salva no localStorage para compatibilidade com código legado
      if (profile) {
        localStorage.setItem('colaboradorLogado', JSON.stringify({
          id: profile.id,
          email: profile.email,
          nome: profile.nome,
          matricula: profile.matricula,
          cargo: profile.cargo,
          loginTimestamp: profile.carregadoEm,
        }));
      }
    } catch (err) {
      console.error('❌ Erro ao atualizar perfil:', err);
      setError('Erro ao carregar dados do usuário');
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  /**
   * Faz logout do usuário
   */
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('colaboradorLogado');
      localStorage.removeItem('colaborador');
    } catch (err) {
      console.error('❌ Erro ao fazer logout:', err);
      setError('Erro ao sair da aplicação');
    }
  }, []);

  /**
   * Limpa o erro atual
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Efeito para inicializar e monitorar mudanças de autenticação
  useEffect(() => {
    let isMounted = true;
    let isInitialized = false;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted) {
          if (session) {
            const profile = await fetchUserProfile(session);
            setUser(profile);
            
            // Salva no localStorage para compatibilidade
            if (profile) {
              localStorage.setItem('colaboradorLogado', JSON.stringify({
                id: profile.id,
                email: profile.email,
                nome: profile.nome,
                matricula: profile.matricula,
                cargo: profile.cargo,
                loginTimestamp: profile.carregadoEm,
              }));
            }
          } else {
            setUser(null);
          }
          setIsLoading(false);
          isInitialized = true;
        }
      } catch (err) {
        console.error('❌ Erro ao inicializar autenticação:', err);
        if (isMounted) {
          setError('Erro ao verificar autenticação');
          setIsLoading(false);
          isInitialized = true;
        }
      }
    };

    initializeAuth();

    // Listener para mudanças de autenticação (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔄 Auth state changed:', event);

        if (!isMounted) return;
        
        // Ignora o evento INITIAL_SESSION pois já tratamos na inicialização
        if (event === 'INITIAL_SESSION') {
          return;
        }

        // Ignora SIGNED_IN se ainda estamos inicializando (evita duplicação)
        if (event === 'SIGNED_IN' && !isInitialized) {
          return;
        }

        if (event === 'SIGNED_IN' && session) {
          const profile = await fetchUserProfile(session);
          setUser(profile);
          
          // Salva no localStorage para compatibilidade
          if (profile) {
            localStorage.setItem('colaboradorLogado', JSON.stringify({
              id: profile.id,
              email: profile.email,
              nome: profile.nome,
              matricula: profile.matricula,
              cargo: profile.cargo,
              loginTimestamp: profile.carregadoEm,
            }));
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('colaboradorLogado');
          localStorage.removeItem('colaborador');
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Token foi atualizado, recarrega o perfil
          const profile = await fetchUserProfile(session);
          if (isMounted) {
            setUser(profile);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // Memoiza o valor do contexto para evitar re-renders desnecessários
  const contextValue = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    refreshUserProfile,
    logout,
    clearError,
  }), [user, isLoading, error, refreshUserProfile, logout, clearError]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
