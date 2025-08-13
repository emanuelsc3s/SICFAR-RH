import { Megaphone, MapPin, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Announcement {
  title: string;
  description: string;
  date: string;
  location?: string;
  type: "event" | "announcement";
}

const announcementData: Announcement[] = [
  {
    title: "Reunião Geral Mensal",
    description: "Apresentação dos resultados e próximos projetos",
    date: "20/08 - 14:00",
    location: "Auditório Principal",
    type: "event"
  },
  {
    title: "Happy Hour da Equipe",
    description: "Confraternização mensal dos colaboradores",
    date: "25/08 - 18:00",
    location: "Terraço",
    type: "event"
  },
  {
    title: "Manutenção do Sistema",
    description: "Sistema de ponto indisponível no sábado",
    date: "17/08 - 06:00",
    type: "announcement"
  }
];

const AnnouncementsCard = () => {
  return (
    <Card className="tile-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Megaphone className="h-5 w-5 text-primary mr-2" />
          Comunicados e Eventos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {announcementData.map((item, index) => (
          <div key={index} className="p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-2">
              <Badge 
                variant={item.type === "event" ? "default" : "secondary"}
                className="text-xs"
              >
                {item.type === "event" ? "Evento" : "Comunicado"}
              </Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            
            <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
              {item.title}
            </h4>
            <p className="text-xs text-muted-foreground mb-2">
              {item.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{item.date}</span>
              {item.location && (
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {item.location}
                </div>
              )}
            </div>
          </div>
        ))}
        
        <div className="pt-2 border-t border-border/50">
          <button className="w-full text-sm text-primary hover:text-primary-700 transition-colors">
            Ver todos comunicados
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnouncementsCard;