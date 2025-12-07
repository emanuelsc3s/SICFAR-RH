# Guia de Verificação - Autenticação e Dados do Usuário

## ✅ Checklist de Verificação

### 1. Verificar Configuração do Supabase

**Arquivo:** `.env`

```env
VITE_SUPABASE_URL=<sua-url>
VITE_SUPABASE_KEY=<sua-chave>
```

**Teste:**
```bash
# Verificar se as variáveis estão definidas
grep VITE_SUPABASE .env
```

---

### 2. Verificar Estrutura das Tabelas

**Verificar se existe Foreign Key entre tabelas:**

```sql
-- No Supabase SQL Editor

-- 1. Verificar estrutura de tbusuario
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tbusuario'
ORDER BY ordinal_position;

-- 2. Verificar estrutura de tbfuncionario
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tbfuncionario'
ORDER BY ordinal_position;

-- 3. Verificar se existem dados relacionados
SELECT
  u.usuario_id,
  u.usuario,
  u.user_id,
  u.funcionario_id,
  f.nome,
  f.cargo,
  f.matricula
FROM tbusuario u
LEFT JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE u.deletado = 'N'
LIMIT 5;
```

---

### 3. Verificar RLS (Row Level Security)

**Políticas necessárias:**

```sql
-- Verificar políticas de tbusuario
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'tbusuario';

-- Verificar políticas de tbfuncionario
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'tbfuncionario';
```

**Políticas recomendadas:**

```sql
-- tbusuario: Usuário pode ler seus próprios dados
CREATE POLICY "Usuários podem ler seus próprios dados"
ON tbusuario FOR SELECT
USING (auth.uid() = user_id);

-- tbfuncionario: Usuário pode ler dados do funcionário relacionado
CREATE POLICY "Usuários podem ler dados do funcionário relacionado"
ON tbfuncionario FOR SELECT
USING (
  funcionario_id IN (
    SELECT funcionario_id
    FROM tbusuario
    WHERE user_id = auth.uid()
  )
);
```

---

### 4. Testar Query Manualmente

**No Supabase SQL Editor:**

```sql
-- Substitua '<UUID-DO-USUARIO>' pelo UUID real de auth.users
SELECT
  u.usuario_id,
  u.usuario,
  u.funcionario_id,
  u.perfil_id,
  u.deletado,
  f.matricula,
  f.cargo,
  f.nome
FROM tbusuario u
LEFT JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE u.user_id = '<UUID-DO-USUARIO>'
  AND u.deletado = 'N';
```

**Resultado esperado:**
```
usuario_id | usuario      | funcionario_id | perfil_id | deletado | matricula | cargo        | nome
-----------|--------------|----------------|-----------|----------|-----------|--------------|-------------
1          | emanuel      | 123            | 2         | N        | MAT001    | Colaborador  | Emanuel Silva
```

---

### 5. Verificar Console do Navegador

**Após fazer login, verifique:**

1. Abra DevTools (F12)
2. Vá para Console
3. Procure por mensagens do AuthContext:

```
✅ Login bem-sucedido: email@exemplo.com
🔄 Auth state changed: SIGNED_IN
✅ Perfil do usuário carregado: {
  nomeUsuario: "emanuel",
  nome: "Emanuel Silva",
  cargo: "Colaborador",
  email: "email@exemplo.com",
  matricula: "MAT001"
}
```

**Erros comuns:**
```
❌ Erro ao buscar perfil do usuário: {...}
❌ Erro de autenticação: {...}
```

---

### 6. Verificar localStorage

**Após login bem-sucedido:**

```javascript
// No Console do navegador
JSON.parse(localStorage.getItem('colaboradorLogado'))
```

**Resultado esperado:**
```json
{
  "id": "uuid-aqui",
  "email": "email@exemplo.com",
  "nome": "Emanuel Silva",
  "matricula": "MAT001",
  "cargo": "Colaborador",
  "loginTimestamp": "2025-12-06T..."
}
```

---

### 7. Verificar Dados no Header

**Inspecionar valores no Header:**

```javascript
// Adicione temporariamente no Header.tsx, após a linha 113:
console.log('🔍 Dados do Header:', {
  user,
  nomeVisualExibicao,
  cargoExibicao,
  emailExibicao,
  matriculaExibicao,
  isPerfilCarregando,
});
```

---

## 🐛 Troubleshooting

### Problema 1: Dados não aparecem no Header

**Causa possível:** AuthContext não está carregando os dados

**Solução:**
1. Verificar console para erros de query
2. Verificar RLS policies
3. Verificar relacionamentos entre tabelas

---

### Problema 2: Erro "não autorizado" ou "permission denied"

**Causa:** RLS (Row Level Security) bloqueando acesso

**Solução:**
```sql
-- Criar políticas de acesso (ver seção 3)
```

---

### Problema 3: JOIN retorna null

**Causa:** `funcionario_id` em `tbusuario` não existe em `tbfuncionario`

**Solução:**
```sql
-- Verificar dados órfãos
SELECT u.usuario_id, u.usuario, u.funcionario_id
FROM tbusuario u
LEFT JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE f.funcionario_id IS NULL
  AND u.deletado = 'N';
```

---

### Problema 4: `user_id` não relacionado com auth.users

**Causa:** Registro em `tbusuario` não tem `user_id` preenchido

**Solução:**
```sql
-- Verificar registros sem user_id
SELECT * FROM tbusuario WHERE user_id IS NULL;

-- Atualizar manualmente (SE NECESSÁRIO)
UPDATE tbusuario
SET user_id = '<UUID-DO-AUTH-USERS>'
WHERE usuario_id = <ID-DO-USUARIO>;
```

---

## 🎯 Teste Final

**Script de teste completo:**

```typescript
// Adicione temporariamente em Login.tsx após linha 141
console.log('🧪 TESTE DE AUTENTICAÇÃO');
console.log('1. User autenticado:', data.user.id);
console.log('2. Email:', data.user.email);

// Verificar se AuthContext vai capturar
setTimeout(() => {
  const stored = localStorage.getItem('colaboradorLogado');
  console.log('3. Dados salvos no localStorage:', stored);
}, 2000);
```

---

## ✅ Verificação Final

Se tudo estiver funcionando, você deverá ver:

1. ✅ Login bem-sucedido
2. ✅ Console mostra "Perfil do usuário carregado"
3. ✅ localStorage contém dados do usuário
4. ✅ Header exibe nome, cargo, email e matrícula corretos
5. ✅ Nenhum erro no console

---

## 🔗 Relacionamentos Necessários

```
auth.users (Supabase Auth)
    ↓ id
tbusuario
    ↓ user_id (UUID)
    ↓ funcionario_id
tbfuncionario
    ↓ funcionario_id (PK)
```

**Importante:** Certifique-se de que:
- `tbusuario.user_id` existe e é do tipo UUID
- `tbusuario.funcionario_id` referencia `tbfuncionario.funcionario_id`
- RLS policies permitem leitura dos dados
