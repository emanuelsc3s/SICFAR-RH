import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SystemService {
  name: string;
  status: "operational" | "degraded" | "down";
  lastCheck: string;
}

const systemServices: SystemService[] = [
  { name: "Sistema de Ponto", status: "operational", lastCheck: "2 min" },
  { name: "Portal RH", status: "operational", lastCheck: "1 min" },
  { name: "Sistema de Benefícios", status: "degraded", lastCheck: "5 min" },
  { name: "Email Corporativo", status: "operational", lastCheck: "3 min" }
];

const SystemStatus = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "down":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-success text-success-foreground">Operacional</Badge>;
      case "degraded":
        return <Badge className="bg-warning text-warning-foreground">Lento</Badge>;
      case "down":
        return <Badge className="bg-destructive text-destructive-foreground">Indisponível</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  return (
    <Card className="tile-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <CheckCircle className="h-5 w-5 text-success mr-2" />
          Status dos Sistemas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {systemServices.map((service, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <div className="flex items-center space-x-3">
              {getStatusIcon(service.status)}
              <div>
                <p className="font-medium text-sm">{service.name}</p>
                <p className="text-xs text-muted-foreground">Última verificação: {service.lastCheck} atrás</p>
              </div>
            </div>
            {getStatusBadge(service.status)}
          </div>
        ))}
        
        <div className="pt-2 border-t border-border/50">
          <button className="w-full text-sm text-primary hover:text-primary-700 transition-colors">
            Ver página de status completa
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatus;