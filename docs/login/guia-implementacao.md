# 🚀 Guia de Implementação - Sistema de Permissões Dinâmicas

Este guia fornece um passo a passo completo para implementar o sistema de permissões dinâmicas no SICFAR-RH.

---

## 📋 Pré-requisitos

- [ ] Acesso ao Supabase Dashboard
- [ ] Projeto React/Vite configurado
- [ ] Supabase Client instalado (`@supabase/supabase-js`)
- [ ] Tabela `tbusuario` existente com campo `perfil_id`

---

## 🗄️ Parte 1: Configuração do Banco de Dados

### **Passo 1.1: Criar Tabelas**

Acesse o **SQL Editor** no Supabase Dashboard e execute:

```sql
-- 1. Tabela de Perfis
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
COMMENT ON TABLE tbperfil IS 'Perfis de usuário do sistema';
COMMENT ON COLUMN tbperfil.nome IS 'Nome único do perfil';

-- 2. Tabela de Recursos
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
COMMENT ON TABLE tbrecurso IS 'Recursos/funcionalidades do sistema';
COMMENT ON COLUMN tbrecurso.nome IS 'Identificador único (ex: funcionarios.visualizar_todos)';

-- 3. Tabela de Permissões (N:N)
CREATE TABLE tbperfil_recurso (
    perfil_id INTEGER NOT NULL REFERENCES tbperfil(perfil_id) ON DELETE CASCADE,
    recurso_id INTEGER NOT NULL REFERENCES tbrecurso(recurso_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    PRIMARY KEY (perfil_id, recurso_id)
);

-- Índices
CREATE INDEX idx_perfil_recurso_perfil ON tbperfil_recurso(perfil_id);
CREATE INDEX idx_perfil_recurso_recurso ON tbperfil_recurso(recurso_id);

-- Comentários
COMMENT ON TABLE tbperfil_recurso IS 'Relacionamento entre perfis e recursos';

-- 4. Atualizar tbusuario
ALTER TABLE tbusuario
ADD CONSTRAINT fk_tbusuario_perfil 
FOREIGN KEY (perfil_id) REFERENCES tbperfil(perfil_id);

CREATE INDEX IF NOT EXISTS idx_tbusuario_perfil ON tbusuario(perfil_id);
CREATE INDEX IF NOT EXISTS idx_tbusuario_user_id ON tbusuario(user_id);
```

✅ **Verificação:**
```sql
-- Deve retornar as 3 novas tabelas
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tbperfil', 'tbrecurso', 'tbperfil_recurso');
```

---

### **Passo 1.2: Inserir Dados Iniciais**

```sql
-- Perfis padrão
INSERT INTO tbperfil (nome, descricao) VALUES
('Admin', 'Administrador do sistema - acesso total'),
('RH', 'Recursos Humanos - gerencia funcionários e benefícios'),
('Parceiro', 'Parceiro comercial - gerencia benefícios'),
('Colaborador', 'Funcionário comum - acesso limitado');

-- Recursos do sistema
INSERT INTO tbrecurso (nome, descricao, categoria) VALUES
-- Funcionários
('funcionarios.visualizar_todos', 'Visualizar todos os funcionários', 'Funcionários'),
('funcionarios.visualizar_proprio', 'Visualizar apenas próprio perfil', 'Funcionários'),
('funcionarios.editar', 'Editar dados de funcionários', 'Funcionários'),
('funcionarios.criar', 'Criar novos funcionários', 'Funcionários'),
('funcionarios.deletar', 'Deletar funcionários', 'Funcionários'),

-- Benefícios
('beneficios.visualizar', 'Visualizar benefícios', 'Benefícios'),
('beneficios.criar', 'Criar novos benefícios', 'Benefícios'),
('beneficios.editar', 'Editar benefícios', 'Benefícios'),
('beneficios.deletar', 'Deletar benefícios', 'Benefícios'),

-- Vouchers
('vouchers.visualizar_todos', 'Visualizar todos os vouchers', 'Vouchers'),
('vouchers.visualizar_proprios', 'Visualizar próprios vouchers', 'Vouchers'),
('vouchers.criar', 'Criar novos vouchers', 'Vouchers'),
('vouchers.aprovar', 'Aprovar/rejeitar vouchers', 'Vouchers'),
('vouchers.editar', 'Editar vouchers', 'Vouchers'),

-- Parceiros
('parceiros.visualizar', 'Visualizar parceiros', 'Parceiros'),
('parceiros.criar', 'Cadastrar parceiros', 'Parceiros'),
('parceiros.editar', 'Editar parceiros', 'Parceiros'),
('parceiros.deletar', 'Deletar parceiros', 'Parceiros'),

-- Configurações
('config.permissoes', 'Gerenciar permissões', 'Configurações'),
('config.usuarios', 'Gerenciar usuários', 'Configurações'),
('config.perfis', 'Gerenciar perfis', 'Configurações');

-- Permissões padrão

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

✅ **Verificação:**
```sql
-- Deve retornar 4 perfis
SELECT COUNT(*) FROM tbperfil;

