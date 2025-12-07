import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { AuthError } from "@supabase/supabase-js";
// Imagem hero do login
import loginHero from "@/assets/LisPortalRH.png";

// Interface para dados de login
interface LoginFormData {
  email: string;
  password: string;
}

// Função para mapear erros do Supabase para mensagens em português
const mapearErroSupabase = (error: AuthError): string => {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha incorretos',
    'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada',
    'User not found': 'Usuário não encontrado',
    'Too many requests': 'Muitas tentativas. Tente novamente mais tarde',
    'Network request failed': 'Erro de conexão. Verifique sua internet',
  };

  // Verifica se a mensagem de erro está no mapeamento
  for (const [key, value] of Object.entries(errorMessages)) {
    if (error.message.includes(key)) {
      return value;
    }
  }

  // Mensagem genérica para erros não mapeados
  return 'Erro ao fazer login. Tente novamente';
};

// Função para validar formato de email
const validarEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Verifica se já existe uma sessão ativa ao montar o componente
  useEffect(() => {
    const verificarSessao = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Usuário já está autenticado, redireciona para página principal
          console.log("✅ Sessão ativa encontrada, redirecionando...");
          navigate('/solicitarbeneficio');
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      }
    };

    verificarSessao();
  }, [navigate]);

  // Função de validação do formulário
  const validarFormulario = (): boolean => {
    let isValid = true;

    // Limpa erros anteriores
    setEmailError("");
    setPasswordError("");

    // Valida email
    if (!email.trim()) {
      setEmailError("Email é obrigatório");
      isValid = false;
    } else if (!validarEmail(email.trim())) {
      setEmailError("Email inválido");
      isValid = false;
    }

    // Valida senha
    if (!password.trim()) {
      setPasswordError("Senha é obrigatória");
      isValid = false;
    } else if (password.trim().length < 6) {
      setPasswordError("Senha deve ter no mínimo 6 caracteres");
      isValid = false;
    }

    return isValid;
  };

  // Função de login com Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Valida formulário
    if (!validarFormulario()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        // Mapeia erro para mensagem em português
        const mensagemErro = mapearErroSupabase(error);
        setErrorMessage(mensagemErro);
        setShowErrorDialog(true);
        console.error("❌ Erro de autenticação:", error.message);
        return;
      }

      if (data.user) {
        console.log("✅ Login bem-sucedido:", data.user.email);
        
        // O AuthContext irá automaticamente:
        // 1. Capturar o evento SIGNED_IN
        // 2. Buscar dados completos do usuário (tbusuario + tbfuncionario)
        // 3. Salvar no localStorage para compatibilidade

        // Redireciona para página principal
        navigate('/solicitarbeneficio');
      }
    } catch (error) {
      console.error("❌ Erro inesperado ao fazer login:", error);
      setErrorMessage("Erro inesperado. Tente novamente");
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Seção Esquerda - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradiente de fundo baseado no Figma */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgb(88, 177, 240) 0%, rgb(4, 20, 44) 100%)' }}
        />

        {/* Imagem hero baseada no Figma */}
        <img
          src={loginHero}
          alt="Hero"
          className="absolute left-1/2 -translate-x-1/2 bottom-0 h-[90%] object-contain z-[1]"
        />

        {/* Padrão de pontos decorativo */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 z-[2]">
          <div className="grid grid-cols-12 gap-2 p-8">
            {Array.from({ length: 144 }).map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full bg-white"
                style={{
                  opacity: Math.random() * 0.5 + 0.3,
                }}
              />
            ))}
          </div>
        </div>

        {/* Conteúdo da seção de branding */}
        <div className="relative z-10 flex flex-col justify-end items-center w-full px-12 pb-12 text-white">
          {/* Texto de branding */}
          <div className="text-left max-w-lg">
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Sua ponte de comunicação com o RH
              <span className="inline-flex items-center ml-2">
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </span>
            </h1>
            <p className="text-lg text-white/90">
              Acesse informações, benefícios e recursos de forma rápida e segura
            </p>
          </div>
        </div>

        {/* Efeito de brilho animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </div>

      {/* Seção Direita - Formulário de Login */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Logo e título */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2">
                <svg
                  className="w-10 h-10 text-primary"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                <h1 className="text-2xl font-bold text-foreground">SICFAR RH</h1>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Acesse sua conta
            </h2>
            <p className="text-sm text-muted-foreground">
              Entre com seu email e senha
            </p>
          </div>

          {/* Card do formulário */}
          <Card className="border-border/50 shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campo de Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Digite seu email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      className={`pl-10 ${emailError ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                      aria-describedby={emailError ? "email-error" : undefined}
                    />
                  </div>
                  {emailError && (
                    <p id="email-error" className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Campo de Senha */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError("");
                      }}
                      className={`pl-10 pr-10 ${passwordError ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                      aria-describedby={passwordError ? "password-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p id="password-error" className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {passwordError}
                    </p>
                  )}
                </div>

                {/* Link Esqueceu a senha */}
                <div className="flex justify-end">
                  <Link
                    to="/esqueceu-senha"
                    className="text-sm text-primary hover:text-primary-700 hover:underline transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>

                {/* Botão de Login */}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-700 text-primary-foreground font-medium h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'FAZER LOGIN'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Informações adicionais */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Ao fazer login, você concorda com nossos{" "}
              <Link to="/termos" className="text-primary hover:underline">
                Termos de Uso
              </Link>{" "}
              e{" "}
              <Link to="/privacidade" className="text-primary hover:underline">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>

        {/* Modal de Erro de Autenticação */}
        <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Erro de Autenticação
              </DialogTitle>
              <DialogDescription className="text-slate-600 pt-2">
                {errorMessage || "Erro ao fazer login. Por favor, verifique suas credenciais e tente novamente."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button
                type="button"
                onClick={() => {
                  setShowErrorDialog(false);
                  setErrorMessage("");
                }}
                className="w-full sm:w-auto bg-primary hover:bg-primary-700 text-white"
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Login;

