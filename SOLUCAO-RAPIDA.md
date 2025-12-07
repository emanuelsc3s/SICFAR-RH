# 🚀 SOLUÇÃO RÁPIDA - Funcionário 968

## 🎯 Problema Identificado

O debug mostrou:
- ✅ `tbusuario` carregando corretamente (usuarioId: 1, funcionarioId: 968)
- ❌ `tbfuncionario` **NÃO** retornando dados (nome: "Usuário", matricula: "", cargo: "Colaborador" - todos fallbacks)

**Causa:** JOIN com `tbfuncionario` não está funcionando. Pode ser:
1. RLS bloqueando acesso
2. `funcionario_id 968` não existe em `tbfuncionario`

---

## ⚡ Solução em 3 Passos

### **PASSO 1: Abrir Supabase SQL Editor**

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Menu lateral → **SQL Editor**
4. Clique em **New Query**

---

### **PASSO 2: Executar Query de Diagnóstico**

Cole e execute esta query:

```sql
-- Diagnóstico Completo
SELECT
    u.usuario_id,
    u.usuario,
    u.funcionario_id,
    f.funcionario_id as func_existe,
    f.nome as func_nome,
    f.matricula as func_matricula,
    f.cargo as func_cargo,
    CASE
        WHEN f.funcionario_id IS NULL THEN 'PROBLEMA: funcionario_id 968 não existe'
        WHEN f.nome IS NULL THEN 'PROBLEMA: RLS bloqueando acesso'
        ELSE 'OK: Dados completos'
    END as status
FROM tbusuario u
LEFT JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE u.usuario_id = 1
  AND u.deletado = 'N';
```

**Analise o resultado:**

#### ✅ **Cenário A: Funcionário existe (func_nome tem valor)**

Se `func_nome`, `func_matricula`, `func_cargo` **NÃO FOREM NULL**:
- **Problema:** RLS está bloqueando
- **Solução:** Execute PASSO 3 - SOLUÇÃO A

#### ❌ **Cenário B: Funcionário NÃO existe (func_nome é NULL)**

Se `func_existe` for NULL:
- **Problema:** `funcionario_id 968` não existe na tabela
- **Solução:** Execute PASSO 3 - SOLUÇÃO B

---

### **PASSO 3: Aplicar Correção**

#### **SOLUÇÃO A: Corrigir RLS (se funcionário existe)**

Execute isto:

```sql
-- 1. Dropar política antiga (se existir)
DROP POLICY IF EXISTS "authenticated_users_read_funcionario" ON tbfuncionario;

-- 2. Criar política que permite leitura para usuários autenticados
CREATE POLICY "authenticated_users_read_funcionario"
ON tbfuncionario
FOR SELECT
TO authenticated
USING (
    -- Permite ler se o funcionario_id está relacionado ao usuário logado
    funcionario_id IN (
        SELECT funcionario_id
        FROM tbusuario
        WHERE user_id = auth.uid()
          AND deletado = 'N'
    )
);

-- 3. Verificar se funcionou
SELECT
    u.usuario_id,
    u.usuario,
    f.nome,
    f.matricula,
    f.cargo
FROM tbusuario u
INNER JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE u.user_id = 'f513fb3e-f790-461d-8fef-58ff9d8c4b7e'
  AND u.deletado = 'N';
```

**✅ Se retornar dados:** RLS corrigido! Vá para PASSO 4.

**❌ Se ainda retornar vazio:** Tente a política mais permissiva:

```sql
DROP POLICY IF EXISTS "authenticated_users_read_funcionario" ON tbfuncionario;

CREATE POLICY "authenticated_users_read_funcionario"
ON tbfuncionario
FOR SELECT
TO authenticated
USING (true);  -- Permite todos autenticados lerem

-- Testar novamente
SELECT f.* FROM tbfuncionario f WHERE f.funcionario_id = 968;
```

---

#### **SOLUÇÃO B: Criar Funcionário (se não existe)**

**Opção 1: Criar funcionário com ID 968**

⚠️ **Substitua os dados pelos valores corretos:**

```sql
INSERT INTO tbfuncionario (
    funcionario_id,
    nome,
    matricula,
    cargo,
    cpf,
    email,
    data_nascimento,
    data_admissao,
    status,
    created_at,
    updated_at
)
VALUES (
    968,
    'Emanuel Silva',           -- ← ALTERE: seu nome completo
    'MAT001',                  -- ← ALTERE: sua matrícula
    'Gerente de TI',           -- ← ALTERE: seu cargo
    '000.000.000-00',          -- ← ALTERE: seu CPF
    'emanuel@farmace.com.br',
    '1990-01-01',              -- ← ALTERE: data nascimento
    '2020-01-01',              -- ← ALTERE: data admissão
    'ativo',
    NOW(),
    NOW()
);

-- Verificar se foi criado
SELECT * FROM tbfuncionario WHERE funcionario_id = 968;
```

**Opção 2: Usar funcionário existente**

Se você já tem um registro em `tbfuncionario` com seus dados:

```sql
-- 1. Encontrar seu funcionario_id real
SELECT funcionario_id, nome, matricula, cargo, email
FROM tbfuncionario
WHERE email = 'emanuel@farmace.com.br'
  OR cpf = '000.000.000-00'  -- ← ALTERE
  OR nome ILIKE '%Emanuel%';

-- 2. Atualizar tbusuario com o funcionario_id correto
UPDATE tbusuario
SET
    funcionario_id = 999,  -- ← ALTERE: use o funcionario_id encontrado acima
    updated_at = NOW()
WHERE usuario_id = 1
  AND deletado = 'N';
```

