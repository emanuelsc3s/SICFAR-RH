# 💡 Exemplos de Uso - Funcionalidade de Rede Social de Aniversariantes

## 📚 Índice

1. [Uso Básico](#uso-básico)
2. [Integração em Outras Páginas](#integração-em-outras-páginas)
3. [Customização](#customização)
4. [Debugging](#debugging)

---

## 🎯 Uso Básico

### Exemplo 1: Usar o Modal em Qualquer Componente

```tsx
import { useState } from 'react';
import { BirthdayDetailModal } from '@/components/birthday/BirthdayDetailModal';
import type { BirthdayPerson } from '@/types/aniversariante';

function MeuComponente() {
  const [selectedPerson, setSelectedPerson] = useState<BirthdayPerson | null>(null);

  const aniversariante: BirthdayPerson = {
    name: "MARIA SILVA",
    department: "RH",
    date: "15/01",
    birthDate: "15.01.1990",
    admissionDate: "10.03.2020",
    matricula: "12345",
    avatar: "https://..."
  };

  return (
    <>
      <button onClick={() => setSelectedPerson(aniversariante)}>
        Ver Detalhes
      </button>

      <BirthdayDetailModal
        person={selectedPerson}
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />
    </>
  );
}
```

---

### Exemplo 2: Usar Hook de Curtidas Diretamente

```tsx
import { useBirthdayLikes } from '@/hooks/useBirthdayLikes';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

function MeuBotaoCurtida({ matricula }: { matricula: string }) {
  const { totalLikes, isLiked, toggleLike, isLoading } = useBirthdayLikes(matricula);

  return (
    <div className="flex items-center gap-2">
      <span>{totalLikes} curtidas</span>
      <Button onClick={toggleLike} disabled={isLoading}>
        <Heart className={isLiked ? 'fill-current' : ''} />
        {isLiked ? 'Curtido' : 'Curtir'}
      </Button>
    </div>
  );
}
```

---

### Exemplo 3: Usar Hook de Comentários Diretamente

```tsx
import { useBirthdayComments } from '@/hooks/useBirthdayComments';
import { useState } from 'react';

function MinhaSecaoComentarios({ matricula }: { matricula: string }) {
  const { comments, addComment, removeComment, isLoading } = useBirthdayComments(matricula);
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addComment(mensagem);
    setMensagem('');
  };

  return (
    <div>
      <h3>Comentários ({comments.length})</h3>
      
      {comments.map(comment => (
        <div key={comment.id}>
          <p><strong>{comment.autorNome}</strong></p>
          <p>{comment.mensagem}</p>
          <button onClick={() => removeComment(comment.id)}>Remover</button>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          maxLength={500}
        />
        <button type="submit" disabled={isLoading}>Enviar</button>
      </form>
    </div>
  );
}
```

---

## 🔗 Integração em Outras Páginas

### Exemplo 4: Integrar na Página Aniversariantes.tsx

```tsx
// src/pages/Aniversariantes.tsx
import { useState } from 'react';
import { BirthdayDetailModal } from '@/components/birthday/BirthdayDetailModal';
import type { BirthdayPerson } from '@/types/aniversariante';

function Aniversariantes() {
  const [selectedPerson, setSelectedPerson] = useState<BirthdayPerson | null>(null);

  // ... código existente ...

  return (
    <div>
      {/* Lista de aniversariantes */}
      {birthdayData.map((person) => (
        <div 
          key={person.matricula}
          onClick={() => setSelectedPerson(person)}
          className="cursor-pointer hover:bg-muted/50"
        >
          {/* Card do aniversariante */}
        </div>
      ))}

      {/* Modal de detalhes */}
      <BirthdayDetailModal
        person={selectedPerson}
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />
    </div>
  );
}
```

---

### Exemplo 5: Criar Card Customizado com Indicadores

```tsx
import { useBirthdayLikes } from '@/hooks/useBirthdayLikes';
import { useBirthdayComments } from '@/hooks/useBirthdayComments';
import { Heart, MessageCircle } from 'lucide-react';

function BirthdayCardWithStats({ person }: { person: BirthdayPerson }) {
  const { totalLikes } = useBirthdayLikes(person.matricula || '');
  const { comments } = useBirthdayComments(person.matricula || '');

  return (
    <div className="p-4 border rounded-lg">
      <h3>{person.name}</h3>
      <p>{person.department}</p>
      
      {/* Indicadores de interação */}
      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Heart className="h-4 w-4" />
          <span>{totalLikes}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" />
          <span>{comments.length}</span>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎨 Customização

### Exemplo 6: Customizar Mensagens de Toast

```tsx
import { useBirthdayLikes } from '@/hooks/useBirthdayLikes';
import { useToast } from '@/hooks/use-toast';

function BotaoCurtidaCustomizado({ matricula }: { matricula: string }) {
  const { toggleLike } = useBirthdayLikes(matricula);
  const { toast } = useToast();

  const handleLike = async () => {
    await toggleLike();
    
    // Toast customizado
    toast({
      title: "🎉 Parabéns enviado!",
      description: "Sua felicitação foi registrada com carinho",
      duration: 5000,
    });
  };

  return <button onClick={handleLike}>Parabenizar</button>;
}
```

---

### Exemplo 7: Adicionar Validação Customizada

```tsx
import { useBirthdayComments } from '@/hooks/useBirthdayComments';
import { useToast } from '@/hooks/use-toast';

function FormularioComentarioCustomizado({ matricula }: { matricula: string }) {
  const { addComment } = useBirthdayComments(matricula);
  const { toast } = useToast();
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação customizada
    if (mensagem.includes('palavrão')) {
      toast({
        title: "Erro",
        description: "Por favor, use linguagem apropriada",
        variant: "destructive",
      });
      return;
    }

    await addComment(mensagem);
    setMensagem('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
      <button type="submit">Enviar</button>
    </form>
  );
}
```

---

## 🐛 Debugging

### Exemplo 8: Verificar Dados no localStorage

```javascript
// Abrir console do navegador (F12) e executar:

// Ver todas as curtidas do ano atual
const likes = JSON.parse(localStorage.getItem('birthday_likes_2025'));
console.table(likes);

// Ver todos os comentários do ano atual
const comments = JSON.parse(localStorage.getItem('birthday_comments_2025'));
console.table(comments);

// Ver dados do usuário logado
const user = JSON.parse(localStorage.getItem('colaborador'));
console.log('Usuário logado:', user);
```

---

### Exemplo 9: Limpar Dados de Teste

```javascript
// Limpar todas as curtidas
localStorage.removeItem('birthday_likes_2025');

// Limpar todos os comentários
localStorage.removeItem('birthday_comments_2025');

// Limpar tudo relacionado a aniversariantes
Object.keys(localStorage)
  .filter(key => key.startsWith('birthday_'))
  .forEach(key => localStorage.removeItem(key));

// Recarregar página
location.reload();
```

---

### Exemplo 10: Adicionar Dados de Teste Manualmente

```javascript
// Adicionar curtidas de teste
const testLikes = [
  {
    id: crypto.randomUUID(),
    funcionarioMatricula: "12345",
    autorMatricula: "67890",
    ano: 2025,
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    funcionarioMatricula: "12345",
    autorMatricula: "11111",
    ano: 2025,
    createdAt: new Date().toISOString()
  }
];

localStorage.setItem('birthday_likes_2025', JSON.stringify(testLikes));

// Adicionar comentários de teste
const testComments = [
  {
    id: crypto.randomUUID(),
    funcionarioMatricula: "12345",
    autorMatricula: "67890",
    autorNome: "Maria Silva",
    mensagem: "Parabéns! Muita saúde!",
    ano: 2025,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

localStorage.setItem('birthday_comments_2025', JSON.stringify(testComments));

// Recarregar página
location.reload();
```

---

## 🔧 Utilitários

### Exemplo 11: Usar Funções Auxiliares

```tsx
import { 
  getInitials, 
  formatRelativeDate, 
  validateMessage,
  pluralize 
} from '@/utils/birthdayHelpers';

// Gerar iniciais
const initials = getInitials("MARIA SILVA SANTOS"); // "MS"

// Formatar data relativa
const relativeDate = formatRelativeDate("2025-01-15T10:30:00Z"); // "há 2 horas"

// Validar mensagem
const validation = validateMessage("Minha mensagem");
if (!validation.valid) {
  console.error(validation.error);
}

// Pluralizar
const text = pluralize(5, "curtida", "curtidas"); // "5 curtidas"
```

---

## 📊 Monitoramento

### Exemplo 12: Criar Dashboard de Estatísticas

```tsx
import { birthdayStorage } from '@/services/birthdayStorage';

function DashboardAniversariantes() {
  const [stats, setStats] = useState({
    totalLikes: 0,
    totalComments: 0,
    mostLiked: null,
    mostCommented: null,
  });

  useEffect(() => {
    // Buscar todas as curtidas e comentários
    const allLikes = birthdayStorage._getAllLikes();
    const allComments = birthdayStorage._getAllComments();

    // Calcular estatísticas
    setStats({
      totalLikes: allLikes.length,
      totalComments: allComments.length,
      // ... mais cálculos
    });
  }, []);

  return (
    <div>
      <h2>Estatísticas de Aniversariantes</h2>
      <p>Total de curtidas: {stats.totalLikes}</p>
      <p>Total de comentários: {stats.totalComments}</p>
    </div>
  );
}
```

---

**Dica:** Todos esses exemplos podem ser adaptados conforme suas necessidades específicas!

