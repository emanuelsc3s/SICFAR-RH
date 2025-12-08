import { Gift, DollarSign, Clock, Fuel, Cross, Home, Plus, Users, QrCode, Download, Eye, Heart, Bus, Flame, Pill, LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Interfaces TypeScript para vouchers
interface BeneficioData {
  beneficio: string;
  descricao: string;
  icone: string;
}

interface VoucherComBeneficio {
  voucher_id: string;
  numero_voucher: string;
  data_emissao: string;
  data_validade: string;
  data_resgate: string | null;
  hora_resgate: string | null;
  valor: number;
  status: 'pendente' | 'emitido' | 'aprovado' | 'resgatado' | 'expirado' | 'cancelado';
  beneficio_id: number;
  // JOIN pode retornar array ou objeto (padrão Supabase)
  tbbeneficio: BeneficioData | BeneficioData[] | null;
}

// Atualizado para forçar rebuild
const PortalBeneficio = () => {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState("Início");

  // Estados para vouchers dinâmicos
  const { user, isLoading: isAuthLoading } = useAuth();
  const [vouchers, setVouchers] = useState<VoucherComBeneficio[]>([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(true);

  const navigationButtons = [
    { name: "Início", icon: Home },
    { name: "Solicitar Voucher", icon: Plus },
    { name: "Dashboard RH", icon: Users },
    { name: "Scanner Parceiro", icon: QrCode },
    { name: "Resgates", icon: Download },
    { name: "Faturas", icon: DollarSign },
    { name: "Auditoria", icon: Eye }
  ];

  const statsData = [{
    title: "Vouchers Ativos",
    value: "1",
    description: "Disponíveis para uso",
    icon: Gift,
    color: "bg-blue-500",
    borderColor: "border-blue-500",
    customBorderColor: "#1E3A8A"
  }, {
    title: "Valor Total",
    value: "R$ 500,00",
    description: "Em vouchers ativos",
    icon: DollarSign,
    color: "bg-green-500",
    borderColor: "border-green-500"
  }, {
    title: "Solicitações Pendentes",
    value: "0",
    description: "Aguardando aprovação",
    icon: Clock,
    color: "bg-yellow-500",
    borderColor: "border-yellow-500"
  }];
  const programasDisponiveis = [{
    title: "Vale Gás",
    description: "Auxílio para gás de cozinha",
    value: "R$ 125,00",
    icon: Fuel
  }, {
    title: "Vale Farmácia Santa Cecília",
    description: "Medicamentos e produtos farmacêuticos",
    value: "Máx R$ 300,00",
    icon: Cross
  }, {
    title: "Vale Farmácia Gentil",
    description: "Medicamentos e produtos farmacêuticos",
    value: "Máx R$ 300,00",
    icon: Cross
  }, {
    title: "Vale Combustível",
    description: "Auxílio para combustível",
    value: "Consultar valor",
    icon: Fuel
  }, {
    title: "Plano de Saúde",
    description: "Assistência médica e hospitalar",
    value: "R$ 79,00",
    icon: Heart
  }, {
    title: "Vale Transporte",
    description: "Auxílio para deslocamento urbano",
    value: "R$ 35,00",
    icon: Bus
  }];

  // useEffect para carregar vouchers do Supabase
  useEffect(() => {
    const carregarVouchers = async () => {
      // Validação: usuário autenticado
      if (!user?.funcionarioId) {
        console.log('ℹ️ Usuário sem funcionario_id, aguardando autenticação...');
        setIsLoadingVouchers(false);
        return;
      }

      try {
        setIsLoadingVouchers(true);

        const { data, error } = await supabase
          .from('tbvoucher')
          .select(`
            voucher_id,
            numero_voucher,
            data_emissao,
            data_validade,
            data_resgate,
            hora_resgate,
            valor,
            status,
            beneficio_id,
            tbbeneficio:beneficio_id (
              beneficio,
              descricao,
              icone
            )
          `)
          .eq('funcionario_id', user.funcionarioId)
          .eq('deletado', 'N')
          .order('data_emissao', { ascending: false });

        if (error) {
          console.error('❌ Erro ao carregar vouchers:', error);
          toast.error('Erro ao carregar vouchers', {
            description: 'Não foi possível carregar seus vouchers.',
            duration: 5000
          });
          setVouchers([]);
          return;
        }

        if (!data || data.length === 0) {
          console.log('ℹ️ Nenhum voucher encontrado para o funcionário');
          setVouchers([]);
          return;
        }

        console.log(`✅ ${data.length} voucher(s) carregado(s)`);
        setVouchers(data);

      } catch (error) {
        console.error('❌ Erro inesperado ao carregar vouchers:', error);
        toast.error('Erro inesperado', {
          description: 'Ocorreu um erro ao carregar os vouchers.',
          duration: 5000
        });
        setVouchers([]);
      } finally {
        setIsLoadingVouchers(false);
      }
    };

    if (!isAuthLoading) {
      carregarVouchers();
    }
  }, [user?.funcionarioId, isAuthLoading]);

  // Funções auxiliares de formatação
  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatarData = (dataISO: string): string => {
    // Split manual evita problema de timezone ao interpretar DATE do PostgreSQL
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const formatarHora = (horaString: string | null): string => {
    if (!horaString) return '--:--';
    // horaString vem no formato HH:MM:SS ou HH:MM:SS.ffffff
    const [horas, minutos] = horaString.split(':');
    return `${horas}:${minutos}`;
  };

  const obterLabelStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pendente': 'Pendente',
      'emitido': 'Emitido',
      'aprovado': 'Aprovado',
      'resgatado': 'Resgatado',
      'expirado': 'Expirado',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const obterCorStatus = (status: string): { bg: string; text: string } => {
    const coresMap: Record<string, { bg: string; text: string }> = {
      'pendente': { bg: '#FFA50020', text: '#FF8C00' },    // Laranja
      'emitido': { bg: '#1E3A8A20', text: '#1E3A8A' },     // Azul (padrão atual)
      'aprovado': { bg: '#10B98120', text: '#059669' },    // Verde
      'resgatado': { bg: '#6B728020', text: '#4B5563' },   // Cinza
      'expirado': { bg: '#EF444420', text: '#DC2626' },    // Vermelho
      'cancelado': { bg: '#6B728020', text: '#6B7280' }    // Cinza escuro
    };
    return coresMap[status] || { bg: '#1E3A8A20', text: '#1E3A8A' };
  };

  // Mapa de ícones dinâmicos baseado no benefício
  const obterIconeBeneficio = (iconeName: string | undefined | null): LucideIcon => {
    if (!iconeName) {
      console.warn('⚠️ Ícone não definido, usando Gift como padrão');
      return Gift;
    }

    const iconMap: Record<string, LucideIcon> = {
      'flame': Flame,      // Vale Gás
      'pill': Pill,        // Farmácias
      'fuel': Fuel,        // Vale Combustível
      'heart': Heart,      // Plano de Saúde
      'bus': Bus,          // Vale Transporte
      'gift': Gift         // Padrão
    };

    // Normalizar para lowercase e trim
    const normalizedIconName = iconeName.toLowerCase().trim();

    const icon = iconMap[normalizedIconName];

    if (!icon) {
      console.warn(`⚠️ Ícone "${iconeName}" não encontrado no mapa, usando Gift como padrão`);
      return Gift;
    }

    return icon;
  };

  return <div className="min-h-screen bg-background">
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
            {navigationButtons.map((button, index) => (
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
                    navigate('/beneficiofaturas');
                  }
                }}
              >
                {button.icon && <button.icon className="w-4 h-4 mr-2" />}
                {button.name}
              </Button>
            ))}
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo ao Portal de Benefícios
          </h1>
          <p className="text-gray-600 mb-6">
            Gerencie seus vouchers de benefícios de forma simples e rápida
          </p>
          <Button 
            style={{
              backgroundColor: "#1E3A8A"
            }} 
            className="text-white hover:opacity-90"
            onClick={() => navigate('/solicitarbeneficio')}
          >
            <Gift className="w-4 h-4 mr-2" />
            Solicitar Novo Voucher
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsData.map((stat, index) => <Card key={index} className="border-b-4" style={{
          borderBottomColor: stat.customBorderColor || ""
        }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.description}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center`} style={stat.title === "Vouchers Ativos" ? {
                backgroundColor: "#1E3A8A"
              } : {}}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Programas Disponíveis */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Programas Disponíveis</h2>
            <div className="space-y-4">
              {programasDisponiveis.map((programa, index) => <Card key={index} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <programa.icon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{programa.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{programa.description}</p>
                          <p className="font-bold text-gray-900">{programa.value}</p>
                        </div>
                      </div>
                      <Button style={{
                    backgroundColor: "#1E3A8A"
                  }} className="text-white hover:opacity-90">
                        Solicitar
                      </Button>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>

          {/* Meus Vouchers */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Meus Vouchers</h2>
              <Button variant="ghost" style={{
              color: "#1E3A8A"
            }} className="hover:opacity-80">
                Ver Todos
              </Button>
            </div>
            <div className="space-y-4">
              {/* Loading State */}
              {isLoadingVouchers ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Carregando vouchers...</p>
                </div>
              ) : vouchers.length === 0 ? (
                /* Empty State */
                <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
                  <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Nenhum voucher disponível</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Seus vouchers aparecerão aqui assim que forem emitidos
                  </p>
                </div>
              ) : (
                /* Cards Dinâmicos */
                vouchers.map((voucher) => {
                  // Tratar JOIN que pode retornar array ou objeto (padrão Supabase)
                  const beneficioData = voucher.tbbeneficio;
                  const beneficio = Array.isArray(beneficioData)
                    ? beneficioData[0]
                    : beneficioData;

                  const cores = obterCorStatus(voucher.status);
                  const nomeBeneficio = beneficio?.beneficio || 'Benefício';

                  // Debug: verificar valor do ícone
                  if (beneficio?.icone) {
                    console.log(`🔍 Ícone do benefício "${nomeBeneficio}":`, beneficio.icone);
                  }

                  const IconeBeneficio = obterIconeBeneficio(beneficio?.icone);

                  return (
                    <Card key={voucher.voucher_id} className="border-l-4 hover:shadow-md transition-shadow duration-200" style={{ borderLeftColor: cores.text }}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {/* Cabeçalho: Ícone + Título + Badge */}
                            <div className="flex items-center gap-3 mb-3">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                  backgroundColor: cores.bg,
                                  color: cores.text
                                }}
                              >
                                <IconeBeneficio className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-gray-900 text-base">
                                    {nomeBeneficio}
                                  </h3>
                                  <Badge
                                    style={{
                                      backgroundColor: cores.bg,
                                      color: cores.text
                                    }}
                                  >
                                    {obterLabelStatus(voucher.status)}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Número do Voucher */}
                            <div className="mb-2">
                              <p className="text-xs text-gray-500 mb-1">Número do Voucher</p>
                              <p className="font-mono font-bold text-gray-900 text-sm tracking-wide">
                                {voucher.numero_voucher}
                              </p>
                            </div>

                            {/* Rodapé: Emissão, Valor, Validade e Resgate */}
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                              <div>
                                <p className="text-xs text-gray-500">Emitido em</p>
                                <p className="text-sm font-medium text-gray-700">
                                  {formatarData(voucher.data_emissao)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Valor</p>
                                <p className="text-sm font-bold text-gray-900">
                                  {formatarMoeda(voucher.valor)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Válido até</p>
                                <p className="text-sm font-medium text-gray-700">
                                  {formatarData(voucher.data_validade)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Resgate</p>
                                <p className="text-sm font-medium text-gray-700">
                                  {voucher.data_resgate
                                    ? `${formatarData(voucher.data_resgate)} ${formatarHora(voucher.hora_resgate)}`
                                    : 'Não resgatado'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default PortalBeneficio;