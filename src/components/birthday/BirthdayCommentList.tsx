/**
 * Componente de lista de comentários
 */

import { MessageCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BirthdayCommentItem } from './BirthdayCommentItem';
import type { ComentarioAniversario } from '@/types/aniversariante';

interface BirthdayCommentListProps {
  comments: ComentarioAniversario[];
  onRemove: (commentId: string) => void;
}

export function BirthdayCommentList({ comments, onRemove }: BirthdayCommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          Seja o primeiro a parabenizar! 🎉
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-3">
        {comments.map((comment) => (
          <BirthdayCommentItem
            key={comment.id}
            comment={comment}
            onRemove={onRemove}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

