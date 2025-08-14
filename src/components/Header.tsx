import { Search, Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
const Header = () => {
  return <header className="bg-card border-b border-border/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo e Title */}
        <div className="flex items-center space-x-4">
          <div className="bg-white rounded-lg flex items-center justify-center p-1" style={{
          width: '149.98px',
          height: '68.97px'
        }}>
            <img src="/farmace-logo.png" alt="Farmace Logo" className="object-contain" style={{
            width: '149.98px',
            height: '68.97px'
          }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Portal Corporativo</h1>
            <p className="text-sm text-muted-foreground">Intranet & Recursos Humanos</p>
          </div>
        </div>

        {/* Search Bar */}
        

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-6 w-6" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs">
              3
            </Badge>
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-3 pl-3 border-l border-border/50">
            <div className="text-right">
              <p className="text-sm font-medium">Emanuel Silva</p>
              <p className="text-xs text-muted-foreground">Gerente de TI</p>
            </div>
            <Avatar className="h-9 w-9">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-primary text-primary-foreground">AS</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>;
};
export default Header;