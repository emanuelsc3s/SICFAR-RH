# 📚 Sistema de Permissões - Exemplos Práticos

## 📋 Índice

1. [Exemplos de Uso no Frontend](#exemplos-de-uso-no-frontend)
2. [Exemplos de Queries SQL](#exemplos-de-queries-sql)
3. [Casos de Uso Comuns](#casos-de-uso-comuns)
4. [Troubleshooting](#troubleshooting)

---

## 💻 Exemplos de Uso no Frontend

### **1. Proteger Rotas Inteiras**

```typescript
// src/App.tsx ou router
import { ProtectedByPermission } from '@/components/ProtectedByPermission';
import { Navigate } from 'react-router-dom';

function App() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route path="/login" element={<Login />} />
      
      {/* Rota protegida por permissão */}
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
      
      {/* Rota que requer múltiplas permissões */}
      <Route 
        path="/admin/usuarios" 
        element={
          <ProtectedByPermission 
            recursos={['config.usuarios', 'funcionarios.visualizar_todos']}
            fallback={<Navigate to="/" replace />}
          >
            <GerenciarUsuarios />
          </ProtectedByPermission>
        } 
      />
    </Routes>
  );
}
```

### **2. Condicionar Elementos da UI**

```typescript
// src/pages/Funcionarios.tsx
import { usePermissoes } from '@/hooks/usePermissoes';
import { ProtectedByPermission } from '@/components/ProtectedByPermission';

export function FuncionariosPage() {
  const { temPermissao, temAlgumaPermissao } = usePermissoes();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Funcionários</h1>
        
        {/* Botão visível apenas para quem pode criar */}
        <ProtectedByPermission recurso="funcionarios.criar">
          <button className="btn-primary">
            Novo Funcionário
          </button>
        </ProtectedByPermission>
      </div>

      {/* Conteúdo condicional baseado em permissões */}
      {temPermissao('funcionarios.visualizar_todos') ? (
        <TodosFuncionarios />
      ) : temPermissao('funcionarios.visualizar_proprio') ? (
        <MeuPerfil />
      ) : (
        <div>Você não tem permissão para visualizar funcionários</div>
      )}

      {/* Ações condicionais */}
      <div className="mt-4 flex gap-2">
        {temPermissao('funcionarios.editar') && (
          <button>Editar</button>
        )}
        
        {temPermissao('funcionarios.deletar') && (
          <button className="text-red-600">Excluir</button>
        )}
      </div>
    </div>
  );
}
```

### **3. Menu Dinâmico Baseado em Permissões**

```typescript
// src/components/Sidebar.tsx
import { usePermissoes } from '@/hooks/usePermissoes';
import { Link } from 'react-router-dom';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  permissao?: string;
  permissoesOr?: string[];
}

export function Sidebar() {
  const { temPermissao, temAlgumaPermissao } = usePermissoes();

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      path: '/',
      icon: <HomeIcon />
    },
    {
      label: 'Funcionários',
      path: '/funcionarios',
      icon: <UsersIcon />,
      permissoesOr: ['funcionarios.visualizar_todos', 'funcionarios.visualizar_proprio']
    },
    {
      label: 'Benefícios',
      path: '/beneficios',
      icon: <GiftIcon />,
      permissao: 'beneficios.visualizar'
    },
    {
      label: 'Vouchers',
      path: '/vouchers',
      icon: <TicketIcon />,
      permissoesOr: ['vouchers.visualizar_todos', 'vouchers.visualizar_proprios']
    },
    {
      label: 'Parceiros',
      path: '/parceiros',
      icon: <BuildingIcon />,
      permissao: 'parceiros.visualizar'
    },
    {
      label: 'Configurações',
      path: '/config',
      icon: <SettingsIcon />,
      permissoesOr: ['config.permissoes', 'config.usuarios', 'config.perfis']
    }
  ];

  // Filtrar itens baseado em permissões
  const menuItemsVisiveis = menuItems.filter(item => {
    if (!item.permissao && !item.permissoesOr) return true;
    
    if (item.permissao) {
      return temPermissao(item.permissao);
    }
    
    if (item.permissoesOr) {
      return temAlgumaPermissao(item.permissoesOr);
    }
    
    return false;
  });

  return (
    <nav className="sidebar">
      {menuItemsVisiveis.map(item => (
        <Link 
          key={item.path} 
          to={item.path}
          className="sidebar-item"
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
```

### **4. Formulário com Campos Condicionais**

```typescript
// src/components/FormularioFuncionario.tsx
import { usePermissoes } from '@/hooks/usePermissoes';

export function FormularioFuncionario() {
  const { temPermissao } = usePermissoes();

  return (
    <form>
      {/* Campos básicos - todos veem */}
      <input name="nome" placeholder="Nome" />
      <input name="email" placeholder="Email" />

      {/* Campo visível apenas para RH e Admin */}
      {temPermissao('funcionarios.editar') && (
        <>
          <input name="salario" placeholder="Salário" type="number" />
          <select name="cargo">
            <option>Selecione o cargo</option>
          </select>
        </>
      )}

      {/* Campo visível apenas para Admin */}
      {temPermissao('config.usuarios') && (
        <select name="perfil_id">
          <option>Selecione o perfil</option>
          <option value="1">Admin</option>
          <option value="2">RH</option>
          <option value="4">Colaborador</option>
        </select>
      )}

      <button type="submit">
        {temPermissao('funcionarios.criar') ? 'Criar' : 'Salvar'}
      </button>
    </form>
  );
}
```

### **5. Tabela com Ações Condicionais**

```typescript
// src/components/TabelaFuncionarios.tsx
import { usePermissoes } from '@/hooks/usePermissoes';

export function TabelaFuncionarios({ funcionarios }) {
  const { temPermissao } = usePermissoes();

  return (
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Email</th>
          <th>Cargo</th>
          {(temPermissao('funcionarios.editar') || temPermissao('funcionarios.deletar')) && (
            <th>Ações</th>
          )}
        </tr>
      </thead>
      <tbody>
        {funcionarios.map(func => (
          <tr key={func.id}>
            <td>{func.nome}</td>
            <td>{func.email}</td>
            <td>{func.cargo}</td>
            
            {(temPermissao('funcionarios.editar') || temPermissao('funcionarios.deletar')) && (
              <td className="flex gap-2">
                {temPermissao('funcionarios.editar') && (
                  <button onClick={() => editar(func.id)}>
                    Editar
                  </button>
                )}
                
                {temPermissao('funcionarios.deletar') && (
                  <button 
                    onClick={() => deletar(func.id)}
                    className="text-red-600"
                  >
                    Excluir
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 🗄️ Exemplos de Queries SQL

### **1. Verificar Permissões de um Usuário**

```sql
-- Listar todas as permissões de um usuário específico
SELECT * FROM usuario_permissoes('uuid-do-usuario'::UUID);

-- Verificar se usuário tem permissão específica
SELECT usuario_tem_permissao(
    'uuid-do-usuario'::UUID,
    'funcionarios.visualizar_todos'
) AS tem_permissao;

-- Contar quantas permissões um usuário tem
SELECT COUNT(*) AS total_permissoes
FROM usuario_permissoes('uuid-do-usuario'::UUID);
```

### **2. Gerenciar Permissões de um Perfil**

```sql
-- Listar todas as permissões de um perfil
SELECT * FROM perfil_permissoes(2); -- perfil_id = 2 (RH)

-- Adicionar permissão a um perfil
INSERT INTO tbperfil_recurso (perfil_id, recurso_id)
VALUES (
    2, -- RH
    (SELECT recurso_id FROM tbrecurso WHERE nome = 'vouchers.aprovar')
);

-- Remover permissão de um perfil
DELETE FROM tbperfil_recurso
WHERE perfil_id = 2
AND recurso_id = (SELECT recurso_id FROM tbrecurso WHERE nome = 'vouchers.aprovar');

-- Copiar permissões de um perfil para outro
INSERT INTO tbperfil_recurso (perfil_id, recurso_id)
SELECT 5, recurso_id -- Novo perfil_id = 5
FROM tbperfil_recurso
WHERE perfil_id = 2; -- Copiar do RH
```

### **3. Criar Novo Perfil com Permissões**

```sql
-- Criar novo perfil
INSERT INTO tbperfil (nome, descricao)
VALUES ('Gerente', 'Gerente de departamento - acesso intermediário')
RETURNING perfil_id;

-- Adicionar permissões ao novo perfil (assumindo perfil_id = 5)
INSERT INTO tbperfil_recurso (perfil_id, recurso_id)
SELECT 5, recurso_id FROM tbrecurso
WHERE nome IN (
    'funcionarios.visualizar_todos',
    'funcionarios.editar',
    'beneficios.visualizar',
    'vouchers.visualizar_todos',
    'vouchers.aprovar'
);
```

### **4. Criar Novo Recurso**

```sql
-- Adicionar novo recurso ao sistema
INSERT INTO tbrecurso (nome, descricao, categoria)
VALUES (
    'relatorios.exportar',
    'Exportar relatórios em PDF/Excel',
    'Relatórios'
);

-- Dar permissão do novo recurso para Admin
INSERT INTO tbperfil_recurso (perfil_id, recurso_id)
VALUES (
    1, -- Admin
    (SELECT recurso_id FROM tbrecurso WHERE nome = 'relatorios.exportar')
);
```

### **5. Auditoria e Relatórios**

```sql
-- Listar usuários por perfil
SELECT
    p.nome AS perfil,
    COUNT(u.usuario_id) AS total_usuarios
FROM tbperfil p
LEFT JOIN tbusuario u ON p.perfil_id = u.perfil_id AND u.deletado = 'N'
GROUP BY p.perfil_id, p.nome
ORDER BY total_usuarios DESC;

-- Listar recursos mais usados (mais perfis têm acesso)
SELECT
    r.nome,
    r.categoria,
    COUNT(pr.perfil_id) AS perfis_com_acesso
FROM tbrecurso r
LEFT JOIN tbperfil_recurso pr ON r.recurso_id = pr.recurso_id
GROUP BY r.recurso_id, r.nome, r.categoria
ORDER BY perfis_com_acesso DESC;

-- Listar perfis e suas permissões
SELECT
    p.nome AS perfil,
    r.categoria,
    r.nome AS recurso,
    r.descricao
FROM tbperfil p
INNER JOIN tbperfil_recurso pr ON p.perfil_id = pr.perfil_id
INNER JOIN tbrecurso r ON pr.recurso_id = r.recurso_id
WHERE p.ativo = true AND r.ativo = true
ORDER BY p.nome, r.categoria, r.nome;

-- Encontrar usuários sem perfil definido
SELECT
    usuario_id,
    usuario,
    user_id
FROM tbusuario
WHERE perfil_id IS NULL
AND deletado = 'N';
```

---

## 🎯 Casos de Uso Comuns

### **Caso 1: Colaborador Solicita Voucher**

**Fluxo:**
1. Colaborador acessa sistema (perfil: Colaborador)
2. Tem permissão `vouchers.criar` e `vouchers.visualizar_proprios`
3. Pode criar voucher para si mesmo
4. Vê apenas seus próprios vouchers
5. Não pode aprovar vouchers

**Código Frontend:**
```typescript
function SolicitarVoucher() {
  const { temPermissao } = usePermissoes();

  if (!temPermissao('vouchers.criar')) {
    return <div>Você não pode solicitar vouchers</div>;
  }

  return <FormularioVoucher />;
}
```

**Política RLS:**
```sql
-- Colaborador só vê seus próprios vouchers
CREATE POLICY "Visualizar proprios vouchers"
ON tbvoucher FOR SELECT
USING (
    usuario_tem_permissao(auth.uid(), 'vouchers.visualizar_proprios')
    AND funcionario_id IN (
        SELECT funcionario_id FROM tbusuario
        WHERE user_id = auth.uid() AND deletado = 'N'
    )
);
```

### **Caso 2: RH Aprova Vouchers**

**Fluxo:**
1. RH acessa sistema (perfil: RH)
2. Tem permissão `vouchers.visualizar_todos` e `vouchers.aprovar`
3. Vê todos os vouchers pendentes
4. Pode aprovar ou rejeitar

**Código Frontend:**
```typescript
function AprovarVouchers() {
  const { temPermissao } = usePermissoes();

  if (!temPermissao('vouchers.aprovar')) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <h1>Vouchers Pendentes</h1>
      {/* Lista de vouchers com botões Aprovar/Rejeitar */}
    </div>
  );
}
```

### **Caso 3: Admin Gerencia Permissões**

**Fluxo:**
1. Admin acessa sistema (perfil: Admin)
2. Tem permissão `config.permissoes`
3. Acessa página de gerenciamento
4. Pode adicionar/remover permissões de qualquer perfil

**Código Frontend:**
```typescript
<ProtectedByPermission
  recurso="config.permissoes"
  fallback={<Navigate to="/" />}
>
  <GerenciarPermissoes />
</ProtectedByPermission>
```

### **Caso 4: Parceiro Gerencia Benefícios**

**Fluxo:**
1. Parceiro acessa sistema (perfil: Parceiro)
2. Tem permissão `beneficios.visualizar` e `beneficios.editar`
3. Vê todos os benefícios
4. Pode editar benefícios (mas não criar novos)

**Código Frontend:**
```typescript
function BeneficiosPage() {
  const { temPermissao } = usePermissoes();

  return (
    <div>
      <h1>Benefícios</h1>

      {/* Botão criar - apenas Admin e RH */}
      {temPermissao('beneficios.criar') && (
        <button>Novo Benefício</button>
      )}

      {/* Lista de benefícios */}
      <ListaBeneficios
        podeEditar={temPermissao('beneficios.editar')}
        podeDeletar={temPermissao('beneficios.deletar')}
      />
    </div>
  );
}
```

---

## 🔧 Troubleshooting

### **Problema 1: Permissões não carregam**

**Sintomas:**
- Hook `usePermissoes` retorna array vazio
- `isLoading` fica sempre `true`

**Soluções:**
```typescript
// 1. Verificar se função PostgreSQL existe
// No Supabase SQL Editor:
SELECT * FROM pg_proc WHERE proname = 'usuario_permissoes';

// 2. Verificar se usuário está autenticado
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// 3. Verificar se usuário tem perfil_id
const { data } = await supabase
  .from('tbusuario')
  .select('perfil_id')
  .eq('user_id', session.user.id)
  .single();
console.log('Perfil ID:', data?.perfil_id);

// 4. Testar função diretamente
const { data, error } = await supabase.rpc('usuario_permissoes', {
  p_user_id: session.user.id
});
console.log('Permissões:', data, 'Erro:', error);
```

### **Problema 2: RLS bloqueia acesso mesmo com permissão**

**Sintomas:**
- Usuário tem permissão mas query retorna vazio
- Erro "permission denied" ou "row-level security policy"

**Soluções:**
```sql
-- 1. Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'tbfuncionario';

-- 2. Listar políticas ativas
SELECT * FROM pg_policies
WHERE tablename = 'tbfuncionario';

-- 3. Testar política manualmente
SET ROLE authenticated;
SET request.jwt.claim.sub = 'uuid-do-usuario';
SELECT * FROM tbfuncionario; -- Deve respeitar RLS

-- 4. Desabilitar RLS temporariamente para debug (CUIDADO!)
ALTER TABLE tbfuncionario DISABLE ROW LEVEL SECURITY;
-- Lembre-se de reabilitar depois!
```

### **Problema 3: Permissão não salva**

**Sintomas:**
- Checkbox marca mas não persiste
- Erro ao inserir em `tbperfil_recurso`

**Soluções:**
```typescript
// 1. Verificar se usuário tem permissão para alterar
const { data } = await supabase.rpc('usuario_tem_permissao', {
  p_user_id: session.user.id,
  p_recurso_nome: 'config.permissoes'
});
console.log('Pode gerenciar permissões:', data);

// 2. Verificar constraint de foreign key
// No SQL Editor:
SELECT * FROM tbperfil WHERE perfil_id = 2;
SELECT * FROM tbrecurso WHERE recurso_id = 10;

// 3. Verificar se já existe
SELECT * FROM tbperfil_recurso
WHERE perfil_id = 2 AND recurso_id = 10;

// 4. Tentar inserir manualmente
INSERT INTO tbperfil_recurso (perfil_id, recurso_id)
VALUES (2, 10);
```

### **Problema 4: Performance lenta**

**Sintomas:**
- Queries demoram muito
- Interface trava ao carregar permissões

**Soluções:**
```sql
-- 1. Verificar índices
SELECT * FROM pg_indexes
WHERE tablename IN ('tbperfil', 'tbrecurso', 'tbperfil_recurso', 'tbusuario');

-- 2. Criar índices faltantes
CREATE INDEX IF NOT EXISTS idx_tbusuario_user_id ON tbusuario(user_id);
CREATE INDEX IF NOT EXISTS idx_tbusuario_perfil ON tbusuario(perfil_id);
CREATE INDEX IF NOT EXISTS idx_perfil_recurso_perfil ON tbperfil_recurso(perfil_id);

-- 3. Analisar query plan
EXPLAIN ANALYZE
SELECT * FROM usuario_permissoes('uuid-do-usuario'::UUID);

-- 4. Cachear permissões no frontend
// Usar React Query ou SWR para cache
import { useQuery } from '@tanstack/react-query';

function usePermissoes() {
  return useQuery({
    queryKey: ['permissoes'],
    queryFn: carregarPermissoes,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000 // 10 minutos
  });
}
```

---

## ✅ Checklist de Implementação

- [ ] Criar tabelas `tbperfil`, `tbrecurso`, `tbperfil_recurso`
- [ ] Inserir dados iniciais (perfis e recursos)
- [ ] Criar funções PostgreSQL (`usuario_tem_permissao`, `usuario_permissoes`)
- [ ] Habilitar RLS nas tabelas
- [ ] Criar políticas RLS para tabelas de permissões
- [ ] Atualizar políticas RLS das tabelas principais
- [ ] Criar hook `usePermissoes`
- [ ] Criar componente `ProtectedByPermission`
- [ ] Criar página `GerenciarPermissoes`
- [ ] Adicionar rota protegida para gerenciamento
- [ ] Testar permissões com diferentes perfis
- [ ] Documentar novos recursos criados

---

## 📖 Referências

- [Documentação Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [React Hooks Best Practices](https://react.dev/reference/react)

