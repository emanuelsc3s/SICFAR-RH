# 🎂 Funcionalidade de Rede Social para Aniversariantes

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Dados](#estrutura-de-dados)
3. [Arquitetura de Componentes](#arquitetura-de-componentes)
4. [Fluxo de Interação](#fluxo-de-interação)
5. [Especificação Técnica](#especificação-técnica)
6. [Guia de Migração](#guia-de-migração)

---

## 🎯 Visão Geral

Sistema de interação social para aniversariantes do SICFAR-RH que permite:

- ❤️ **Curtir/Descurtir** aniversariantes
- 💬 **Comentar** felicitações
- 👁️ **Visualizar** interações de outros colaboradores
- 🗑️ **Remover** próprios comentários

### Fases de Implementação

#### Fase 1: Implementação com localStorage (ATUAL)
- Backend temporário usando localStorage do navegador
- Dados armazenados localmente por ano
- Estrutura de dados compatível com Supabase
- Fácil migração futura

#### Fase 2: Migração para Supabase (FUTURO)
- Persistência em banco de dados
- Sincronização entre dispositivos
- Row Level Security (RLS)
- Backup e recuperação de dados

---

## 📊 Estrutura de Dados

### localStorage (Fase 1 - Implementação Atual)

#### Chaves de Armazenamento

```typescript
// Curtidas do ano atual
birthday_likes_2025: CurtidaAniversario[]

// Comentários do ano atual
birthday_comments_2025: ComentarioAniversario[]
```

#### Estrutura de Dados - Curtidas

```typescript
interface CurtidaAniversario {
  id: string;                    // UUID gerado no frontend
  funcionarioMatricula: string;  // Matrícula do aniversariante
  autorMatricula: string;        // Matrícula de quem curtiu
  ano: number;                   // Ano da curtida (2025)
  createdAt: string;             // ISO timestamp
}
```

**Exemplo:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "funcionarioMatricula": "12345",
  "autorMatricula": "67890",
  "ano": 2025,
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

#### Estrutura de Dados - Comentários

```typescript
interface ComentarioAniversario {
  id: string;                    // UUID gerado no frontend
  funcionarioMatricula: string;  // Matrícula do aniversariante
  autorMatricula: string;        // Matrícula de quem comentou
  autorNome: string;             // Nome de quem comentou
  autorAvatar?: string;          // Avatar de quem comentou
  mensagem: string;              // Texto do comentário (max 500 chars)
  ano: number;                   // Ano do comentário (2025)
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}
```

**Exemplo:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "funcionarioMatricula": "12345",
  "autorMatricula": "67890",
  "autorNome": "Maria Silva",
  "autorAvatar": "https://...",
  "mensagem": "Parabéns! Muita saúde e sucesso!",
  "ano": 2025,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

### Supabase (Fase 2 - Implementação Futura)

Consulte: [01-estrutura-banco-dados.md](./01-estrutura-banco-dados.md)

---

## 🏗️ Arquitetura de Componentes

Consulte: [02-arquitetura-componentes.md](./02-arquitetura-componentes.md)

---

## 🔄 Fluxo de Interação

Consulte: [03-fluxo-interacao.md](./03-fluxo-interacao.md)

---

## 🔧 Especificação Técnica

Consulte: [04-especificacao-tecnica.md](./04-especificacao-tecnica.md)

---

## 🚀 Guia de Migração

Consulte: [05-guia-migracao.md](./05-guia-migracao.md)

---

## 📝 Notas de Implementação

### Limitações do localStorage

- ⚠️ Dados armazenados apenas no navegador local
- ⚠️ Não sincroniza entre dispositivos
- ⚠️ Pode ser limpo pelo usuário
- ⚠️ Limite de ~5-10MB por domínio

### Vantagens do localStorage (Fase 1)

- ✅ Implementação rápida
- ✅ Sem necessidade de configuração de backend
- ✅ Testes locais sem dependências externas
- ✅ Estrutura compatível com migração futura

---

## 📅 Cronograma

| Fase | Descrição | Status |
|------|-----------|--------|
| 1.1 | Documentação completa | ✅ Concluído |
| 1.2 | Implementação localStorage | ✅ Concluído |
| 1.3 | Testes e validação | 🔄 Em andamento |
| 2.1 | Configuração Supabase | ⏳ Pendente |
| 2.2 | Migração de dados | ⏳ Pendente |
| 2.3 | Deploy em produção | ⏳ Pendente |

---

## 📚 Documentação Adicional

- 📖 [**IMPLEMENTACAO.md**](./IMPLEMENTACAO.md) - Guia de implementação e arquivos criados
- 🧪 [**GUIA-TESTE.md**](./GUIA-TESTE.md) - Guia completo de testes
- 💡 [**EXEMPLOS-USO.md**](./EXEMPLOS-USO.md) - Exemplos práticos de uso
- 📊 [**RESUMO-EXECUTIVO.md**](./RESUMO-EXECUTIVO.md) - Resumo executivo do projeto
- ✅ [**CHECKLIST.md**](./CHECKLIST.md) - Checklist de implementação
- ❓ [**FAQ.md**](./FAQ.md) - Perguntas frequentes

---

## 🚀 Quick Start

1. **Testar a funcionalidade:**
   ```bash
   # Certifique-se de estar logado no sistema
   # Acesse a página inicial
   # Clique em qualquer aniversariante no card da sidebar
   ```

2. **Verificar dados no localStorage:**
   ```javascript
   // Abrir console do navegador (F12)
   JSON.parse(localStorage.getItem('birthday_likes_2025'))
   JSON.parse(localStorage.getItem('birthday_comments_2025'))
   ```

3. **Consultar documentação:**
   - Leia `IMPLEMENTACAO.md` para entender o que foi implementado
   - Siga `GUIA-TESTE.md` para testar todas as funcionalidades
   - Veja `EXEMPLOS-USO.md` para exemplos de código

