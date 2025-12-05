import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente de proteção de rotas que verifica autenticação via Supabase
 * 
 * Funcionalidades:
 * - Verifica se existe uma sessão ativa do Supabase
 * - Redireciona usuários não autenticados para /login
 * - Exibe loading enquanto verifica a sessão
 * - Permite acesso apenas para usuários com sessão ativa
 * 
 * Uso:
 * <ProtectedRoute>
 *   <SuaPagina />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verificarAutenticacao = async () => {
      try {
        // Verifica se existe uma sessão ativa no Supabase
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Erro ao verificar sessão:", error);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        if (session) {
          // Usuário está autenticado
          console.log("✅ Sessão ativa encontrada para:", session.user.email);
          setIsAuthenticated(true);
        } else {
          // Não há sessão ativa
          console.log("⚠️ Nenhuma sessão ativa encontrada");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("❌ Erro inesperado ao verificar autenticação:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verificarAutenticacao();

    // Listener para mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Mudança no estado de autenticação:", event);
        
        if (event === 'SIGNED_IN' && session) {
          console.log("✅ Usuário autenticado:", session.user.email);
          setIsAuthenticated(true);
        } else if (event === 'SIGNED_OUT') {
          console.log("⚠️ Usuário desconectado");
          setIsAuthenticated(false);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log("🔄 Token atualizado");
          setIsAuthenticated(true);
        }
      }
    );

    // Cleanup: remove o listener quando o componente for desmontado
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Exibe loading enquanto verifica a autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para login
  if (!isAuthenticated) {
    console.log("🔒 Acesso negado - Redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado, renderiza o conteúdo protegido
  return <>{children}</>;
};

export default ProtectedRoute;

