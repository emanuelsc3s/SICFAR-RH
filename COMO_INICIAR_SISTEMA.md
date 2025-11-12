# 🚀 Como Iniciar o Sistema SICFAR-RH

## ⚠️ IMPORTANTE

**O sistema possui 2 partes que precisam estar rodando:**

1. **Frontend** (Interface do usuário) - Porta 8080
2. **Backend** (Servidor de e-mail) - Porta 3001

**Ambos são necessários para o funcionamento completo do sistema!**

---

## 🎯 Método Recomendado (Mais Fácil)

### Iniciar Tudo de Uma Vez

```bash
npm run dev:all
```

Este comando inicia **automaticamente**:
- ✅ Frontend na porta 8080
- ✅ Backend na porta 3001

**Saída esperada:**

```
[0] 
[0] VITE v5.x.x  ready in xxx ms
[0] 
[0]   ➜  Local:   http://localhost:8080/
[0]   ➜  Network: use --host to expose
[0] 
[1] 🚀 Servidor de email rodando na porta 3001
[1] 📧 Configuração SMTP: smtplw.com.br:465
[1] ✅ Servidor SMTP pronto para enviar emails
```

**Pronto! O sistema está funcionando!** 🎉

Acesse: **http://localhost:8080**

---

## 🔧 Método Alternativo (Separado)

Se preferir iniciar cada parte separadamente:

### Terminal 1 - Backend (Servidor de E-mail)

```bash
npm run server
```

**Saída esperada:**
```
🚀 Servidor de email rodando na porta 3001
📧 Configuração SMTP: smtplw.com.br:465
✅ Servidor SMTP pronto para enviar emails
```

### Terminal 2 - Frontend (Interface)

```bash
npm run dev
```

**Saída esperada:**
```
VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
```

**Acesse:** http://localhost:8080

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de que:

- ✅ Node.js está instalado (versão 16 ou superior)
- ✅ Dependências foram instaladas:
  ```bash
  npm install
  ```
- ✅ Arquivo `.env` existe na raiz do projeto
- ✅ Credenciais SMTP estão configuradas no `.env`

---

## 🔍 Verificando se Está Funcionando

### 1. Verificar Frontend

Abra o navegador e acesse:
```
http://localhost:8080
```

Você deve ver a página de login do SICFAR-RH.

### 2. Verificar Backend

Abra o navegador e acesse:
```
http://localhost:3001/health
```

Você deve ver:
```json
{
  "status": "ok",
  "message": "Servidor de email está funcionando"
}
```

### 3. Verificar Portas em Uso

**Linux/Mac:**
```bash
# Verificar porta 8080 (Frontend)
lsof -i :8080

# Verificar porta 3001 (Backend)
lsof -i :3001
```

**Windows:**
```bash
# Verificar porta 8080 (Frontend)
netstat -ano | findstr 8080

# Verificar porta 3001 (Backend)
netstat -ano | findstr 3001
```

---

## 🛑 Como Parar o Sistema

### Se iniciou com `npm run dev:all`:

Pressione **Ctrl + C** no terminal

### Se iniciou separadamente:

Pressione **Ctrl + C** em **cada terminal** (Frontend e Backend)

---

## ⚠️ Problemas Comuns

### Problema 1: "Porta 8080 já está em uso"

**Solução:**
```bash
# Linux/Mac
lsof -ti:8080 | xargs kill -9

# Windows
netstat -ano | findstr 8080
# Anote o PID e execute:
taskkill /PID <PID> /F
```

### Problema 2: "Porta 3001 já está em uso"

**Solução:**
```bash
# Linux/Mac
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr 3001
# Anote o PID e execute:
taskkill /PID <PID> /F
```

### Problema 3: "Servidor SMTP com erro"

**Causa:** Credenciais SMTP incorretas no `.env`

**Solução:**
1. Verifique o arquivo `.env`
2. Confirme as credenciais:
   ```env
   EMAIL_API=sicfar@farmace.com.br
   EMAIL_API_SENHA=sua_senha_smtp_aqui
   EMAIL_API_HOST=smtplw.com.br
   EMAIL_API_PORTA=465
   EMAIL_API_USER=farmace
   ```
   **⚠️ IMPORTANTE:** Use a senha real do SMTP no arquivo `.env`
3. Reinicie o backend

### Problema 4: "Erro ao enviar e-mail"

**Causa:** Backend não está rodando

