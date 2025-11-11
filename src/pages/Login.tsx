import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de autenticação será implementada posteriormente
    console.log("Login attempt:", { email, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Seção Esquerda - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-700 to-primary relative overflow-hidden">
        {/* Padrão de pontos decorativo */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
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
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
          {/* Imagem ilustrativa */}
          <div className="mb-8 max-w-md">
            <img
              src="/placeholder.svg"
              alt="Profissional usando smartphone"
              className="w-full h-auto rounded-lg shadow-2xl"
            />
          </div>

          {/* Texto de branding */}
          <div className="text-center max-w-lg">
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
              Login com seu e-mail
            </h2>
            <p className="text-sm text-muted-foreground">
              Acesse o portal corporativo
            </p>
          </div>

          {/* Card do formulário */}
          <Card className="border-border/50 shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campo de E-mail */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    E-mail
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@email.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
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
                      placeholder="******"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
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
                >
                  FAZER LOGIN
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
      </div>
    </div>
  );
};

export default Login;

