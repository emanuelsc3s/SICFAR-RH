import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
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
import funcionariosData from "../../data/funcionarios.json";
// Imagem hero do login
import loginHero from "@/assets/LisPortalRH.png";

// Interface para os dados do funcionário
interface Funcionario {
  MATRICULA: string;
  NOME: string;
  CPF: string;
  NASCIMENTO: string;
  EMAIL: string;
}

// Função para gerar a senha esperada baseada no CPF e data de nascimento
const gerarSenha = (cpf: string, dataNascimento: string): string => {
  // Pega os 3 últimos dígitos do CPF
  const ultimosDigitosCPF = cpf.slice(-3);

  // Extrai dia e mês da data de nascimento (formato: DD.MM.YYYY HH:MM)
  const [dia, mes] = dataNascimento.split('.');
  const ddmm = `${dia}${mes}`;

  return `${ultimosDigitosCPF}${ddmm}`;
};

// Função para normalizar matrícula (remove zeros à esquerda)
const normalizarMatricula = (matricula: string): string => {
  return matricula.replace(/^0+/, '') || '0';
};

// Função para normalizar CPF (remove pontos, traços e espaços)
const normalizarCPF = (cpf: string): string => {
  return cpf.replace(/[.\-\s]/g, '');
};

// Função para detectar se o input é CPF ou matrícula
const detectarTipoInput = (input: string): 'cpf' | 'matricula' => {
  const inputLimpo = input.replace(/[.\-\s]/g, '');

  // Se tem 11 dígitos numéricos, é CPF
  if (/^\d{11}$/.test(inputLimpo)) {
    return 'cpf';
  }

  // Caso contrário, é matrícula
  return 'matricula';
};

// Função para buscar funcionário por matrícula OU CPF
const buscarFuncionario = (input: string, funcionarios: Funcionario[]): Funcionario | undefined => {
  const tipoInput = detectarTipoInput(input);

  if (tipoInput === 'cpf') {
    // Busca por CPF
    const cpfNormalizado = normalizarCPF(input);
    return funcionarios.find(f => normalizarCPF(f.CPF) === cpfNormalizado);
  } else {
    // Busca por matrícula
    const matriculaNormalizada = normalizarMatricula(input);
    return funcionarios.find(f => {
      const matriculaFuncionarioNormalizada = normalizarMatricula(f.MATRICULA);
      return matriculaFuncionarioNormalizada === matriculaNormalizada;
    });
  }
};

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [matriculaOuCpf, setMatriculaOuCpf] = useState("");
  const [password, setPassword] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Remove espaços em branco
    const inputDigitado = matriculaOuCpf.trim();
    const senhaDigitada = password.trim();

    // Busca o funcionário no JSON (por matrícula OU CPF)
    const funcionarios = funcionariosData.RecordSet as Funcionario[];
    const funcionario = buscarFuncionario(inputDigitado, funcionarios);

    if (!funcionario) {
      // Matrícula ou CPF não encontrado
      setShowErrorDialog(true);
      return;
    }

    // Gera a senha esperada baseada no CPF e data de nascimento
    const senhaEsperada = gerarSenha(funcionario.CPF, funcionario.NASCIMENTO);

    if (senhaDigitada === senhaEsperada) {
      // Login bem-sucedido
      const tipoLogin = detectarTipoInput(inputDigitado);
      console.log("✅ Login bem-sucedido:", funcionario.NOME, "| Email:", funcionario.EMAIL, "| Tipo de login:", tipoLogin === 'cpf' ? 'CPF' : 'Matrícula');

      // Salva os dados do colaborador no localStorage
      const colaboradorData = {
        matricula: funcionario.MATRICULA,
        nome: funcionario.NOME,
        cpf: funcionario.CPF,
        dataNascimento: funcionario.NASCIMENTO,
        email: funcionario.EMAIL || '',
        loginTimestamp: new Date().toISOString()
      };

      localStorage.setItem('colaboradorLogado', JSON.stringify(colaboradorData));

      // Redireciona para página de solicitar benefício
      navigate('/solicitarbeneficio');
    } else {
      // Senha incorreta
      console.log("❌ Senha incorreta. Esperada:", senhaEsperada, "Digitada:", senhaDigitada);
      setShowErrorDialog(true);
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
              Entre com sua matrícula ou CPF
            </p>
          </div>

          {/* Card do formulário */}
          <Card className="border-border/50 shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campo de Matrícula ou CPF */}
                <div className="space-y-2">
                  <Label htmlFor="matriculaOuCpf" className="text-foreground">
                    Matrícula ou CPF
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="matriculaOuCpf"
                      type="text"
                      placeholder="Digite sua matrícula ou CPF"
                      value={matriculaOuCpf}
                      onChange={(e) => setMatriculaOuCpf(e.target.value)}
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
                      placeholder="3 últimos dígitos CPF + Dia Mês Nascimento"
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

        {/* Modal de Erro de Autenticação */}
        <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Erro de Autenticação
              </DialogTitle>
              <DialogDescription className="text-slate-600 pt-2">
                Matrícula/CPF ou senha incorreta. Por favor, verifique suas credenciais e tente novamente.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button
                type="button"
                onClick={() => setShowErrorDialog(false)}
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

