import {
  User, Clock, TrendingUp, DollarSign, MessageCircle,
  Settings, Shield, BarChart3, BookOpen, HelpCircle,
  Users, UserCheck, Bot, Calendar, Eye, LogOut, ArrowRightLeft, FileText, FileCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "@/components/Header";
import TileCard from "@/components/TileCard";
import BirthdayCard from "@/components/BirthdayCard";
import AnnouncementsCard from "@/components/AnnouncementsCard";
import NewsCard from "@/components/NewsCard";
import SystemStatus from "@/components/SystemStatus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NoticiaInterna } from "@/types/comunicacao";
import { getNoticiasInternas, incrementarVisualizacao } from "@/utils/localStorage";

const Index = () => {
  const navigate = useNavigate();
  const [noticiasRecentes, setNoticiasRecentes] = useState<NoticiaInterna[]>([]);
  const [isAutoatendimentoModalOpen, setIsAutoatendimentoModalOpen] = useState(false);

  useEffect(() => {
    const noticias = getNoticiasInternas()
      .filter(noticia => noticia.status === 'publicado')
      .sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime())
      .slice(0, 6);

    setNoticiasRecentes(noticias);
  }, []);

  const handleTileClick = (title: string) => {
    if (title === "Manual do Gestor") {
      navigate("/manualgestor");
    } else if (title === "FAQ") {
      navigate("/faq");
    } else if (title === "Lis AI") {
      navigate("/chatlisai");
    } else if (title === "Benefícios e Remuneração") {
      navigate("/portalbeneficio");
    } else if (title === "Comunicação") {
      navigate("/comunicacao");
    } else if (title === "Autoatendimento") {
      setIsAutoatendimentoModalOpen(true);
    } else {
      console.log(`Clicked on ${title}`);
    }
  };

  const hasRedirect = (title: string) => {
    return ["Manual do Gestor", "FAQ", "Lis AI", "Benefícios e Remuneração", "Comunicação", "Gestão de Dados", "Autoatendimento"].includes(title);
  };

  const handleAutoatendimentoAction = (action: string) => {
    if (action === "Solicitar Saída Antecipada") {
      navigate("/solicitarsaidaantecipada");
    } else if (action === "Solicitar Férias") {
      navigate("/solicitarferias");
    } else if (action === "Solicitar Transferência") {
      navigate("/solicitartransferencia");
    } else if (action === "Enviar Atestado Médico") {
      navigate("/enviaratestado");
    } else {
      console.log(`Ação selecionada: ${action}`);
    }
  };

  const formatarData = (dataStr: string): string => {
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR');
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-destructive text-destructive-foreground';
      case 'media': return 'bg-primary text-primary-foreground';
      case 'baixa': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleVisualizarNoticia = (noticiaId: string) => {
    incrementarVisualizacao(noticiaId);
    navigate('/comunicacao');
  };
  const mainTiles = [
    {
      title: "Gestão de Dados",
      description: "Acesse e atualize suas informações pessoais, documentos e dados cadastrais",
      icon: User
    },
    {
      title: "Autoatendimento",
      description: "Solicitações e acompanhamento de férias, saídas, horários e transferências",
      icon: Clock
    },
    {
      title: "Desenvolvimento e Carreira",
      description: "Treinamentos, avaliações de desempenho e planos de carreira",
      icon: TrendingUp
    },
    {
      title: "Benefícios e Remuneração",
      description: "Consulte holerites, benefícios, vale-transporte e assistência médica",
      icon: DollarSign
    },
    {
      title: "Comunicação",
      description: "Chat interno, fóruns, enquetes e comunicação entre equipes",
      icon: MessageCircle
    },
    {
      title: "Gestão Operacional",
      description: "Requisições, aprovações, relatórios e processos operacionais",
      icon: Settings
    },
    {
      title: "Funcionalidades Técnicas",
      description: "Integrações, APIs, automações e ferramentas técnicas",
      icon: BookOpen
    },
    {
      title: "Compliance e Segurança",
      description: "Políticas de segurança, auditorias e conformidade regulatória",
      icon: Shield
    },
    {
      title: "Indicadores",
      description: "Dashboards, relatórios analíticos e business intelligence",
      icon: BarChart3
    },
    {
      title: "FAQ",
      description: "Perguntas frequentes e respostas sobre políticas e procedimentos",
      icon: HelpCircle
    },
    {
      title: "Manual do Colaborador",
      description: "Guia completo com todas as informações essenciais para colaboradores",
      icon: Users
    },
    {
      title: "Manual do Gestor",
      description: "Orientações e ferramentas específicas para líderes e gestores",
      icon: UserCheck
    },
    {
      title: "Lis AI",
      description: "Assistente virtual inteligente para suporte e automação de tarefas",
      icon: Bot
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content - Tiles */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Portal de Recursos Humanos</h2>
              <p className="text-muted-foreground">
                Acesse rapidamente os principais serviços e informações da empresa
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {mainTiles.map((tile, index) => (
                <TileCard
                  key={index}
                  title={tile.title}
                  description={tile.description}
                  icon={tile.icon}
                  gradient={tile.gradient}
                  disabled={!hasRedirect(tile.title)}
                  onClick={() => handleTileClick(tile.title)}
                />
              ))}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <BirthdayCard />
            <AnnouncementsCard />
            <SystemStatus />
            <NewsCard />
          </div>
        </div>

        {/* Seção de Últimas Notícias */}
        {noticiasRecentes.length > 0 && (
          <div className="mt-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Últimas Notícias</h2>
              <p className="text-muted-foreground">
                Fique por dentro das novidades e comunicados da empresa
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {noticiasRecentes.map((noticia) => (
                <Card 
                  key={noticia.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleVisualizarNoticia(noticia.id)}
                >
                  <CardContent className="p-0">
                    {noticia.imagem && (
                      <div className="h-40 bg-muted rounded-t-lg overflow-hidden">
                        <img 
                          src={noticia.imagem} 
                          alt={noticia.titulo}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {noticia.categoria}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getPrioridadeColor(noticia.prioridade)}`}
                        >
                          {noticia.prioridade === 'alta' ? 'Importante' : 
                           noticia.prioridade === 'media' ? 'Médio' : 'Baixo'}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {noticia.titulo}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {noticia.resumo}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatarData(noticia.dataPublicacao)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{noticia.visualizacoes}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button 
                variant="outline" 
                onClick={() => navigate('/comunicacao')}
                className="px-8"
              >
                Ver todas as notícias
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Autoatendimento */}
      <Dialog open={isAutoatendimentoModalOpen} onOpenChange={setIsAutoatendimentoModalOpen}>
        <DialogContent className="max-w-[900px] w-[85vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Autoatendimento do Colaborador</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Primeira linha - 3 cards */}
            <div className="col-span-2 grid grid-cols-3 gap-4">
              {/* Card 1: Solicitar Saída Antecipada */}
              <Card
                className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-2 hover:border-orange-500"
                onClick={() => handleAutoatendimentoAction("Solicitar Saída Antecipada")}
              >
                <CardContent className="p-4 flex flex-col items-center text-center h-full justify-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <LogOut className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base mb-1">Solicitar Saída Antecipada</h3>
                  <p className="text-xs text-muted-foreground">Informar saída antes do horário</p>
                </CardContent>
              </Card>

              {/* Card 2: Solicitar Férias */}
              <Card
                className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-2 hover:border-blue-500"
                onClick={() => handleAutoatendimentoAction("Solicitar Férias")}
              >
                <CardContent className="p-4 flex flex-col items-center text-center h-full justify-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base mb-1">Solicitar Férias</h3>
                  <p className="text-xs text-muted-foreground">Solicitar período de férias</p>
                </CardContent>
              </Card>

              {/* Card 3: Solicitar Mudança de Horário */}
              <Card
                className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-2 hover:border-purple-500"
                onClick={() => handleAutoatendimentoAction("Solicitar Mudança de Horário")}
              >
                <CardContent className="p-4 flex flex-col items-center text-center h-full justify-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base mb-1">Solicitar Mudança de Horário</h3>
                  <p className="text-xs text-muted-foreground">Alterar turno ou horário de trabalho</p>
                </CardContent>
              </Card>
            </div>

            {/* Segunda linha - 3 cards */}
            <div className="col-span-2 grid grid-cols-3 gap-4">
              {/* Card 4: Solicitar Transferência */}
              <Card
                className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-2 hover:border-green-500"
                onClick={() => handleAutoatendimentoAction("Solicitar Transferência")}
              >
                <CardContent className="p-4 flex flex-col items-center text-center h-full justify-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <ArrowRightLeft className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base mb-1">Solicitar Transferência</h3>
                  <p className="text-xs text-muted-foreground">Solicitar mudança de departamento</p>
                </CardContent>
              </Card>

              {/* Card 5: Visualizar Minhas Solicitações */}
              <Card
                className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-2 hover:border-slate-500"
                onClick={() => handleAutoatendimentoAction("Visualizar Minhas Solicitações")}
              >
                <CardContent className="p-4 flex flex-col items-center text-center h-full justify-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base mb-1">Visualizar Minhas Solicitações</h3>
                  <p className="text-xs text-muted-foreground">Acompanhar status das solicitações</p>
                </CardContent>
              </Card>

              {/* Card 6: Enviar Atestado Médico */}
              <Card
                className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-2 hover:border-teal-500"
                onClick={() => handleAutoatendimentoAction("Enviar Atestado Médico")}
              >
                <CardContent className="p-4 flex flex-col items-center text-center h-full justify-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <FileCheck className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base mb-1">Enviar Atestado Médico</h3>
                  <p className="text-xs text-muted-foreground">Enviar atestado de ausência ou afastamento</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
