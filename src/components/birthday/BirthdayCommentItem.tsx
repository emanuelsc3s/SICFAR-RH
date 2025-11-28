/**
 * Componente de item individual de comentário
 */

import { Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { ComentarioAniversario } from '@/types/aniversariante';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BirthdayCommentItemProps {
  comment: ComentarioAniversario;
  onRemove: (commentId: string) => void;
}

export function BirthdayCommentItem({ comment, onRemove }: BirthdayCommentItemProps) {
  const { matricula } = useCurrentUser();
  const canRemove = matricula === comment.autorMatricula;

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarImage src={comment.autorAvatar} alt={comment.autorNome} />
        <AvatarFallback className="text-xs">
          {getInitials(comment.autorNome)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{comment.autorNome}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(comment.createdAt)}
            </p>
          </div>

          {canRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(comment.id)}
              title="Remover comentário"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="text-sm mt-2 whitespace-pre-wrap break-words">
          {comment.mensagem}
        </p>
      </div>
    </div>
  );
}

