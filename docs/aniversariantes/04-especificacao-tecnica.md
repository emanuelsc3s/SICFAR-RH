# 🔧 Especificação Técnica

## Visão Geral

Especificação detalhada dos hooks customizados, serviços e utilitários para a funcionalidade de rede social de aniversariantes.

---

## 🪝 Hooks Customizados

### 1. useCurrentUser

**Localização:** `src/hooks/useCurrentUser.ts`

**Responsabilidade:** Gerenciar dados do usuário logado.

**Interface:**
```typescript
interface CurrentUser {
  matricula: string;
  nome: string;
  cpf: string;
  email: string;
  dataNascimento: string;
  loginTimestamp: string;
}

interface UseCurrentUserReturn {
  user: CurrentUser | null;
  isLoggedIn: boolean;
  matricula: string | null;
  nome: string | null;
}

function useCurrentUser(): UseCurrentUserReturn
```

**Implementação:**
```typescript
export function useCurrentUser(): UseCurrentUserReturn {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('colaborador');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return {
    user,
    isLoggedIn: !!user,
    matricula: user?.matricula || null,
    nome: user?.nome || null,
  };
}
```

**Uso:**
```typescript
const { user, isLoggedIn, matricula, nome } = useCurrentUser();

if (!isLoggedIn) {
  return <div>Faça login para continuar</div>;
}
```

---

### 2. useBirthdayLikes

**Localização:** `src/hooks/useBirthdayLikes.ts`

**Responsabilidade:** Gerenciar curtidas de aniversariantes.

**Interface:**
```typescript
interface UseBirthdayLikesReturn {
  totalLikes: number;
  isLiked: boolean;
  toggleLike: () => void;
  isLoading: boolean;
}

function useBirthdayLikes(
  funcionarioMatricula: string
): UseBirthdayLikesReturn
```

**Implementação:**
```typescript
export function useBirthdayLikes(
  funcionarioMatricula: string
): UseBirthdayLikesReturn {
  const { matricula: autorMatricula, isLoggedIn } = useCurrentUser();
  const [totalLikes, setTotalLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar curtidas ao montar
  useEffect(() => {
    loadLikes();
  }, [funcionarioMatricula, autorMatricula]);

  const loadLikes = () => {
    const likes = birthdayStorage.getLikes(funcionarioMatricula);
    setTotalLikes(likes.length);
    
    if (autorMatricula) {
      const userLiked = likes.some(
        like => like.autorMatricula === autorMatricula
      );
      setIsLiked(userLiked);
    }
  };

  const toggleLike = async () => {
    if (!isLoggedIn || !autorMatricula) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para parabenizar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLiked) {
        await birthdayStorage.removeLike(funcionarioMatricula, autorMatricula);
      } else {
        await birthdayStorage.addLike(funcionarioMatricula, autorMatricula);
      }
      
      loadLikes();
      
      toast({
        title: isLiked ? "Curtida removida" : "Parabéns enviado!",
        description: isLiked 
          ? "Você removeu sua felicitação" 
          : "Sua felicitação foi registrada",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar sua ação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { totalLikes, isLiked, toggleLike, isLoading };
}
```

**Uso:**
```typescript
const { totalLikes, isLiked, toggleLike, isLoading } = useBirthdayLikes(
  person.matricula
);

<Button onClick={toggleLike} disabled={isLoading}>
  {isLiked ? "Curtido" : "Parabenizar"}
</Button>
```

---

### 3. useBirthdayComments

**Localização:** `src/hooks/useBirthdayComments.ts`

**Responsabilidade:** Gerenciar comentários de aniversariantes.

**Interface:**
```typescript
interface UseBirthdayCommentsReturn {
  comments: ComentarioAniversario[];
  addComment: (mensagem: string) => Promise<void>;
  removeComment: (commentId: string) => Promise<void>;
  isLoading: boolean;
}

function useBirthdayComments(
  funcionarioMatricula: string
): UseBirthdayCommentsReturn
```

**Implementação:**
```typescript
export function useBirthdayComments(
  funcionarioMatricula: string
): UseBirthdayCommentsReturn {
  const { user, isLoggedIn } = useCurrentUser();
  const [comments, setComments] = useState<ComentarioAniversario[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar comentários ao montar
  useEffect(() => {
    loadComments();
  }, [funcionarioMatricula]);

  const loadComments = () => {
    const allComments = birthdayStorage.getComments(funcionarioMatricula);
    setComments(allComments);
  };

  const addComment = async (mensagem: string) => {
    if (!isLoggedIn || !user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para comentar",
        variant: "destructive",
      });
      return;
    }

    if (!mensagem.trim()) {
      toast({
        title: "Erro",
        description: "O comentário não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    if (mensagem.length > 500) {
      toast({
        title: "Erro",
        description: "O comentário não pode ter mais de 500 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await birthdayStorage.addComment({
        funcionarioMatricula,
        autorMatricula: user.matricula,
        autorNome: user.nome,
        mensagem: mensagem.trim(),
      });

      loadComments();

      toast({
        title: "Felicitação enviada!",
        description: "Seu comentário foi adicionado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar comentário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeComment = async (commentId: string) => {
    if (!isLoggedIn || !user) return;

    setIsLoading(true);

    try {
      await birthdayStorage.removeComment(commentId, user.matricula);
      loadComments();

      toast({
        title: "Comentário removido",
        description: "Seu comentário foi removido com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover comentário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { comments, addComment, removeComment, isLoading };
}
```

