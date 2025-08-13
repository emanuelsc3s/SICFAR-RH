import { Calendar, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NewsItem {
  title: string;
  summary: string;
  date: string;
  category: string;
  priority?: "high" | "medium" | "low";
}

const newsData: NewsItem[] = [
  {
    title: "Nova Política de Home Office",
    summary: "Diretrizes atualizadas para trabalho remoto a partir de setembro",
    date: "2 horas atrás",
    category: "RH",
    priority: "high"
  },
  {
    title: "Treinamento de Segurança Digital",
    summary: "Inscrições abertas para curso obrigatório de cybersecurity",
    date: "1 dia atrás",
    category: "TI",
    priority: "medium"
  },
  {
    title: "Resultados Q2 2024",
    summary: "Confira os resultados do segundo trimestre da empresa",
    date: "3 dias atrás",
    category: "Corporativo",
    priority: "medium"
  }
];

const NewsCard = () => {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="tile-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Calendar className="h-5 w-5 text-primary mr-2" />
          Últimas Notícias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {newsData.map((news, index) => (
          <div key={index} className="p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-2">
              <Badge variant="outline" className="text-xs">{news.category}</Badge>
              {news.priority && (
                <Badge className={`text-xs ${getPriorityColor(news.priority)}`}>
                  {news.priority === "high" && "Importante"}
                  {news.priority === "medium" && "Médio"}
                  {news.priority === "low" && "Baixo"}
                </Badge>
              )}
            </div>
            
            <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
              {news.title}
            </h4>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {news.summary}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {news.date}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        ))}
        
        <div className="pt-2 border-t border-border/50">
          <button className="w-full text-sm text-primary hover:text-primary-700 transition-colors">
            Ver todas as notícias
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;