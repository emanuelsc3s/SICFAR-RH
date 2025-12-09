-- =====================================================
-- Migration: Criar ENUM para ícones de benefícios
-- Descrição: Define os ícones válidos para a tabela tbbeneficio
-- Data: 2025-12-08
-- =====================================================

-- 1. Criar o tipo ENUM para ícones
CREATE TYPE tipo_icone_beneficio AS ENUM (
  -- Saúde e Bem-estar
  'activity',      -- Academia/Atividades físicas
  'apple',         -- Alimentação saudável
  'brain',         -- Saúde mental/Terapia
  'eye',           -- Óculos/Oftalmologia
  'heart',         -- Saúde/Plano de saúde
  'pill',          -- Medicamentos
  'stethoscope',   -- Consultas médicas

  -- Transporte
  'bike',          -- Bicicleta/Mobilidade
  'bus',           -- Transporte público
  'car',           -- Carro
  'fuel',          -- Combustível
  'plane',         -- Viagens corporativas
  'train',         -- Trem/Metrô

  -- Alimentação
  'coffee',        -- Café/Lanche
  'pizza',         -- Fast food
  'salad',         -- Alimentação saudável
  'utensils',      -- Refeição/Vale alimentação

  -- Educação e Desenvolvimento
  'book-open',     -- Cursos/Educação
  'graduation-cap', -- Formação/Graduação
  'headphones',    -- Cursos online/E-learning
  'laptop',        -- Tecnologia/Equipamentos

  -- Financeiro
  'credit-card',   -- Vale presente/Cartão
  'dollar-sign',   -- Bônus/Auxílio financeiro
  'piggy-bank',    -- Previdência/Poupança
  'wallet',        -- Carteira/Benefícios flexíveis

  -- Lazer e Qualidade de Vida
  'baby',          -- Auxílio creche/Berçário
  'gift',          -- Presentes/Cestas
  'home',          -- Auxílio moradia/Home office
  'paw-print',     -- Pet/Auxílio pet
  'ticket',        -- Eventos/Cinema/Teatro
  'umbrella',      -- Seguros

  -- Outros
  'dumbbell',      -- Academia/Fitness
  'flame',         -- Chama/Energia
  'phone',         -- Telefone/Celular corporativo
  'shirt',         -- Uniforme/Vestuário
  'shopping-bag',  -- Compras/Varejo
  'sparkles',      -- Benefícios especiais
  'star',          -- Benefício genérico/Padrão ⭐
  'wifi'           -- Internet
);

-- 2. Alterar a coluna 'icone' na tabela tbbeneficio para usar o ENUM
-- NOTA: Se já existem dados na tabela, primeiro certifique-se de que todos os valores são válidos

-- Opção A: Se a tabela está vazia ou você quer fazer backup antes
ALTER TABLE tbbeneficio
  ALTER COLUMN icone TYPE tipo_icone_beneficio
  USING icone::tipo_icone_beneficio;

-- Opção B: Se houver valores NULL ou inválidos, use este comando comentado:
-- UPDATE tbbeneficio SET icone = 'star' WHERE icone IS NULL OR icone NOT IN (
--   'activity', 'apple', 'brain', 'eye', 'heart', 'pill', 'stethoscope',
--   'bike', 'bus', 'car', 'fuel', 'plane', 'train',
--   'coffee', 'pizza', 'salad', 'utensils',
--   'book-open', 'graduation-cap', 'headphones', 'laptop',
--   'credit-card', 'dollar-sign', 'piggy-bank', 'wallet',
--   'baby', 'gift', 'home', 'paw-print', 'ticket', 'umbrella',
--   'dumbbell', 'flame', 'phone', 'shirt', 'shopping-bag', 'sparkles', 'star', 'wifi'
-- );
-- ALTER TABLE tbbeneficio ALTER COLUMN icone TYPE tipo_icone_beneficio USING icone::tipo_icone_beneficio;

-- 3. (Opcional) Definir valor padrão
ALTER TABLE tbbeneficio
  ALTER COLUMN icone SET DEFAULT 'star';

-- 4. Comentários para documentação
COMMENT ON TYPE tipo_icone_beneficio IS 'Tipos de ícones válidos para benefícios (baseado em Lucide React)';
COMMENT ON COLUMN tbbeneficio.icone IS 'Ícone do benefício - deve corresponder aos ícones disponíveis no iconMap do frontend';

-- =====================================================
-- Para reverter esta migration (ROLLBACK):
-- =====================================================
-- ALTER TABLE tbbeneficio ALTER COLUMN icone TYPE VARCHAR(50);
-- DROP TYPE tipo_icone_beneficio;
