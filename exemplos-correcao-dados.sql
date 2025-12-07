-- ============================================================================
-- EXEMPLOS PRÁTICOS DE CORREÇÃO DE DADOS
-- SICFAR-RH - Relacionamento entre auth.users, tbusuario e tbfuncionario
-- ============================================================================
--
-- Este arquivo contém exemplos práticos de correção para cenários comuns
-- Execute cada seção conforme sua necessidade
--
-- ⚠️  IMPORTANTE: Substitua os valores de exemplo pelos seus dados reais
-- ============================================================================


-- ----------------------------------------------------------------------------
-- CENÁRIO 1: Usuário existe em auth.users mas NÃO existe em tbusuario
-- ----------------------------------------------------------------------------
-- Problema: Usuário consegue fazer login, mas não tem dados no sistema
-- Solução: Criar registro em tbusuario relacionando com funcionário

-- 1.1. Verificar se o usuário existe em auth.users
SELECT id, email, created_at
FROM auth.users
WHERE email = 'novo.usuario@farmace.com.br';  -- ← ALTERE AQUI
-- Copie o 'id' (UUID) retornado


-- 1.2. Verificar se existe funcionário sem usuário
SELECT funcionario_id, nome, matricula, cargo, cpf
FROM tbfuncionario
WHERE cpf = '123.456.789-00'  -- ← ALTERE AQUI (use CPF ou outro critério)
  OR nome ILIKE '%Nome do Funcionário%';  -- ← ALTERE AQUI
-- Copie o 'funcionario_id' retornado


-- 1.3. Criar registro em tbusuario relacionando os dois
INSERT INTO tbusuario (
    usuario,           -- Nome de usuário/login
    user_id,           -- UUID do auth.users
    funcionario_id,    -- ID do tbfuncionario
    perfil_id,         -- Nível de acesso (1=Admin, 2=Usuário, etc)
    deletado,          -- Flag de exclusão lógica
    created_at,
    updated_at
)
VALUES (
    'novo.usuario',                          -- ← ALTERE: nome de usuário
    'UUID-DO-AUTH-USERS-COPIADO-NO-1.1',    -- ← ALTERE: UUID do passo 1.1
    123,                                      -- ← ALTERE: funcionario_id do passo 1.2
    2,                                        -- ← ALTERE: perfil_id (2=usuário padrão)
    'N',                                      -- N = não deletado
    NOW(),
    NOW()
);

-- 1.4. Verificar se foi criado corretamente
SELECT
    u.usuario_id,
    u.usuario,
    u.user_id,
    u.funcionario_id,
    au.email,
    f.nome,
    f.cargo,
    f.matricula
FROM tbusuario u
INNER JOIN auth.users au ON u.user_id = au.id
INNER JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE au.email = 'novo.usuario@farmace.com.br';  -- ← ALTERE AQUI


-- ----------------------------------------------------------------------------
-- CENÁRIO 2: tbusuario existe mas NÃO tem user_id preenchido
-- ----------------------------------------------------------------------------
-- Problema: Usuário antigo sem relacionamento com auth.users
-- Solução: Atualizar user_id com UUID do auth.users

-- 2.1. Identificar usuários sem user_id
SELECT usuario_id, usuario, funcionario_id, user_id
FROM tbusuario
WHERE user_id IS NULL
  AND deletado = 'N';


-- 2.2. Encontrar o UUID no auth.users pelo email
SELECT id as user_id_para_copiar, email
FROM auth.users
WHERE email = 'usuario.existente@farmace.com.br';  -- ← ALTERE AQUI


-- 2.3. Atualizar o user_id em tbusuario
UPDATE tbusuario
SET
    user_id = 'UUID-COPIADO-DO-PASSO-2.2',  -- ← ALTERE AQUI
    updated_at = NOW()
WHERE usuario_id = 5  -- ← ALTERE: ID do usuário em tbusuario
  AND deletado = 'N';


-- 2.4. Verificar se foi atualizado corretamente
SELECT
    u.usuario_id,
    u.usuario,
    u.user_id,
    au.email,
    f.nome
FROM tbusuario u
LEFT JOIN auth.users au ON u.user_id = au.id
LEFT JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE u.usuario_id = 5;  -- ← ALTERE AQUI


-- ----------------------------------------------------------------------------
-- CENÁRIO 3: tbusuario existe mas funcionario_id é inválido
-- ----------------------------------------------------------------------------
-- Problema: funcionario_id aponta para registro que não existe
-- Solução: Criar funcionário ou corrigir funcionario_id

-- 3.1. Identificar usuários com funcionario_id inválido
SELECT
    u.usuario_id,
    u.usuario,
    u.funcionario_id,
    'PROBLEMA: funcionario_id não existe em tbfuncionario' as diagnostico
FROM tbusuario u
LEFT JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE f.funcionario_id IS NULL
  AND u.deletado = 'N';