---

### **PASSO 4: Testar na Aplicação**

#### 4.1. Recarregar a página

- Pressione **Ctrl+Shift+R** (Windows/Linux) ou **Cmd+Shift+R** (Mac)

#### 4.2. Verificar os novos logs no console

Abra o Console do navegador (F12) e procure por:

```
🔍 DEBUG - Query response: { ... }
🔍 DEBUG - Dados do funcionário: { ... }
```

**✅ Deve mostrar:**
```javascript
🔍 DEBUG - Dados do funcionário: {
  funcionarioData: {
    nome: "Emanuel Silva",      // ← Agora com dados reais!
    cargo: "Gerente de TI",     // ← Agora com dados reais!
    matricula: "MAT001"          // ← Agora com dados reais!
  },
  isArray: false,
  funcionario: { nome: "Emanuel Silva", ... }
}
```

#### 4.3. Verificar o DebugAuth

O card de debug deve agora mostrar:

**Dados para o Header:**
- Nome (usuario): **Emanuel Silva** ✅
- Nome Completo: **Emanuel Silva** ✅ (não mais "Usuário")
- Cargo: **Gerente de TI** ✅ (não mais fallback)
- Email: **emanuel@farmace.com.br** ✅
- Matrícula: **MAT001** ✅ (não mais vazio)

#### 4.4. Verificar o Header

O Header deve exibir seus dados reais!

---

## 🔄 Se Ainda Não Funcionar

### Opção 1: Logout e Login novamente

1. Clique no avatar → Sair
2. Faça login novamente
3. Verifique o DebugAuth

### Opção 2: Limpar cache e localStorage

```javascript
// No Console do navegador (F12)
localStorage.clear();
location.reload();
```

Depois faça login novamente.

### Opção 3: Verificar se a query está correta

Execute no Supabase SQL Editor:

```sql
-- Esta é a EXATA query que o AuthContext executa
SELECT
    u.usuario_id,
    u.usuario,
    u.funcionario_id,
    u.perfil_id,
    u.deletado,
    jsonb_build_object(
        'matricula', f.matricula,
        'cargo', f.cargo,
        'nome', f.nome
    ) as tbfuncionario
FROM tbusuario u
LEFT JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE u.user_id = 'f513fb3e-f790-461d-8fef-58ff9d8c4b7e'
  AND u.deletado = 'N';
```

**✅ Resultado esperado:**
```json
{
  "usuario_id": 1,
  "usuario": "Emanuel Silva",
  "funcionario_id": 968,
  "tbfuncionario": {
    "matricula": "MAT001",
    "cargo": "Gerente de TI",
    "nome": "Emanuel Silva"
  }
}
```

**❌ Se `tbfuncionario` for `null`:**
- Volte ao PASSO 2 e analise novamente
- Verifique se as políticas RLS foram criadas corretamente

---

## 📋 Checklist Final

Marque após completar:

- [ ] 1. Executei PASSO 1 (abri Supabase SQL Editor)
- [ ] 2. Executei PASSO 2 (query de diagnóstico)
- [ ] 3. Identifiquei o problema (RLS ou funcionário inexistente)
- [ ] 4. Executei PASSO 3 (solução apropriada)
- [ ] 5. Query de verificação retorna dados completos
- [ ] 6. Recarreguei a aplicação (Ctrl+Shift+R)
- [ ] 7. Console mostra logs de debug com dados corretos
- [ ] 8. DebugAuth mostra dados completos (sem fallbacks)
- [ ] 9. Header exibe dados reais (nome, cargo, matrícula)

**✅ Se todos marcados: PROBLEMA RESOLVIDO!**

---

## 🎯 Resumo Visual

**ANTES (com problema):**
```
Header:
  Nome: "Emanuel Silva"  ← OK (de tbusuario.usuario)
  Cargo: "Colaborador"   ← ❌ FALLBACK
  Email: "emanuel@..."   ← OK (de auth.users)
  Matrícula: ""          ← ❌ VAZIO (fallback)
```

**DEPOIS (corrigido):**
```
Header:
  Nome: "Emanuel Silva"  ← OK (de tbusuario.usuario)
  Cargo: "Gerente de TI" ← ✅ REAL (de tbfuncionario.cargo)
  Email: "emanuel@..."   ← OK (de auth.users)
  Matrícula: "MAT001"    ← ✅ REAL (de tbfuncionario.matricula)
```

---

## 💡 Entendendo o Problema

**O que aconteceu:**

1. `tbusuario` tem `funcionario_id = 968`
2. AuthContext tenta fazer JOIN com `tbfuncionario`
3. JOIN retorna vazio porque:
   - **Opção A:** RLS bloqueia acesso
   - **Opção B:** `funcionario_id 968` não existe
4. AuthContext usa fallbacks: `nome: "Usuário"`, `matricula: ""`
5. Header exibe os fallbacks

**A solução:**

- Criar políticas RLS adequadas OU
- Criar/corrigir o registro em `tbfuncionario`

---

**Qualquer dúvida, me envie:**
- Screenshot do resultado da query de diagnóstico (PASSO 2)
- Logs do console (🔍 DEBUG)
- Screenshot do DebugAuth após as correções
