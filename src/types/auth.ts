/**
 * Tipos para autenticação e perfil do usuário
 * 
 * Este arquivo centraliza as interfaces relacionadas aos dados
 * do usuário logado, incluindo dados de tbusuario, tbfuncionario e auth.users
 */

/**
 * Perfil completo do usuário logado
 * Combina dados de:
 * - auth.users (Supabase Auth)
 * - tbusuario (tabela de usuários do sistema)
 * - tbfuncionario (tabela de funcionários)
 */
export interface UserProfile {
  // Dados do Supabase Auth (auth.users)
  id: string;              // auth.users.id (UUID do Supabase)
  email: string;           // auth.users.email
  
  // Dados de tbusuario
  usuarioId?: number;      // tbusuario.usuario_id
  nomeUsuario: string;     // tbusuario.usuario (nome visual/login)
  perfilId?: number;       // tbusuario.perfil_id (nível de acesso)
  funcionarioId?: number;  // tbusuario.funcionario_id (FK para tbfuncionario)
  
  // Dados de tbfuncionario
  nome: string;            // tbfuncionario.nome (nome completo)
  matricula: string;       // tbfuncionario.matricula
  cargo: string;           // tbfuncionario.cargo
  
  // Metadados
  carregadoEm: string;     // Timestamp de quando os dados foram carregados
}

/**
 * Estado do contexto de autenticação
 */
export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Ações disponíveis no contexto de autenticação
 */
export interface AuthContextType extends AuthState {
  // Recarrega os dados do perfil do usuário
  refreshUserProfile: () => Promise<void>;
  // Faz logout do usuário
  logout: () => Promise<void>;
  // Limpa o erro atual
  clearError: () => void;
}

/**
 * Dados brutos retornados pela query do Supabase
 * (antes de transformar em UserProfile)
 */
export interface SupabaseUserData {
  usuario_id: number;
  usuario: string;
  funcionario_id: number;
  perfil_id: number;
  deletado: string;
  tbfuncionario: {
    matricula: string;
    cargo: string;
    nome: string;
  } | {
    matricula: string;
    cargo: string;
    nome: string;
  }[];
}
