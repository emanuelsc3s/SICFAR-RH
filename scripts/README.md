# 🛠️ Scripts de Utilidade - SICFAR-RH

Esta pasta contém scripts úteis para manutenção e verificação do projeto.

---

## 📋 Scripts Disponíveis

### **verificar-seguranca.sh** 🔒

Script de verificação de segurança que busca por credenciais expostas no projeto.

**Uso:**
```bash
./scripts/verificar-seguranca.sh
```

**O que verifica:**
1. ✅ Se `.env` está protegido no `.gitignore`
2. ✅ Se `.env` foi commitado no histórico do Git
3. ✅ Se `.env` está no staging (preparado para commit)
4. ✅ Padrões suspeitos de senhas em arquivos
5. ✅ Senhas antigas conhecidas que devem ser rotacionadas
6. ✅ Se `.env.example` existe e usa placeholders

**Saída esperada (quando tudo está OK):**
```
🔒 ==============================================
   VERIFICAÇÃO DE SEGURANÇA - SICFAR-RH
==============================================

📋 [1/6] Verificando proteção do arquivo .env...
✅ PASSOU - Arquivo .env está no .gitignore

📋 [2/6] Verificando se .env foi commitado no Git...
✅ PASSOU - Arquivo .env nunca foi commitado

📋 [3/6] Verificando se .env está no staging...
✅ PASSOU - Arquivo .env não está no staging

📋 [4/6] Buscando padrões de senha em arquivos...
✅ PASSOU - Nenhum padrão suspeito encontrado

📋 [5/6] Verificando senhas antigas conhecidas...
✅ PASSOU - Nenhuma senha antiga encontrada

📋 [6/6] Verificando arquivo .env.example...
✅ PASSOU - Arquivo .env.example existe e usa placeholders

==============================================
📊 RESUMO DA VERIFICAÇÃO
==============================================

✅ Verificações aprovadas: 6
❌ Problemas encontrados:  0

🎉 PARABÉNS! Nenhum problema de segurança encontrado!
```

**Quando executar:**
- ✅ Antes de fazer commit
- ✅ Antes de fazer push
- ✅ Após adicionar novas credenciais
- ✅ Periodicamente (mensal)
- ✅ Antes de deploy em produção

**Integração com Git Hooks (opcional):**

Para executar automaticamente antes de cada commit:

```bash
# Criar hook pre-commit
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
./scripts/verificar-seguranca.sh
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Commit bloqueado por problemas de segurança!"
    echo "   Corrija os problemas e tente novamente."
    exit 1
fi
EOF

# Tornar executável
chmod +x .git/hooks/pre-commit
```

---

## 🔧 Manutenção dos Scripts

### **Adicionar novas senhas antigas para verificação:**

Edite o arquivo `verificar-seguranca.sh` e adicione a senha antiga no array `OLD_PASSWORDS`:

```bash
OLD_PASSWORDS=(
    "pobhsxux2793"
    "321651310"
    "nova_senha_antiga_aqui"  # Adicione aqui
)
```

### **Adicionar novos padrões de busca:**

Edite o arquivo `verificar-seguranca.sh` e adicione o padrão no array `PATTERNS`:

```bash
PATTERNS=(
    "EMAIL_API_SENHA=[^s][^u][^a]"
    "password=['\"][^'\"]+"
    "novo_padrao_aqui"  # Adicione aqui
)
```

---

## 📚 Documentação Relacionada

- **Relatório de Segurança:** `/docs/RELATORIO_SEGURANCA_SMTP.md`
- **Migração para Edge Functions:** `/docs/email/MIGRACAO_SUPABASE_EDGE_FUNCTION.md`

---

## 🆘 Troubleshooting

### **Problema: "Permission denied"**

**Solução:**
```bash
chmod +x scripts/verificar-seguranca.sh
```

### **Problema: Script não encontra comandos Git**

**Causa:** Git não está instalado ou não está no PATH

**Solução:**
```bash
# Verificar se Git está instalado
git --version

# Se não estiver, instalar
sudo apt-get install git  # Ubuntu/Debian
brew install git          # macOS
```

### **Problema: Falsos positivos**

**Causa:** O script pode detectar padrões em comentários ou documentação

**Solução:**
- Revise manualmente os resultados
- Adicione exclusões no script se necessário
- Use placeholders claros como `sua_senha_aqui`

---

## 🎯 Boas Práticas

1. ✅ Execute o script antes de cada commit importante
2. ✅ Revise os resultados manualmente
3. ✅ Mantenha a lista de senhas antigas atualizada
4. ✅ Documente qualquer exclusão adicionada ao script
5. ✅ Compartilhe o script com a equipe

---

**Criado em:** 12/11/2025  
**Versão:** 1.0  
**Mantido por:** Equipe SICFAR-RH

