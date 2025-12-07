/**
 * Componente de Debug para verificar dados de autenticação
 *
 * ESTE COMPONENTE É APENAS PARA DESENVOLVIMENTO/DEBUG
 * Remova após verificar que a autenticação está funcionando
 *
 * USO:
 * Adicione no SolicitarBeneficio.tsx ou qualquer página protegida:
 *
 * import DebugAuth from '@/components/DebugAuth';
 *
 * // No JSX, adicione:
 * <DebugAuth />
 */

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

export default function DebugAuth() {
  const { user, isLoading, isAuthenticated, error } = useAuth();
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  const verificarSessao = async () => {
    setIsLoadingSession(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSupabaseSession({ session, error });
    } catch (err) {
      setSupabaseSession({ error: err });
    } finally {
      setIsLoadingSession(false);
    }
  };

  const verificarLocalStorage = () => {
    const colaboradorLogado = localStorage.getItem('colaboradorLogado');
    return colaboradorLogado ? JSON.parse(colaboradorLogado) : null;
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-[600px] overflow-y-auto shadow-lg z-50 border-2 border-primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Debug - Autenticação
          <Button
            size="sm"
            variant="outline"
            onClick={verificarSessao}
            disabled={isLoadingSession}
          >
            {isLoadingSession ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        {/* Status de Autenticação */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            Status
            {isAuthenticated ? (
              <Badge className="bg-green-500">Autenticado</Badge>
            ) : (
              <Badge variant="destructive">Não Autenticado</Badge>
            )}
          </h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span>isAuthenticated: {isAuthenticated.toString()}</span>
            </div>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle className="h-3 w-3 text-green-500" />
              )}
              <span>isLoading: {isLoading.toString()}</span>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-3 w-3" />
                <span>Erro: {error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dados do Usuário (AuthContext) */}
        <div>
          <h3 className="font-semibold mb-2">AuthContext - user</h3>
          {user ? (
            <pre className="bg-muted p-2 rounded text-[10px] overflow-x-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          ) : (
            <p className="text-muted-foreground">Nenhum usuário carregado</p>
          )}
        </div>

        {/* Sessão do Supabase */}
        <div>
          <h3 className="font-semibold mb-2">Supabase Session</h3>
          {supabaseSession ? (
            <pre className="bg-muted p-2 rounded text-[10px] overflow-x-auto max-h-40">
              {JSON.stringify(
                {
                  user: supabaseSession.session?.user
                    ? {
                        id: supabaseSession.session.user.id,
                        email: supabaseSession.session.user.email,
                        user_metadata: supabaseSession.session.user.user_metadata,
                      }
                    : null,
                  error: supabaseSession.error,
                },
                null,
                2
              )}
            </pre>
          ) : (
            <Button size="sm" onClick={verificarSessao} disabled={isLoadingSession}>
              Verificar Sessão
            </Button>
          )}
        </div>

        {/* localStorage */}
        <div>
          <h3 className="font-semibold mb-2">localStorage</h3>
          <pre className="bg-muted p-2 rounded text-[10px] overflow-x-auto">
            {JSON.stringify(verificarLocalStorage(), null, 2)}
          </pre>
        </div>

        {/* Dados Específicos para o Header */}
        {user && (
          <div className="border-t pt-3">
            <h3 className="font-semibold mb-2 text-primary">Dados para o Header</h3>
            <div className="space-y-1 bg-primary/5 p-2 rounded">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome (usuario):</span>
                <span className="font-medium">{user.nomeUsuario || '❌ null'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome Completo:</span>
                <span className="font-medium">{user.nome || '❌ null'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cargo:</span>
                <span className="font-medium">{user.cargo || '❌ null'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{user.email || '❌ null'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Matrícula:</span>
                <span className="font-medium">{user.matricula || '❌ null'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Verificações */}
        <div className="border-t pt-3">
          <h3 className="font-semibold mb-2">Verificações</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {user?.id ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span>auth.users.id presente</span>
            </div>
            <div className="flex items-center gap-2">
              {user?.email ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span>Email carregado</span>
            </div>
            <div className="flex items-center gap-2">
              {user?.nomeUsuario ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span>tbusuario.usuario carregado</span>
            </div>
            <div className="flex items-center gap-2">
              {user?.nome ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span>tbfuncionario.nome carregado</span>
            </div>
            <div className="flex items-center gap-2">
              {user?.cargo ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span>tbfuncionario.cargo carregado</span>
            </div>
            <div className="flex items-center gap-2">
              {user?.matricula ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span>tbfuncionario.matricula carregado</span>
            </div>
            <div className="flex items-center gap-2">
              {user?.usuarioId ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span>tbusuario.usuario_id carregado</span>
            </div>
            <div className="flex items-center gap-2">
              {user?.funcionarioId ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span>JOIN com tbfuncionario OK</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
