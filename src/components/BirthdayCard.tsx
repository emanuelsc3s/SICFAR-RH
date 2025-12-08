import { useState } from "react";
import { Cake, Users, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BirthdayDetailModal } from "@/components/birthday/BirthdayDetailModal";
import { useBirthdayData } from "@/hooks/useBirthdayData";
import type { BirthdayPerson } from "@/types/aniversariante";

const BirthdayCard = () => {
  const navigate = useNavigate();
  const [selectedPerson, setSelectedPerson] = useState<BirthdayPerson | null>(null);
  const { aniversariantes, isLoading, error } = useBirthdayData();

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
            <Cake className="h-5 w-5 text-primary mr-2 shrink-0 self-center" />
            <span className="leading-normal">Aniversariantes</span>
            <Badge variant="secondary" className="ml-auto">
              {isLoading ? '...' : aniversariantes.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Estado de loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
            </div>
          )}

          {/* Estado de erro */}
          {error && !isLoading && (
            <div className="flex items-center justify-center py-8 text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Lista vazia */}
          {!isLoading && !error && aniversariantes.length === 0 && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Cake className="h-5 w-5 mr-2" />
              <span className="text-sm">Nenhum aniversariante este mês</span>
            </div>
          )}

          {/* Lista de aniversariantes com scroll */}
          {!isLoading && !error && aniversariantes.length > 0 && (
            <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
              {aniversariantes.map((person, index) => (
                <div
                  key={person.matricula || index}
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
            </div>
          )}

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