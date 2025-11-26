import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Send, User, AlertCircle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import BirthdayCard from "@/components/BirthdayCard";
import AnnouncementsCard from "@/components/AnnouncementsCard";
import SystemStatus from "@/components/SystemStatus";
import NewsCard from "@/components/NewsCard";
import { toast } from "sonner";
import {
  carregarSaldoFerias,
  carregarHistoricoFerias,
  adicionarSolicitacaoFerias,
  atualizarSaldoAposSolicitacao,
  verificarFeriasPendentes,
  obterUltimasFerias
} from "@/utils/feriasStorage";
import { SaldoFerias, HistoricoFerias, formatarDataBR, calcularDiasAteData } from "@/types/ferias";

const SolicitarFerias = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    colaborador: "",
    dataInicio: "",
    dataFim: "",
    observacoes: "",
  });

  // Estados para saldo e histórico de férias
  const [saldoFerias, setSaldoFerias] = useState<SaldoFerias | null>(null);
  const [historicoFerias, setHistoricoFerias] = useState<HistoricoFerias[]>([]);
  const [feriasPendentes, setFeriasPendentes] = useState(false);

  // Carregar dados ao montar o componente
  useEffect(() => {
    carregarDadosFerias();

    // Listener para sincronizar mudanças do localStorage
    const handleSaldoAtualizado = () => {
      carregarDadosFerias();
    };

    window.addEventListener('saldoFeriasAtualizado', handleSaldoAtualizado);
    window.addEventListener('historicoFeriasAtualizado', handleSaldoAtualizado);

    return () => {
      window.removeEventListener('saldoFeriasAtualizado', handleSaldoAtualizado);
      window.removeEventListener('historicoFeriasAtualizado', handleSaldoAtualizado);
    };
  }, []);

  const carregarDadosFerias = () => {
    const saldo = carregarSaldoFerias();
    const historico = obterUltimasFerias(5);
    const pendentes = verificarFeriasPendentes();

    setSaldoFerias(saldo);
    setHistoricoFerias(historico);
    setFeriasPendentes(pendentes);
  };

  const calcularDiasFerias = () => {
    if (!formData.dataInicio || !formData.dataFim) return 0;
    
    const inicio = new Date(formData.dataInicio);
    const fim = new Date(formData.dataFim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.colaborador) {
      toast.error("Por favor, informe o nome do colaborador.");
      return;
    }

    if (!formData.dataInicio) {
      toast.error("Por favor, selecione a data de início das férias.");
      return;
    }

    if (!formData.dataFim) {
      toast.error("Por favor, selecione a data de término das férias.");
      return;
    }

    // Validar se data fim é posterior à data início
    const inicio = new Date(formData.dataInicio);
    const fim = new Date(formData.dataFim);

    if (fim < inicio) {
      toast.error("A data de término deve ser posterior à data de início.");
      return;
    }

    const diasFerias = calcularDiasFerias();

    if (diasFerias > 30) {
      toast.error("O período de férias não pode exceder 30 dias.");
      return;
    }

    // Validar se há saldo suficiente
    if (saldoFerias && diasFerias > saldoFerias.totalSaldoRestante) {
      toast.error(`Saldo insuficiente! Você possui apenas ${saldoFerias.totalSaldoRestante} dias disponíveis.`);
      return;
    }

    // Alertar se há férias pendentes
    if (feriasPendentes) {
      toast.warning("Você já possui uma solicitação de férias pendente de aprovação.");
    }

    // Adicionar ao histórico
    adicionarSolicitacaoFerias({
      colaborador: formData.colaborador,
      dataInicio: formData.dataInicio,
      dataFim: formData.dataFim,
      diasUtilizados: diasFerias,
      status: 'Pendente',
      dataSolicitacao: new Date().toISOString().split('T')[0],
      observacoes: formData.observacoes
    });

    // Atualizar saldo (marca como utilizado, mas ainda pendente)
    atualizarSaldoAposSolicitacao(diasFerias);

    toast.success(`Solicitação de férias enviada com sucesso! (${diasFerias} dias)`);

    // Limpar formulário
    setFormData({
      colaborador: "",
      dataInicio: "",
      dataFim: "",
      observacoes: "",
    });

    // Recarregar dados
    carregarDadosFerias();

    // Redirecionar após 2 segundos
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8">
        {/* Breadcrumb / Voltar */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center text-muted-foreground hover:text-foreground p-0 h-auto font-normal"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o início
          </Button>
        </div>

        {/* Título da página */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Solicitar Férias
              </h1>
              <p className="text-muted-foreground">
                Preencha o formulário abaixo para solicitar seu período de férias
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content - Formulário */}
          <div className="lg:col-span-3 space-y-6">
            {/* Alertas */}
            {feriasPendentes && (
              <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  Você possui uma solicitação de férias pendente de aprovação.
                </AlertDescription>
              </Alert>
            )}

            {saldoFerias && saldoFerias.proximoVencimento && calcularDiasAteData(saldoFerias.proximoVencimento.dataLimite) <= 60 && (
              <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                <Clock className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  Atenção! Você tem {saldoFerias.proximoVencimento.diasAVencer} dias de férias que vencem em {formatarDataBR(saldoFerias.proximoVencimento.dataLimite)}
                  ({calcularDiasAteData(saldoFerias.proximoVencimento.dataLimite)} dias restantes).
                </AlertDescription>
              </Alert>
            )}

            {/* Card de Saldo de Férias */}
            {saldoFerias && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Saldo de Férias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Total Disponível */}
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Total Disponível</span>
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-3xl font-bold text-blue-600">{saldoFerias.totalDiasDisponiveis}</p>
                      <p className="text-xs text-muted-foreground mt-1">dias no período</p>
                    </div>

                    {/* Dias Utilizados */}
                    <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Dias Utilizados</span>
                        <CheckCircle2 className="h-4 w-4 text-orange-600" />
                      </div>
                      <p className="text-3xl font-bold text-orange-600">{saldoFerias.totalDiasUtilizados}</p>
                      <p className="text-xs text-muted-foreground mt-1">dias já usados</p>
                    </div>

                    {/* Saldo Restante */}
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Saldo Restante</span>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-3xl font-bold text-green-600">{saldoFerias.totalSaldoRestante}</p>
                      <p className="text-xs text-muted-foreground mt-1">dias disponíveis</p>
                    </div>
                  </div>

                  {/* Períodos Aquisitivos */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Períodos Aquisitivos
                    </h4>
                    {saldoFerias.periodosAquisitivos.map((periodo) => (
                      <div key={periodo.id} className="p-3 rounded-lg border border-border/50 bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={periodo.saldoRestante > 0 ? "default" : "secondary"}>
                              {formatarDataBR(periodo.dataInicio)} a {formatarDataBR(periodo.dataFim)}
                            </Badge>
                          </div>
                          <span className="text-sm font-medium">
                            {periodo.saldoRestante}/{periodo.diasDisponiveis} dias
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${periodo.saldoRestante > 0 ? 'bg-green-500' : 'bg-gray-400'}`}
                            style={{ width: `${(periodo.saldoRestante / periodo.diasDisponiveis) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Período concessivo: {formatarDataBR(periodo.periodoConcessivoInicio)} a {formatarDataBR(periodo.periodoConcessivoFim)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Card de Histórico de Férias */}
            {historicoFerias.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Histórico de Férias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {historicoFerias.map((ferias) => (
                      <div key={ferias.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={
                                  ferias.status === 'Aprovada' ? 'default' :
                                  ferias.status === 'Pendente' ? 'secondary' :
                                  'destructive'
                                }
                                className={
                                  ferias.status === 'Aprovada' ? 'bg-green-500' :
                                  ferias.status === 'Pendente' ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }
                              >
                                {ferias.status}
                              </Badge>
                              <span className="text-sm font-medium">
                                {ferias.diasUtilizados} dias
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Período: {formatarDataBR(ferias.dataInicio)} a {formatarDataBR(ferias.dataFim)}
                            </p>
                            {ferias.observacoes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {ferias.observacoes}
                              </p>
                            )}
                            {ferias.justificativaRejeicao && (
                              <p className="text-xs text-red-600 mt-1">
                                Motivo da rejeição: {ferias.justificativaRejeicao}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              Solicitado em
                            </p>
                            <p className="text-sm font-medium">
                              {formatarDataBR(ferias.dataSolicitacao)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Formulário */}
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Dados da Solicitação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Busca de Colaborador */}
              <div className="space-y-2">
                <Label htmlFor="colaborador" className="text-sm font-medium">
                  Colaborador *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="colaborador"
                    type="text"
                    placeholder="Digite o nome do colaborador"
                    value={formData.colaborador}
                    onChange={(e) =>
                      setFormData({ ...formData, colaborador: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Por enquanto, digite manualmente. Em breve será carregado automaticamente.
                </p>
              </div>

              {/* Data de Início */}
              <div className="space-y-2">
                <Label htmlFor="dataInicio" className="text-sm font-medium">
                  Data de Início *
                </Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) =>
                    setFormData({ ...formData, dataInicio: e.target.value })
                  }
                />
              </div>

              {/* Data de Término */}
              <div className="space-y-2">
                <Label htmlFor="dataFim" className="text-sm font-medium">
                  Data de Término *
                </Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) =>
                    setFormData({ ...formData, dataFim: e.target.value })
                  }
                />
                {formData.dataInicio && formData.dataFim && (
                  <p className="text-sm text-primary font-medium">
                    Total de dias: {calcularDiasFerias()} dias
                  </p>
                )}
              </div>

              {/* Campo de Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-sm font-medium">
                  Observações
                </Label>
                <Textarea
                  id="observacoes"
                  placeholder="Adicione observações ou informações adicionais sobre suas férias..."
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  className="min-h-[120px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.observacoes.length}/500 caracteres
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Solicitação
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

            {/* Card Informativo */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Informações Importantes
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>A solicitação será enviada para aprovação do seu gestor imediato</li>
                  <li>Você receberá uma notificação quando a solicitação for analisada</li>
                  <li>O período máximo de férias é de 30 dias corridos</li>
                  <li>Certifique-se de planejar suas férias com antecedência</li>
                  <li>Em caso de dúvidas, entre em contato com o RH</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <BirthdayCard />
            <AnnouncementsCard />
            <SystemStatus />
            <NewsCard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SolicitarFerias;

