import { 
  User, Clock, TrendingUp, DollarSign, MessageCircle, 
  Settings, Shield, BarChart3, BookOpen 
} from "lucide-react";

import Header from "@/components/Header";
import TileCard from "@/components/TileCard";
import BirthdayCard from "@/components/BirthdayCard";
import AnnouncementsCard from "@/components/AnnouncementsCard";
import NewsCard from "@/components/NewsCard";
import QuickStats from "@/components/QuickStats";
import SystemStatus from "@/components/SystemStatus";

const Index = () => {
  const mainTiles = [
    {
      title: "Gestão de Dados e Perfil",
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
      title: "Analytics e Inteligência",
      description: "Dashboards, relatórios analíticos e business intelligence",
      icon: BarChart3
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
                  onClick={() => console.log(`Clicked on ${tile.title}`)}
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
      </main>
    </div>
  );
};

export default Index;
