# 🚀 Guia de Migração: localStorage → Supabase

## Visão Geral

Este documento descreve o processo de migração da implementação atual (localStorage) para o Supabase (banco de dados em nuvem).

---

## 📋 Pré-requisitos

### 1. Configuração do Supabase

```bash
# Instalar dependências
npm install @supabase/supabase-js

# Variáveis de ambiente (.env)
VITE_SUPABASE_URL=https://gonbyhpqnqnddqozqvhk.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### 2. Criar Tabelas no Supabase

Execute os scripts SQL do arquivo `01-estrutura-banco-dados.md`:

1. Tabela `funcionarios`
2. Tabela `curtidas_aniversario`
3. Tabela `comentarios_aniversario`
4. Índices e constraints
5. Políticas RLS
6. Triggers

---

## 🔄 Estratégia de Migração

### Fase 1: Preparação (ATUAL)

✅ Implementação com localStorage
✅ Interface de API compatível com Supabase
✅ Estrutura de dados idêntica

### Fase 2: Implementação Paralela

🔄 Criar client Supabase
🔄 Implementar serviço `supabaseStorage.ts`
🔄 Manter ambas implementações (localStorage + Supabase)

### Fase 3: Migração de Dados

🔄 Script de migração de dados existentes
🔄 Validação de dados migrados
🔄 Testes de integridade

### Fase 4: Transição

🔄 Feature flag para alternar entre localStorage/Supabase
🔄 Testes com usuários beta
🔄 Monitoramento de erros

### Fase 5: Finalização

🔄 Remover código de localStorage
🔄 Limpeza de código legado
🔄 Documentação atualizada

---

## 🛠️ Implementação do Supabase Client

### 1. Criar Client

**Arquivo:** `src/services/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. Criar Serviço Supabase

**Arquivo:** `src/services/supabaseStorage.ts`

```typescript
import { supabase } from './supabase';
import type { CurtidaAniversario, ComentarioAniversario, NovoComentario } from '@/types/aniversariante';

export const supabaseStorage = {
  // Curtidas
  async getLikes(funcionarioMatricula: string): Promise<CurtidaAniversario[]> {
    const ano = new Date().getFullYear();
    
    const { data, error } = await supabase
      .from('curtidas_aniversario')
      .select(`
        id,
        funcionario_id,
        autor_matricula,
        ano,
        created_at
      `)
      .eq('funcionario_matricula', funcionarioMatricula)
      .eq('ano', ano);

    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      funcionarioMatricula,
      autorMatricula: item.autor_matricula,
      ano: item.ano,
      createdAt: item.created_at,
    }));
  },

  async addLike(funcionarioMatricula: string, autorMatricula: string): Promise<void> {
    const ano = new Date().getFullYear();
    
    const { error } = await supabase
      .from('curtidas_aniversario')
      .insert({
        funcionario_matricula: funcionarioMatricula,
        autor_matricula: autorMatricula,
        ano,
      });

    if (error) throw error;
  },

  async removeLike(funcionarioMatricula: string, autorMatricula: string): Promise<void> {
    const ano = new Date().getFullYear();
    
    const { error } = await supabase
      .from('curtidas_aniversario')
      .delete()
      .eq('funcionario_matricula', funcionarioMatricula)
      .eq('autor_matricula', autorMatricula)
      .eq('ano', ano);

    if (error) throw error;
  },

  // Comentários
  async getComments(funcionarioMatricula: string): Promise<ComentarioAniversario[]> {
    const ano = new Date().getFullYear();
    
    const { data, error } = await supabase
      .from('comentarios_aniversario')
      .select('*')
      .eq('funcionario_matricula', funcionarioMatricula)
      .eq('ano', ano)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      funcionarioMatricula,
      autorMatricula: item.autor_matricula,
      autorNome: item.autor_nome,
      autorAvatar: item.autor_avatar,
      mensagem: item.mensagem,
      ano: item.ano,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  },

  async addComment(data: NovoComentario): Promise<ComentarioAniversario> {
    const ano = new Date().getFullYear();
    
    const { data: newComment, error } = await supabase
      .from('comentarios_aniversario')
      .insert({
        funcionario_matricula: data.funcionarioMatricula,
        autor_matricula: data.autorMatricula,
        autor_nome: data.autorNome,
        autor_avatar: data.autorAvatar,
        mensagem: data.mensagem,
        ano,
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: newComment.id,
      funcionarioMatricula: data.funcionarioMatricula,
      autorMatricula: data.autorMatricula,
      autorNome: data.autorNome,
      autorAvatar: data.autorAvatar,
      mensagem: data.mensagem,
      ano,
      createdAt: newComment.created_at,
      updatedAt: newComment.updated_at,
    };
  },

  async removeComment(commentId: string, autorMatricula: string): Promise<void> {
    const { error } = await supabase
      .from('comentarios_aniversario')
      .delete()
      .eq('id', commentId)
      .eq('autor_matricula', autorMatricula);

    if (error) throw error;
  },
};
```

