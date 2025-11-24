import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  FileCheck, 
  Plus, 
  Download, 
  Eye, 
  Calendar,
  Clock,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Header from "@/components/Header";
import BirthdayCard from "@/components/BirthdayCard";
import AnnouncementsCard from "@/components/AnnouncementsCard";
import SystemStatus from "@/components/SystemStatus";
import NewsCard from "@/components/NewsCard";
import { AtestadoMedico } from "@/types/atestado";
import { getAtestados, formatarTamanhoArquivo, calcularDiasAfastamento } from "@/utils/atestadoStorage";

const MeusAtestados = () => {
  const navigate = useNavigate();
  const [atestados, setAtestados] = useState<AtestadoMedico[]>([]);
  const [atestadosFiltrados, setAtestadosFiltrados] = useState<AtestadoMedico[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [atestadoSelecionado, setAtestadoSelecionado] = useState<AtestadoMedico | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);

  // Carregar atestados ao montar o componente
  useEffect(() => {
    carregarAtestados();
  }, []);

  // Aplicar filtros quando atestados, filtroStatus ou busca mudarem
  useEffect(() => {
    aplicarFiltros();
  }, [atestados, filtroStatus, busca]);

  const carregarAtestados = () => {
    const atestadosCarregados = getAtestados();
    // Ordenar por data de envio (mais recentes primeiro)
    atestadosCarregados.sort((a, b) => 
      new Date(b.dataEnvio).getTime() - new Date(a.dataEnvio).getTime()
    );
    setAtestados(atestadosCarregados);
  };

  const aplicarFiltros = () => {
    let resultado = [...atestados];

    // Filtrar por status
    if (filtroStatus !== "todos") {
      resultado = resultado.filter(a => a.status === filtroStatus);
    }

    // Filtrar por busca
    if (busca.trim()) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(a => 
        a.id.toLowerCase().includes(buscaLower) ||
        a.motivo.toLowerCase().includes(buscaLower) ||
        formatarData(a.dataInicio).includes(buscaLower) ||
        formatarData(a.dataFim).includes(buscaLower)
      );
    }

    setAtestadosFiltrados(resultado);
  };

  const formatarData = (dataISO: string): string => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (dataISO: string): string => {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aprovado":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case "rejeitado":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeitado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
    }
  };

  const handleVisualizarAtestado = (atestado: AtestadoMedico) => {
    setAtestadoSelecionado(atestado);
    setDialogAberto(true);
  };

  const handleBaixarPDF = (atestado: AtestadoMedico) => {
    // Criar link para download
    const link = document.createElement('a');
    link.href = atestado.arquivoPdf;
    link.download = atestado.nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMotivosLabel = (motivo: string): string => {
    const motivos: Record<string, string> = {
      'doenca': 'Doença',
      'acidente': 'Acidente',
      'consulta-medica': 'Consulta médica',
      'exame': 'Exame médico',
      'cirurgia': 'Cirurgia',
      'acompanhamento-familiar': 'Acompanhamento familiar',
      'outros': 'Outros',
    };
    return motivos[motivo] || motivo;
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Meus Atestados Médicos
                </h1>
                <p className="text-muted-foreground">
                  Visualize e gerencie seus atestados enviados
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/enviaratestado")}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Atestado
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filtros e Busca */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Busca */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar por ID, motivo ou data..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filtro de Status */}
                  <div className="w-full md:w-48">
                    <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                      <SelectTrigger>
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="rejeitado">Rejeitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Atestados */}
            {atestadosFiltrados.length === 0 ? (
              <Card className="p-12 text-center">
                <FileCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum atestado encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  {atestados.length === 0
                    ? "Você ainda não enviou nenhum atestado médico."
                    : "Tente ajustar os filtros para encontrar atestados."}
                </p>
                {atestados.length === 0 && (
                  <Button onClick={() => navigate("/enviaratestado")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Enviar Primeiro Atestado
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {atestadosFiltrados.map((atestado) => (
                  <Card key={atestado.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Cabeçalho */}
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{atestado.id}</h3>
                                {getStatusBadge(atestado.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {getMotivosLabel(atestado.motivo)}
                              </p>
                            </div>
                          </div>

                          {/* Informações */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Período</p>
                                <p className="font-medium">
                                  {formatarData(atestado.dataInicio)} - {formatarData(atestado.dataFim)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Duração</p>
                                <p className="font-medium">
                                  {calcularDiasAfastamento(atestado.dataInicio, atestado.dataFim)}{" "}
                                  {calcularDiasAfastamento(atestado.dataInicio, atestado.dataFim) === 1 ? 'dia' : 'dias'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <FileCheck className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Enviado em</p>
                                <p className="font-medium">{formatarData(atestado.dataEnvio)}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex md:flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVisualizarAtestado(atestado)}
                            className="flex-1 md:flex-none"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBaixarPDF(atestado)}
                            className="flex-1 md:flex-none"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Baixar PDF
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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

      {/* Dialog de Visualização */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Atestado</DialogTitle>
            <DialogDescription>
              Informações completas do atestado médico
            </DialogDescription>
          </DialogHeader>

          {atestadoSelecionado && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  {getStatusBadge(atestadoSelecionado.status)}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">ID do Atestado</p>
                  <p className="font-mono font-semibold">{atestadoSelecionado.id}</p>
                </div>
              </div>

              {/* Informações do Funcionário */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Funcionário</p>
                  <p className="font-medium">{atestadoSelecionado.funcionario}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">CPF</p>
                  <p className="font-medium">{atestadoSelecionado.cpf}</p>
                </div>
              </div>

              {/* Período de Afastamento */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Período de Afastamento</p>
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Data de Início</p>
                    <p className="font-medium">{formatarData(atestadoSelecionado.dataInicio)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Data de Fim</p>
                    <p className="font-medium">{formatarData(atestadoSelecionado.dataFim)}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Total: {calcularDiasAfastamento(atestadoSelecionado.dataInicio, atestadoSelecionado.dataFim)}{" "}
                  {calcularDiasAfastamento(atestadoSelecionado.dataInicio, atestadoSelecionado.dataFim) === 1 ? 'dia' : 'dias'}
                </p>
              </div>

              {/* Motivo */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Motivo</p>
                <p className="font-medium">{getMotivosLabel(atestadoSelecionado.motivo)}</p>
              </div>

              {/* Observações */}
              {atestadoSelecionado.observacoes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Observações</p>
                  <p className="text-sm p-3 bg-muted/30 rounded-lg">{atestadoSelecionado.observacoes}</p>
                </div>
              )}

              {/* Arquivo */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Arquivo Anexado</p>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-red-100 dark:bg-red-950 flex items-center justify-center">
                      <FileCheck className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{atestadoSelecionado.nomeArquivo}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatarTamanhoArquivo(atestadoSelecionado.tamanhoArquivo)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBaixarPDF(atestadoSelecionado)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </div>

              {/* Datas de Envio e Análise */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Enviado em</p>
                  <p className="text-sm font-medium">{formatarDataHora(atestadoSelecionado.dataEnvio)}</p>
                </div>
                {atestadoSelecionado.dataAnalise && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Analisado em</p>
                    <p className="text-sm font-medium">{formatarDataHora(atestadoSelecionado.dataAnalise)}</p>
                  </div>
                )}
              </div>

              {/* Informações de Rejeição */}
              {atestadoSelecionado.status === 'rejeitado' && atestadoSelecionado.motivoRejeicao && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                    Motivo da Rejeição
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {atestadoSelecionado.motivoRejeicao}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeusAtestados;

