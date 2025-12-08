import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_KEY no arquivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Função auxiliar para criar usuário com email já confirmado (apenas para desenvolvimento/testes)
 * NOTA: Requer service_role key (não use em produção com chave exposta)
 *
 * Para usar esta função, você precisa:
 * 1. Adicionar VITE_SUPABASE_SERVICE_ROLE_KEY no .env
 * 2. Criar um cliente admin separado
 *
 * Exemplo de uso:
 * ```typescript
 * const { data, error } = await criarUsuarioConfirmado({
 *   email: 'usuario@exemplo.com',
 *   password: 'senha123',
 *   user_metadata: {
 *     nome: 'Nome do Usuário',
 *     matricula: '12345'
 *   }
 * });
 * ```
 */
export async function criarUsuarioConfirmado(params: {
  email: string;
  password: string;
  user_metadata?: Record<string, unknown>;
}) {
  // IMPORTANTE: Esta função requer service_role key
  // Não use em produção com a chave exposta no frontend
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('VITE_SUPABASE_SERVICE_ROLE_KEY não configurada. Esta função requer permissões de admin.');
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return await supabaseAdmin.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: true, // Email já confirmado
    user_metadata: params.user_metadata || {}
  });
}