---

## 🔀 Abstração de Storage

### Criar Interface Unificada

**Arquivo:** `src/services/birthdayStorageAdapter.ts`

```typescript
import { birthdayStorage } from './birthdayStorage';
import { supabaseStorage } from './supabaseStorage';

// Feature flag
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// Adapter que escolhe automaticamente
export const storage = USE_SUPABASE ? supabaseStorage : birthdayStorage;
```

### Atualizar Hooks

```typescript
// Antes
import { birthdayStorage } from '@/services/birthdayStorage';

// Depois
import { storage } from '@/services/birthdayStorageAdapter';

// Uso permanece o mesmo
const likes = await storage.getLikes(funcionarioMatricula);
```

---

## 📊 Script de Migração de Dados

**Arquivo:** `scripts/migrate-to-supabase.ts`

```typescript
import { birthdayStorage } from '../src/services/birthdayStorage';
import { supabaseStorage } from '../src/services/supabaseStorage';

async function migrateData() {
  console.log('🚀 Iniciando migração de dados...');

  try {
    // 1. Migrar curtidas
    console.log('📦 Migrando curtidas...');
    const allLikes = birthdayStorage._getAllLikes();
    
    for (const like of allLikes) {
      await supabaseStorage.addLike(
        like.funcionarioMatricula,
        like.autorMatricula
      );
    }
    
    console.log(`✅ ${allLikes.length} curtidas migradas`);

    // 2. Migrar comentários
    console.log('📦 Migrando comentários...');
    const allComments = birthdayStorage._getAllComments();
    
    for (const comment of allComments) {
      await supabaseStorage.addComment({
        funcionarioMatricula: comment.funcionarioMatricula,
        autorMatricula: comment.autorMatricula,
        autorNome: comment.autorNome,
        autorAvatar: comment.autorAvatar,
        mensagem: comment.mensagem,
      });
    }
    
    console.log(`✅ ${allComments.length} comentários migrados`);

    console.log('🎉 Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  }
}

migrateData();
```

**Executar:**
```bash
npx tsx scripts/migrate-to-supabase.ts
```

---

## 🧪 Testes de Migração

### 1. Validar Dados Migrados

```typescript
async function validateMigration() {
  const localLikes = birthdayStorage._getAllLikes();
  const supabaseLikes = await supabaseStorage.getAllLikes();
  
  console.log('Local:', localLikes.length);
  console.log('Supabase:', supabaseLikes.length);
  
  if (localLikes.length !== supabaseLikes.length) {
    console.error('❌ Quantidade de curtidas não confere!');
  } else {
    console.log('✅ Curtidas migradas corretamente');
  }
}
```

### 2. Testes de Integridade

```typescript
// Verificar se não há duplicatas
// Verificar se todos os campos foram migrados
// Verificar se as datas estão corretas
```

---

## 🔒 Configurar Row Level Security

### 1. Habilitar RLS

```sql
ALTER TABLE curtidas_aniversario ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios_aniversario ENABLE ROW LEVEL SECURITY;
```

### 2. Criar Políticas

Consulte `01-estrutura-banco-dados.md` para políticas completas.

---

## 📈 Monitoramento Pós-Migração

### Métricas a Acompanhar

- ✅ Taxa de erro de requisições
- ✅ Tempo de resposta das queries
- ✅ Quantidade de dados migrados
- ✅ Feedback dos usuários

### Logs

```typescript
// Adicionar logging em produção
console.log('[SUPABASE] Curtida adicionada:', { funcionarioMatricula, autorMatricula });
```

---

## 🗑️ Limpeza Pós-Migração

### Após Validação Completa

1. Remover `birthdayStorage.ts`
2. Remover feature flag `USE_SUPABASE`
3. Atualizar imports nos hooks
4. Limpar localStorage dos usuários
5. Atualizar documentação

---

## ⚠️ Rollback Plan

### Se Algo Der Errado

1. Desabilitar feature flag (`VITE_USE_SUPABASE=false`)
2. Aplicação volta a usar localStorage
3. Investigar e corrigir problemas
4. Tentar migração novamente

---

## 📅 Cronograma Sugerido

| Semana | Atividade |
|--------|-----------|
| 1 | Configurar Supabase + Criar tabelas |
| 2 | Implementar `supabaseStorage.ts` |
| 3 | Criar adapter + Feature flag |
| 4 | Testes internos |
| 5 | Migração de dados |
| 6 | Beta com usuários selecionados |
| 7 | Rollout gradual (25% → 50% → 100%) |
| 8 | Limpeza e documentação |

