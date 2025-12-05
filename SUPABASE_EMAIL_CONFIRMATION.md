# 📧 Guia: Configuração de Confirmação de Email no Supabase

## 🎯 Problema

Ao tentar fazer login, você recebe o erro:
```
Erro de Autenticação
Email não confirmado. Verifique sua caixa de entrada
```

Este erro ocorre porque o Supabase, por padrão, exige que usuários confirmem seus emails antes de fazer login.

---

## ✅ Solução 1: Desabilitar Confirmação de Email (Recomendado para Desenvolvimento)

### 📋 Passo a Passo:

1. **Acesse o Painel do Supabase:**
   - Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecione seu projeto **SICFAR**

2. **Navegue até Authentication:**
   ```
   Menu Lateral → Authentication → Providers
   ```

3. **Configure o Provider de Email:**
   - Clique em **Email** na lista de providers
   - Procure pela seção **"Email Confirmations"**
   - **Desmarque** a opção **"Enable email confirmations"** ou **"Confirm email"**
   - Clique em **Save**

### 📸 Caminho Completo:
```
Dashboard → [Seu Projeto] → Authentication → Providers → Email → 
Confirm email (toggle OFF) → Save
```

### ⚠️ Importante:
- Esta configuração é **recomendada apenas para desenvolvimento/testes**
- Em **produção**, mantenha a confirmação de email **ativada** por segurança

---

## ✅ Solução 2: Confirmar Email Manualmente no Painel

Se você preferir manter a confirmação ativa, pode confirmar emails manualmente:

### 📋 Passo a Passo:

1. **Acesse a Lista de Usuários:**
   ```
   Menu Lateral → Authentication → Users
   ```

2. **Localize o Usuário:**
   - Encontre o usuário pelo email na tabela
   - Observe que a coluna **"Email Confirmed"** mostra **"No"** ou está vazia

3. **Confirme o Email:**
   - Clique nos **3 pontinhos** (⋮) ao lado do usuário
   - Selecione **"Confirm email"** ou **"Verify email"**
   - Confirme a ação

### 📸 Caminho Completo:
```
Dashboard → [Seu Projeto] → Authentication → Users → 
[Selecionar usuário] → ⋮ → Confirm email
```

---

## ✅ Solução 3: Confirmar Email via SQL

Para confirmar emails em massa ou via script:

### 📋 Passo a Passo:

1. **Acesse o SQL Editor:**
   ```
   Menu Lateral → SQL Editor → New query
   ```

2. **Execute uma das queries abaixo:**

#### Confirmar email de um usuário específico:
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'seu-email@exemplo.com';
```

#### Confirmar TODOS os usuários não confirmados:
```sql
-- ⚠️ CUIDADO: Use apenas em desenvolvimento!
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
```

#### Verificar status de confirmação:
```sql
SELECT 
  id,
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN 'Não confirmado'
    ELSE 'Confirmado'
  END as status
FROM auth.users
ORDER BY created_at DESC;
```

3. **Execute a Query:**
   - Clique em **Run** ou pressione `Ctrl+Enter`
   - Verifique os resultados na aba **Results**

---

## ✅ Solução 4: Criar Usuários Já Confirmados Programaticamente

### 🔑 Requisitos:

1. **Obter Service Role Key:**
   - Vá para **Settings → API**
   - Copie a **service_role key** (não a anon key)
   - ⚠️ **NUNCA exponha esta chave em produção!**

2. **Adicionar no arquivo `.env`:**
```env
# ⚠️ APENAS PARA DESENVOLVIMENTO - NÃO COMMITAR!
VITE_SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### 💻 Uso da Função:

A função `criarUsuarioConfirmado()` já foi adicionada em `src/lib/supabase.ts`:

```typescript
import { criarUsuarioConfirmado } from '@/lib/supabase';

// Criar usuário com email já confirmado
const { data, error } = await criarUsuarioConfirmado({
  email: 'usuario@exemplo.com',
  password: 'senha123',
  user_metadata: {
    nome: 'Nome do Usuário',
    matricula: '12345',
    cpf: '12345678900'
  }
});

if (error) {
  console.error('Erro ao criar usuário:', error);
} else {
  console.log('Usuário criado com sucesso:', data.user);
}
```

### ⚠️ Avisos de Segurança:

- **NUNCA** use `service_role key` no frontend em produção
- Esta solução é **apenas para desenvolvimento/testes**
- Em produção, use a `service_role key` apenas no backend
- Adicione `.env` no `.gitignore` para não commitar credenciais

---

## 🔍 Verificar Configuração Atual

### Via Painel:
```
Authentication → Providers → Email → Verificar "Enable email confirmations"
```

### Via SQL:
```sql
-- Verificar configuração de autenticação
SELECT * FROM auth.config;
```

---

## 📊 Comparação das Soluções

| Solução | Facilidade | Segurança | Uso Recomendado |
|---------|-----------|-----------|-----------------|
| **1. Desabilitar confirmação** | ⭐⭐⭐⭐⭐ | ⚠️ Baixa | Desenvolvimento |
| **2. Confirmar manualmente** | ⭐⭐⭐ | ✅ Alta | Poucos usuários |
| **3. Confirmar via SQL** | ⭐⭐⭐⭐ | ✅ Alta | Muitos usuários |
| **4. Criar já confirmado** | ⭐⭐ | ⚠️ Baixa | Scripts de teste |

---

## 🎯 Recomendação Final

### Para Desenvolvimento/Testes:
✅ **Use a Solução 1** (Desabilitar confirmação de email)
- Mais rápido e prático
- Não requer configuração adicional
- Fácil de reverter

### Para Produção:
✅ **Mantenha confirmação ativada** e configure SMTP:
1. Vá para **Authentication → Email Templates**
2. Configure seu servidor SMTP em **Settings → Auth**
3. Personalize os templates de email
4. Teste o fluxo completo de confirmação

---

## 🐛 Troubleshooting

### Problema: Ainda recebo erro após desabilitar confirmação
**Solução:** Limpe o cache do navegador e tente novamente

### Problema: Não encontro a opção "Confirm email"
**Solução:** Verifique se você tem permissões de admin no projeto

### Problema: SQL retorna erro de permissão
**Solução:** Certifique-se de estar usando o SQL Editor do Supabase, não um cliente externo

---

## 📚 Referências

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Confirmations](https://supabase.com/docs/guides/auth/auth-email)
- [Admin API](https://supabase.com/docs/reference/javascript/auth-admin-createuser)

