/**
 * Componente de formulário para adicionar comentários
 */

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface BirthdayCommentFormProps {
  onSubmit: (mensagem: string) => Promise<void>;
  isLoading?: boolean;
}

export function BirthdayCommentForm({ onSubmit, isLoading = false }: BirthdayCommentFormProps) {
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mensagem.trim()) return;

    await onSubmit(mensagem);
    setMensagem(''); // Limpar formulário após envio
  };

  const isDisabled = !mensagem.trim() || isLoading;
  const charCount = mensagem.length;
  const maxChars = 500;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Escreva sua mensagem de parabéns..."
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        maxLength={maxChars}
        rows={3}
        disabled={isLoading}
        className="resize-none"
      />

      <div className="flex items-center justify-between">
        <span className={`text-xs ${charCount > maxChars * 0.9 ? 'text-destructive' : 'text-muted-foreground'}`}>
          {charCount}/{maxChars}
        </span>

        <Button type="submit" disabled={isDisabled} size="sm" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Enviar Felicitação
        </Button>
      </div>
    </form>
  );
}