**Solução:**
1. Verifique se o backend está rodando:
   ```bash
   curl http://localhost:3001/health
   ```
2. Se não estiver, inicie com:
   ```bash
   npm run server
   ```

### Problema 5: "Dependências não instaladas"

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Estrutura do Sistema

```
SICFAR-RH/
├── src/                    # Frontend (React + TypeScript)
│   ├── pages/             # Páginas da aplicação
│   ├── components/        # Componentes reutilizáveis
│   └── utils/             # Utilitários (voucherStorage, etc)
│
├── server/                # Backend (Node.js + Express)
│   └── index.js          # Servidor de e-mail
│
├── .env                   # Variáveis de ambiente (SMTP)
├── package.json          # Dependências e scripts
└── vite.config.ts        # Configuração do Vite
```

---

## 🔐 Configuração SMTP

O sistema usa as seguintes configurações SMTP (arquivo `.env`):

```env
EMAIL_API=sicfar@farmace.com.br
EMAIL_API_SENHA=sua_senha_smtp_aqui
EMAIL_API_HOST=smtplw.com.br
EMAIL_API_PORTA=465
EMAIL_API_USER=farmace
BACKEND_PORT=3001
```

**Importante:**
- Porta 465 usa SSL/TLS (secure: true)
- Credenciais devem estar válidas e ativas
- O servidor SMTP deve estar acessível
- **⚠️ Substitua `sua_senha_smtp_aqui` pela senha real no arquivo `.env`**

---

## 🧪 Testando o Sistema Completo

### Passo a Passo:

1. **Inicie o sistema:**
   ```bash
   npm run dev:all
   ```

2. **Acesse o sistema:**
   ```
   http://localhost:8080/login
   ```

3. **Faça login:**
   - Matrícula: `12345`
   - Senha: `senha123`

4. **Solicite um voucher:**
   - Clique em "Solicitar Novo Voucher"
   - Selecione benefícios
   - Preencha os dados
   - Clique em "Confirmar Solicitação"

5. **Verifique:**
   - ✅ Voucher é exibido na tela
   - ✅ E-mail é enviado
   - ✅ Voucher é salvo no localStorage
   - ✅ Voucher aparece em "Benefício Faturas"

---

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia apenas o frontend |
| `npm run server` | Inicia apenas o backend |
| `npm run dev:all` | Inicia frontend + backend |
| `npm run build` | Compila o projeto para produção |
| `npm run preview` | Visualiza o build de produção |
| `npm run lint` | Verifica erros de código |

---

## 🎯 Fluxo de Funcionamento

```
1. USUÁRIO ACESSA
   ↓
2. FRONTEND (localhost:8080)
   ↓
3. USUÁRIO SOLICITA VOUCHER
   ↓
4. FRONTEND GERA:
   - Número do voucher
   - QR Code
   - PDF
   ↓
5. FRONTEND SALVA NO LOCALSTORAGE
   ↓
6. FRONTEND ENVIA PARA BACKEND (localhost:3001)
   ↓
7. BACKEND ENVIA E-MAIL (SMTP)
   ↓
8. USUÁRIO RECEBE E-MAIL
   ↓
9. VOUCHER APARECE EM "FATURAS"
```

---

## 🆘 Suporte

Se ainda tiver problemas:

1. **Verifique os logs do console:**
   - Abra o DevTools (F12)
   - Vá para a aba Console
   - Procure por erros em vermelho

2. **Verifique os logs do backend:**
   - Olhe o terminal onde o backend está rodando
   - Procure por mensagens de erro

3. **Teste o health check:**
   ```bash
   curl http://localhost:3001/health
   ```

4. **Limpe o cache:**
   ```bash
   # Limpar node_modules
   rm -rf node_modules package-lock.json
   npm install
   
   # Limpar cache do navegador
   Ctrl + Shift + Delete
   ```

---

## ✅ Checklist de Inicialização

Antes de usar o sistema, verifique:

- [ ] Node.js instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Porta 8080 livre
- [ ] Porta 3001 livre
- [ ] Backend iniciado (`npm run server`)
- [ ] Frontend iniciado (`npm run dev`)
- [ ] Health check funcionando (`http://localhost:3001/health`)
- [ ] Login funcionando (`http://localhost:8080/login`)

---

**Data:** 11/11/2025  
**Versão:** 1.0.0  
**Sistema:** SICFAR-RH  
**Desenvolvedor:** Augment Agent

