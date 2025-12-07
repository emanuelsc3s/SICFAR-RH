import { useState, useEffect } from "react";
import { Home, Plus, Users, QrCode, Download, DollarSign, Eye, ArrowLeft, ArrowRight, Flame, Pill, Car, Heart, Bus, Fuel, LogOut, Settings, User as UserIcon, ChevronDown, LucideIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { toast } from "sonner";
import { generateVoucherPDF } from "@/utils/pdfGenerator";
import { supabase } from "@/lib/supabase";

// Interface para os dados do colaborador
interface ColaboradorData {
  matricula: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  email: string;
  loginTimestamp: string;
}

// Interface para benefício vindo do banco de dados
interface BeneficioFromDB {
  beneficio_id: number;
  beneficio: string;        // Nome do benefício
  descricao: string;
  icone: string;            // Nome do ícone em kebab-case
  parceiro_id: number | null;
}

// Interface para benefício usado no componente
interface Beneficio {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

// Interface para inserção no banco de dados (tbvoucher)
interface VoucherDatabaseInsert {
  // Datas
  data_emissao: string;           // DATE: YYYY-MM-DD
  data_validade: string;          // DATE: YYYY-MM-DD

  // Dados do Funcionário
  funcionario_id?: number | null;
  funcionario: string;            // Snapshot
  email: string;                  // Snapshot
  matricula: string;              // Snapshot

  // Benefício (1:1)
  beneficio_id: number;

  // Detalhes da Solicitação
  justificativa?: string | null;
  urgente: boolean;

  // Status e valor
  status: 'pendente' | 'emitido' | 'aprovado' | 'resgatado' | 'expirado' | 'cancelado';
  valor: number;

  // Auditoria
  created_nome: string;
  created_by: string;             // UUID
  deletado: 'N' | 'S';
}

// Interface para resposta do INSERT no banco (após trigger gerar numero_voucher)
interface VoucherInsertResponse {
  voucher_id: string;        // UUID gerado automaticamente
  numero_voucher: string;    // VOU-XXXXXXXXXXXXXXXX gerado pelo trigger
}

// Mapa de ícones Lucide React
const iconMap: Record<string, LucideIcon> = {
  'flame': Flame,
  'pill': Pill,
  'fuel': Fuel,
  'heart': Heart,
  'bus': Bus,
  'car': Car,
};

// Função para obter o componente de ícone
const getIconComponent = (iconName: string | null): LucideIcon => {
  if (!iconName) return Pill; // Ícone padrão
  return iconMap[iconName.toLowerCase()] || Pill; // Ícone padrão caso não encontre
};

const SolicitarBeneficio = () => {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState("Solicitar Voucher");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBeneficios, setSelectedBeneficios] = useState<string[]>([]);
  const [showVoucher, setShowVoucher] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [colaborador, setColaborador] = useState<ColaboradorData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentVoucherNumber, setCurrentVoucherNumber] = useState<string>("");

  // Estados para benefícios dinâmicos
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const [isLoadingBeneficios, setIsLoadingBeneficios] = useState(true);

  // Estado para armazenar múltiplos vouchers gerados (um para cada benefício)
  const [vouchersGerados, setVouchersGerados] = useState<Array<{
    voucherNumber: string;
    beneficio: Beneficio;
    qrCodeUrl: string;
  }>>([]);

  // Form data for step 2
  const [formData, setFormData] = useState({
    justificativa: "",
    urgencia: "nao"  // Default to "Não" (not urgent)
  });

  // Função para obter as iniciais do nome
  const getInitials = (nome: string): string => {
    if (!nome) return "??";
    const names = nome.trim().split(" ");
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  // Função para formatar o nome (Primeiro nome + inicial do sobrenome)
  const formatDisplayName = (nome: string): string => {
    if (!nome) return "Usuário";
    const names = nome.trim().split(" ");
    if (names.length === 1) {
      return names[0];
    }
    const primeiroNome = names[0];
    const inicialSobrenome = names[names.length - 1][0].toUpperCase();
    return `${primeiroNome} ${inicialSobrenome}.`;
  };

  // Função para fazer logout
  const handleLogout = async () => {
    try {
      // Faz logout no Supabase
      await supabase.auth.signOut();

      // Remove dados do localStorage
      localStorage.removeItem('colaboradorLogado');

      console.log("✅ Logout realizado com sucesso");

      // Redireciona para login
      navigate('/login');
    } catch (error) {
      console.error("❌ Erro ao fazer logout:", error);

      // Mesmo com erro, remove dados locais e redireciona
      localStorage.removeItem('colaboradorLogado');
      navigate('/login');
    }
  };

  // Carregar dados do colaborador do localStorage
  useEffect(() => {
    const colaboradorData = localStorage.getItem('colaboradorLogado');
    if (colaboradorData) {
      try {
        const data = JSON.parse(colaboradorData);
        setColaborador(data);
      } catch (error) {
        console.error('Erro ao carregar dados do colaborador:', error);
        navigate('/login');
      }
    } else {
      // Se não houver dados do colaborador, redirecionar para login
      navigate('/login');
    }
  }, [navigate]);

  // Carregar benefícios do Supabase
  useEffect(() => {
    const carregarBeneficios = async () => {
      try {
        setIsLoadingBeneficios(true);
        console.log('🔄 Carregando benefícios do Supabase...');

        const { data, error } = await supabase
          .from('tbbeneficio')
          .select('beneficio_id, beneficio, descricao, icone, parceiro_id')
          .eq('ativo', true)
          .eq('deletado', 'N')
          .order('beneficio_id', { ascending: true });

        if (error) {
          console.error('❌ Erro ao carregar benefícios:', error);
          toast.error('Erro ao carregar benefícios', {
            description: 'Não foi possível carregar a lista de benefícios. Tente novamente.',
            duration: 5000
          });
          setBeneficios([]);
          return;
        }

        if (!data || data.length === 0) {
          console.warn('⚠️ Nenhum benefício ativo encontrado');
          toast.warning('Nenhum benefício disponível', {
            description: 'Não há benefícios ativos no momento.',
            duration: 5000
          });
          setBeneficios([]);
          return;
        }

        // Transformar dados do banco para o formato usado no componente
        const beneficiosTransformados: Beneficio[] = data.map((item: BeneficioFromDB) => ({
          id: item.beneficio_id.toString(),
          title: item.beneficio,
          description: item.descricao || 'Sem descrição',
          icon: getIconComponent(item.icone)
        }));

        console.log(`✅ ${beneficiosTransformados.length} benefício(s) carregado(s) com sucesso`);
        setBeneficios(beneficiosTransformados);

      } catch (error) {
        console.error('❌ Erro inesperado ao carregar benefícios:', error);
        toast.error('Erro inesperado', {
          description: 'Ocorreu um erro ao carregar os benefícios.',
          duration: 5000
        });
        setBeneficios([]);
      } finally {
        setIsLoadingBeneficios(false);
      }
    };

    carregarBeneficios();
  }, []);

  const navigationButtons = [
    { name: "Início", icon: Home },
    { name: "Solicitar Voucher", icon: Plus },
    { name: "Dashboard RH", icon: Users },
    { name: "Scanner Parceiro", icon: QrCode },
    { name: "Resgates", icon: Download },
    { name: "Faturas", icon: DollarSign },
    { name: "Auditoria", icon: Eye }
  ];

  const steps = [
    { number: 1, title: "Escolher Programa", subtitle: "Selecione o tipo de voucher", active: currentStep === 1 },
    { number: 2, title: "Preencher Detalhes", subtitle: "Informações adicionais", active: currentStep === 2 },
    { number: 3, title: "Revisar e Confirmar", subtitle: "Conferir dados antes do envio", active: currentStep === 3 }
  ];

  const handleBeneficioToggle = (beneficioId: string) => {
    setSelectedBeneficios(prev => {
      if (prev.includes(beneficioId)) {
        return prev.filter(id => id !== beneficioId);
      } else {
        return [...prev, beneficioId];
      }
    });
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // =====================================================================
  // NOTA: Geração local de numero_voucher foi REMOVIDA
  // Motivo: O banco de dados gera automaticamente via trigger
  // Trigger: trg_gerar_numero_voucher
  // Função: gerar_numero_voucher() usando gen_random_bytes(8)
  // Formato: VOU-XXXXXXXXXXXXXXXX (16 caracteres hexadecimais)
  // =====================================================================

  /**
   * Gera QR Code para um voucher específico
   * @param voucherNumber - Número único do voucher
   * @param beneficioId - ID do benefício associado ao voucher
   * @returns URL do QR Code em formato data URL ou string vazia em caso de erro
   */
  const generateQRCodeForVoucher = async (voucherNumber: string, beneficioId: string): Promise<string> => {
    const qrData = JSON.stringify({
      voucher: voucherNumber,
      beneficio: beneficioId, // Cada voucher agora tem apenas um benefício
      data: new Date().toISOString(),
      empresa: "Farmace Benefícios"
    });

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1E3A8A',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      return '';
    }
  };

  // Mantém a função original para compatibilidade (usada na visualização do voucher)
  const generateQRCode = async (voucherNumber: string) => {
    const qrCodeDataUrl = await generateQRCodeForVoucher(voucherNumber, selectedBeneficios[0] || '');
    setQrCodeUrl(qrCodeDataUrl);
  };

  // Função para salvar voucher no localStorage usando o utilitário
  const saveVoucherToLocalStorage = (voucherData: VoucherEmitido): boolean => {
    const sucesso = salvarVoucherEmitido(voucherData);

    if (!sucesso) {
      toast.error("Erro ao salvar voucher localmente", {
        description: "O voucher foi gerado mas não foi salvo no histórico local.",
        duration: 5000
      });
    } else {
      // Disparar evento customizado para notificar outras páginas
      window.dispatchEvent(new CustomEvent('voucherEmitido', {
        detail: voucherData
      }));
      console.log('📢 Evento voucherEmitido disparado para:', voucherData.id);
    }

    return sucesso;
  };

  /**
   * =====================================================================
   * FUNÇÃO PRINCIPAL: handleConfirmSolicitation
   * =====================================================================
   *
   * LÓGICA DE GERAÇÃO DE VOUCHERS INDIVIDUAIS:
   * - Para cada benefício selecionado pelo usuário, é gerado UM voucher separado
   * - Isso significa que se o usuário selecionar 3 benefícios, serão gerados 3 vouchers
   * - Cada voucher é salvo no banco de dados (trigger gera numero_voucher)
   * - Cada voucher possui seu próprio número único, QR Code e PDF
   * - Cada voucher é enviado em um e-mail separado para o colaborador
   *
   * FLUXO DE PROCESSAMENTO (ORDEM CRÍTICA):
   * 1. INSERT no banco → trigger gera numero_voucher automaticamente
   * 2. Recupera voucher_id (UUID) + numero_voucher do banco
   * 3. Gera QR Code usando numero_voucher do banco
   * 4. Gera PDF usando numero_voucher do banco
   * 5. Envia email usando numero_voucher do banco
   *
   * IMPORTANTE:
   * - O numero_voucher é gerado pelo BANCO via trigger (NÃO pelo frontend)
   * - Formato: VOU-XXXXXXXXXXXXXXXX (20 chars: "VOU-" + 16 hex)
   * - Gerado via gen_random_bytes(8) - criptograficamente seguro
   * - Único garantido por índice UNIQUE no banco
   *
   * EXEMPLO:
   * Se o usuário seleciona: Vale Gás + Vale Farmácia + Vale Transporte
   * Serão gerados:
   *   - Voucher VOU-A1B2C3D4E5F67890 → Vale Gás (PDF + Email)
   *   - Voucher VOU-1234567890ABCDEF → Vale Farmácia (PDF + Email)
   *   - Voucher VOU-FEDCBA9876543210 → Vale Transporte (PDF + Email)
   *
   * =====================================================================
   */
  const handleConfirmSolicitation = async () => {
    console.log('🚀 Iniciando handleConfirmSolicitation...');
    console.log('📋 MODO: Geração de vouchers INDIVIDUAIS (um por benefício)');

    // ===================================================================
    // BLOCO DE VALIDAÇÕES
    // ===================================================================

    // Validação 1: Verifica se há dados do colaborador
    if (!colaborador) {
      console.error('❌ Validação falhou: Colaborador não encontrado');
      toast.error("Dados do colaborador não encontrados. Por favor, faça login novamente.");
      navigate('/login');
      return;
    }
    console.log('✅ Validação 1 passou: Colaborador encontrado', colaborador);

    // Validação 2: Verifica se o e-mail está disponível
    if (!colaborador.email || colaborador.email.trim() === '') {
      console.error('❌ Validação falhou: E-mail não encontrado');
      toast.error("E-mail do colaborador não encontrado. Não é possível enviar o voucher.", {
        description: "Entre em contato com o RH para atualizar seu e-mail no cadastro.",
        duration: 5000
      });
      return;
    }
    console.log('✅ Validação 2 passou: E-mail encontrado', colaborador.email);

    // Validação 3: Verifica se há benefícios selecionados
    if (selectedBeneficios.length === 0) {
      console.error('❌ Validação falhou: Nenhum benefício selecionado');
      toast.error("Nenhum benefício selecionado. Por favor, selecione pelo menos um benefício.");
      return;
    }
    console.log('✅ Validação 3 passou: Benefícios selecionados', selectedBeneficios);
    console.log(`📊 Total de benefícios: ${selectedBeneficios.length} → Serão gerados ${selectedBeneficios.length} voucher(s) individual(is)`);

    console.log('⏳ Iniciando processamento...');
    setIsProcessing(true);

    // ===================================================================
    // Obter usuário autenticado (para created_by)
    // ===================================================================
    console.log('🔐 Obtendo usuário autenticado...');

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      console.error('❌ Erro ao obter sessão:', sessionError);
      toast.error("Sessão expirada. Por favor, faça login novamente.");
      setIsProcessing(false);
      navigate('/login');
      return;
    }

    const userId = session.user.id; // UUID para created_by
    console.log('✅ Usuário autenticado:', userId);

    // ===================================================================
    // VALIDAÇÃO: Verificar se funcionário existe e está ATIVO (não demitido)
    // Busca por MATRÍCULA e valida dt_rescisao IS NULL
    // ===================================================================
    console.log('🔍 Validando funcionário na tbfuncionario...');
    console.log('📋 Matrícula da sessão:', colaborador.matricula);

    let funcionarioId: number | null = null;

    // Verificar se tem matrícula na sessão
    if (!colaborador.matricula || colaborador.matricula.trim() === '') {
      console.error('❌ Matrícula não encontrada na sessão do colaborador');
      setIsProcessing(false);
      toast.error('Dados incompletos', {
        description: 'Sua matrícula não foi encontrada. Faça logout e login novamente ou contate o RH.',
        duration: 8000
      });
      return;
    }

    try {
      const { data: funcionarioData, error: funcionarioError } = await supabase
        .from('tbfuncionario')
        .select('funcionario_id, cpf, nome, email, matricula, dt_rescisao')
        .eq('matricula', colaborador.matricula.trim())
        .single();

      // Caso 1: Funcionário não encontrado pela matrícula
      if (funcionarioError) {
        console.error('❌ Funcionário não encontrado na tbfuncionario:', funcionarioError);
        console.error('📋 Matrícula buscada:', colaborador.matricula);
        setIsProcessing(false);
        toast.error('Matrícula não encontrada', {
          description: `A matrícula "${colaborador.matricula}" não foi encontrada no cadastro de funcionários. Contate o RH.`,
          duration: 10000
        });
        navigate('/portalbeneficio');
        return;
      }

      // Caso 2: Dados incompletos
      if (!funcionarioData || !funcionarioData.funcionario_id) {
        console.error('❌ Dados do funcionário incompletos');
        setIsProcessing(false);
        toast.error('Cadastro incompleto', {
          description: 'Seu cadastro está incompleto na tabela de funcionários. Contate o RH.',
          duration: 8000
        });
        navigate('/portalbeneficio');
        return;
      }

      // Caso 3: Funcionário DEMITIDO (dt_rescisao preenchida)
      if (funcionarioData.dt_rescisao !== null) {
        console.error('❌ Funcionário DEMITIDO - dt_rescisao:', funcionarioData.dt_rescisao);
        setIsProcessing(false);
        toast.error('Colaborador desligado', {
          description: 'Você não pode solicitar benefícios pois consta como desligado no sistema. Em caso de dúvida, contate o RH.',
          duration: 10000
        });
        navigate('/portalbeneficio');
        return;
      }

      // ✅ Funcionário encontrado e ATIVO
      funcionarioId = funcionarioData.funcionario_id;
      console.log('✅ Funcionário ATIVO encontrado!');
      console.log('   → funcionario_id:', funcionarioId);
      console.log('   → Nome:', funcionarioData.nome);
      console.log('   → CPF:', funcionarioData.cpf);
      console.log('   → dt_rescisao:', funcionarioData.dt_rescisao, '(null = ativo)');

    } catch (error) {
      console.error('❌ Erro ao validar funcionário:', error);
      setIsProcessing(false);
      toast.error('Erro ao validar funcionário', {
        description: 'Não foi possível verificar seu cadastro. Tente novamente ou contate o suporte.',
        duration: 5000
      });
      return;
    }

    // ===================================================================
    // INÍCIO DO PROCESSAMENTO DE VOUCHERS INDIVIDUAIS
    // ===================================================================

    try {
      // Array para armazenar os vouchers gerados durante o processamento
      const vouchersProcessados: Array<{
        voucherNumber: string;
        beneficio: Beneficio;
        qrCodeUrl: string;
      }> = [];

      // Contadores para estatísticas
      let vouchersComSucesso = 0;
      let vouchersComErroEmail = 0;
      let vouchersComErroGeral = 0;
      let vouchersComErroBanco = 0;

      const now = new Date();
      const dataValidade = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias de validade

      // Adicionar formatação para o banco (DATE)
      const dataEmissao = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const dataValidadeFormatted = dataValidade.toISOString().split('T')[0]; // YYYY-MM-DD

      // Converter urgencia string → boolean
      const isUrgent = formData.urgencia === 'sim';

      console.log('📅 Datas calculadas:', { dataEmissao, dataValidadeFormatted });
      console.log('⏰ Urgência:', formData.urgencia, '→', isUrgent);

      // ===================================================================
      // BUSCAR VALORES DOS BENEFÍCIOS
      // ===================================================================
      console.log('💰 Buscando valores dos benefícios selecionados...');

      const beneficioIds = selectedBeneficios.map(id => parseInt(id, 10));
      const { data: beneficiosData, error: beneficiosError } = await supabase
        .from('tbbeneficio')
        .select('beneficio_id, valor')
        .in('beneficio_id', beneficioIds);

      if (beneficiosError) {
        console.error('❌ Erro ao buscar valores dos benefícios:', beneficiosError);
        setIsProcessing(false);
        toast.error('Erro ao buscar dados dos benefícios', {
          description: 'Não foi possível carregar os valores. Tente novamente.',
          duration: 5000
        });
        return;
      }

      if (!beneficiosData || beneficiosData.length !== selectedBeneficios.length) {
        console.error('❌ Alguns benefícios não foram encontrados no banco');
        setIsProcessing(false);
        toast.error('Erro ao validar benefícios', {
          description: 'Alguns benefícios selecionados não estão disponíveis.',
          duration: 5000
        });
        return;
      }

      // Criar mapa para acesso rápido aos valores
      const beneficioValorMap = new Map(
        beneficiosData.map(b => [b.beneficio_id, b.valor || 0])
      );

      console.log('✅ Valores dos benefícios carregados:', Object.fromEntries(beneficioValorMap));

      // ===================================================================
      // LOOP: Processa CADA benefício individualmente
      // ===================================================================
      console.log('🔄 Iniciando loop de processamento individual de benefícios...');

      for (let index = 0; index < selectedBeneficios.length; index++) {
        const beneficioId = selectedBeneficios[index];
        const beneficio = beneficios.find(b => b.id === beneficioId);

        if (!beneficio) {
          console.warn(`⚠️ Benefício não encontrado: ${beneficioId}`);
          continue;
        }

        console.log(`\n📦 [${index + 1}/${selectedBeneficios.length}] Processando benefício: ${beneficio.title}`);

        try {
          // =================================================================
          // PASSO 1: INSERIR NO BANCO PRIMEIRO (trigger gera numero_voucher)
          // =================================================================
          console.log(`  💾 Inserindo voucher no banco de dados...`);

          // Validar beneficio_id antes de inserir
          const beneficioIdNumber = parseInt(beneficio.id, 10);
          if (isNaN(beneficioIdNumber)) {
            console.error(`  ❌ beneficio_id inválido:`, beneficio.id);
            vouchersComErroBanco++;
            continue; // Pula para próximo benefício
          }

          // Obter valor do benefício do mapa
          const valorBeneficio = beneficioValorMap.get(beneficioIdNumber) || 0;
          console.log(`  💰 Valor do benefício: R$ ${valorBeneficio}`);

          // Preparar objeto para inserção
          const voucherToInsert: VoucherDatabaseInsert = {
            // Datas
            data_emissao: dataEmissao,
            data_validade: dataValidadeFormatted,

            // Funcionário (snapshot + FK opcional)
            funcionario_id: funcionarioId,
            funcionario: colaborador.nome,
            email: colaborador.email,
            matricula: colaborador.matricula,

            // Benefício (1:1)
            beneficio_id: beneficioIdNumber,

            // Detalhes da solicitação
            justificativa: formData.justificativa || null,
            urgente: isUrgent,

            // Status e valor
            status: 'emitido',
            valor: valorBeneficio,

            // Auditoria
            created_nome: colaborador.nome,
            created_by: userId,
            deletado: 'N'
          };

          // ✅ INSERIR E RECUPERAR voucher_id + numero_voucher
          const { data: voucherInserido, error: insertError } = await supabase
            .from('tbvoucher')
            .insert([voucherToInsert])
            .select('voucher_id, numero_voucher')  // ✅ MUDANÇA CRÍTICA: recuperar numero_voucher
            .single();

          // ✅ VALIDAR RESPOSTA DO BANCO
          if (insertError || !voucherInserido) {
            console.error(`  ❌ Erro ao inserir voucher no banco:`, insertError);
            vouchersComErroBanco++;

            toast.warning('Erro ao salvar voucher no banco', {
              description: `Benefício "${beneficio.title}" não foi processado. Tente novamente.`,
              duration: 5000
            });

            continue; // Pula para próximo benefício
          }

          // ✅ RECUPERAR numero_voucher DO BANCO
          const voucherNumber = voucherInserido.numero_voucher;
          const voucherId = voucherInserido.voucher_id;

          // ✅ VALIDAR FORMATO do numero_voucher
          if (!voucherNumber || !voucherNumber.startsWith('VOU-') || voucherNumber.length !== 20) {
            console.error(`  ❌ Formato inválido de numero_voucher: "${voucherNumber}"`);
            console.error(`     Esperado: VOU-XXXXXXXXXXXXXXXX (20 chars)`);
            vouchersComErroBanco++;

            toast.error('Erro no formato do voucher', {
              description: 'O voucher gerado está em formato inválido. Contate o suporte.',
              duration: 8000
            });

            continue; // Pula para próximo benefício
          }

          console.log(`  ✅ Voucher inserido no banco:`);
          console.log(`     → UUID: ${voucherId}`);
          console.log(`     → Número: ${voucherNumber}`);
          console.log(`     → Formato validado: ${voucherNumber.length} caracteres`);

          // =================================================================
          // PASSO 2: GERAR QR CODE com numero_voucher do banco
          // =================================================================
          const qrCodeUrlIndividual = await generateQRCodeForVoucher(voucherNumber, beneficioId);
          console.log(`  📱 QR Code gerado`);

          // =================================================================
          // PASSO 3: PREPARAR BENEFÍCIO PARA PDF
          // =================================================================
          const beneficioFormatado = {
            id: beneficio.id,
            title: beneficio.title,
            description: beneficio.description,
            icon: beneficio.icon
          };

          // =================================================================
          // PASSO 4: GERAR PDF com numero_voucher do banco
          // =================================================================
          const pdfBase64 = await generateVoucherPDF({
            voucherNumber,  // ✅ Agora vem do banco
            beneficios: [beneficioFormatado], // Array com apenas 1 benefício
            formData,
            qrCodeUrl: qrCodeUrlIndividual,
            colaborador: {
              nome: colaborador.nome,
              matricula: colaborador.matricula,
              email: colaborador.email
            }
          });
          console.log(`  📄 PDF gerado`);

          // =================================================================
          // PASSO 5: ENVIAR EMAIL com numero_voucher do banco
          // =================================================================
          console.log(`  📧 Enviando e-mail...`);

          try {
            const response = await fetch('http://localhost:3001/api/send-voucher-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                destinatario: colaborador.email,
                nomeDestinatario: colaborador.nome,
                voucherNumber,  // ✅ Agora vem do banco
                beneficios: [beneficioFormatado], // Apenas 1 benefício no email
                pdfBase64,
                formData
              }),
            });

            if (!response.ok) {
              throw new Error(`Erro HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
              console.log(`  ✅ E-mail enviado`);
              vouchersComSucesso++;
            } else {
              throw new Error(result.message || 'Erro ao enviar e-mail');
            }

          } catch (emailError) {
            // Erro no envio de e-mail não impede a geração do voucher
            console.warn(`  ⚠️ Erro ao enviar e-mail:`, emailError);
            vouchersComErroEmail++;
            // ℹ️ Não impede o fluxo - voucher foi salvo no banco
          }

          // =================================================================
          // PASSO 6: ADICIONAR À LISTA DE VOUCHERS PROCESSADOS
          // =================================================================
          vouchersProcessados.push({
            voucherNumber,  // ✅ Agora vem do banco
            beneficio,
            qrCodeUrl: qrCodeUrlIndividual
          });

        } catch (beneficioError) {
          // Erro no processamento individual de um benefício
          console.error(`  ❌ Erro ao processar benefício ${beneficio.title}:`, beneficioError);
          vouchersComErroGeral++;
        }
      }

      // ===================================================================
      // FINALIZAÇÃO: Resumo e feedback para o usuário
      // ===================================================================
      console.log('\n📊 === RESUMO DO PROCESSAMENTO ===');
      console.log(`  ✅ Vouchers com sucesso total: ${vouchersComSucesso}`);
      console.log(`  ⚠️ Vouchers com erro de e-mail: ${vouchersComErroEmail}`);
      console.log(`  ❌ Vouchers com erro geral: ${vouchersComErroGeral}`);
      console.log(`  🗄️ Vouchers com erro de banco: ${vouchersComErroBanco}`);
      console.log(`  📦 Total de vouchers gerados: ${vouchersProcessados.length}`);

      // Atualiza o estado com os vouchers gerados
      setVouchersGerados(vouchersProcessados);

      // Define o primeiro voucher como o "principal" para exibição
      if (vouchersProcessados.length > 0) {
        setCurrentVoucherNumber(vouchersProcessados[0].voucherNumber);
        setQrCodeUrl(vouchersProcessados[0].qrCodeUrl);
      }

      // Exibe feedback apropriado ao usuário
      if (vouchersComSucesso > 0) {
        toast.success(`${vouchersProcessados.length} voucher(s) gerado(s) com sucesso! 🎉`, {
          description: vouchersComErroEmail > 0
            ? `${vouchersComSucesso} enviado(s) por e-mail. ${vouchersComErroEmail} não enviado(s).`
            : `Todos os e-mails foram enviados para: ${colaborador.email}`,
          duration: 5000
        });
      } else if (vouchersProcessados.length > 0) {
        toast.warning(`${vouchersProcessados.length} voucher(s) gerado(s), mas nenhum e-mail foi enviado.`, {
          description: "Os vouchers estão disponíveis para visualização.",
          duration: 5000
        });
      } else {
        toast.error("Nenhum voucher foi gerado. Por favor, tente novamente.", {
          duration: 5000
        });
      }

      // Mostra a tela de vouchers se pelo menos um foi gerado
      if (vouchersProcessados.length > 0) {
        setShowVoucher(true);
      }

    } catch (error) {
      // Tratamento de erros gerais não capturados
      console.error('❌ Erro GERAL ao processar solicitação:', error);
      toast.error("Erro ao processar solicitação", {
        description: "Ocorreu um erro ao gerar os vouchers. Por favor, tente novamente.",
        duration: 5000
      });
    } finally {
      console.log('🏁 Finalizando processamento...');
      setIsProcessing(false);
      console.log('✅ handleConfirmSolicitation concluído');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="text-white px-6 py-2" style={{
        backgroundColor: "#1E3A8A"
      }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/farmace-logo.png" alt="Farmace Logo" className="object-contain h-8" style={{
              width: "149.98px",
              height: "68.97px"
            }} />
          </div>

          <nav className="hidden md:flex items-center space-x-2 ml-12">
            {navigationButtons.map((button, index) => {
              const IconComponent = button.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className={`transition-colors px-3 py-2 text-sm ${
                    activeButton === button.name
                      ? "bg-white/30 text-white border-b-2 border-white/60"
                      : "text-white hover:bg-white/20 hover:text-white"
                  }`}
                  onClick={() => {
                    setActiveButton(button.name);
                    if (button.name === "Faturas") {
                      navigate("/beneficiofaturas");
                    } else if (button.name === "Início") {
                      navigate("/");
                    }
                  }}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {button.name}
                </Button>
              );
            })}
          </nav>

          {/* Seção de Perfil do Usuário */}
          {colaborador && (
            <div className="hidden md:flex items-center space-x-3 ml-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-3 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 border-2 border-white/30">
                      <AvatarFallback className="bg-primary-700 text-white font-semibold text-sm">
                        {getInitials(colaborador.nome)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Nome e Badge */}
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-white leading-tight">
                        {formatDisplayName(colaborador.nome)}
                      </span>
                      <Badge variant="secondary" className="mt-0.5 text-xs bg-white/20 text-white border-white/30 hover:bg-white/30">
                        Colaborador
                      </Badge>
                    </div>

                    {/* Ícone de dropdown */}
                    <ChevronDown className="h-4 w-4 text-white/70" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{colaborador.nome}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {colaborador.email || 'Sem email cadastrado'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        Matrícula: {colaborador.matricula}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/configuracao')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/configuracao')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </header>

      {showVoucher ? (
        /* ===================================================================
         * TELA DE VOUCHERS GERADOS
         * ===================================================================
         * Esta tela exibe TODOS os vouchers individuais gerados.
         * Cada benefício selecionado resultou em um voucher separado,
         * então exibimos cada um em um card individual.
         * =================================================================== */
        <div className="max-w-4xl mx-auto p-4 print:p-2">
          <div className="mb-4 print:hidden">
            <Button
              variant="ghost"
              onClick={() => setShowVoucher(false)}
              className="flex items-center text-gray-600 hover:text-gray-800 p-0 h-auto font-normal"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>

          {/* Header com resumo dos vouchers gerados */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg px-6 py-4 text-white mb-6 print:px-4 print:py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center print:w-8 print:h-8">
                  <Plus className="w-5 h-5 text-white print:w-4 print:h-4" />
                </div>
                <div>
                  <h1 className="text-xl font-bold print:text-lg">
                    {/* Exibe título singular ou plural conforme quantidade de vouchers */}
                    {vouchersGerados.length === 1
                      ? "Voucher Gerado"
                      : `${vouchersGerados.length} Vouchers Gerados`}
                  </h1>
                  <p className="text-blue-100 text-sm">Farmace Benefícios</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-xs">Data de geração</p>
                <p className="text-sm font-semibold">{new Date().toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </div>

          {/* Mensagem de sucesso */}
          <div className="text-center mb-6 print:mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2 print:text-lg print:mb-1">
              Parabéns! {vouchersGerados.length === 1 ? "Seu voucher foi aprovado!" : "Seus vouchers foram aprovados!"}
            </h2>
            <p className="text-gray-600 text-sm">
              {/* Informação sobre vouchers individuais */}
              {vouchersGerados.length > 1
                ? `Foram gerados ${vouchersGerados.length} vouchers individuais - um para cada benefício selecionado.`
                : "Utilize as informações abaixo para resgatar seu benefício."}
            </p>
          </div>

          {/* ===================================================================
           * LISTA DE VOUCHERS INDIVIDUAIS
           * Cada voucher é exibido em um card separado com seu próprio
           * número, QR Code e informações do benefício associado.
           * =================================================================== */}
          <div className="space-y-4">
            {vouchersGerados.map((voucher, index) => {
              const IconComponent = voucher.beneficio.icon;
              return (
                <div
                  key={voucher.voucherNumber}
                  className="bg-white rounded-lg shadow-lg overflow-hidden print:shadow-none print:rounded-none print:break-inside-avoid"
                >
                  {/* Indicador de número do voucher na sequência */}
                  {vouchersGerados.length > 1 && (
                    <div className="bg-blue-600 px-4 py-1 text-white text-sm print:hidden">
                      Voucher {index + 1} de {vouchersGerados.length}
                    </div>
                  )}

                  {/* Card do Voucher Individual */}
                  <div className="p-6 print:p-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200 print:p-3">
                      <div className="flex items-start justify-between gap-4">
                        {/* Lado esquerdo - Informações do voucher */}
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 mb-1">Número do Voucher</p>
                          <p className="text-xl font-bold text-blue-600 mb-3 print:text-lg">{voucher.voucherNumber}</p>

                          {/* Informações do benefício associado */}
                          <div className="flex items-center space-x-3 mb-3 print:space-x-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center print:w-8 print:h-8">
                              <IconComponent className="w-5 h-5 text-white print:w-4 print:h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{voucher.beneficio.title}</p>
                              <p className="text-sm text-gray-600 print:hidden">{voucher.beneficio.description}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Status:</span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium ml-2">
                                Aprovado
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Validade:</span>
                              <span className="font-semibold text-gray-900 ml-2">
                                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Lado direito - QR Code individual */}
                        <div className="flex flex-col items-center">
                          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 print:p-1">
                            {voucher.qrCodeUrl ? (
                              <img
                                src={voucher.qrCodeUrl}
                                alt={`QR Code do Voucher ${voucher.voucherNumber}`}
                                className="w-24 h-24 print:w-20 print:h-20"
                              />
                            ) : (
                              <div className="w-24 h-24 bg-gray-100 flex items-center justify-center rounded-lg print:w-20 print:h-20">
                                <QrCode className="w-12 h-12 text-gray-400 print:w-10 print:h-10" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-center">
                            Escaneie para validar
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detalhes da Solicitação (exibido uma única vez para todos os vouchers) */}
          {(formData.justificativa || formData.urgencia) && (
            <div className="bg-white rounded-lg shadow-lg p-6 mt-4 print:shadow-none print:p-4">
              <h4 className="font-semibold text-gray-900 mb-3 print:text-sm print:mb-2">Detalhes da Solicitação</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {formData.urgencia && (
                  <div>
                    <p className="text-gray-600 mb-1">Urgência:</p>
                    <p className="text-gray-900 font-medium">
                      {formData.urgencia === 'sim' ? 'Sim' : formData.urgencia === 'nao' ? 'Não' : 'Não informado'}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600 mb-1">Data:</p>
                  <p className="text-gray-900 font-medium">{new Date().toLocaleDateString("pt-BR")}</p>
                </div>
                {formData.justificativa && (
                  <div className="col-span-2 print:hidden">
                    <p className="text-gray-600 mb-1">Justificativa:</p>
                    <p className="text-gray-900 text-xs">{formData.justificativa}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 print:hidden">
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4 mr-2" />
              Imprimir {vouchersGerados.length === 1 ? "Voucher" : "Vouchers"}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/portalbeneficio")}
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Portal
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowVoucher(false);
                setCurrentStep(1);
                setSelectedBeneficios([]);
                setVouchersGerados([]); // Limpa os vouchers gerados
                setFormData({
                  justificativa: "",
                  urgencia: ""
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Solicitação
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto p-6">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/portalbeneficio')}
                className="flex items-center text-gray-600 hover:text-gray-800 p-0 h-auto font-normal"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Solicitar Voucher
            </h1>
            <p className="text-gray-600 mb-8">
              Siga os passos abaixo para solicitar um novo voucher
            </p>
          </div>

          {/* Steps Header */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mb-2 ${
                      step.active ? 'bg-blue-600' : currentStep > step.number ? 'bg-gray-400' : 'bg-gray-300'
                    }`}
                  >
                    {step.number}
                  </div>
                  <div className="text-center">
                    <p className={`font-semibold text-sm ${step.active ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-gray-400 text-xs">{step.subtitle}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-16 h-px bg-gray-300 ml-8 mr-8 mt-[-40px]"></div>
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Escolher Programa */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Escolha o Programa</h2>

              {/* Estado de Loading */}
              {isLoadingBeneficios ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-600">Carregando benefícios disponíveis...</p>
                </div>
              ) : beneficios.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-center">
                    Nenhum benefício disponível no momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {beneficios.map((beneficio) => (
                    <Card
                      key={beneficio.id}
                      className={`border transition-all cursor-pointer ${
                        selectedBeneficios.includes(beneficio.id)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleBeneficioToggle(beneficio.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              selectedBeneficios.includes(beneficio.id) ? 'bg-blue-600' : 'bg-gray-100'
                            }`}>
                              <beneficio.icon className={`w-6 h-6 ${
                                selectedBeneficios.includes(beneficio.id) ? 'text-white' : 'text-gray-600'
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-1">{beneficio.title}</h3>
                              <p className="text-sm text-blue-600">{beneficio.description}</p>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                            selectedBeneficios.includes(beneficio.id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedBeneficios.includes(beneficio.id) && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/portalbeneficio')}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>

                <Button
                  onClick={handleNextStep}
                  disabled={selectedBeneficios.length === 0 || isLoadingBeneficios}
                  className="flex items-center text-white"
                  style={{ backgroundColor: "#1E3A8A" }}
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Detalhes da Solicitação */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Detalhes da Solicitação</h2>
              
              <div className="space-y-6">
                {/* Justificativa */}
                <div className="space-y-2">
                  <Label htmlFor="justificativa" className="text-sm font-medium text-gray-900">
                    Justificativa para Solicitação Mensal Excedente
                  </Label>
                  <Textarea
                    id="justificativa"
                    placeholder="Explique o motivo da solicitação..."
                    value={formData.justificativa}
                    onChange={(e) => setFormData({...formData, justificativa: e.target.value})}
                    className="min-h-[120px] resize-none bg-gray-50 border-gray-200"
                  />
                </div>

                {/* Urgência */}
                <div className="space-y-2">
                  <Label htmlFor="urgencia" className="text-sm font-medium text-gray-900">
                    Urgência
                  </Label>
                  <Select value={formData.urgencia} onValueChange={(value) => setFormData({...formData, urgencia: value})}>
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Normal" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                      <SelectItem value="nao">Não</SelectItem>
                      <SelectItem value="sim">Sim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
              
              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8">
                <Button 
                  variant="ghost" 
                  onClick={handlePrevStep}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                
                <Button 
                  onClick={handleNextStep}
                  className="flex items-center text-white"
                  style={{ backgroundColor: "#1E3A8A" }}
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Revisar e Confirmar */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Header Card - Fatura Style */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Resumo da Solicitação</h2>
                    <p className="text-blue-100">Olá! Sua solicitação está quase pronta!</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm">Data da solicitação</p>
                    <p className="font-semibold">{new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>

              {/* Main Summary Card */}
              <div className="bg-white rounded-lg border-2 border-blue-200 p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Benefícios Solicitados</h3>
                    <div className="space-y-3">
                      {selectedBeneficios.map(beneficioId => {
                        const beneficio = beneficios.find(b => b.id === beneficioId);
                        if (!beneficio) return null;
                        const IconComponent = beneficio.icon;
                        return (
                          <div key={beneficioId} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{beneficio.title}</p>
                              <p className="text-sm text-blue-600">{beneficio.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Total de benefícios</p>
                      <p className="text-3xl font-bold text-gray-900">{selectedBeneficios.length}</p>
                      <p className="text-sm text-gray-500">itens selecionados</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                        <p className="text-sm font-medium text-gray-900">Status da solicitação</p>
                      </div>
                      <p className="text-sm text-gray-600">Aguardando confirmação</p>
                    </div>
                  </div>
                </div>

                {/* Form Data Summary */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Detalhes da Solicitação</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Justificativa:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {formData.justificativa || "Não informado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Urgência:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {formData.urgencia === 'sim' ? 'Sim' : formData.urgencia === 'nao' ? 'Não' : 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    onClick={handlePrevStep}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar e Editar
                  </Button>
                  
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/portalbeneficio')}
                      className="flex items-center"
                    >
                      Cancelar
                    </Button>
                    
                    <Button
                      className="flex items-center text-white px-8"
                      style={{ backgroundColor: "#1E3A8A" }}
                      onClick={handleConfirmSolicitation}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Processando...
                        </>
                      ) : (
                        <>
                          Confirmar Solicitação
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SolicitarBeneficio;
