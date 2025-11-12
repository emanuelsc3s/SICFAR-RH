# 📧 Instruções - Envio de Email com Voucher em PDF

## 🎯 Funcionalidade Implementada

Foi implementado o envio automático de email transacional com PDF do voucher anexado quando o usuário confirma a solicitação de benefício.

## 🚀 Como Executar o Projeto

### 1️⃣ Instalar Dependências

Se ainda não instalou as dependências, execute:

```bash
npm install
```

### 2️⃣ Iniciar o Servidor Backend e Frontend

Para rodar o projeto completo (frontend + backend de email), execute:

```bash
npm run dev:all
```

Este comando irá iniciar:
- **Frontend (Vite)**: `http://localhost:8080`
- **Backend (Express)**: `http://localhost:3001`

**OU** você pode rodar separadamente em dois terminais:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run server
```

### 3️⃣ Verificar se o Servidor de Email está Funcionando

Acesse no navegador:
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

## 📋 Fluxo de Funcionamento

1. **Usuário faz login** no sistema
2. **Navega para "Solicitar Voucher"**
3. **Seleciona os benefícios** desejados (Etapa 1)
4. **Preenche os detalhes** da solicitação (Etapa 2)
5. **Revisa e confirma** a solicitação (Etapa 3)
6. **Ao clicar em "Confirmar Solicitação"**:
   - ✅ Gera o número do voucher
   - ✅ Gera o QR Code
   - ✅ Cria o PDF do voucher
   - ✅ Envia email para o colaborador com o PDF anexado
   - ✅ Exibe o voucher na tela

## 📧 Configuração SMTP

As configurações SMTP estão no arquivo `.env`:

```env
EMAIL_API=sicfar@farmace.com.br
EMAIL_API_SENHA=sua_senha_smtp_aqui
EMAIL_API_HOST=smtplw.com.br
EMAIL_API_PORTA=465
EMAIL_API_USER=farmace
BACKEND_PORT=3001
```

**⚠️ IMPORTANTE:** Substitua `sua_senha_smtp_aqui` pela senha real do SMTP no arquivo `.env` (não commitado).

## 🎨 Template do Email

O email enviado possui:
- ✅ Design responsivo e profissional
- ✅ Cores do design system SICFAR (azul #1E3A8A)
- ✅ Informações do voucher (número, benefícios, status)
- ✅ PDF do voucher anexado
- ✅ Mensagem personalizada com nome do colaborador

## 🔍 Testando a Funcionalidade

### Passo a Passo:

1. **Inicie o projeto:**
   ```bash
   npm run dev:all
   ```

2. **Acesse o sistema:**
   ```
   http://localhost:8080/login
   ```

3. **Faça login com credenciais de teste:**
   - **Matrícula:** `8` (ou `000008`)
   - **Senha:** `8681106`

4. **Navegue para "Solicitar Voucher"**

5. **Selecione benefícios e preencha o formulário**

6. **Clique em "Confirmar Solicitação"**

7. **Verifique:**
   - ✅ Mensagem de loading "Processando..."
   - ✅ Toast de sucesso "Voucher enviado por email com sucesso! 🎉"
   - ✅ Voucher exibido na tela
   - ✅ Email recebido na caixa de entrada do colaborador

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
- ✅ `.env` - Variáveis de ambiente SMTP
- ✅ `server/index.js` - Servidor Express para envio de emails
- ✅ `src/utils/pdfGenerator.ts` - Gerador de PDF do voucher
- ✅ `INSTRUCOES_EMAIL.md` - Este arquivo

### Arquivos Modificados:
- ✅ `src/pages/SolicitarBeneficio.tsx` - Integração com envio de email
- ✅ `package.json` - Novos scripts e dependências

## 🛠️ Dependências Instaladas

```json
{
  "dependencies": {
    "nodemailer": "^6.x.x",
    "express": "^4.x.x",
    "cors": "^2.x.x",
    "dotenv": "^16.x.x",
    "jspdf": "^2.x.x"
  },
  "devDependencies": {
    "concurrently": "^8.x.x",
    "@types/nodemailer": "^6.x.x"
  }
}
```

## ⚠️ Tratamento de Erros

O sistema possui tratamento robusto de erros:

- ✅ Se o email do colaborador não estiver cadastrado, exibe erro
- ✅ Se o servidor de email estiver offline, exibe aviso mas mostra o voucher
- ✅ Se houver erro no envio, o voucher ainda é exibido na tela
- ✅ Feedback visual em todas as etapas (loading, sucesso, erro)

## 🎯 Próximos Passos (Opcional)

Para melhorias futuras, considere:

1. **Salvar histórico de vouchers** em banco de dados
2. **Implementar fila de emails** (usando Bull ou RabbitMQ)
3. **Adicionar retry automático** em caso de falha no envio
4. **Criar dashboard** para acompanhar emails enviados
5. **Implementar templates** de email personalizáveis

## 📞 Suporte

Em caso de problemas:

1. Verifique se o servidor backend está rodando (`http://localhost:3001/health`)
2. Verifique as credenciais SMTP no arquivo `.env`
3. Verifique os logs do console do navegador e do terminal
4. Certifique-se de que o colaborador possui email cadastrado

## ✅ Checklist de Implementação

- [x] Criar arquivo `.env` com variáveis SMTP
- [x] Instalar dependências (nodemailer, express, jspdf, etc.)
- [x] Criar servidor Express para envio de emails
- [x] Criar gerador de PDF do voucher
- [x] Criar template de email HTML
- [x] Integrar envio de email no handleConfirmSolicitation
- [x] Adicionar feedback visual e tratamento de erros
- [x] Testar funcionalidade completa

---

**Desenvolvido para SICFAR-RH** 🚀

