# 🔐 Sistema de Permissões Dinâmicas

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
4. [Funções PostgreSQL](#funções-postgresql)
5. [Políticas RLS](#políticas-rls)
6. [Implementação no Frontend](#implementação-no-frontend)
7. [Interface de Gerenciamento](#interface-de-gerenciamento)
8. [Exemplos de Uso](#exemplos-de-uso)

---

## 🎯 Visão Geral

O sistema de permissões dinâmicas permite que administradores configurem, via interface web, quais funcionalidades cada perfil de usuário pode acessar, sem necessidade de alterar código ou políticas RLS manualmente.

### **Características Principais**

- ✅ **100% Dinâmico** - Configuração via interface admin
- ✅ **Seguro** - Baseado em RLS do PostgreSQL
- ✅ **Escalável** - Fácil adicionar novos recursos
- ✅ **Sem Secret Key** - Não expõe chaves sensíveis no frontend
- ✅ **Auditável** - Rastreamento de alterações

### **Conceitos Fundamentais**

| Conceito | Descrição | Exemplo |
|----------|-----------|---------|
| **Perfil** | Grupo de usuários com permissões similares | Admin, RH, Colaborador |
| **Recurso** | Funcionalidade específica do sistema | `funcionarios.visualizar_todos` |
| **Permissão** | Relacionamento entre Perfil e Recurso | Admin pode `funcionarios.criar` |

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ usePermissoes()  │  │ ProtectedBy      │                │
│  │ Hook             │  │ Permission       │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │                     │                            │
│           └─────────┬───────────┘                            │
│                     │ Publishable Key (Seguro)              │
└─────────────────────┼─────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE / POSTGRESQL                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Funções PostgreSQL                                   │  │
│  │  • usuario_tem_permissao(user_id, recurso)           │  │
│  │  • usuario_permissoes(user_id)                       │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │  Políticas RLS (Row Level Security)                  │  │
│  │  • Aplicam permissões automaticamente                │  │
│  │  • Filtram dados baseado em permissões               │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │  Tabelas de Permissões                               │  │
│  │  • tbperfil (Perfis)                                 │  │
│  │  • tbrecurso (Recursos/Funcionalidades)              │  │
│  │  • tbperfil_recurso (Relacionamento N:N)             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Estrutura do Banco de Dados

### **1. Tabela `tbperfil` - Perfis de Usuário**

Define os grupos de usuários do sistema.

```sql
CREATE TABLE tbperfil (
    perfil_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX idx_tbperfil_ativo ON tbperfil(ativo);
CREATE INDEX idx_tbperfil_nome ON tbperfil(nome);

-- Comentários
COMMENT ON TABLE tbperfil IS 'Perfis de usuário do sistema (Admin, RH, Colaborador, etc)';
COMMENT ON COLUMN tbperfil.nome IS 'Nome único do perfil';
COMMENT ON COLUMN tbperfil.ativo IS 'Indica se o perfil está ativo no sistema';
```

### **2. Tabela `tbrecurso` - Recursos/Funcionalidades**

Define as funcionalidades disponíveis no sistema.

```sql
CREATE TABLE tbrecurso (
    recurso_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    categoria VARCHAR(50),
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tbrecurso_categoria ON tbrecurso(categoria);
CREATE INDEX idx_tbrecurso_ativo ON tbrecurso(ativo);
CREATE INDEX idx_tbrecurso_nome ON tbrecurso(nome);

-- Comentários
COMMENT ON TABLE tbrecurso IS 'Recursos/funcionalidades do sistema que podem ser controlados por permissões';
COMMENT ON COLUMN tbrecurso.nome IS 'Identificador único do recurso (ex: funcionarios.visualizar_todos)';
COMMENT ON COLUMN tbrecurso.categoria IS 'Categoria para agrupar recursos na interface (ex: Funcionários, Benefícios)';
```

### **3. Tabela `tbperfil_recurso` - Permissões**

Relaciona perfis com recursos (tabela de junção N:N).

```sql
CREATE TABLE tbperfil_recurso (
    perfil_id INTEGER NOT NULL REFERENCES tbperfil(perfil_id) ON DELETE CASCADE,
    recurso_id INTEGER NOT NULL REFERENCES tbrecurso(recurso_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    PRIMARY KEY (perfil_id, recurso_id)
);

-- Índices para performance
CREATE INDEX idx_perfil_recurso_perfil ON tbperfil_recurso(perfil_id);
CREATE INDEX idx_perfil_recurso_recurso ON tbperfil_recurso(recurso_id);

-- Comentários
COMMENT ON TABLE tbperfil_recurso IS 'Relacionamento entre perfis e recursos - define as permissões';
```

### **4. Atualizar `tbusuario`**

Adicionar constraint de foreign key para garantir integridade.

```sql
-- Adicionar constraint se ainda não existir
ALTER TABLE tbusuario
ADD CONSTRAINT fk_tbusuario_perfil 
FOREIGN KEY (perfil_id) REFERENCES tbperfil(perfil_id);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_tbusuario_perfil ON tbusuario(perfil_id);
```

---

## 📊 Dados Iniciais

### **Perfis Padrão**

```sql
INSERT INTO tbperfil (nome, descricao) VALUES
('Admin', 'Administrador do sistema - acesso total a todas as funcionalidades'),
('RH', 'Recursos Humanos - gerencia funcionários, benefícios e vouchers'),
('Parceiro', 'Parceiro comercial - gerencia seus próprios benefícios e visualiza dados'),
('Colaborador', 'Funcionário comum - acesso limitado às próprias informações');
```

### **Recursos do Sistema**

```sql
INSERT INTO tbrecurso (nome, descricao, categoria) VALUES
-- Funcionários
('funcionarios.visualizar_todos', 'Visualizar todos os funcionários do sistema', 'Funcionários'),
('funcionarios.visualizar_proprio', 'Visualizar apenas o próprio perfil', 'Funcionários'),
('funcionarios.editar', 'Editar dados de funcionários', 'Funcionários'),
('funcionarios.criar', 'Criar novos funcionários no sistema', 'Funcionários'),
('funcionarios.deletar', 'Deletar funcionários (soft delete)', 'Funcionários'),

-- Benefícios
('beneficios.visualizar', 'Visualizar lista de benefícios disponíveis', 'Benefícios'),
('beneficios.criar', 'Criar novos benefícios', 'Benefícios'),
('beneficios.editar', 'Editar benefícios existentes', 'Benefícios'),
('beneficios.deletar', 'Deletar benefícios', 'Benefícios'),

-- Vouchers
('vouchers.visualizar_todos', 'Visualizar todos os vouchers do sistema', 'Vouchers'),
('vouchers.visualizar_proprios', 'Visualizar apenas os próprios vouchers', 'Vouchers'),
('vouchers.criar', 'Criar novos vouchers', 'Vouchers'),
('vouchers.aprovar', 'Aprovar ou rejeitar vouchers', 'Vouchers'),
('vouchers.editar', 'Editar vouchers existentes', 'Vouchers'),

-- Parceiros
('parceiros.visualizar', 'Visualizar lista de parceiros', 'Parceiros'),
('parceiros.criar', 'Cadastrar novos parceiros', 'Parceiros'),
('parceiros.editar', 'Editar dados de parceiros', 'Parceiros'),
('parceiros.deletar', 'Deletar parceiros', 'Parceiros'),

-- Configurações
('config.permissoes', 'Gerenciar permissões do sistema', 'Configurações'),
('config.usuarios', 'Gerenciar usuários do sistema', 'Configurações'),
('config.perfis', 'Gerenciar perfis de acesso', 'Configurações');
```

### **Permissões Padrão**

```sql
-- Admin: Todas as permissões
INSERT INTO tbperfil_recurso (perfil_id, recurso_id)
SELECT 1, recurso_id FROM tbrecurso;

-- RH: Permissões de gestão
INSERT INTO tbperfil_recurso (perfil_id, recurso_id)
SELECT 2, recurso_id FROM tbrecurso
WHERE nome IN (
    'funcionarios.visualizar_todos',
    'funcionarios.editar',
    'beneficios.visualizar',
    'beneficios.criar',
    'beneficios.editar',
    'vouchers.visualizar_todos',
    'vouchers.aprovar',
    'vouchers.editar',
    'parceiros.visualizar',
    'config.usuarios'
);

-- Parceiro: Permissões limitadas
INSERT INTO tbperfil_recurso (perfil_id, recurso_id)
SELECT 3, recurso_id FROM tbrecurso
WHERE nome IN (
    'funcionarios.visualizar_todos',
    'beneficios.visualizar',
    'beneficios.editar',
    'vouchers.visualizar_todos',
    'parceiros.visualizar'
);

-- Colaborador: Permissões básicas
INSERT INTO tbperfil_recurso (perfil_id, recurso_id)
SELECT 4, recurso_id FROM tbrecurso
WHERE nome IN (
    'funcionarios.visualizar_proprio',
    'beneficios.visualizar',
    'vouchers.visualizar_proprios',
    'vouchers.criar'
);
```

---

## 🔧 Funções PostgreSQL

### **1. Função `usuario_tem_permissao`**

Verifica se um usuário tem uma permissão específica.

```sql
CREATE OR REPLACE FUNCTION usuario_tem_permissao(
    p_user_id UUID,
    p_recurso_nome VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM tbusuario u
        INNER JOIN tbperfil_recurso pr ON u.perfil_id = pr.perfil_id
        INNER JOIN tbrecurso r ON pr.recurso_id = r.recurso_id
        WHERE u.user_id = p_user_id
        AND u.deletado = 'N'
        AND r.nome = p_recurso_nome
        AND r.ativo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION usuario_tem_permissao IS 'Verifica se um usuário tem uma permissão específica baseado em seu perfil';
```

**Exemplo de uso:**

```sql
-- Verificar se usuário pode visualizar todos os funcionários
SELECT usuario_tem_permissao(
    'uuid-do-usuario'::UUID,
    'funcionarios.visualizar_todos'
);
-- Retorna: true ou false
```

### **2. Função `usuario_permissoes`**

Retorna todas as permissões de um usuário.

```sql
CREATE OR REPLACE FUNCTION usuario_permissoes(p_user_id UUID)
RETURNS TABLE(
    recurso_nome VARCHAR,
    recurso_descricao TEXT,
    categoria VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.nome,
        r.descricao,
        r.categoria
    FROM tbusuario u
    INNER JOIN tbperfil_recurso pr ON u.perfil_id = pr.perfil_id
    INNER JOIN tbrecurso r ON pr.recurso_id = r.recurso_id
    WHERE u.user_id = p_user_id
    AND u.deletado = 'N'
    AND r.ativo = true
    ORDER BY r.categoria, r.nome;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION usuario_permissoes IS 'Retorna todas as permissões de um usuário baseado em seu perfil';
```

**Exemplo de uso:**

```sql
-- Listar todas as permissões do usuário
SELECT * FROM usuario_permissoes('uuid-do-usuario'::UUID);

-- Resultado:
-- recurso_nome                    | recurso_descricao              | categoria
-- --------------------------------|--------------------------------|-------------
-- beneficios.visualizar           | Visualizar lista de benefícios | Benefícios
-- funcionarios.visualizar_proprio | Visualizar apenas próprio...   | Funcionários
-- vouchers.criar                  | Criar novos vouchers           | Vouchers
```

### **3. Função `perfil_permissoes`**

Retorna todas as permissões de um perfil específico.

```sql
CREATE OR REPLACE FUNCTION perfil_permissoes(p_perfil_id INTEGER)
RETURNS TABLE(
    recurso_id INTEGER,
    recurso_nome VARCHAR,
    recurso_descricao TEXT,
    categoria VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.recurso_id,
        r.nome,
        r.descricao,
        r.categoria
    FROM tbperfil_recurso pr
    INNER JOIN tbrecurso r ON pr.recurso_id = r.recurso_id
    WHERE pr.perfil_id = p_perfil_id
    AND r.ativo = true
    ORDER BY r.categoria, r.nome;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION perfil_permissoes IS 'Retorna todas as permissões de um perfil específico';
```

---

## 🔒 Políticas RLS (Row Level Security)

### **Habilitar RLS nas Tabelas de Permissões**

```sql
-- Habilitar RLS
ALTER TABLE tbperfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrecurso ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbperfil_recurso ENABLE ROW LEVEL SECURITY;
```

### **Políticas para `tbperfil`**

```sql
-- Todos podem visualizar perfis ativos
CREATE POLICY "Visualizar perfis ativos"
ON tbperfil FOR SELECT
TO authenticated
USING (ativo = true);

-- Apenas Admin pode gerenciar perfis
CREATE POLICY "Admin gerencia perfis"
ON tbperfil FOR ALL
TO authenticated
USING (
    usuario_tem_permissao(auth.uid(), 'config.perfis')
);
```

### **Políticas para `tbrecurso`**

```sql
-- Todos podem visualizar recursos ativos
CREATE POLICY "Visualizar recursos ativos"
ON tbrecurso FOR SELECT
TO authenticated
USING (ativo = true);

-- Apenas Admin pode gerenciar recursos
CREATE POLICY "Admin gerencia recursos"
ON tbrecurso FOR ALL
TO authenticated
USING (
    usuario_tem_permissao(auth.uid(), 'config.permissoes')
);
```

### **Políticas para `tbperfil_recurso`**

```sql
-- Todos podem visualizar permissões
CREATE POLICY "Visualizar permissoes"
ON tbperfil_recurso FOR SELECT
TO authenticated
USING (true);

-- Apenas Admin pode gerenciar permissões
CREATE POLICY "Admin gerencia permissoes"
ON tbperfil_recurso FOR ALL
TO authenticated
USING (
    usuario_tem_permissao(auth.uid(), 'config.permissoes')
);
```

### **Exemplo: Políticas RLS para `tbfuncionario`**

Aplicando permissões dinâmicas na tabela de funcionários.

```sql
-- Habilitar RLS
ALTER TABLE tbfuncionario ENABLE ROW LEVEL SECURITY;

-- Política para SELECT (visualização)
CREATE POLICY "Acesso baseado em permissoes - SELECT"
ON tbfuncionario FOR SELECT
USING (
    -- Pode ver todos se tem permissão "funcionarios.visualizar_todos"
    usuario_tem_permissao(auth.uid(), 'funcionarios.visualizar_todos')
    OR
    -- Ou pode ver apenas o próprio se tem permissão "funcionarios.visualizar_proprio"
    (
        usuario_tem_permissao(auth.uid(), 'funcionarios.visualizar_proprio')
        AND funcionario_id IN (
            SELECT funcionario_id
            FROM tbusuario
            WHERE user_id = auth.uid()
            AND deletado = 'N'
        )
    )
);

-- Política para INSERT (criação)
CREATE POLICY "Criar funcionario com permissao"
ON tbfuncionario FOR INSERT
WITH CHECK (
    usuario_tem_permissao(auth.uid(), 'funcionarios.criar')
);

-- Política para UPDATE (edição)
CREATE POLICY "Editar funcionario com permissao"
ON tbfuncionario FOR UPDATE
USING (
    usuario_tem_permissao(auth.uid(), 'funcionarios.editar')
);

-- Política para DELETE (exclusão)
CREATE POLICY "Deletar funcionario com permissao"
ON tbfuncionario FOR DELETE
USING (
    usuario_tem_permissao(auth.uid(), 'funcionarios.deletar')
);
```

### **Exemplo: Políticas RLS para `tbvoucher`**

```sql
-- Habilitar RLS
ALTER TABLE tbvoucher ENABLE ROW LEVEL SECURITY;

-- Política para SELECT
CREATE POLICY "Visualizar vouchers baseado em permissoes"
ON tbvoucher FOR SELECT
USING (
    -- Admin e RH veem todos
    usuario_tem_permissao(auth.uid(), 'vouchers.visualizar_todos')
    OR
    -- Colaborador vê apenas os próprios
    (
        usuario_tem_permissao(auth.uid(), 'vouchers.visualizar_proprios')
        AND funcionario_id IN (
            SELECT funcionario_id
            FROM tbusuario
            WHERE user_id = auth.uid()
            AND deletado = 'N'
        )
    )
);

-- Política para INSERT
CREATE POLICY "Criar voucher com permissao"
ON tbvoucher FOR INSERT
WITH CHECK (
    usuario_tem_permissao(auth.uid(), 'vouchers.criar')
    AND (
        -- Colaborador só pode criar para si mesmo
        NOT usuario_tem_permissao(auth.uid(), 'vouchers.visualizar_todos')
        OR funcionario_id IN (
            SELECT funcionario_id
            FROM tbusuario
            WHERE user_id = auth.uid()
        )
    )
);

-- Política para UPDATE
CREATE POLICY "Editar voucher com permissao"
ON tbvoucher FOR UPDATE
USING (
    usuario_tem_permissao(auth.uid(), 'vouchers.editar')
    OR usuario_tem_permissao(auth.uid(), 'vouchers.aprovar')
);
```

### **Exemplo: Políticas RLS para `tbbeneficio`**

```sql
-- Habilitar RLS
ALTER TABLE tbbeneficio ENABLE ROW LEVEL SECURITY;

-- Todos podem visualizar benefícios ativos
CREATE POLICY "Visualizar beneficios ativos"
ON tbbeneficio FOR SELECT
USING (
    ativo = true
    AND usuario_tem_permissao(auth.uid(), 'beneficios.visualizar')
);

-- Apenas quem tem permissão pode criar
CREATE POLICY "Criar beneficio com permissao"
ON tbbeneficio FOR INSERT
WITH CHECK (
    usuario_tem_permissao(auth.uid(), 'beneficios.criar')
);

-- Apenas quem tem permissão pode editar
CREATE POLICY "Editar beneficio com permissao"
ON tbbeneficio FOR UPDATE
USING (
    usuario_tem_permissao(auth.uid(), 'beneficios.editar')
);

-- Apenas quem tem permissão pode deletar
CREATE POLICY "Deletar beneficio com permissao"
ON tbbeneficio FOR DELETE
USING (
    usuario_tem_permissao(auth.uid(), 'beneficios.deletar')
);
```

---


