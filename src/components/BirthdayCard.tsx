import { Cake, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface BirthdayPerson {
  name: string;
  department: string;
  date: string;
  avatar?: string;
}

const birthdayData: BirthdayPerson[] = [
  { name: "Carlos Santos", department: "TI", date: "15/08", avatar: "" },
  { name: "Maria João", department: "Marketing", date: "22/08", avatar: "" },
  { name: "Pedro Costa", department: "Vendas", date: "28/08", avatar: "" },
];

const BirthdayCard = () => {
  return (
    <Card className="tile-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Cake className="h-5 w-5 text-primary mr-2" />
          Aniversariantes do Mês
          <Badge variant="secondary" className="ml-auto">
            {birthdayData.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {birthdayData.map((person, index) => (
          <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <Avatar className="h-10 w-10">
              <AvatarImage src={person.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {person.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{person.name}</p>
              <p className="text-xs text-muted-foreground">{person.department}</p>
            </div>
            <Badge variant="outline" className="text-xs">{person.date}</Badge>
          </div>
        ))}
        
        <div className="pt-2 border-t border-border/50">
          <button className="w-full text-sm text-primary hover:text-primary-700 transition-colors flex items-center justify-center space-x-1">
            <Users className="h-4 w-4" />
            <span>Ver todos aniversariantes</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthdayCard;