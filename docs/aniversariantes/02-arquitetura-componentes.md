# 🏗️ Arquitetura de Componentes React

## Visão Geral

Sistema modular de componentes React para funcionalidade de rede social de aniversariantes.

---

## 📐 Diagrama de Arquitetura

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APRESENTAÇÃO                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐              ┌──────────────────────┐              │
│  │  Index.tsx      │              │ Aniversariantes.tsx  │              │
│  │  (Página Home)  │              │ (Página Completa)    │              │
│  └────────┬────────┘              └──────────┬───────────┘              │
│           │                                  │                          │
│           │         ┌────────────────────────┘                          │
│           │         │                                                    │
│           ▼         ▼                                                    │
│  ┌─────────────────────────────┐                                        │
│  │    BirthdayCard.tsx         │  ◄── Modificado (adicionar onClick)   │
│  │    (Lista de 4 pessoas)     │                                        │
│  └──────────────┬──────────────┘                                        │
│                 │                                                        │
│                 │ onClick(person)                                        │
│                 ▼                                                        │
│  ┌──────────────────────────────────────────────────────┐               │
│  │         BirthdayDetailModal.tsx (NOVO)               │               │
│  │         ┌──────────────────────────────────┐         │               │
│  │         │  Header: Avatar + Nome + Depto   │         │               │
│  │         └──────────────────────────────────┘         │               │
│  │         ┌──────────────────────────────────┐         │               │
│  │         │  BirthdayLikeButton.tsx (NOVO)   │         │               │
│  │         │  ❤️ 15 curtidas [Parabenizar]    │         │               │
│  │         └──────────────────────────────────┘         │               │
│  │         ┌──────────────────────────────────┐         │               │
│  │         │ BirthdayCommentSection.tsx (NOVO)│         │               │
│  │         │  ├─ BirthdayCommentList          │         │               │
│  │         │  │   └─ BirthdayCommentItem (N)  │         │               │
│  │         │  └─ BirthdayCommentForm          │         │               │
│  │         └──────────────────────────────────┘         │               │
│  └──────────────────────────────────────────────────────┘               │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE LÓGICA (HOOKS)                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │useBirthdayLikes  │  │useBirthdayComments│ │useCurrentUser    │      │
│  │                  │  │                   │  │                  │      │
│  │- totalLikes      │  │- comments[]       │  │- user            │      │
│  │- isLiked         │  │- addComment()     │  │- isLoggedIn      │      │
│  │- toggleLike()    │  │- removeComment()  │  │- matricula       │      │
│  │- isLoading       │  │- isLoading        │  │- nome            │      │
│  └────────┬─────────┘  └────────┬──────────┘  └────────┬─────────┘      │
│           │                     │                      │                │
│           └─────────────────────┼──────────────────────┘                │
│                                 │                                        │
│                                 ▼                                        │
│                  ┌──────────────────────────────┐                       │
│                  │  birthdayStorage.ts (NOVO)   │                       │
│                  │  (Abstração localStorage)    │                       │
│                  │                              │                       │
│                  │  - getLikes()                │                       │
│                  │  - addLike()                 │                       │
│                  │  - removeLike()              │                       │
│                  │  - getComments()             │                       │
│                  │  - addComment()              │                       │
│                  │  - removeComment()           │                       │
│                  └──────────────┬───────────────┘                       │
│                                 │                                        │
│                                 ▼                                        │
│                  ┌──────────────────────────────┐                       │
│                  │      localStorage            │                       │
│                  │  - birthday_likes_2025       │                       │
│                  │  - birthday_comments_2025    │                       │
│                  └──────────────────────────────┘                       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Componentes

### 1. BirthdayDetailModal (NOVO)

**Localização:** `src/components/birthday/BirthdayDetailModal.tsx`

**Responsabilidade:** Modal principal que exibe detalhes do aniversariante e todas as interações.

**Props:**
```typescript
interface BirthdayDetailModalProps {
  person: BirthdayPerson | null;
  isOpen: boolean;
  onClose: () => void;
}
```

