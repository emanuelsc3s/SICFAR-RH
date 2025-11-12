# Documentação do Projeto SICFAR-RH

## 📝 Regras de Documentação

- Só crie arquivo de documentação quando claramente solicitado.

## 🔒 Segurança em Documentação

**NUNCA exponha credenciais reais em documentação!**

### ❌ NÃO FAÇA:

```env
# ❌ ERRADO - Senha real exposta
EMAIL_API_SENHA=teste
DATABASE_PASSWORD=minha_senha_123
API_KEY=sk-teste
```

### ✅ FAÇA:

```env
# ✅ CORRETO - Use placeholders
EMAIL_API_SENHA=sua_senha_smtp_aqui
DATABASE_PASSWORD=sua_senha_database_aqui
API_KEY=sua_api_key_aqui
```

### 📋 Checklist de Segurança para Documentação:

Antes de criar ou atualizar documentação, verifique:

- [ ] Nenhuma senha real está exposta
- [ ] Todos os exemplos usam placeholders (ex: `sua_senha_aqui`)
- [ ] Variáveis de ambiente são referenciadas, não seus valores
- [ ] Avisos de segurança estão incluídos quando necessário
- [ ] Instruções claras sobre onde colocar valores reais (arquivo `.env`)

### 🛡️ Boas Práticas:

1. **Use placeholders descritivos:**
   - ✅ `sua_senha_smtp_aqui`
   - ✅ `your_api_key_here`
   - ✅ `<sua-senha>`
   - ❌ `123456`
   - ❌ `password`

2. **Adicione avisos de segurança:**
   ```markdown
   **⚠️ IMPORTANTE:** Substitua `sua_senha_aqui` pela senha real no arquivo `.env` (não commitado).
   ```

3. **Referencie variáveis de ambiente:**
   ```javascript
   // ✅ CORRETO
   const senha = process.env.EMAIL_API_SENHA

   // ❌ ERRADO
   const senha = "minha_senha_123"
   ```