-- Deve retornar 22 recursos
SELECT COUNT(*) FROM tbrecurso;

-- Deve retornar permissões (Admin tem todas = 22)
SELECT p.nome, COUNT(pr.recurso_id) AS total_permissoes
FROM tbperfil p
LEFT JOIN tbperfil_recurso pr ON p.perfil_id = pr.perfil_id
GROUP BY p.perfil_id, p.nome;
```

---

### **Passo 1.3: Criar Funções PostgreSQL**

```sql
-- Função 1: Verificar se usuário tem permissão
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

COMMENT ON FUNCTION usuario_tem_permissao IS 'Verifica se usuário tem permissão específica';

-- Função 2: Listar permissões do usuário
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

COMMENT ON FUNCTION usuario_permissoes IS 'Retorna todas as permissões do usuário';

-- Função 3: Listar permissões de um perfil
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

COMMENT ON FUNCTION perfil_permissoes IS 'Retorna todas as permissões de um perfil';
```

✅ **Verificação:**
```sql
-- Testar função 1 (substitua pelo UUID real de um usuário)
SELECT usuario_tem_permissao(
    'seu-user-id-aqui'::UUID,
    'funcionarios.visualizar_todos'
);

-- Testar função 2
SELECT * FROM usuario_permissoes('seu-user-id-aqui'::UUID);

-- Testar função 3
SELECT * FROM perfil_permissoes(1); -- Admin
```

---

### **Passo 1.4: Configurar RLS (Row Level Security)**

```sql
-- Habilitar RLS nas tabelas de permissões
ALTER TABLE tbperfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrecurso ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbperfil_recurso ENABLE ROW LEVEL SECURITY;

-- Políticas para tbperfil
CREATE POLICY "Visualizar perfis ativos"
ON tbperfil FOR SELECT
TO authenticated
USING (ativo = true);

CREATE POLICY "Admin gerencia perfis"
ON tbperfil FOR ALL
TO authenticated
USING (usuario_tem_permissao(auth.uid(), 'config.perfis'));

-- Políticas para tbrecurso
CREATE POLICY "Visualizar recursos ativos"
ON tbrecurso FOR SELECT
TO authenticated
USING (ativo = true);

CREATE POLICY "Admin gerencia recursos"
ON tbrecurso FOR ALL
TO authenticated
USING (usuario_tem_permissao(auth.uid(), 'config.permissoes'));

-- Políticas para tbperfil_recurso
CREATE POLICY "Visualizar permissoes"
ON tbperfil_recurso FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin gerencia permissoes"
ON tbperfil_recurso FOR ALL
TO authenticated
USING (usuario_tem_permissao(auth.uid(), 'config.permissoes'));
```

✅ **Verificação:**
```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('tbperfil', 'tbrecurso', 'tbperfil_recurso');