**Estrutura:**
```tsx
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent>
    {/* Header com Avatar, Nome, Departamento */}
    <BirthdayHeader person={person} />
    
    {/* Seção de Curtidas */}
    <BirthdayLikeButton 
      funcionarioMatricula={person.matricula}
    />
    
    {/* Seção de Comentários */}
    <BirthdayCommentSection 
      funcionarioMatricula={person.matricula}
    />
  </DialogContent>
</Dialog>
```

---

### 2. BirthdayLikeButton (NOVO)

**Localização:** `src/components/birthday/BirthdayLikeButton.tsx`

**Responsabilidade:** Botão de curtir/descurtir com contador.

**Props:**
```typescript
interface BirthdayLikeButtonProps {
  funcionarioMatricula: string;
}
```

**Estrutura:**
```tsx
<div className="flex items-center gap-4">
  <div className="flex items-center gap-2">
    <Heart className="h-5 w-5" />
    <span>{totalLikes} curtidas</span>
  </div>
  
  <Button 
    onClick={handleToggleLike}
    variant={isLiked ? "default" : "outline"}
  >
    <Heart className={isLiked ? "fill-current" : ""} />
    {isLiked ? "Curtido" : "Parabenizar"}
  </Button>
</div>
```

**Hook utilizado:** `useBirthdayLikes(funcionarioMatricula)`

---

### 3. BirthdayCommentSection (NOVO)

**Localização:** `src/components/birthday/BirthdayCommentSection.tsx`

**Responsabilidade:** Container para lista de comentários e formulário.

**Props:**
```typescript
interface BirthdayCommentSectionProps {
  funcionarioMatricula: string;
}
```

**Estrutura:**
```tsx
<div className="space-y-4">
  <h3>Felicitações ({comments.length})</h3>
  
  {/* Lista de comentários */}
  <BirthdayCommentList 
    comments={comments}
    onRemove={handleRemoveComment}
  />
  
  {/* Formulário de novo comentário */}
  <BirthdayCommentForm 
    onSubmit={handleAddComment}
  />
</div>
```

**Hook utilizado:** `useBirthdayComments(funcionarioMatricula)`

---

### 4. BirthdayCommentList (NOVO)

**Localização:** `src/components/birthday/BirthdayCommentList.tsx`

**Responsabilidade:** Lista de comentários com scroll.

**Props:**
```typescript
interface BirthdayCommentListProps {
  comments: ComentarioAniversario[];
  onRemove: (commentId: string) => void;
}
```

**Estrutura:**
```tsx
<ScrollArea className="h-[300px]">
  {comments.length === 0 ? (
    <EmptyState />
  ) : (
    comments.map(comment => (
      <BirthdayCommentItem 
        key={comment.id}
        comment={comment}
        onRemove={onRemove}
      />
    ))
  )}
</ScrollArea>
```

---

### 5. BirthdayCommentItem (NOVO)

**Localização:** `src/components/birthday/BirthdayCommentItem.tsx`

**Responsabilidade:** Item individual de comentário.

**Props:**
```typescript
interface BirthdayCommentItemProps {
  comment: ComentarioAniversario;
  onRemove: (commentId: string) => void;
}
```

**Estrutura:**
```tsx
<div className="flex gap-3 p-3 rounded-lg border">
  <Avatar>
    <AvatarImage src={comment.autorAvatar} />
    <AvatarFallback>{getInitials(comment.autorNome)}</AvatarFallback>
  </Avatar>
  
  <div className="flex-1">
    <div className="flex items-center justify-between">
      <span className="font-semibold">{comment.autorNome}</span>
      <span className="text-xs text-muted-foreground">
        {formatDate(comment.createdAt)}
      </span>
    </div>
    
    <p className="text-sm mt-1">{comment.mensagem}</p>
    
    {canRemove && (
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onRemove(comment.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    )}
  </div>
</div>
```

