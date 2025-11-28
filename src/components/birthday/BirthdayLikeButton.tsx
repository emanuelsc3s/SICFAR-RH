/**
 * Componente de botão de curtida para aniversariantes
 */

import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBirthdayLikes } from '@/hooks/useBirthdayLikes';

interface BirthdayLikeButtonProps {
  funcionarioMatricula: string;
}

export function BirthdayLikeButton({ funcionarioMatricula }: BirthdayLikeButtonProps) {
  const { totalLikes, isLiked, toggleLike, isLoading } = useBirthdayLikes(funcionarioMatricula);

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Heart className="h-5 w-5" />
        <span className="text-sm font-medium">
          {totalLikes} {totalLikes === 1 ? 'curtida' : 'curtidas'}
        </span>
      </div>

      <Button
        onClick={toggleLike}
        disabled={isLoading}
        variant={isLiked ? 'default' : 'outline'}
        size="sm"
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            {isLiked ? 'Curtido' : 'Parabenizar'}
          </>
        )}
      </Button>
    </div>
  );
}

