# 🔧 Troubleshooting - Header Exibindo Email Incorreto

## 🐛 Problema Reportado

A div na linha 366 do Header.tsx está exibindo `emanuel@farmace.com.br` (e-mail do auth.users) ao invés do campo `usuario` da tabela `tbusuario`.

---

## 🔍 Diagnóstico

### Passo 1: Verificar Logs no Console

Abra o Console do navegador (F12) e procure pelos logs:

```
🔍 Debug Header - Dados recebidos: {
  usuario: {...},
  funcionarioArray: [...],
  funcionario: {...},
  'usuario.usuario': '...',
  'funcionario.nome': '...',
  'funcionario.cargo': '...',
  'funcionario.matricula': '...'
}

✅ Perfil montado: {
  nome: '...',
  cargo: '...',
  usuario: '...',
  matricula: '...'
}
```

### Passo 2: Verificar Dados no Banco

Execute esta query no Supabase SQL Editor:

```sql
-- Verificar dados do usuário logado
SELECT 
  u.usuario_id,
  u.usuario,
  u.user_id,
  u.deletado,
  u.funcionario_id,
  f.nome as funcionario_nome,
  f.cargo as funcionario_cargo,
  f.matricula as funcionario_matricula,
  au.email as auth_email
FROM tbusuario u
LEFT JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
LEFT JOIN auth.users au ON u.user_id = au.id
WHERE au.email = 'emanuel@farmace.com.br';
```

**Resultado esperado:**
```
usuario_id | usuario                  | user_id | deletado | funcionario_id | funcionario_nome | funcionario_cargo | funcionario_matricula | auth_email
-----------|--------------------------|---------|----------|----------------|------------------|-------------------|-----------------------|------------------------
1          | emanuel@farmace.com.br   | uuid... | N        | 123            | Emanuel Silva    | Gerente           | 00001                 | emanuel@farmace.com.br
```

---

## 🎯 Possíveis Causas e Soluções

### Causa 1: Campo `usuario` está NULL

**Sintoma:** Log mostra `'usuario.usuario': null` ou `undefined`

**Solução:**
```sql
-- Atualizar campo usuario com o email do auth.users
UPDATE tbusuario u
SET usuario = au.email
FROM auth.users au
WHERE u.user_id = au.id
AND u.usuario IS NULL;
```

### Causa 2: Campo `funcionario_id` está NULL

**Sintoma:** Log mostra `funcionario: null` ou `undefined`

**Solução:**
```sql
-- Verificar se existe funcionário com o email
SELECT funcionario_id, nome, email, matricula
FROM tbfuncionario
WHERE email = 'emanuel@farmace.com.br';

-- Se existir, vincular ao usuário
UPDATE tbusuario
SET funcionario_id = (
  SELECT funcionario_id 
  FROM tbfuncionario 
  WHERE email = 'emanuel@farmace.com.br'
  LIMIT 1
)
WHERE usuario = 'emanuel@farmace.com.br';
```

### Causa 3: Registro com `deletado = 'S'`

**Sintoma:** Query não retorna dados

**Solução:**
```sql
-- Verificar status do registro
SELECT usuario_id, usuario, deletado
FROM tbusuario
WHERE usuario = 'emanuel@farmace.com.br';

-- Se deletado = 'S', reativar
UPDATE tbusuario
SET deletado = 'N'
WHERE usuario = 'emanuel@farmace.com.br';
```

### Causa 4: Join do Supabase retornando array vazio

**Sintoma:** Log mostra `funcionarioArray: []`

**Solução:** Verificar se o `funcionario_id` está correto:
```sql
-- Verificar vínculo
SELECT 
  u.usuario_id,
  u.funcionario_id,
  f.funcionario_id as f_id,
  f.nome
FROM tbusuario u
LEFT JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE u.usuario = 'emanuel@farmace.com.br';
```

---

## 📊 Estrutura Esperada dos Dados

### Resposta da Query Supabase

```typescript
{
  usuario_id: 1,
  usuario: "emanuel@farmace.com.br",
  funcionario_id: 123,
  perfil_id: 1,
  tbfuncionario: [  // ⚠️ ARRAY (não objeto)
    {
      matricula: "00001",
      cargo: "Gerente",
      nome: "Emanuel Silva"
    }
  ]
}
```

### Perfil Montado

```typescript
{
  nome: "Emanuel Silva",        // ← De tbfuncionario.nome
  cargo: "Gerente",             // ← De tbfuncionario.cargo
  usuario: "emanuel@farmace.com.br",  // ← De tbusuario.usuario
  matricula: "00001"            // ← De tbfuncionario.matricula
}
```

---

## 🧪 Teste Manual

### 1. Verificar Exibição no Header

**Trigger do Dropdown (linha 366):**
```
┌─────────────────────────┐
│ Emanuel Silva           │ ← Deve ser o NOME do funcionário
│ Gerente                 │ ← Deve ser o CARGO do funcionário
└─────────────────────────┘
```

**Dentro do Dropdown (linha 383):**
```
┌─────────────────────────────┐
│ emanuel@farmace.com.br      │ ← Deve ser o USUARIO da tbusuario
│ Matrícula: 00001            │ ← Deve ser a MATRICULA do funcionário
├─────────────────────────────┤
│ 🚪 Sair                     │
└─────────────────────────────┘
```

### 2. Verificar Variáveis no Console

Abra o Console e digite:

```javascript
// Verificar estado do componente
// (Adicione um breakpoint no código ou use React DevTools)
```

---

## 🔄 Script de Correção Completo

Se os dados estiverem inconsistentes, execute este script:

```sql
-- 1. Atualizar campo usuario com email do auth.users
UPDATE tbusuario u
SET usuario = au.email
FROM auth.users au
WHERE u.user_id = au.id
AND (u.usuario IS NULL OR u.usuario = '');

-- 2. Vincular funcionario_id baseado no email
UPDATE tbusuario u
SET funcionario_id = f.funcionario_id
FROM tbfuncionario f
WHERE u.usuario = f.email
AND u.funcionario_id IS NULL;

-- 3. Garantir que deletado = 'N'
UPDATE tbusuario
SET deletado = 'N'
WHERE deletado IS NULL OR deletado = '';

-- 4. Verificar resultado
SELECT 
  u.usuario_id,
  u.usuario,
  u.deletado,
  u.funcionario_id,
  f.nome,
  f.cargo,
  f.matricula
FROM tbusuario u
LEFT JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE u.usuario = 'emanuel@farmace.com.br';
```

---

## 📞 Próximos Passos

1. ✅ Abrir Console do navegador (F12)
2. ✅ Fazer login no sistema
3. ✅ Verificar logs `🔍 Debug Header`
4. ✅ Executar queries SQL acima
5. ✅ Compartilhar resultados para análise

---

**Última atualização:** 05/12/2024