---

### 6. BirthdayCommentForm (NOVO)

**Localização:** `src/components/birthday/BirthdayCommentForm.tsx`

**Responsabilidade:** Formulário para adicionar novo comentário.

**Props:**
```typescript
interface BirthdayCommentFormProps {
  onSubmit: (mensagem: string) => Promise<void>;
}
```

**Estrutura:**
```tsx
<form onSubmit={handleSubmit}>
  <Textarea 
    placeholder="Escreva sua mensagem de parabéns..."
    value={mensagem}
    onChange={(e) => setMensagem(e.target.value)}
    maxLength={500}
  />
  
  <div className="flex items-center justify-between mt-2">
    <span className="text-xs text-muted-foreground">
      {mensagem.length}/500
    </span>
    
    <Button type="submit" disabled={!mensagem.trim()}>
      <MessageCircle className="h-4 w-4 mr-2" />
      Enviar Felicitação
    </Button>
  </div>
</form>
```

---

## 🔄 Modificações em Componentes Existentes

### BirthdayCard.tsx (MODIFICAR)

**Mudanças necessárias:**

1. Adicionar prop `onPersonClick`:
```typescript
interface BirthdayCardProps {
  onPersonClick?: (person: BirthdayPerson) => void;
}
```

2. Tornar cards clicáveis:
```tsx
<div 
  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
  onClick={() => onPersonClick?.(person)}
>
  {/* Conteúdo existente */}
</div>
```

3. Adicionar indicadores visuais (opcional):
```tsx
<div className="flex items-center gap-1 text-xs text-muted-foreground">
  <Heart className="h-3 w-3" />
  <span>{getLikesCount(person.matricula)}</span>
</div>
```

---

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── BirthdayCard.tsx                      # ✏️ MODIFICAR
│   └── birthday/                             # 📁 NOVO DIRETÓRIO
│       ├── BirthdayDetailModal.tsx           # 🆕 CRIAR
│       ├── BirthdayLikeButton.tsx            # 🆕 CRIAR
│       ├── BirthdayCommentSection.tsx        # 🆕 CRIAR
│       ├── BirthdayCommentList.tsx           # 🆕 CRIAR
│       ├── BirthdayCommentItem.tsx           # 🆕 CRIAR
│       └── BirthdayCommentForm.tsx           # 🆕 CRIAR
├── hooks/
│   ├── useBirthdayLikes.ts                   # 🆕 CRIAR
│   ├── useBirthdayComments.ts                # 🆕 CRIAR
│   └── useCurrentUser.ts                     # 🆕 CRIAR
├── services/
│   └── birthdayStorage.ts                    # 🆕 CRIAR
├── types/
│   └── aniversariante.ts                     # 🆕 CRIAR
└── utils/
    └── birthdayHelpers.ts                    # 🆕 CRIAR (opcional)
```

---

## 🎨 Componentes UI Reutilizados

Componentes do shadcn/ui já disponíveis:

- ✅ `Dialog` - Modal principal
- ✅ `Avatar` - Foto do usuário
- ✅ `Button` - Botões de ação
- ✅ `Textarea` - Campo de comentário
- ✅ `ScrollArea` - Lista de comentários
- ✅ `Badge` - Tags e labels
- ✅ `Card` - Containers

---

## 🔌 Integração com Páginas

### Index.tsx

```tsx
import { BirthdayDetailModal } from '@/components/birthday/BirthdayDetailModal';

function Index() {
  const [selectedPerson, setSelectedPerson] = useState<BirthdayPerson | null>(null);
  
  return (
    <>
      <BirthdayCard onPersonClick={setSelectedPerson} />
      
      <BirthdayDetailModal 
        person={selectedPerson}
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />
    </>
  );
}
```

### Aniversariantes.tsx

```tsx
// Similar ao Index.tsx
const [selectedPerson, setSelectedPerson] = useState<BirthdayPerson | null>(null);

// Adicionar onClick nos cards da lista
```

