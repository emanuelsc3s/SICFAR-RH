import { 
  User, Clock, TrendingUp, DollarSign, MessageCircle, 
  Settings, Shield, BarChart3, BookOpen, HelpCircle, 
  Users, UserCheck, Bot, Calendar, Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "@/components/Header";
import TileCard from "@/components/TileCard";
import BirthdayCard from "@/components/BirthdayCard";
import AnnouncementsCard from "@/components/AnnouncementsCard";
import NewsCard from "@/components/NewsCard";
import QuickStats from "@/components/QuickStats";
import SystemStatus from "@/components/SystemStatus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NoticiaInterna } from "@/types/comunicacao";
import { getNoticiasInternas, incrementarVisualizacao } from "@/utils/localStorage";

const Index = () => {
  const navigate = useNavigate();
  const [noticiasRecentes, setNoticiasRecentes] = useState<NoticiaInterna[]>([]);

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
    } else {
      console.log(`Clicked on ${title}`);
    }
  };

  const hasRedirect = (title: string) => {
    return ["Manual do Gestor", "FAQ", "Lis AI", "Benefícios e Remuneração", "Comunicação", "Gestão de Dados"].includes(title);
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
      icon: User,
      gradient: true
    },
    {
      title: "Gestão de Tempo e Presença",
      description: "Controle de ponto, banco de horas, férias e justificativas de ausência",
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
        {/* Quick Stats */}
        <QuickStats />
        
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
    </div>
  );
};

export default Index;
