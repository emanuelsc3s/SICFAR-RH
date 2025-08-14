import { ArrowLeft, BookOpen, Download, Share2, Search, ChevronRight, FileText, Users, Target, TrendingUp, Shield, Award, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";

const ManualGestor = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const chapters = [
    {
      id: 1,
      title: "Introdução à Gestão",
      icon: BookOpen,
      duration: "15 min",
      completed: true,
      summary: "Fundamentos essenciais da liderança e gestão de equipes",
      topics: ["Perfil do gestor moderno", "Competências fundamentais", "Responsabilidades e expectativas"]
    },
    {
      id: 2,
      title: "Gestão de Pessoas",
      icon: Users,
      duration: "25 min", 
      completed: true,
      summary: "Estratégias para liderar, motivar e desenvolver sua equipe",
      topics: ["Recrutamento e seleção", "Feedback e avaliação", "Desenvolvimento de talentos", "Gestão de conflitos"]
    },
    {
      id: 3,
      title: "Planejamento e Metas",
      icon: Target,
      duration: "20 min",
      completed: false,
      summary: "Como definir objetivos claros e acompanhar resultados",
      topics: ["Metodologia SMART", "KPIs e indicadores", "Planos de ação", "Monitoramento de progresso"]
    },
    {
      id: 4,
      title: "Performance e Resultados",
      icon: TrendingUp,
      duration: "30 min",
      completed: false,
      summary: "Otimização de processos e maximização de resultados",
      topics: ["Análise de performance", "Melhoria contínua", "Gestão por resultados", "ROI e produtividade"]
    },
    {
      id: 5,
      title: "Compliance e Ética",
      icon: Shield,
      duration: "18 min",
      completed: false,
      summary: "Normas, regulamentações e conduta profissional",
      topics: ["Código de ética", "Políticas internas", "Conformidade legal", "Responsabilidade social"]
    },
    {
      id: 6,
      title: "Liderança Avançada",
      icon: Award,
      duration: "35 min",
      completed: false,
      summary: "Técnicas avançadas de liderança e influência",
      topics: ["Liderança situacional", "Comunicação assertiva", "Tomada de decisão", "Gestão de mudanças"]
    }
  ];

  const filteredChapters = chapters.filter(chapter =>
    chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chapter.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chapter.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalDuration = chapters.reduce((acc, chapter) => {
    const minutes = parseInt(chapter.duration.split(' ')[0]);
    return acc + minutes;
  }, 0);

  const completedChapters = chapters.filter(chapter => chapter.completed).length;
  const progressPercentage = (completedChapters / chapters.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <BookOpen className="h-8 w-8 text-primary mr-3" />
                Manual do Gestor
              </h1>
              <p className="text-muted-foreground mt-1">
                Guia completo para excelência em gestão e liderança
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 hero-gradient text-white">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">{completedChapters}/{chapters.length}</div>
                <div className="text-white/80">Capítulos Concluídos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">{Math.round(progressPercentage)}%</div>
                <div className="text-white/80">Progresso Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">{totalDuration}min</div>
                <div className="text-white/80">Tempo Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Buscar por tópicos, capítulos ou conteúdo..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Chapters Grid */}
        <div className="grid gap-6">
          {filteredChapters.map((chapter, index) => (
            <Card key={chapter.id} className="tile-card group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      chapter.completed ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
                    }`}>
                      {chapter.completed ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <chapter.icon className="h-6 w-6" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-foreground">
                          Capítulo {chapter.id}: {chapter.title}
                        </h3>
                        <Badge variant={chapter.completed ? "default" : "secondary"}>
                          <Clock className="h-3 w-3 mr-1" />
                          {chapter.duration}
                        </Badge>
                        {chapter.completed && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Concluído
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-4">
                        {chapter.summary}
                      </p>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Tópicos abordados:</h4>
                        <div className="flex flex-wrap gap-2">
                          {chapter.topics.map((topic, topicIndex) => (
                            <Badge key={topicIndex} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant={chapter.completed ? "default" : "outline"}
                    className="ml-4 group-hover:scale-105 transition-transform"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {chapter.completed ? "Revisar" : "Começar"}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                6 Capítulos
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {totalDuration} minutos
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Para todos os gestores
              </div>
            </div>
            <p className="mt-4 text-muted-foreground">
              Este manual é atualizado regularmente com as melhores práticas em gestão e liderança.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ManualGestor;