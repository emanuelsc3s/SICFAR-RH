/**
 * Modal de detalhes do aniversariante com funcionalidade de rede social
 */

import { Cake, Briefcase, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BirthdayLikeButton } from './BirthdayLikeButton';
import { BirthdayCommentSection } from './BirthdayCommentSection';
import type { BirthdayPerson } from '@/types/aniversariante';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BirthdayDetailModalProps {
  person: BirthdayPerson | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BirthdayDetailModal({ person, isOpen, onClose }: BirthdayDetailModalProps) {
  if (!person) return null;

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatBirthDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getYearsInCompany = (admissionDate: string): number => {
    try {
      const admission = new Date(admissionDate);
      return differenceInYears(new Date(), admission);
    } catch {
      return 0;
    }
  };

  const yearsInCompany = getYearsInCompany(person.admissionDate);

  // Usar matrícula se disponível, senão usar nome como fallback
  const funcionarioMatricula = person.matricula || person.name;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Aniversariante do Mês</DialogTitle>
        </DialogHeader>

        {/* Header com informações do aniversariante */}
        <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
          <Avatar className="h-20 w-20">
            <AvatarImage src={person.avatar} alt={person.name} />
            <AvatarFallback className="text-xl">
              {getInitials(person.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">{person.name}</h2>
            <p className="text-sm text-muted-foreground mb-3">{person.department}</p>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Cake className="h-3 w-3" />
                {formatBirthDate(person.birthDate)}
              </Badge>

              <Badge variant="secondary" className="gap-1">
                <Briefcase className="h-3 w-3" />
                {yearsInCompany} {yearsInCompany === 1 ? 'ano' : 'anos'} na empresa
              </Badge>

              <Badge variant="secondary" className="gap-1">
                <Calendar className="h-3 w-3" />
                Desde {format(new Date(person.admissionDate), 'dd/MM/yyyy')}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Seção de curtidas */}
        <BirthdayLikeButton funcionarioMatricula={funcionarioMatricula} />

        <Separator />

        {/* Seção de comentários */}
        <BirthdayCommentSection funcionarioMatricula={funcionarioMatricula} />
      </DialogContent>
    </Dialog>
  );
}

