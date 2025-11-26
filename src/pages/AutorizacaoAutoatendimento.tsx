import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardCheck,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Calendar,
  User,
  Building,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import BirthdayCard from "@/components/BirthdayCard";
import AnnouncementsCard from "@/components/AnnouncementsCard";
import SystemStatus from "@/components/SystemStatus";
import NewsCard from "@/components/NewsCard";
import { NotificacaoSolicitacao } from "@/types/notificacao";
import {
  carregarSolicitacoes,
  aprovarSolicitacao,
  rejeitarSolicitacao
} from "@/utils/solicitacoesStorage";

const AutorizacaoAutoatendimento = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [solicitacoes, setSolicitacoes] = useState<NotificacaoSolicitacao[]>([]);
  const [solicitacoesFiltradas, setSolicitacoesFiltradas] = useState<NotificacaoSolicitacao[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<NotificacaoSolicitacao | null>(null);
  const [dialogDetalhes, setDialogDetalhes] = useState(false);
  const [dialogAvaliacao, setDialogAvaliacao] = useState(false);
  const [tipoAvaliacao, setTipoAvaliacao] = useState<'aprovar' | 'rejeitar' | null>(null);
  const [justificativa, setJustificativa] = useState("");
  const [erroJustificativa, setErroJustificativa] = useState(false);

  // Carregar solicitações ao montar o componente
  useEffect(() => {
    carregarSolicitacoesDoStorage();

    // Listener para sincronizar mudanças do localStorage
    const handleSolicitacoesAtualizadas = () => {
      carregarSolicitacoesDoStorage();
    };

    window.addEventListener('solicitacoesAtualizadas', handleSolicitacoesAtualizadas);

    return () => {
      window.removeEventListener('solicitacoesAtualizadas', handleSolicitacoesAtualizadas);
    };
  }, []);

  const carregarSolicitacoesDoStorage = () => {
    const dados = carregarSolicitacoes();
    // Ordenar por data de solicitação (mais recentes primeiro)
    dados.sort((a, b) =>
      new Date(b.datasolicitacao).getTime() - new Date(a.datasolicitacao).getTime()
    );
    setSolicitacoes(dados);
  };

  // Aplicar filtros quando solicitações, filtroStatus ou busca mudarem
  useEffect(() => {
    let resultado = [...solicitacoes];

    // Filtrar por status
    if (filtroStatus !== "todos") {
      resultado = resultado.filter(s => s.status === filtroStatus);
    }

    // Filtrar por busca
    if (busca.trim()) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(s =>
        s.matricula.toLowerCase().includes(buscaLower) ||
        s.colaborador.toLowerCase().includes(buscaLower) ||
        s.solicitacao.toLowerCase().includes(buscaLower) ||
        (s.setor && s.setor.toLowerCase().includes(buscaLower))
      );
    }

    setSolicitacoesFiltradas(resultado);
  }, [solicitacoes, filtroStatus, busca]);

  const formatarData = (dataStr: string): string => {
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aprovada':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Pendente':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Rejeitada':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovada':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">Aprovada</Badge>;
      case 'Pendente':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">Pendente</Badge>;
      case 'Rejeitada':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200">Rejeitada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleVisualizarDetalhes = (solicitacao: NotificacaoSolicitacao) => {
    setSolicitacaoSelecionada(solicitacao);
    setDialogDetalhes(true);
  };

  const handleAbrirAvaliacao = (solicitacao: NotificacaoSolicitacao, tipo: 'aprovar' | 'rejeitar') => {
    setSolicitacaoSelecionada(solicitacao);
    setTipoAvaliacao(tipo);
    setJustificativa("");
    setErroJustificativa(false);
    setDialogAvaliacao(true);
  };

  const handleConfirmarAvaliacao = () => {
    // Validar justificativa - obrigatória para ambos os casos
    if (!justificativa.trim()) {
      setErroJustificativa(true);
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe a justificativa para sua decisão.",
        variant: "destructive",
      });
      return;
    }

    if (!solicitacaoSelecionada || !tipoAvaliacao) return;

    const avaliadorNome = 'Emanuel Silva'; // Nome do usuário logado

    // Salvar no localStorage usando as funções utilitárias
    if (tipoAvaliacao === 'aprovar') {
      aprovarSolicitacao(solicitacaoSelecionada.id, justificativa, avaliadorNome);
    } else {
      rejeitarSolicitacao(solicitacaoSelecionada.id, justificativa, avaliadorNome);
    }

    // Recarregar as solicitações do localStorage
    carregarSolicitacoesDoStorage();

    toast({
      title: tipoAvaliacao === 'aprovar' ? "Solicitação Aprovada" : "Solicitação Rejeitada",
      description: `A solicitação de ${solicitacaoSelecionada.colaborador} foi ${tipoAvaliacao === 'aprovar' ? 'aprovada' : 'rejeitada'} com sucesso.`,
    });

    setDialogAvaliacao(false);
    setSolicitacaoSelecionada(null);
    setTipoAvaliacao(null);
    setJustificativa("");
  };

  // Contar pendentes
  const totalPendentes = solicitacoes.filter(s => s.status === 'Pendente').length;

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
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Autorização de Autoatendimento
                </h1>
                <p className="text-muted-foreground">
                  Avalie e gerencie as solicitações dos colaboradores
                </p>
              </div>
            </div>
            {totalPendentes > 0 && (
              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {totalPendentes} solicitação{totalPendentes > 1 ? 'ões' : ''} pendente{totalPendentes > 1 ? 's' : ''}
              </Badge>
            )}
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
                      placeholder="Buscar por matrícula, nome, solicitação ou setor..."
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
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Aprovada">Aprovada</SelectItem>
                        <SelectItem value="Rejeitada">Rejeitada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Solicitações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Solicitações de Colaboradores</CardTitle>
              </CardHeader>
              <CardContent>
                {solicitacoesFiltradas.length === 0 ? (
                  <div className="p-12 text-center">
                    <ClipboardCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma solicitação encontrada</h3>
                    <p className="text-muted-foreground">
                      {solicitacoes.length === 0
                        ? "Não há solicitações para avaliar no momento."
                        : "Tente ajustar os filtros para encontrar solicitações."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Matrícula</TableHead>
                          <TableHead>Colaborador</TableHead>
                          <TableHead>Setor</TableHead>
                          <TableHead>Solicitação</TableHead>
                          <TableHead className="w-[120px]">Status</TableHead>
                          <TableHead className="w-[100px]">Data</TableHead>
                          <TableHead className="w-[200px] text-center">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {solicitacoesFiltradas.map((solicitacao) => (
                          <TableRow key={solicitacao.id} className="hover:bg-muted/50">
                            <TableCell className="font-mono text-sm">{solicitacao.matricula}</TableCell>
                            <TableCell className="font-medium">{solicitacao.colaborador}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{solicitacao.setor || '-'}</TableCell>
                            <TableCell>{solicitacao.solicitacao}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(solicitacao.status)}
                                {getStatusBadge(solicitacao.status)}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatarData(solicitacao.datasolicitacao)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleVisualizarDetalhes(solicitacao)}
                                  title="Ver detalhes"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {solicitacao.status === 'Pendente' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => handleAbrirAvaliacao(solicitacao, 'aprovar')}
                                      title="Aprovar"
                                    >
                                      <ThumbsUp className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleAbrirAvaliacao(solicitacao, 'rejeitar')}
                                      title="Rejeitar"
                                    >
                                      <ThumbsDown className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
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

      {/* Dialog de Detalhes */}
      <Dialog open={dialogDetalhes} onOpenChange={setDialogDetalhes}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
            <DialogDescription>
              Informações completas da solicitação do colaborador
            </DialogDescription>
          </DialogHeader>

          {solicitacaoSelecionada && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(solicitacaoSelecionada.status)}
                    {getStatusBadge(solicitacaoSelecionada.status)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">ID da Solicitação</p>
                  <p className="font-mono font-semibold">{solicitacaoSelecionada.id}</p>
                </div>
              </div>

              {/* Informações do Colaborador */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Colaborador</p>
                    <p className="font-medium">{solicitacaoSelecionada.colaborador}</p>
                    <p className="text-xs text-muted-foreground">Mat: {solicitacaoSelecionada.matricula}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Setor / Cargo</p>
                    <p className="font-medium">{solicitacaoSelecionada.setor || '-'}</p>
                    <p className="text-xs text-muted-foreground">{solicitacaoSelecionada.cargo || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Tipo e Data */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Solicitação</p>
                    <p className="font-medium">{solicitacaoSelecionada.solicitacao}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data da Solicitação</p>
                    <p className="font-medium">{formatarData(solicitacaoSelecionada.datasolicitacao)}</p>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              {solicitacaoSelecionada.descricaoSolicitacao && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Descrição da Solicitação</p>
                  <p className="text-sm p-3 bg-muted/30 rounded-lg">{solicitacaoSelecionada.descricaoSolicitacao}</p>
                </div>
              )}

              {/* Informações de Avaliação (se já avaliado) */}
              {solicitacaoSelecionada.status !== 'Pendente' && solicitacaoSelecionada.justificativaAvaliacao && (
                <div className={`p-4 rounded-lg border ${
                  solicitacaoSelecionada.status === 'Aprovada'
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                }`}>
                  <p className={`text-sm font-medium mb-1 ${
                    solicitacaoSelecionada.status === 'Aprovada'
                      ? 'text-green-900 dark:text-green-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    Justificativa da {solicitacaoSelecionada.status === 'Aprovada' ? 'Aprovação' : 'Rejeição'}
                  </p>
                  <p className={`text-sm ${
                    solicitacaoSelecionada.status === 'Aprovada'
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {solicitacaoSelecionada.justificativaAvaliacao}
                  </p>
                  {solicitacaoSelecionada.avaliadorNome && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Avaliado por: {solicitacaoSelecionada.avaliadorNome} em {formatarData(solicitacaoSelecionada.dataAvaliacao || '')}
                    </p>
                  )}
                </div>
              )}

              {/* Botões de Ação */}
              {solicitacaoSelecionada.status === 'Pendente' && (
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setDialogDetalhes(false);
                      handleAbrirAvaliacao(solicitacaoSelecionada, 'rejeitar');
                    }}
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      setDialogDetalhes(false);
                      handleAbrirAvaliacao(solicitacaoSelecionada, 'aprovar');
                    }}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Avaliação */}
      <Dialog open={dialogAvaliacao} onOpenChange={setDialogAvaliacao}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={tipoAvaliacao === 'aprovar' ? 'text-green-600' : 'text-red-600'}>
              {tipoAvaliacao === 'aprovar' ? 'Aprovar Solicitação' : 'Rejeitar Solicitação'}
            </DialogTitle>
            <DialogDescription>
              {solicitacaoSelecionada && (
                <>
                  Solicitação de <strong>{solicitacaoSelecionada.solicitacao}</strong> do colaborador{' '}
                  <strong>{solicitacaoSelecionada.colaborador}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="justificativa" className="flex items-center gap-1">
                Justificativa / Motivo
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="justificativa"
                placeholder={tipoAvaliacao === 'aprovar'
                  ? "Informe o motivo da aprovação..."
                  : "Informe o motivo da rejeição..."}
                value={justificativa}
                onChange={(e) => {
                  setJustificativa(e.target.value);
                  if (e.target.value.trim()) setErroJustificativa(false);
                }}
                className={`min-h-[100px] ${erroJustificativa ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {erroJustificativa && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Este campo é obrigatório
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                A justificativa é obrigatória e ficará registrada no histórico da solicitação.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAvaliacao(false)}>
              Cancelar
            </Button>
            <Button
              className={tipoAvaliacao === 'aprovar'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'}
              onClick={handleConfirmarAvaliacao}
            >
              {tipoAvaliacao === 'aprovar' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Aprovação
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Confirmar Rejeição
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutorizacaoAutoatendimento;