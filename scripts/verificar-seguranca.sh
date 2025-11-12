#!/bin/bash

# ============================================================================
# SCRIPT DE VERIFICAÇÃO DE SEGURANÇA - SICFAR-RH
# ============================================================================
# Descrição: Verifica se há credenciais expostas no projeto
# Uso: ./scripts/verificar-seguranca.sh
# Data: 12/11/2025
# ============================================================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
ISSUES_FOUND=0
CHECKS_PASSED=0

echo ""
echo "🔒 =============================================="
echo "   VERIFICAÇÃO DE SEGURANÇA - SICFAR-RH"
echo "=============================================="
echo ""

# ============================================================================
# 1. VERIFICAR SE .env ESTÁ NO .gitignore
# ============================================================================
echo "📋 [1/6] Verificando proteção do arquivo .env..."

if grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}✅ PASSOU${NC} - Arquivo .env está no .gitignore"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌ FALHOU${NC} - Arquivo .env NÃO está no .gitignore"
    echo "   Solução: Adicione '.env' ao arquivo .gitignore"
    ((ISSUES_FOUND++))
fi

echo ""

# ============================================================================
# 2. VERIFICAR SE .env FOI COMMITADO
# ============================================================================
echo "📋 [2/6] Verificando se .env foi commitado no Git..."

if git log --all --full-history --source -- .env 2>/dev/null | grep -q "commit"; then
    echo -e "${RED}❌ FALHOU${NC} - Arquivo .env foi commitado no histórico do Git"
    echo "   Solução: Remover do histórico com git filter-branch ou BFG Repo-Cleaner"
    ((ISSUES_FOUND++))
else
    echo -e "${GREEN}✅ PASSOU${NC} - Arquivo .env nunca foi commitado"
    ((CHECKS_PASSED++))
fi

echo ""

# ============================================================================
# 3. VERIFICAR SE .env ESTÁ NO STAGING
# ============================================================================
echo "📋 [3/6] Verificando se .env está no staging..."

if git status --porcelain 2>/dev/null | grep -q "\.env$"; then
    echo -e "${YELLOW}⚠️  AVISO${NC} - Arquivo .env está no staging"
    echo "   Solução: Execute 'git reset HEAD .env'"
    ((ISSUES_FOUND++))
else
    echo -e "${GREEN}✅ PASSOU${NC} - Arquivo .env não está no staging"
    ((CHECKS_PASSED++))
fi

echo ""

# ============================================================================
# 4. BUSCAR PADRÕES DE SENHA EM ARQUIVOS
# ============================================================================
echo "📋 [4/6] Buscando padrões de senha em arquivos..."

# Padrões suspeitos
PATTERNS=(
    "EMAIL_API_SENHA=[^s][^u][^a]"  # EMAIL_API_SENHA=algo_que_nao_seja_sua
    "password=['\"][^'\"]+"
    "senha=['\"][^'\"]+"
    "api_key=['\"][^'\"]+"
    "secret=['\"][^'\"]+"
)

FOUND_PATTERNS=0

for pattern in "${PATTERNS[@]}"; do
    results=$(grep -r -E "$pattern" \
        --exclude-dir=node_modules \
        --exclude-dir=.git \
        --exclude-dir=dist \
        --exclude="*.log" \
        --exclude="verificar-seguranca.sh" \
        --exclude="RELATORIO_SEGURANCA_SMTP.md" \
        --exclude="CLAUDE.md" \
        --exclude="README.md" \
        . 2>/dev/null)
    
    if [ ! -z "$results" ]; then
        echo -e "${RED}❌ Padrão suspeito encontrado:${NC} $pattern"
        echo "$results" | head -5
        echo ""
        ((FOUND_PATTERNS++))
    fi
done

if [ $FOUND_PATTERNS -eq 0 ]; then
    echo -e "${GREEN}✅ PASSOU${NC} - Nenhum padrão suspeito encontrado"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌ FALHOU${NC} - Encontrados $FOUND_PATTERNS padrões suspeitos"
    ((ISSUES_FOUND++))
fi

echo ""

# ============================================================================
# 5. VERIFICAR SENHAS ESPECÍFICAS CONHECIDAS (após rotação)
# ============================================================================
echo "📋 [5/6] Verificando senhas antigas conhecidas..."

# IMPORTANTE: Adicione aqui senhas antigas que devem ser rotacionadas
OLD_PASSWORDS=(
    "pobhsxux2793"
    "321651310"
)

FOUND_OLD_PASSWORDS=0

for password in "${OLD_PASSWORDS[@]}"; do
    results=$(grep -r "$password" \
        --exclude-dir=node_modules \
        --exclude-dir=.git \
        --exclude-dir=dist \
        --exclude="*.log" \
        --exclude="verificar-seguranca.sh" \
        --exclude="RELATORIO_SEGURANCA_SMTP.md" \
        --exclude="CLAUDE.md" \
        --exclude="README.md" \
        . 2>/dev/null)
    
    if [ ! -z "$results" ]; then
        echo -e "${RED}❌ Senha antiga encontrada:${NC} $password"
        echo "$results"
        echo ""
        ((FOUND_OLD_PASSWORDS++))
    fi
done

if [ $FOUND_OLD_PASSWORDS -eq 0 ]; then
    echo -e "${GREEN}✅ PASSOU${NC} - Nenhuma senha antiga encontrada"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌ FALHOU${NC} - Encontradas $FOUND_OLD_PASSWORDS senhas antigas"
    echo "   Solução: Remover senhas antigas da documentação"
    ((ISSUES_FOUND++))
fi

echo ""

# ============================================================================
# 6. VERIFICAR SE .env.example EXISTE E NÃO TEM SENHAS REAIS
# ============================================================================
echo "📋 [6/6] Verificando arquivo .env.example..."

if [ -f ".env.example" ]; then
    # Verificar se contém placeholders
    if grep -q "sua_senha" .env.example || grep -q "your_password" .env.example; then
        echo -e "${GREEN}✅ PASSOU${NC} - Arquivo .env.example existe e usa placeholders"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠️  AVISO${NC} - Arquivo .env.example pode conter valores reais"
        echo "   Solução: Use placeholders como 'sua_senha_aqui'"
        ((ISSUES_FOUND++))
    fi
else
    echo -e "${YELLOW}⚠️  AVISO${NC} - Arquivo .env.example não encontrado"
    echo "   Recomendação: Criar .env.example com placeholders"
fi

echo ""

# ============================================================================
# RESUMO FINAL
# ============================================================================
echo "=============================================="
echo "📊 RESUMO DA VERIFICAÇÃO"
echo "=============================================="
echo ""
echo -e "✅ Verificações aprovadas: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "❌ Problemas encontrados:  ${RED}$ISSUES_FOUND${NC}"
echo ""

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}🎉 PARABÉNS! Nenhum problema de segurança encontrado!${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  ATENÇÃO! Foram encontrados $ISSUES_FOUND problemas de segurança.${NC}"
    echo ""
    echo "📋 Próximos passos:"
    echo "   1. Revise os problemas listados acima"
    echo "   2. Corrija cada problema identificado"
    echo "   3. Execute este script novamente"
    echo "   4. Considere rotacionar senhas expostas"
    echo ""
    exit 1
fi