-- 3.2. OPÇÃO A: Criar registro em tbfuncionario
INSERT INTO tbfuncionario (
    nome,
    matricula,
    cargo,
    cpf,
    email,
    data_admissao,
    created_at,
    updated_at
)
VALUES (
    'Nome Completo do Funcionário',   -- ← ALTERE AQUI
    'MAT12345',                        -- ← ALTERE AQUI
    'Cargo do Funcionário',            -- ← ALTERE AQUI
    '123.456.789-00',                  -- ← ALTERE AQUI
    'email@farmace.com.br',            -- ← ALTERE AQUI
    '2024-01-15',                      -- ← ALTERE AQUI
    NOW(),
    NOW()
)
RETURNING funcionario_id;  -- Copie este ID


-- 3.3. OPÇÃO B: Atualizar funcionario_id em tbusuario para um existente
-- Primeiro, encontre um funcionario_id válido
SELECT funcionario_id, nome, matricula
FROM tbfuncionario
WHERE nome ILIKE '%Nome%'  -- ← ALTERE AQUI
  OR cpf = '123.456.789-00';  -- ← ALTERE AQUI

-- Depois, atualize tbusuario
UPDATE tbusuario
SET
    funcionario_id = 999,  -- ← ALTERE: funcionario_id válido
    updated_at = NOW()
WHERE usuario_id = 5  -- ← ALTERE: usuario_id em tbusuario
  AND deletado = 'N';


-- ----------------------------------------------------------------------------
-- CENÁRIO 4: Múltiplos usuários precisam ser relacionados de uma vez
-- ----------------------------------------------------------------------------
-- Problema: Vários usuários sem user_id
-- Solução: Update em massa baseado em email

-- 4.1. Atualizar user_id baseado no email (quando email é igual em ambas tabelas)
-- ⚠️  ATENÇÃO: Execute apenas se tbusuario tiver coluna 'email' ou se conseguir relacionar

-- Exemplo 1: Se tbusuario tem coluna 'email'
UPDATE tbusuario u
SET
    user_id = au.id,
    updated_at = NOW()
FROM auth.users au
WHERE u.email = au.email  -- Relaciona pelo email
  AND u.user_id IS NULL   -- Apenas onde está vazio
  AND u.deletado = 'N';


-- Exemplo 2: Se precisa relacionar via tbfuncionario.email
UPDATE tbusuario u
SET
    user_id = au.id,
    updated_at = NOW()
FROM auth.users au
INNER JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE f.email = au.email  -- Relaciona pelo email do funcionário
  AND u.user_id IS NULL
  AND u.deletado = 'N';


-- 4.2. Verificar quantos foram atualizados
SELECT
    COUNT(*) FILTER (WHERE user_id IS NOT NULL) as com_user_id,
    COUNT(*) FILTER (WHERE user_id IS NULL) as sem_user_id,
    COUNT(*) as total
FROM tbusuario
WHERE deletado = 'N';


-- ----------------------------------------------------------------------------
-- CENÁRIO 5: Usuário tem dados mas não consegue ver (problema de RLS)
-- ----------------------------------------------------------------------------
-- Problema: Dados existem mas RLS bloqueia acesso
-- Solução: Verificar e recriar políticas RLS

-- 5.1. Verificar políticas atuais em tbusuario
SELECT
    policyname,
    cmd as tipo_operacao,
    qual as condicao,
    with_check
FROM pg_policies
WHERE tablename = 'tbusuario';


-- 5.2. Dropar todas as políticas antigas (CUIDADO!)
DROP POLICY IF EXISTS "usuarios_podem_ler_proprios_dados" ON tbusuario;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON tbusuario;
DROP POLICY IF EXISTS "users can read own data" ON tbusuario;
-- Adicione aqui outros nomes de políticas que apareceram no passo 5.1


-- 5.3. Criar política correta para SELECT
CREATE POLICY "usuarios_podem_ler_proprios_dados"
ON tbusuario
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);


-- 5.4. Fazer o mesmo para tbfuncionario
DROP POLICY IF EXISTS "usuarios_podem_ler_funcionario_relacionado" ON tbfuncionario;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON tbfuncionario;

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


-- 5.5. Testar se funciona (deve retornar seus dados quando logado)
SELECT
    u.usuario_id,
    u.usuario,
    f.nome,
    f.cargo,
    f.matricula,
    auth.uid() as meu_uuid
FROM tbusuario u
LEFT JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE u.user_id = auth.uid()
  AND u.deletado = 'N';


-- ----------------------------------------------------------------------------
-- CENÁRIO 6: Resetar tudo e começar do zero (CUIDADO!)
-- ----------------------------------------------------------------------------
-- ⚠️  ATENÇÃO: Execute apenas em desenvolvimento, NUNCA em produção!

-- 6.1. Desabilitar RLS temporariamente (para poder limpar)
ALTER TABLE tbusuario DISABLE ROW LEVEL SECURITY;
ALTER TABLE tbfuncionario DISABLE ROW LEVEL SECURITY;


