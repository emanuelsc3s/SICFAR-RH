/**
 * Componente de seção de comentários (lista + formulário)
 */

import { Separator } from '@/components/ui/separator';
import { BirthdayCommentList } from './BirthdayCommentList';
import { BirthdayCommentForm } from './BirthdayCommentForm';
import { useBirthdayComments } from '@/hooks/useBirthdayComments';

interface BirthdayCommentSectionProps {
  funcionarioMatricula: string;
}

export function BirthdayCommentSection({ funcionarioMatricula }: BirthdayCommentSectionProps) {
  const { comments, addComment, removeComment, isLoading } = useBirthdayComments(funcionarioMatricula);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">
          Felicitações ({comments.length})
        </h3>
        <p className="text-sm text-muted-foreground">
          Deixe uma mensagem de parabéns
        </p>
      </div>

      <Separator />

      <BirthdayCommentList comments={comments} onRemove={removeComment} />

      <Separator />

      <BirthdayCommentForm onSubmit={addComment} isLoading={isLoading} />
    </div>
  );
}

