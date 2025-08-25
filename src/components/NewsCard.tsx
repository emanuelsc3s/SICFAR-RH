import { Calendar, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NoticiaInterna } from "@/types/comunicacao";
import { getNoticiasInternas } from "@/utils/localStorage";

const formatarData = (dataStr: string): string => {
  const data = new Date(dataStr);
  const agora = new Date();
  const diffMs = agora.getTime() - data.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHoras < 1) return "Agora mesmo";
  if (diffHoras < 24) return `${diffHoras}h atrás`;
  if (diffDias === 1) return "1 dia atrás";
  if (diffDias < 7) return `${diffDias} dias atrás`;
  
  return data.toLocaleDateString('pt-BR');
};

const NewsCard = () => {
  const [noticias, setNoticias] = useState<NoticiaInterna[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const todasNoticias = getNoticiasInternas()
      .filter(noticia => noticia.status === 'publicado')
      .sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime())
      .slice(0, 3);
    
    setNoticias(todasNoticias);
  }, []);

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case "alta": return "bg-destructive text-destructive-foreground";
      case "media": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (noticias.length === 0) {
    return (
      <Card className="tile-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Calendar className="h-5 w-5 text-primary mr-2" />
            Últimas Notícias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma notícia publicada ainda.
          </p>
          <div className="pt-2 border-t border-border/50">
            <button 
              className="w-full text-sm text-primary hover:text-primary-700 transition-colors"
              onClick={() => navigate('/comunicacao')}
            >
              Ver todas as notícias
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="tile-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Calendar className="h-5 w-5 text-primary mr-2" />
          Últimas Notícias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {noticias.map((noticia) => (
          <div key={noticia.id} className="p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-2">
              <Badge variant="outline" className="text-xs">{noticia.categoria}</Badge>
              <Badge className={`text-xs ${getPriorityColor(noticia.prioridade)}`}>
                {noticia.prioridade === "alta" && "Importante"}
                {noticia.prioridade === "media" && "Médio"}
                {noticia.prioridade === "baixa" && "Baixo"}
              </Badge>
            </div>
            
            <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
              {noticia.titulo}
            </h4>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {noticia.resumo}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {formatarData(noticia.dataPublicacao)}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        ))}
        
        <div className="pt-2 border-t border-border/50">
          <button 
            className="w-full text-sm text-primary hover:text-primary-700 transition-colors"
            onClick={() => navigate('/comunicacao')}
          >
            Ver todas as notícias
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;