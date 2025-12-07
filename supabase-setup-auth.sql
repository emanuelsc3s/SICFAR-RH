-- ============================================================================
-- Script de Configuração e Verificação de Autenticação
-- SICFAR-RH - Relacionamento entre auth.users, tbusuario e tbfuncionario
-- ============================================================================
--
-- Execute este script no Supabase SQL Editor para:
-- 1. Verificar a estrutura das tabelas
-- 2. Verificar se há dados relacionados
-- 3. Criar políticas RLS (Row Level Security) necessárias
-- 4. Testar a query de autenticação
--
-- ⚠️  IMPORTANTE: Execute seção por seção, verificando os resultados
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SEÇÃO 1: VERIFICAR ESTRUTURA DAS TABELAS
-- ----------------------------------------------------------------------------
-- Objetivo: Confirmar que as colunas necessárias existem

-- 1.1. Estrutura da tabela tbusuario
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tbusuario'
ORDER BY ordinal_position;

-- Colunas esperadas:
-- - usuario_id (integer)
-- - usuario (text ou varchar)
-- - user_id (uuid) ← CRÍTICO: deve existir e ser do tipo UUID
-- - funcionario_id (integer)
-- - perfil_id (integer)
-- - deletado (char ou varchar)


-- 1.2. Estrutura da tabela tbfuncionario
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tbfuncionario'
ORDER BY ordinal_position;

-- Colunas esperadas:
-- - funcionario_id (integer) ← PK
-- - nome (text ou varchar)
-- - matricula (text ou varchar)
-- - cargo (text ou varchar)


-- ----------------------------------------------------------------------------
-- SEÇÃO 2: VERIFICAR SE user_id EXISTE EM tbusuario
-- ----------------------------------------------------------------------------
-- ⚠️  Se a coluna user_id NÃO EXISTIR, você precisa criá-la:

-- DESCOMENTE E EXECUTE APENAS SE user_id NÃO EXISTIR:
/*
ALTER TABLE tbusuario
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_tbusuario_user_id ON tbusuario(user_id);
*/


-- ----------------------------------------------------------------------------
-- SEÇÃO 3: VERIFICAR DADOS RELACIONADOS
-- ----------------------------------------------------------------------------
-- Objetivo: Ver se há dados vinculados entre as tabelas

-- 3.1. Listar usuários do Supabase Auth
SELECT
    id as auth_user_id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;


-- 3.2. Verificar relacionamento: auth.users ↔ tbusuario
SELECT
    u.usuario_id,
    u.usuario,
    u.user_id,
    u.funcionario_id,
    u.perfil_id,
    u.deletado,
    au.email,
    au.last_sign_in_at
FROM tbusuario u
LEFT JOIN auth.users au ON u.user_id = au.id
WHERE u.deletado = 'N'
ORDER BY u.usuario_id DESC
LIMIT 10;

-- ⚠️  ATENÇÃO aos resultados:
-- - Se au.email for NULL → user_id não está relacionado com auth.users
-- - Se u.user_id for NULL → precisa popular esta coluna


-- 3.3. Verificar relacionamento completo: auth.users ↔ tbusuario ↔ tbfuncionario
SELECT
    u.usuario_id,
    u.usuario,
    u.user_id,
    u.funcionario_id,
    u.perfil_id,
    u.deletado,
    au.email,
    f.funcionario_id as func_id_verificacao,
    f.nome,
    f.matricula,
    f.cargo
FROM tbusuario u
LEFT JOIN auth.users au ON u.user_id = au.id
LEFT JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE u.deletado = 'N'
ORDER BY u.usuario_id DESC
LIMIT 10;

-- ⚠️  ATENÇÃO aos resultados:
-- - Se f.nome for NULL → funcionario_id não existe em tbfuncionario
-- - Todos os campos devem estar preenchidos para o JOIN funcionar


-- 3.4. Identificar dados órfãos (sem relacionamento)
-- Usuários em tbusuario sem user_id (não relacionados com auth.users)
SELECT
    usuario_id,
    usuario,
    funcionario_id,
    'SEM user_id (não relacionado com auth.users)' as problema
