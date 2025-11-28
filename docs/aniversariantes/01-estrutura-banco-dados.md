# 📊 Estrutura de Banco de Dados - Supabase

## Visão Geral

Este documento descreve a estrutura de banco de dados que será implementada no **Supabase** na **Fase 2** do projeto. A estrutura atual (Fase 1) utiliza localStorage com formato compatível para facilitar a migração.

---

## 🗄️ Tabelas

### 1. `funcionarios`

Tabela principal com dados dos colaboradores (sincronizada com `data/funcionarios.json`).

```sql
CREATE TABLE funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  departamento VARCHAR(100),
  data_nascimento DATE,
  data_admissao DATE,
  email VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_funcionarios_matricula ON funcionarios(matricula);
CREATE INDEX idx_funcionarios_data_nascimento ON funcionarios(data_nascimento);
```

**Campos:**
- `id`: Identificador único (UUID)
- `matricula`: Matrícula do funcionário (chave única)
- `nome`: Nome completo
- `cpf`: CPF (formato: 000.000.000-00)
- `departamento`: Departamento/setor
- `data_nascimento`: Data de nascimento
- `data_admissao`: Data de admissão na empresa
- `email`: Email corporativo
- `avatar_url`: URL do avatar (opcional)
- `created_at`: Data de criação do registro
- `updated_at`: Data de última atualização

---

### 2. `curtidas_aniversario`

Armazena as curtidas/parabenizações dos aniversariantes.

```sql
CREATE TABLE curtidas_aniversario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id UUID REFERENCES funcionarios(id) ON DELETE CASCADE,
  autor_matricula VARCHAR(20) NOT NULL,
  ano INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: apenas 1 curtida por pessoa por ano
  CONSTRAINT unique_curtida_por_ano UNIQUE(funcionario_id, autor_matricula, ano)
);

-- Índices para performance
CREATE INDEX idx_curtidas_funcionario ON curtidas_aniversario(funcionario_id, ano);
CREATE INDEX idx_curtidas_autor ON curtidas_aniversario(autor_matricula, ano);
```

**Campos:**
- `id`: Identificador único
- `funcionario_id`: Referência ao aniversariante
- `autor_matricula`: Matrícula de quem curtiu
- `ano`: Ano da curtida (para limpar dados antigos)
- `created_at`: Data/hora da curtida

**Regras de Negócio:**
- Um usuário pode curtir apenas 1 vez por ano o mesmo aniversariante
- Curtidas são resetadas anualmente (novo ano = novas curtidas)
- Ao descurtir, o registro é removido

---

### 3. `comentarios_aniversario`

Armazena comentários/felicitações dos aniversariantes.

```sql
CREATE TABLE comentarios_aniversario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id UUID REFERENCES funcionarios(id) ON DELETE CASCADE,
  autor_matricula VARCHAR(20) NOT NULL,
  autor_nome VARCHAR(255) NOT NULL,
  autor_avatar TEXT,
  mensagem TEXT NOT NULL CHECK (char_length(mensagem) <= 500),
  ano INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_comentarios_funcionario ON comentarios_aniversario(funcionario_id, ano);
CREATE INDEX idx_comentarios_autor ON comentarios_aniversario(autor_matricula, ano);
CREATE INDEX idx_comentarios_created_at ON comentarios_aniversario(created_at DESC);
```

**Campos:**
- `id`: Identificador único
- `funcionario_id`: Referência ao aniversariante
- `autor_matricula`: Matrícula de quem comentou
- `autor_nome`: Nome de quem comentou (desnormalizado para performance)
- `autor_avatar`: Avatar de quem comentou (desnormalizado)
- `mensagem`: Texto do comentário (máx. 500 caracteres)
- `ano`: Ano do comentário
- `created_at`: Data/hora de criação
- `updated_at`: Data/hora de última edição

**Regras de Negócio:**
- Comentários limitados a 500 caracteres
- Usuário pode comentar múltiplas vezes
- Usuário pode remover apenas seus próprios comentários
- Comentários são mantidos por ano (histórico)