-- 6.2. Limpar user_id de todos os registros
UPDATE tbusuario SET user_id = NULL WHERE user_id IS NOT NULL;


-- 6.3. Reabilitar RLS
ALTER TABLE tbusuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbfuncionario ENABLE ROW LEVEL SECURITY;


-- 6.4. Recriar políticas (execute Seção 5.3 e 5.4 acima)


-- ----------------------------------------------------------------------------
-- CENÁRIO 7: Criar usuário completo do zero
-- ----------------------------------------------------------------------------
-- Problema: Precisa criar tudo: auth.users + tbusuario + tbfuncionario
-- Solução: Criar em sequência

-- 7.1. Criar usuário no Supabase Auth
-- ⚠️  Execute via Supabase Dashboard > Authentication > Add User
-- Ou use a função criarUsuarioConfirmado() se tiver service_role key

-- Se tiver service_role key configurada:
/*
-- No código TypeScript/JavaScript:
import { criarUsuarioConfirmado } from '@/lib/supabase';

const { data, error } = await criarUsuarioConfirmado({
  email: 'novo@farmace.com.br',
  password: 'senha_segura_123',
  user_metadata: {
    nome: 'Nome Completo',
    matricula: 'MAT12345'
  }
});

console.log('User ID:', data.user.id);  // Copie este UUID
*/


-- 7.2. Criar registro em tbfuncionario
INSERT INTO tbfuncionario (
    nome,
    matricula,
    cargo,
    cpf,
    email,
    telefone,
    data_nascimento,
    data_admissao,
    status,
    created_at,
    updated_at
)
VALUES (
    'Nome Completo do Novo Funcionário',
    'MAT12345',
    'Analista de RH',
    '123.456.789-00',
    'novo@farmace.com.br',
    '(11) 98765-4321',
    '1990-01-15',
    '2024-01-01',
    'ativo',
    NOW(),
    NOW()
)
RETURNING funcionario_id;  -- Copie este ID


-- 7.3. Criar registro em tbusuario relacionando tudo
INSERT INTO tbusuario (
    usuario,
    user_id,           -- UUID do auth.users (passo 7.1)
    funcionario_id,    -- ID do tbfuncionario (passo 7.2)
    perfil_id,
    deletado,
    created_at,
    updated_at
)
VALUES (
    'novo.usuario',
    'UUID-DO-PASSO-7.1',      -- ← Cole o UUID aqui
    999,                       -- ← Cole o funcionario_id do passo 7.2
    2,                         -- Perfil padrão (2=usuário comum)
    'N',
    NOW(),
    NOW()
);


-- 7.4. Verificar se está tudo relacionado
SELECT
    'auth.users' as tabela,
    au.id::text as id,
    au.email as identificador
FROM auth.users au
WHERE email = 'novo@farmace.com.br'
UNION ALL
SELECT
    'tbfuncionario',
    f.funcionario_id::text,
    f.nome
FROM tbfuncionario f
WHERE email = 'novo@farmace.com.br'
UNION ALL
SELECT
    'tbusuario',
    u.usuario_id::text,
    u.usuario
FROM tbusuario u
INNER JOIN auth.users au ON u.user_id = au.id
WHERE au.email = 'novo@farmace.com.br';

-- Deve retornar 3 linhas (uma de cada tabela)


-- ----------------------------------------------------------------------------
-- UTILITÁRIOS: Queries úteis para manutenção
-- ----------------------------------------------------------------------------

-- Ver todos os relacionamentos de uma vez
SELECT
    u.usuario_id as id_tbusuario,
    u.usuario as login,
    u.user_id as uuid_auth,
    u.funcionario_id as id_funcionario,
    au.email as email_auth,
    f.nome as nome_funcionario,
    f.cargo,
    f.matricula,
    CASE
        WHEN u.user_id IS NULL THEN '❌ Sem user_id'
        WHEN au.id IS NULL THEN '❌ user_id inválido'
        WHEN f.funcionario_id IS NULL THEN '❌ funcionario_id inválido'
        ELSE '✅ OK'
    END as status
FROM tbusuario u
LEFT JOIN auth.users au ON u.user_id = au.id
LEFT JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE u.deletado = 'N'
ORDER BY u.usuario_id DESC;


-- Contar problemas
SELECT
    COUNT(*) FILTER (WHERE u.user_id IS NULL) as sem_user_id,
    COUNT(*) FILTER (WHERE au.id IS NULL AND u.user_id IS NOT NULL) as user_id_invalido,
    COUNT(*) FILTER (WHERE f.funcionario_id IS NULL) as funcionario_id_invalido,
    COUNT(*) FILTER (WHERE u.user_id IS NOT NULL AND au.id IS NOT NULL AND f.funcionario_id IS NOT NULL) as ok,
    COUNT(*) as total
FROM tbusuario u
LEFT JOIN auth.users au ON u.user_id = au.id
LEFT JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
WHERE u.deletado = 'N';


-- ============================================================================
-- FIM DOS EXEMPLOS
-- ============================================================================
