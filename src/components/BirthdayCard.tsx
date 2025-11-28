import { useState } from "react";
import { Cake, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BirthdayDetailModal } from "@/components/birthday/BirthdayDetailModal";
import type { BirthdayPerson } from "@/types/aniversariante";

const birthdayData: BirthdayPerson[] = [
  { 
    name: "FRANCISCO EUDES MAGALHAES FILHO", 
    department: "Microbiológico", 
    date: "14/08", 
    avatar: "",
    admissionDate: "08.04.2024",
    birthDate: "14.08.1986"
  },
  { 
    name: "CICERA ALVES DA SILVA", 
    department: "SPP-FRASCOS E AMPOLAS", 
    date: "14/08", 
    avatar: "",
    admissionDate: "15.07.2005",
    birthDate: "14.08.1977"
  },
  { 
    name: "JOSINALDO FERREIRA DOS SANTOS", 
    department: "Embalagem SPEP I", 
    date: "14/08", 
    avatar: "",
    admissionDate: "01.03.2022",
    birthDate: "14.08.1983"
  },
  { 
    name: "JOSE DANIEL BARBOSA CARDOSO", 
    department: "C P H D", 
    date: "14/09", 
    avatar: "",
    admissionDate: "04.12.2017",
    birthDate: "14.09.1994"
  },
];

const BirthdayCard = () => {
  const navigate = useNavigate();
  const [selectedPerson, setSelectedPerson] = useState<BirthdayPerson | null>(null);

  const handlePersonClick = (person: BirthdayPerson) => {
    setSelectedPerson(person);
  };

  const handleCloseModal = () => {
    setSelectedPerson(null);
  };

  return (
    <>
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
            <div
              key={index}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handlePersonClick(person)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handlePersonClick(person);
                }
              }}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={person.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {person.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
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
            <button
              className="w-full text-sm text-primary hover:text-primary-700 transition-colors flex items-center justify-center space-x-1"
              onClick={() => navigate('/aniversariantes')}
            >
              <Users className="h-4 w-4" />
              <span>Ver todos aniversariantes</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalhes do aniversariante */}
      <BirthdayDetailModal
        person={selectedPerson}
        isOpen={!!selectedPerson}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default BirthdayCard;