---

## 🔒 Row Level Security (RLS)

### Políticas para `curtidas_aniversario`

```sql
-- Habilitar RLS
ALTER TABLE curtidas_aniversario ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ver curtidas
CREATE POLICY "Visualizar curtidas públicas" 
  ON curtidas_aniversario 
  FOR SELECT 
  USING (true);

-- Usuário pode inserir próprias curtidas
CREATE POLICY "Inserir próprias curtidas" 
  ON curtidas_aniversario 
  FOR INSERT 
  WITH CHECK (
    autor_matricula = current_setting('app.current_user_matricula', true)
  );

-- Usuário pode remover apenas próprias curtidas
CREATE POLICY "Remover próprias curtidas" 
  ON curtidas_aniversario 
  FOR DELETE 
  USING (
    autor_matricula = current_setting('app.current_user_matricula', true)
  );
```

### Políticas para `comentarios_aniversario`

```sql
-- Habilitar RLS
ALTER TABLE comentarios_aniversario ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ver comentários
CREATE POLICY "Visualizar comentários públicos" 
  ON comentarios_aniversario 
  FOR SELECT 
  USING (true);

-- Usuário pode inserir próprios comentários
CREATE POLICY "Inserir próprios comentários" 
  ON comentarios_aniversario 
  FOR INSERT 
  WITH CHECK (
    autor_matricula = current_setting('app.current_user_matricula', true)
  );

-- Usuário pode remover apenas próprios comentários
CREATE POLICY "Remover próprios comentários" 
  ON comentarios_aniversario 
  FOR DELETE 
  USING (
    autor_matricula = current_setting('app.current_user_matricula', true)
  );

-- Usuário pode editar apenas próprios comentários
CREATE POLICY "Editar próprios comentários" 
  ON comentarios_aniversario 
  FOR UPDATE 
  USING (
    autor_matricula = current_setting('app.current_user_matricula', true)
  );
```

---

## 🔄 Triggers e Funções

### Atualizar `updated_at` automaticamente

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comentarios_updated_at
  BEFORE UPDATE ON comentarios_aniversario
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 📈 Queries Otimizadas

### Buscar aniversariante com interações

```sql
SELECT 
  f.id,
  f.matricula,
  f.nome,
  f.departamento,
  f.data_nascimento,
  f.data_admissao,
  f.avatar_url,
  COUNT(DISTINCT c.id) as total_curtidas,
  COUNT(DISTINCT com.id) as total_comentarios,
  EXISTS(
    SELECT 1 FROM curtidas_aniversario 
    WHERE funcionario_id = f.id 
    AND autor_matricula = $1 
    AND ano = $2
  ) as curtido_por_mim
FROM funcionarios f
LEFT JOIN curtidas_aniversario c ON c.funcionario_id = f.id AND c.ano = $2
LEFT JOIN comentarios_aniversario com ON com.funcionario_id = f.id AND com.ano = $2
WHERE f.matricula = $3
GROUP BY f.id;
```

### Buscar comentários de um aniversariante

```sql
SELECT 
  id,
  autor_matricula,
  autor_nome,
  autor_avatar,
  mensagem,
  created_at,
  updated_at
FROM comentarios_aniversario
WHERE funcionario_id = $1 AND ano = $2
ORDER BY created_at DESC
LIMIT 50;
```

---

## 🗑️ Limpeza de Dados Antigos

### Remover curtidas de anos anteriores (executar anualmente)

```sql
DELETE FROM curtidas_aniversario 
WHERE ano < EXTRACT(YEAR FROM CURRENT_DATE);
```

### Arquivar comentários antigos (opcional)

```sql
-- Mover para tabela de histórico
INSERT INTO comentarios_aniversario_historico
SELECT * FROM comentarios_aniversario
WHERE ano < EXTRACT(YEAR FROM CURRENT_DATE) - 2;

-- Remover da tabela principal
DELETE FROM comentarios_aniversario
WHERE ano < EXTRACT(YEAR FROM CURRENT_DATE) - 2;
```

