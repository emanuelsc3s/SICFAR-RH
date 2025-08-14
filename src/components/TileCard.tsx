import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TileCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient?: boolean;
  onClick?: () => void;
}

const TileCard = ({ title, description, icon: Icon, gradient = false, onClick }: TileCardProps) => {
  return (
    <Card 
      className={`tile-card p-6 ${gradient ? 'hero-gradient text-primary-foreground' : ''}`}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
          gradient ? 'bg-white/20' : 'bg-primary/10'
        }`}>
          <Icon className={`h-6 w-6 ${gradient ? 'text-white' : 'text-primary'}`} />
        </div>
        
        <h3 className={`font-semibold text-lg mb-2 ${
          gradient ? 'text-white' : 'text-foreground'
        }`}>
          {title}
        </h3>
        
        <p className={`text-sm flex-1 ${
          gradient ? 'text-white/80' : 'text-muted-foreground'
        }`}>
          {description}
        </p>
      </div>
    </Card>
  );
};

export default TileCard;