FROM tbusuario
WHERE user_id IS NULL
  AND deletado = 'N';

-- Usuários com funcionario_id inválido (não existe em tbfuncionario)
SELECT
    u.usuario_id,
    u.usuario,
    u.funcionario_id,
    'funcionario_id não existe em tbfuncionario' as problema
FROM tbusuario u
LEFT JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE f.funcionario_id IS NULL
  AND u.deletado = 'N';


-- ----------------------------------------------------------------------------
-- SEÇÃO 4: CORRIGIR RELACIONAMENTOS (se necessário)
-- ----------------------------------------------------------------------------
-- ⚠️  Execute apenas SE identificou problemas na Seção 3

-- 4.1. Relacionar usuário específico com auth.users
-- IMPORTANTE: Substitua os valores pelos corretos do seu banco

/*
-- Exemplo: Relacionar usuario_id=1 com um email específico do auth.users
UPDATE tbusuario
SET user_id = (
    SELECT id
    FROM auth.users
    WHERE email = 'emanuel@farmace.com.br'  -- ← ALTERE AQUI
    LIMIT 1
)
WHERE usuario_id = 1  -- ← ALTERE AQUI
  AND deletado = 'N';

-- Verificar se funcionou:
SELECT u.usuario_id, u.usuario, u.user_id, au.email
FROM tbusuario u
LEFT JOIN auth.users au ON u.user_id = au.id
WHERE u.usuario_id = 1;
*/


-- ----------------------------------------------------------------------------
-- SEÇÃO 5: VERIFICAR POLÍTICAS RLS (Row Level Security)
-- ----------------------------------------------------------------------------
-- Objetivo: Ver se há políticas de segurança que podem estar bloqueando acesso

-- 5.1. Verificar se RLS está habilitado
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename IN ('tbusuario', 'tbfuncionario');


-- 5.2. Listar políticas existentes em tbusuario
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as comando,
    qual as condicao,
    with_check
FROM pg_policies
WHERE tablename = 'tbusuario';


-- 5.3. Listar políticas existentes em tbfuncionario
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as comando,
    qual as condicao,
    with_check
FROM pg_policies
WHERE tablename = 'tbfuncionario';


-- ----------------------------------------------------------------------------
-- SEÇÃO 6: CRIAR POLÍTICAS RLS NECESSÁRIAS
-- ----------------------------------------------------------------------------
-- ⚠️  Execute apenas SE não houver políticas adequadas na Seção 5

-- 6.1. Habilitar RLS nas tabelas (se não estiver)
ALTER TABLE tbusuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbfuncionario ENABLE ROW LEVEL SECURITY;


-- 6.2. Política para tbusuario: usuário pode ler seus próprios dados
DROP POLICY IF EXISTS "usuarios_podem_ler_proprios_dados" ON tbusuario;

CREATE POLICY "usuarios_podem_ler_proprios_dados"
ON tbusuario
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);


-- 6.3. Política para tbfuncionario: usuário pode ler dados do funcionário relacionado
DROP POLICY IF EXISTS "usuarios_podem_ler_funcionario_relacionado" ON tbfuncionario;

CREATE POLICY "usuarios_podem_ler_funcionario_relacionado"
ON tbfuncionario
FOR SELECT
TO authenticated
USING (
    funcionario_id IN (
        SELECT funcionario_id
        FROM tbusuario
        WHERE user_id = auth.uid()
          AND deletado = 'N'
    )
);


-- 6.4. Verificar se as políticas foram criadas
SELECT
    tablename,
    policyname,
    cmd as comando
FROM pg_policies
WHERE tablename IN ('tbusuario', 'tbfuncionario')
ORDER BY tablename, policyname;


-- ----------------------------------------------------------------------------
-- SEÇÃO 7: TESTAR A QUERY DO AuthContext
-- ----------------------------------------------------------------------------
-- Esta é a mesma query que o AuthContext executa
-- ⚠️  Execute esta query AUTENTICADO no Supabase Dashboard

-- 7.1. Simular a query do AuthContext (substitua o UUID)
-- IMPORTANTE: Substitua '<UUID-DO-AUTH-USER>' pelo ID real de um usuário

/*
-- Para obter o UUID de um usuário específico:
SELECT id, email FROM auth.users WHERE email = 'emanuel@farmace.com.br';

-- Agora teste a query (substitua o UUID):
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
WHERE u.user_id = '<UUID-DO-AUTH-USER>'  -- ← ALTERE AQUI
  AND u.deletado = 'N';
*/


-- 7.2. Testar com auth.uid() (funciona apenas quando autenticado)
-- Execute esta query quando estiver logado no Supabase Dashboard
SELECT
    u.usuario_id,
    u.usuario,
    u.funcionario_id,
    u.perfil_id,
    u.deletado,
    f.matricula,
    f.cargo,
    f.nome,
    auth.uid() as meu_user_id
FROM tbusuario u
LEFT JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE u.user_id = auth.uid()
  AND u.deletado = 'N';

-- ⚠️  RESULTADO ESPERADO:
-- Deve retornar UMA linha com:
-- - usuario_id: número do ID interno
-- - usuario: nome de usuário/login
-- - nome: nome completo do funcionário
-- - cargo: cargo do funcionário
-- - matricula: matrícula do funcionário
-- Se retornar VAZIO → relacionamento não existe ou RLS está bloqueando


-- ----------------------------------------------------------------------------
-- SEÇÃO 8: DIAGNÓSTICO RÁPIDO
-- ----------------------------------------------------------------------------
-- Use esta query para diagnóstico rápido de problemas

SELECT
    '1. Total de usuários no auth.users' as verificacao,
    COUNT(*)::text as resultado
FROM auth.users
UNION ALL
SELECT
    '2. Total de registros em tbusuario (não deletados)',
    COUNT(*)::text
FROM tbusuario
WHERE deletado = 'N'
UNION ALL
SELECT
    '3. Registros em tbusuario COM user_id preenchido',
    COUNT(*)::text
FROM tbusuario
WHERE user_id IS NOT NULL
  AND deletado = 'N'
UNION ALL
SELECT
    '4. Registros em tbusuario SEM user_id (problema!)',
    COUNT(*)::text
FROM tbusuario
WHERE user_id IS NULL
  AND deletado = 'N'
UNION ALL
SELECT
    '5. Registros com JOIN completo funcionando',
    COUNT(*)::text
FROM tbusuario u
INNER JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE u.deletado = 'N'
  AND u.user_id IS NOT NULL;


-- ----------------------------------------------------------------------------
-- SEÇÃO 9: EXEMPLO DE SAÍDA ESPERADA
-- ----------------------------------------------------------------------------
/*
Quando tudo estiver funcionando, a query da Seção 7.2 deve retornar algo como:

usuario_id | usuario  | funcionario_id | perfil_id | deletado | matricula | cargo        | nome           | meu_user_id
-----------|----------|----------------|-----------|----------|-----------|--------------|----------------|-------------
1          | emanuel  | 123            | 2         | N        | MAT001    | Colaborador  | Emanuel Silva  | abc-123-uuid

Se retornar:
- VAZIO → user_id não está relacionado com auth.users
- NULL em nome/cargo/matricula → funcionario_id não existe em tbfuncionario
- Erro de permissão → RLS está bloqueando o acesso
*/


-- ============================================================================
-- CHECKLIST FINAL
-- ============================================================================
/*
Marque cada item após verificar:

[ ] 1. Coluna user_id existe em tbusuario e é do tipo UUID
[ ] 2. Todos os registros de tbusuario têm user_id preenchido
[ ] 3. user_id está relacionado corretamente com auth.users.id
[ ] 4. funcionario_id em tbusuario existe em tbfuncionario
[ ] 5. RLS está habilitado em tbusuario e tbfuncionario
[ ] 6. Políticas RLS foram criadas para permitir leitura
[ ] 7. Query de teste (Seção 7.2) retorna dados corretamente
[ ] 8. Nenhum dado órfão identificado na Seção 3.4

Se todos os itens estiverem marcados, o AuthContext deve funcionar corretamente!
*/