-- Listar políticas criadas
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('tbperfil', 'tbrecurso', 'tbperfil_recurso');
```

---

### **Passo 1.5: Atualizar RLS das Tabelas Principais (Exemplo)**

```sql
-- Exemplo: tbfuncionario
ALTER TABLE tbfuncionario ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Acesso baseado em permissoes - SELECT" ON tbfuncionario;

-- Criar nova política dinâmica
CREATE POLICY "Acesso baseado em permissoes - SELECT"
ON tbfuncionario FOR SELECT
USING (
    usuario_tem_permissao(auth.uid(), 'funcionarios.visualizar_todos')
    OR
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

CREATE POLICY "Criar funcionario com permissao"
ON tbfuncionario FOR INSERT
WITH CHECK (usuario_tem_permissao(auth.uid(), 'funcionarios.criar'));

CREATE POLICY "Editar funcionario com permissao"
ON tbfuncionario FOR UPDATE
USING (usuario_tem_permissao(auth.uid(), 'funcionarios.editar'));

CREATE POLICY "Deletar funcionario com permissao"
ON tbfuncionario FOR DELETE
USING (usuario_tem_permissao(auth.uid(), 'funcionarios.deletar'));
```

**⚠️ IMPORTANTE:** Repita este processo para outras tabelas (`tbvoucher`, `tbbeneficio`, `tbparceiro`, etc.)

---

## 💻 Parte 2: Implementação Frontend

### **Passo 2.1: Criar Hook usePermissoes**

Crie o arquivo `src/hooks/usePermissoes.ts`:

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Permissao {
  recurso_nome: string;
  recurso_descricao: string;
  categoria: string;
}

export function usePermissoes() {
  const [permissoes, setPermissoes] = useState<string[]>([]);
  const [permissoesDetalhadas, setPermissoesDetalhadas] = useState<Permissao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarPermissoes();
  }, []);

  async function carregarPermissoes() {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setPermissoes([]);
        setPermissoesDetalhadas([]);
        return;
      }

      const { data, error: rpcError } = await supabase.rpc('usuario_permissoes', {
        p_user_id: session.user.id
      });

      if (rpcError) throw rpcError;

      const listaPermissoes = data?.map((p: Permissao) => p.recurso_nome) || [];

      setPermissoes(listaPermissoes);
      setPermissoesDetalhadas(data || []);
    } catch (err) {
      console.error('Erro ao carregar permissões:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setPermissoes([]);
      setPermissoesDetalhadas([]);
    } finally {
      setIsLoading(false);
    }
  }

  const temPermissao = (recurso: string): boolean => {
    return permissoes.includes(recurso);
  };

  const temTodasPermissoes = (recursos: string[]): boolean => {
    return recursos.every(recurso => permissoes.includes(recurso));
  };

  const temAlgumaPermissao = (recursos: string[]): boolean => {
    return recursos.some(recurso => permissoes.includes(recurso));
  };

  return {
    permissoes,
    permissoesDetalhadas,
    isLoading,
    error,
    temPermissao,
    temTodasPermissoes,
    temAlgumaPermissao,
    recarregar: carregarPermissoes
  };
}
```

✅ **Verificação:**
```typescript
// Em qualquer componente
import { usePermissoes } from '@/hooks/usePermissoes';

function TestePermissoes() {
  const { permissoes, isLoading } = usePermissoes();

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Minhas Permissões:</h2>
      <ul>
        {permissoes.map(p => <li key={p}>{p}</li>)}
      </ul>
    </div>
  );
}
```

---

### **Passo 2.2: Criar Componente ProtectedByPermission**

Crie o arquivo `src/components/ProtectedByPermission.tsx`:

```typescript
import { ReactNode } from 'react';
import { usePermissoes } from '@/hooks/usePermissoes';

interface ProtectedByPermissionProps {
  recurso?: string;
  recursos?: string[];
  recursosOr?: string[];
  children: ReactNode;
  fallback?: ReactNode;
  showLoading?: boolean;
}

export function ProtectedByPermission({
  recurso,
  recursos,
  recursosOr,
  children,
  fallback = null,
  showLoading = false
}: ProtectedByPermissionProps) {
  const { temPermissao, temTodasPermissoes, temAlgumaPermissao, isLoading } = usePermissoes();

  if (isLoading && showLoading) {
    return <div className="animate-pulse">Carregando...</div>;
  }

  let hasPermission = false;

  if (recurso) {
    hasPermission = temPermissao(recurso);
  } else if (recursos && recursos.length > 0) {
    hasPermission = temTodasPermissoes(recursos);
  } else if (recursosOr && recursosOr.length > 0) {
    hasPermission = temAlgumaPermissao(recursosOr);
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

✅ **Verificação:**
```typescript
// Teste em qualquer componente
<ProtectedByPermission recurso="funcionarios.criar">
  <button>Novo Funcionário</button>
</ProtectedByPermission>
```

---

### **Passo 2.3: Criar Interface de Gerenciamento**

Crie o arquivo `src/pages/admin/GerenciarPermissoes.tsx` com o código completo disponível em [`sistema-permissoes-frontend.md`](./sistema-permissoes-frontend.md).

---

### **Passo 2.4: Adicionar Rota**

No seu arquivo de rotas (ex: `src/App.tsx`):

```typescript
import { GerenciarPermissoes } from '@/pages/admin/GerenciarPermissoes';
import { ProtectedByPermission } from '@/components/ProtectedByPermission';
import { Navigate } from 'react-router-dom';

// Dentro das rotas
<Route
  path="/admin/permissoes"
  element={
    <ProtectedByPermission
      recurso="config.permissoes"
      fallback={<Navigate to="/" replace />}
    >
      <GerenciarPermissoes />
    </ProtectedByPermission>
  }
/>
```

---

## ✅ Parte 3: Testes e Validação

### **Passo 3.1: Atribuir Perfis aos Usuários**

```sql
-- Atualizar usuário existente para ter perfil Admin
UPDATE tbusuario
SET perfil_id = 1
WHERE user_id = 'seu-user-id-aqui'::UUID;

-- Verificar
SELECT u.usuario, p.nome AS perfil
FROM tbusuario u
LEFT JOIN tbperfil p ON u.perfil_id = p.perfil_id
WHERE u.deletado = 'N';
```

---

### **Passo 3.2: Testar Permissões**

1. **Faça login como Admin:**
   - Deve ver todas as funcionalidades
   - Deve conseguir acessar `/admin/permissoes`

2. **Faça login como Colaborador:**
   - Deve ver apenas funcionalidades básicas
   - NÃO deve conseguir acessar `/admin/permissoes`

3. **Teste RLS:**
```sql
-- Como Admin (deve retornar todos)
SELECT COUNT(*) FROM tbfuncionario;

-- Como Colaborador (deve retornar apenas 1)
SELECT COUNT(*) FROM tbfuncionario;
```

---

### **Passo 3.3: Testar Interface de Gerenciamento**

1. Acesse `/admin/permissoes` como Admin
2. Selecione um perfil (ex: RH)
3. Marque/desmarque permissões
4. Verifique no banco:
```sql
SELECT * FROM perfil_permissoes(2); -- RH
```

---

## 🎉 Conclusão

Parabéns! Você implementou com sucesso o sistema de permissões dinâmicas.

### **Próximos Passos:**

1. ✅ Aplicar políticas RLS em todas as tabelas
2. ✅ Adicionar mais recursos conforme necessário
3. ✅ Criar novos perfis personalizados
4. ✅ Documentar recursos customizados

### **Recursos Úteis:**

- [`sistema-permissoes-dinamicas.md`](./sistema-permissoes-dinamicas.md) - Arquitetura completa
- [`sistema-permissoes-frontend.md`](./sistema-permissoes-frontend.md) - Implementação React
- [`sistema-permissoes-exemplos.md`](./sistema-permissoes-exemplos.md) - Exemplos práticos
- [`README.md`](./README.md) - Visão geral

---

**Última atualização:** 2025-12-05