**Uso:**
```typescript
const { comments, addComment, removeComment, isLoading } = useBirthdayComments(
  person.matricula
);

<BirthdayCommentSection 
  comments={comments}
  onAddComment={addComment}
  onRemoveComment={removeComment}
  isLoading={isLoading}
/>
```

---

## 🗄️ Serviço de Armazenamento

### birthdayStorage

**Localização:** `src/services/birthdayStorage.ts`

**Responsabilidade:** Abstração para localStorage com interface compatível com Supabase.

**Interface:**
```typescript
interface BirthdayStorage {
  // Curtidas
  getLikes(funcionarioMatricula: string): CurtidaAniversario[];
  addLike(funcionarioMatricula: string, autorMatricula: string): Promise<void>;
  removeLike(funcionarioMatricula: string, autorMatricula: string): Promise<void>;
  
  // Comentários
  getComments(funcionarioMatricula: string): ComentarioAniversario[];
  addComment(data: NovoComentario): Promise<ComentarioAniversario>;
  removeComment(commentId: string, autorMatricula: string): Promise<void>;
}
```

**Implementação (resumida):**
```typescript
const STORAGE_KEYS = {
  likes: `birthday_likes_${new Date().getFullYear()}`,
  comments: `birthday_comments_${new Date().getFullYear()}`,
};

export const birthdayStorage = {
  // Curtidas
  getLikes(funcionarioMatricula: string): CurtidaAniversario[] {
    const allLikes = this._getAllLikes();
    return allLikes.filter(
      like => like.funcionarioMatricula === funcionarioMatricula
    );
  },

  async addLike(funcionarioMatricula: string, autorMatricula: string): Promise<void> {
    const allLikes = this._getAllLikes();
    
    // Verificar se já existe
    const exists = allLikes.some(
      like => 
        like.funcionarioMatricula === funcionarioMatricula &&
        like.autorMatricula === autorMatricula
    );
    
    if (exists) return;

    const newLike: CurtidaAniversario = {
      id: crypto.randomUUID(),
      funcionarioMatricula,
      autorMatricula,
      ano: new Date().getFullYear(),
      createdAt: new Date().toISOString(),
    };

    allLikes.push(newLike);
    this._saveLikes(allLikes);
  },

  // ... outros métodos
};
```

---

## 📦 Tipos TypeScript

**Localização:** `src/types/aniversariante.ts`

```typescript
export interface BirthdayPerson {
  name: string;
  department: string;
  date: string;
  avatar?: string;
  admissionDate: string;
  birthDate: string;
  matricula?: string; // ADICIONAR
}

export interface CurtidaAniversario {
  id: string;
  funcionarioMatricula: string;
  autorMatricula: string;
  ano: number;
  createdAt: string;
}

export interface ComentarioAniversario {
  id: string;
  funcionarioMatricula: string;
  autorMatricula: string;
  autorNome: string;
  autorAvatar?: string;
  mensagem: string;
  ano: number;
  createdAt: string;
  updatedAt: string;
}

export interface NovoComentario {
  funcionarioMatricula: string;
  autorMatricula: string;
  autorNome: string;
  autorAvatar?: string;
  mensagem: string;
}
```

---

## 🛠️ Utilitários

**Localização:** `src/utils/birthdayHelpers.ts`

```typescript
// Gerar iniciais do nome
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Formatar data relativa
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Agora';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min atrás`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
  
  return format(date, "dd/MM/yyyy 'às' HH:mm");
}

// Validar mensagem
export function validateMessage(message: string): { valid: boolean; error?: string } {
  if (!message.trim()) {
    return { valid: false, error: 'Mensagem não pode estar vazia' };
  }
  
  if (message.length > 500) {
    return { valid: false, error: 'Mensagem muito longa (máx. 500 caracteres)' };
  }
  
  return { valid: true };
}
```

---

## 🎨 Constantes e Configurações

```typescript
// src/config/birthday.ts

export const BIRTHDAY_CONFIG = {
  MAX_COMMENT_LENGTH: 500,
  COMMENTS_PER_PAGE: 20,
  STORAGE_YEAR: new Date().getFullYear(),
  TOAST_DURATION: 3000,
};

export const BIRTHDAY_MESSAGES = {
  LIKE_SUCCESS: 'Parabéns enviado com sucesso!',
  LIKE_REMOVED: 'Curtida removida',
  COMMENT_SUCCESS: 'Felicitação adicionada!',
  COMMENT_REMOVED: 'Comentário removido',
  ERROR_NOT_LOGGED: 'Você precisa estar logado',
  ERROR_EMPTY_MESSAGE: 'Mensagem não pode estar vazia',
  ERROR_MESSAGE_TOO_LONG: 'Mensagem muito longa (máx. 500 caracteres)',
};
```

