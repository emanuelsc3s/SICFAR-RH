-- Script para corrigir o campo deletado da tabela tbusuario
-- Remove as aspas simples extras que estão armazenadas no valor

-- 1. Verificar valores atuais
SELECT 
  usuario_id,
  usuario,
  deletado,
  length(deletado) as tamanho_deletado,
  ascii(substring(deletado, 1, 1)) as primeiro_char
FROM tbusuario
LIMIT 10;

-- 2. Atualizar valores com aspas extras para valores corretos
-- Converte "'N'" para "N" e "'S'" para "S"
UPDATE tbusuario
SET deletado = CASE
  WHEN deletado = '''N''' THEN 'N'
  WHEN deletado = '''S''' THEN 'S'
  ELSE deletado
END
WHERE deletado IN ('''N''', '''S''');

-- 3. Verificar resultado
SELECT 
  usuario_id,
  usuario,
  deletado,
  length(deletado) as tamanho_deletado
FROM tbusuario
LIMIT 10;

-- 4. Alterar o default da coluna para não incluir aspas
ALTER TABLE tbusuario 
ALTER COLUMN deletado SET DEFAULT 'N';

-- 5. Verificar se há valores NULL e corrigir
UPDATE tbusuario
SET deletado = 'N'
WHERE deletado IS NULL;

