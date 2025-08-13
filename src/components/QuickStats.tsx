import { Users, Clock, TrendingUp, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatItem {
  label: string;
  value: string;
  icon: React.ElementType;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

const statsData: StatItem[] = [
  { 
    label: "Funcionários Ativos", 
    value: "247", 
    icon: Users,
    change: "+3",
    trend: "up"
  },
  { 
    label: "Presença Hoje", 
    value: "89%", 
    icon: CheckCircle,
    change: "+2%",
    trend: "up"
  },
  { 
    label: "Horas Médias/Dia", 
    value: "8.2h", 
    icon: Clock,
    change: "+0.1h",
    trend: "up"
  }
];

const QuickStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {statsData.map((stat, index) => (
        <Card key={index} className="tile-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                {stat.change && (
                  <div className="flex items-center mt-1">
                    <TrendingUp className={`h-3 w-3 mr-1 ${
                      stat.trend === "up" ? "text-success" : 
                      stat.trend === "down" ? "text-destructive" : "text-muted-foreground"
                    }`} />
                    <span className={`text-xs ${
                      stat.trend === "up" ? "text-success" : 
                      stat.trend === "down" ? "text-destructive" : "text-muted-foreground"
                    }`}>
                      {stat.change} esta semana
                    </span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickStats;