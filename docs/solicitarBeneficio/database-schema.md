# 📊 Estrutura de Banco de Dados - Vouchers Solicitados

## Documentação Técnica para Supabase

Este documento define a estrutura de banco de dados necessária para armazenar os vouchers solicitados através do componente `SolicitarBeneficio.tsx`.

---

## 📋 Resumo dos Campos Identificados no Componente

### Interface `VoucherEmitido` (Atual - localStorage)

| Campo         | Tipo                                    | Descrição                              |
|---------------|-----------------------------------------|----------------------------------------|
| id            | string                                  | Número único do voucher (VOU...)       |
| funcionario   | string                                  | Nome completo do colaborador           |
| cpf           | string                                  | CPF formatado (XXX.XXX.XXX-XX)         |
| valor         | number                                  | Valor total calculado                  |
| dataResgate   | string                                  | Data de resgate (DD/MM/YYYY)           |
| horaResgate   | string                                  | Hora de resgate (HH:MM)                |
| beneficios    | string[]                                | Lista de benefícios selecionados       |
| parceiro      | string                                  | Parceiro/benefício principal           |
| status        | 'emitido' \| 'resgatado' \| 'expirado'  | Status do voucher                      |
| dataValidade  | string                                  | Data de validade (DD/MM/YYYY)          |

### Campos do Formulário (Step 2)

| Campo                 | Tipo    | Descrição                                   |
|-----------------------|---------|---------------------------------------------|
| justificativa         | string  | Justificativa para solicitação excedente    |
| urgente               | boolean | Indica se a solicitação é urgente (Sim/Não) |
| informacoesAdicionais | string  | Informações complementares (opcional)       |

---

## 🗄️ Estrutura das Tabelas

### 1. Tabela: `tbvoucher`

Tabela principal para armazenar os vouchers solicitados.

> **💡 Decisão de Design:**
> Esta tabela usa **UUID como identificador único** do voucher (`voucher_id`).
> - ✅ Simplicidade: Um único campo identificador
> - ✅ Unicidade garantida: UUID v4 com 2^128 possibilidades
> - ✅ Segurança: IDs não sequenciais e imprevisíveis
> - ✅ Distribuído: Pode ser gerado em qualquer lugar sem coordenação
>
> **QR Code Simplificado:**
> - O QR Code contém **APENAS o UUID** (`voucher_id`)
> - Validação feita por consulta ao banco de dados
> - Dados sempre atualizados (single source of truth)
> - Sem necessidade de campo `qr_code_data` (redundante)
>
> **Dados sensíveis:**
> - CPF do funcionário **não é armazenado** nesta tabela (mantido apenas em `tbfuncionario`)
> - Reduz exposição de dados pessoais sensíveis

```sql
CREATE TABLE tbvoucher (
    -- Identificação
    voucher_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Dados do Funcionário
    funcionario_id INTEGER NOT NULL REFERENCES tbfuncionario(funcionario_id) ON DELETE RESTRICT,
    funcionario_nome VARCHAR(255) NOT NULL,
    funcionario_matricula VARCHAR(20),
    funcionario_email VARCHAR(255),

    -- Valor
    valor NUMERIC(10,2) NOT NULL DEFAULT 0.00,

    -- Datas
    data_emissao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_validade DATE NOT NULL,
    data_resgate TIMESTAMPTZ,
    hora_resgate TIME,

    -- Detalhes da Solicitação
    justificativa TEXT,
    urgente BOOLEAN NOT NULL DEFAULT false,
    informacoes_adicionais TEXT,

    -- Status e Controle
    status VARCHAR(20) NOT NULL DEFAULT 'emitido'
        CHECK (status IN ('emitido', 'pendente', 'aprovado', 'resgatado', 'expirado', 'cancelado')),

    -- Metadados
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Comentários da tabela
COMMENT ON TABLE tbvoucher IS 'Tabela principal de vouchers de benefícios solicitados';
COMMENT ON COLUMN tbvoucher.voucher_id IS 'Identificador único do voucher (UUID v4) - usado diretamente no QR Code';
COMMENT ON COLUMN tbvoucher.urgente IS 'Indica se a solicitação é urgente (true) ou normal (false)';
COMMENT ON COLUMN tbvoucher.status IS 'Status atual do voucher no ciclo de vida';
COMMENT ON COLUMN tbvoucher.funcionario_id IS 'Referência ao funcionário (INTEGER da tbfuncionario)';
```

### 2. Tabela: `tbvoucher_beneficio`

Tabela de relacionamento N:N entre vouchers e benefícios selecionados.

```sql
CREATE TABLE tbvoucher_beneficio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voucher_id UUID NOT NULL REFERENCES tbvoucher(voucher_id) ON DELETE CASCADE,
    beneficio_id UUID NOT NULL REFERENCES tbbeneficio(beneficio_id) ON DELETE RESTRICT,

    -- Valores no momento da emissão
    valor_unitario NUMERIC(10,2) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,

    -- Controle
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Chave única para evitar duplicatas
    CONSTRAINT voucher_beneficio_unique UNIQUE (voucher_id, beneficio_id)
);

COMMENT ON TABLE tbvoucher_beneficio IS 'Benefícios incluídos em cada voucher';
COMMENT ON COLUMN tbvoucher_beneficio.valor_unitario IS 'Valor do benefício no momento da emissão do voucher';
```

### 3. Tabela: `tbbeneficio` (Catálogo de Benefícios)

```sql
CREATE TABLE tbbeneficio (
    beneficio_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    valor NUMERIC(10,2),
    valor_maximo NUMERIC(10,2),
    icone VARCHAR(50),
    ativo BOOLEAN NOT NULL DEFAULT true,

    -- Metadados
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tbbeneficio IS 'Catálogo de benefícios disponíveis para solicitação';
COMMENT ON COLUMN tbbeneficio.beneficio_id IS 'Identificador único do benefício (UUID v4)';
```

### 4. Tabela: `tbfuncionario` (Referência - Já Existente)

> **⚠️ IMPORTANTE:** Esta tabela **já existe** no banco de dados com estrutura completa.
> A tabela `tbvoucher` faz referência a ela através do campo `funcionario_id` (INTEGER).

```sql
-- TABELA JÁ EXISTENTE - NÃO CRIAR NOVAMENTE
-- Estrutura de referência para entendimento do relacionamento

CREATE TABLE tbfuncionario (
    funcionario_id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    emp_codigo TEXT,
    matricula TEXT,
    nome TEXT,
    nome_social TEXT,
    cpf VARCHAR(14) NOT NULL,
    pis VARCHAR(15),
    dtnascimento DATE,
    sexo TEXT,
    estadocivil_id INTEGER,
    estadocivil_descricao VARCHAR(50),
    mae_nome TEXT,
    pai_nome TEXT,
    email TEXT,
    ddd VARCHAR(3),
    fone VARCHAR(15),
    celular VARCHAR(15),
    endereco TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cep VARCHAR(9),
    cidade_id INTEGER,
    cidade_nome VARCHAR(100),
    cidade_uf VARCHAR(2),
    ctps_numero VARCHAR(20),
    ctps_serie VARCHAR(10),
    ctps_dv VARCHAR(2),
    uf_ctps VARCHAR(2),
    ctps_dtexpedicao DATE,
    identidade_numero VARCHAR(20),
    identidade_orgao_expedidor VARCHAR(20),
    identidade_dtexpedicao DATE,
    titulo VARCHAR(20),
    zona VARCHAR(10),
    secao VARCHAR(10),
    admissao_data DATE,
    admissao_tipo VARCHAR(2),
    admissao_tipo_esocial VARCHAR(2),
    admissao_vinculo VARCHAR(2),
    dt_rescisao DATE,
    tem_deficiencia BOOLEAN DEFAULT false,
    preenche_cota_deficiencia BOOLEAN DEFAULT false,
    deficiencia_fisica BOOLEAN DEFAULT false,
    deficiencia_visual BOOLEAN DEFAULT false,
    deficiencia_auditiva BOOLEAN DEFAULT false,
    deficiencia_mental BOOLEAN DEFAULT false,
    deficiencia_intelectual BOOLEAN DEFAULT false,
    grau_instrucao VARCHAR(2),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    cargo_id INTEGER,
    cargo TEXT,
    cargo_codigo TEXT,
    funcao_id INTEGER,
    funcao TEXT,
    funcao_codigo TEXT,
    lotacao_id INTEGER,
    lotacao TEXT,
    lotacao_codigo TEXT,
    grauinstrucao_desc TEXT,

    CONSTRAINT tbfuncionario_pkey PRIMARY KEY (funcionario_id),
    CONSTRAINT tbfuncionario_funcionario_id_key UNIQUE (funcionario_id)
);

-- Índices já existentes
CREATE INDEX IF NOT EXISTS idx_tbfuncionario_nome ON tbfuncionario USING gin (nome gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tbfuncionario_nome_social ON tbfuncionario USING gin (nome_social gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tbfuncionario_email ON tbfuncionario USING btree (email);
CREATE INDEX IF NOT EXISTS idx_tbfuncionario_admissao_data ON tbfuncionario USING btree (admissao_data);
CREATE INDEX IF NOT EXISTS idx_tbfuncionario_ativo ON tbfuncionario USING btree (ativo);
CREATE INDEX IF NOT EXISTS idx_tbfuncionario_dt_rescisao ON tbfuncionario USING btree (dt_rescisao);
CREATE INDEX IF NOT EXISTS idx_tbfuncionario_emp_codigo ON tbfuncionario USING btree (emp_codigo);
CREATE INDEX IF NOT EXISTS idx_tbfuncionario_matricula ON tbfuncionario USING btree (matricula);

COMMENT ON TABLE tbfuncionario IS 'Cadastro completo de funcionários da empresa (TABELA JÁ EXISTENTE)';
```

---

## 🔗 Relacionamentos

```
┌──────────────────┐     ┌───────────────────────┐     ┌───────────────┐
│  tbfuncionario   │────<│      tbvoucher        │>────│  tbbeneficio  │
│  (JÁ EXISTENTE)  │     │                       │     │               │
└──────────────────┘     └───────────────────────┘     └───────────────┘
   funcionario_id              funcionario_id              beneficio_id
   (INTEGER PK)                (INTEGER FK)                (UUID PK)
        │                         │                           │
        │                    voucher_id                       │
        │                    (UUID PK)                        │
        │                         │                           │
        │                    ┌────┴────┐                      │
        │                    │         │                      │
        │              ┌─────┴─────────┴──────┐               │
        │              │ tbvoucher_beneficio  │───────────────┘
        │              └──────────────────────┘
        │                   voucher_id (UUID FK)
        │                   beneficio_id (UUID FK)
        │
   ┌────┴────┐
   │auth.users│ (Opcional - para login)
   └─────────┘
```

### Detalhes dos Relacionamentos

| Tabela Origem         | Campo FK           | Tabela Destino    | Campo PK          | Tipo      |
|-----------------------|--------------------|-------------------|-------------------|-----------|
| `tbvoucher`           | `funcionario_id`   | `tbfuncionario`   | `funcionario_id`  | INTEGER   |
| `tbvoucher_beneficio` | `voucher_id`       | `tbvoucher`       | `voucher_id`      | UUID      |
| `tbvoucher_beneficio` | `beneficio_id`     | `tbbeneficio`     | `beneficio_id`    | UUID      |

---

## 📊 Índices para Otimização

```sql
-- Índices na tabela tbvoucher
CREATE INDEX idx_voucher_funcionario_id ON tbvoucher(funcionario_id);
CREATE INDEX idx_voucher_status ON tbvoucher(status);
CREATE INDEX idx_voucher_data_emissao ON tbvoucher(data_emissao DESC);
CREATE INDEX idx_voucher_data_validade ON tbvoucher(data_validade);
CREATE INDEX idx_voucher_status_validade ON tbvoucher(status, data_validade)
    WHERE status = 'emitido';

-- Índice otimizado para validação rápida de QR Code (scan do parceiro)
-- Cobre a query mais comum: buscar voucher ativo por UUID
CREATE INDEX idx_voucher_scan_lookup ON tbvoucher(voucher_id, status, data_validade)
    WHERE status IN ('emitido', 'aprovado');

COMMENT ON INDEX idx_voucher_scan_lookup IS 'Índice otimizado para validação rápida de vouchers escaneados via QR Code';

-- Índices na tabela tbvoucher_beneficio
CREATE INDEX idx_voucher_beneficio_voucher ON tbvoucher_beneficio(voucher_id);
CREATE INDEX idx_voucher_beneficio_beneficio ON tbvoucher_beneficio(beneficio_id);

-- Índices na tabela tbfuncionario (JÁ EXISTENTES - NÃO CRIAR NOVAMENTE)
-- CREATE INDEX idx_tbfuncionario_matricula ON tbfuncionario(matricula);
-- CREATE INDEX idx_tbfuncionario_email ON tbfuncionario(email);
-- CREATE INDEX idx_tbfuncionario_ativo ON tbfuncionario(ativo);
-- (Ver seção da tabela tbfuncionario para lista completa de índices)

-- Índices na tabela tbbeneficio
CREATE INDEX idx_beneficio_codigo ON tbbeneficio(codigo);
CREATE INDEX idx_beneficio_ativo ON tbbeneficio(ativo) WHERE ativo = true;
```

---

## 🔐 Políticas RLS (Row Level Security)

### Habilitar RLS nas Tabelas

```sql
-- Habilitar RLS
ALTER TABLE tbvoucher ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbvoucher_beneficio ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbbeneficio ENABLE ROW LEVEL SECURITY;
-- tbfuncionario: Avaliar se já possui RLS configurado
```

### Políticas para Tabela `tbvoucher`

> **⚠️ NOTA:** As políticas abaixo assumem que existe uma tabela `user_roles` ou similar para controle de permissões.
> Ajuste conforme a estrutura de autenticação do seu projeto.

```sql
-- Funcionários podem ver apenas seus próprios vouchers
CREATE POLICY "Funcionarios visualizam proprios vouchers"
ON tbvoucher FOR SELECT
TO authenticated
USING (
    funcionario_id IN (
        SELECT funcionario_id FROM tbfuncionario
        WHERE email = auth.jwt()->>'email'  -- Ajustar conforme autenticação
        AND ativo = true
    )
);

-- Funcionários podem criar vouchers para si mesmos
CREATE POLICY "Funcionarios criam proprios vouchers"
ON tbvoucher FOR INSERT
TO authenticated
WITH CHECK (
    funcionario_id IN (
        SELECT funcionario_id FROM tbfuncionario
        WHERE email = auth.jwt()->>'email'  -- Ajustar conforme autenticação
        AND ativo = true
    )
);

-- Apenas RH e Admin podem atualizar vouchers
CREATE POLICY "RH atualiza vouchers"
ON tbvoucher FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'rh')
    )
);

-- Ninguém pode deletar vouchers (apenas soft delete via status)
CREATE POLICY "Vouchers nao podem ser deletados"
ON tbvoucher FOR DELETE
TO authenticated
USING (false);

-- Comentário sobre segurança de dados
COMMENT ON POLICY "Funcionarios visualizam proprios vouchers" ON tbvoucher IS
'Garante que funcionários vejam apenas seus próprios vouchers. CPF não é exposto nesta tabela.';
```

### Políticas para Tabela `tbbeneficio`

```sql
-- Todos os usuários autenticados podem visualizar benefícios ativos
CREATE POLICY "Visualizar benefícios ativos"
ON tbbeneficio FOR SELECT
TO authenticated
USING (ativo = true);

-- Apenas Admin pode gerenciar benefícios
CREATE POLICY "Admin gerencia benefícios"
ON tbbeneficio FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);
```

### Políticas para Tabela `tbfuncionario`

> **⚠️ IMPORTANTE:** Verifique se a tabela `tbfuncionario` já possui políticas RLS configuradas.
> As políticas abaixo são sugestões caso ainda não existam.

```sql
-- Funcionário pode ver apenas seu próprio perfil
CREATE POLICY "Funcionario visualiza proprio perfil"
ON tbfuncionario FOR SELECT
TO authenticated
USING (email = auth.jwt()->>'email');  -- Ajustar conforme autenticação

-- RH pode visualizar todos os funcionários ativos
CREATE POLICY "RH visualiza todos funcionarios"
ON tbfuncionario FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'rh')
    )
);
```

---

## 📝 Tipos Especiais (ENUMs e Domains)

```sql
-- ENUM para status do voucher
CREATE TYPE voucher_status AS ENUM (
    'pendente',     -- Aguardando aprovação
    'emitido',      -- Aprovado e emitido
    'aprovado',     -- Aprovado pelo RH
    'resgatado',    -- Utilizado pelo colaborador
    'expirado',     -- Passou da data de validade
    'cancelado'     -- Cancelado manualmente
);

-- Domain para CPF
CREATE DOMAIN cpf_br AS VARCHAR(14)
CHECK (VALUE ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$');

-- Domain para número de voucher
CREATE DOMAIN numero_voucher AS VARCHAR(20)
CHECK (VALUE ~ '^VOU\d{10,}$');
```

---

## ✅ Validações e Constraints

```sql
-- Constraint para garantir valor positivo
ALTER TABLE tbvoucher
ADD CONSTRAINT chk_valor_positivo
CHECK (valor >= 0);

-- Constraint para data de validade futura na criação
ALTER TABLE tbvoucher
ADD CONSTRAINT chk_validade_futura
CHECK (data_validade >= CURRENT_DATE);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_voucher_updated_at
    BEFORE UPDATE ON tbvoucher
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beneficio_updated_at
    BEFORE UPDATE ON tbbeneficio
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tbfuncionario (verificar se já existe)
CREATE TRIGGER update_funcionario_updated_at
    BEFORE UPDATE ON tbfuncionario
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para expirar vouchers automaticamente
CREATE OR REPLACE FUNCTION verificar_expiracao_voucher()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.data_validade < CURRENT_DATE AND NEW.status = 'emitido' THEN
        NEW.status := 'expirado';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_verificar_expiracao
    BEFORE UPDATE ON tbvoucher
    FOR EACH ROW
    EXECUTE FUNCTION verificar_expiracao_voucher();
```

---

## 🗃️ Dados Iniciais (Seeds)

### Benefícios do Sistema

```sql
INSERT INTO tbbeneficio (codigo, titulo, descricao, valor, valor_maximo, icone, ativo)
VALUES
    ('vale-gas', 'Vale Gás', 'Benefício para compra de gás de cozinha', 125.00, NULL, 'Flame', true),
    ('vale-farmacia-santa-cecilia', 'Vale Farmácia Santa Cecília', 'Benefício para compras na Farmácia Santa Cecília', NULL, 300.00, 'Pill', true),
    ('vale-farmacia-gentil', 'Vale Farmácia Gentil', 'Benefício para compras na Farmácia Gentil', NULL, 300.00, 'Pill', true),
    ('vale-combustivel', 'Vale Combustível', 'Benefício para abastecimento de veículos', NULL, NULL, 'Fuel', true),
    ('plano-saude', 'Plano de Saúde', 'Cobertura de assistência médica e hospitalar', 79.00, NULL, 'Heart', true),
    ('vale-transporte', 'Vale Transporte', 'Auxílio para deslocamento urbano', 35.00, NULL, 'Bus', true);
```

---

## 🗺️ Mapeamento: Componente → Banco de Dados

### SolicitarBeneficio.tsx → Tabelas

| Origem no Componente                    | Destino no Banco                      | Observação                           |
|-----------------------------------------|---------------------------------------|--------------------------------------|
| `voucher_id` (gerado)                   | `tbvoucher.voucher_id`                | UUID v4 gerado automaticamente (usado no QR Code) |
| `colaborador.matricula`                 | `tbfuncionario.matricula` → `tbvoucher.funcionario_id` | Buscar funcionario_id pela matrícula |
| `colaborador.nome`                      | `tbvoucher.funcionario_nome`          | Copiar de tbfuncionario.nome         |
| `colaborador.email`                     | `tbvoucher.funcionario_email`         | Copiar de tbfuncionario.email        |
| `colaborador.cpf`                       | **NÃO ARMAZENADO**                    | Mantido apenas em tbfuncionario (segurança) |
| `valorTotal` (calculado)                | `tbvoucher.valor`                     | Soma dos benefícios selecionados     |
| `new Date()` (emissão)                  | `tbvoucher.data_emissao`              | Timestamp atual                      |
| `dataValidade` (+30 dias)               | `tbvoucher.data_validade`             | data_emissao + 30 dias               |
| `formData.justificativa`                | `tbvoucher.justificativa`             | Texto livre                          |
| `formData.urgente`                      | `tbvoucher.urgente`                   | Boolean (true/false)                 |
| `formData.informacoesAdicionais`        | `tbvoucher.informacoes_adicionais`    | Texto livre (opcional)               |
| `'emitido'` (status inicial)            | `tbvoucher.status`                    | Status padrão                        |
| `selectedBeneficios[]`                  | `tbvoucher_beneficio`                 | Relacionamento N:N                   |
| Cada `beneficio.id`                     | `tbvoucher_beneficio.beneficio_id`    | UUID do benefício                    |
| Cada `beneficio.value`                  | `tbvoucher_beneficio.valor_unitario`  | Valor no momento da emissão          |

---

## ⚠️ Impactos da Integração com `tbfuncionario`

### Mudanças Importantes

1. **Tipo de Chave Primária Diferente**
   - `tbfuncionario` usa `INTEGER` (IDENTITY) como PK
   - `tbvoucher` usa `UUID` como PK (`voucher_id`)
   - **Impacto:** O campo `funcionario_id` em `tbvoucher` deve ser `INTEGER`, não `UUID`

2. **Campos Desnormalizados em `tbvoucher`**
   - Os campos `funcionario_nome`, `funcionario_matricula`, `funcionario_email` são cópias
   - **Motivo:** Preservar dados históricos caso o funcionário seja alterado/desativado
   - **Vantagem:** Vouchers mantêm informações originais mesmo após mudanças no cadastro
   - **Segurança:** CPF **NÃO é armazenado** em `tbvoucher` (mantido apenas em `tbfuncionario`)

3. **Busca de Funcionário no Frontend**
   - O componente React precisa buscar o `funcionario_id` antes de criar o voucher
   - **Query necessária:**
   ```sql
   SELECT funcionario_id, nome, email, matricula
   FROM tbfuncionario
   WHERE matricula = ? AND ativo = true
   ```
   - **Nota:** CPF não é retornado para reduzir exposição de dados sensíveis

4. **Validações Necessárias**
   - Verificar se funcionário existe e está ativo antes de criar voucher
   - Validar se matrícula corresponde ao funcionário logado
   - Verificar se funcionário tem permissão para solicitar benefícios

### Fluxo de Criação de Voucher

```typescript
// 1. Buscar funcionário pela matrícula (do login)
const funcionario = await supabase
  .from('tbfuncionario')
  .select('funcionario_id, nome, email, matricula')
  .eq('matricula', colaborador.matricula)
  .eq('ativo', true)
  .single();

// 2. Criar voucher com dados do funcionário
const { data: voucher, error } = await supabase
  .from('tbvoucher')
  .insert({
    // voucher_id é gerado automaticamente (UUID)
    funcionario_id: funcionario.funcionario_id,  // INTEGER
    funcionario_nome: funcionario.nome,
    funcionario_matricula: funcionario.matricula,
    funcionario_email: funcionario.email,
    // CPF NÃO é armazenado aqui (segurança)
    valor: valorTotal,
    data_validade: dataValidade,
    status: 'emitido',
    justificativa: formData.justificativa,
    urgente: formData.urgente,  // Boolean: true ou false
    informacoes_adicionais: formData.informacoesAdicionais
  })
  .select('voucher_id')  // Retorna o UUID gerado
  .single();

// 3. O voucher_id (UUID) é usado diretamente no QR Code
console.log('Voucher criado:', voucher.voucher_id);

// 4. Gerar QR Code com apenas o UUID
const qrCodeDataUrl = await QRCode.toDataURL(voucher.voucher_id, {
  width: 200,
  margin: 2,
  errorCorrectionLevel: 'M'
});
```

### Considerações de Autenticação

Como `tbfuncionario` não possui campo `user_id` (UUID do Supabase Auth), você tem duas opções:

**Opção 1: Adicionar campo `user_id` em `tbfuncionario`**
```sql
ALTER TABLE tbfuncionario
ADD COLUMN user_id UUID REFERENCES auth.users(id);

CREATE INDEX idx_tbfuncionario_user_id ON tbfuncionario(user_id);
```

**Opção 2: Usar email ou matrícula para autenticação**
```sql
-- Política RLS usando email
USING (email = auth.jwt()->>'email')

-- Ou criar tabela de vínculo
CREATE TABLE tbfuncionario_auth (
    funcionario_id INTEGER REFERENCES tbfuncionario(funcionario_id),
    user_id UUID REFERENCES auth.users(id),
    PRIMARY KEY (funcionario_id, user_id)
);
```

---

## 🔄 Ciclo de Vida do Voucher

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  PENDENTE   │────>│   APROVADO  │────>│   EMITIDO   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       │                                       ├───────────────┐
       v                                       v               v
┌─────────────┐                        ┌─────────────┐  ┌─────────────┐
│  CANCELADO  │                        │  RESGATADO  │  │  EXPIRADO   │
└─────────────┘                        └─────────────┘  └─────────────┘
```

### Descrição dos Status

| Status      | Descrição                                              |
|-------------|--------------------------------------------------------|
| `pendente`  | Aguardando aprovação do RH                             |
| `aprovado`  | Aprovado pelo RH, aguardando emissão                   |
| `emitido`   | Voucher gerado e disponível para uso                   |
| `resgatado` | Voucher utilizado em um parceiro                       |
| `expirado`  | Passou da data de validade sem ser utilizado           |
| `cancelado` | Cancelado manualmente por RH ou colaborador            |

---

## 📱 Estrutura do QR Code (Simplificada)

> **💡 Decisão de Design:**
> O QR Code contém **APENAS o UUID** do voucher (`voucher_id`).
> Todos os dados são obtidos por consulta ao banco de dados.

### Formato do QR Code

```typescript
// QR Code contém apenas uma string UUID
type QRCodeContent = string; // UUID v4

// Exemplo de conteúdo do QR Code:
"550e8400-e29b-41d4-a716-446655440000"
```

### Geração do QR Code

```typescript
import QRCode from 'qrcode';

// Gerar QR Code com apenas o UUID
const generateQRCode = async (voucherId: string) => {
  const qrCodeDataUrl = await QRCode.toDataURL(voucherId, {
    width: 200,
    margin: 2,
    errorCorrectionLevel: 'M', // Médio (15% de correção)
    color: {
      dark: '#1E3A8A',
      light: '#FFFFFF'
    }
  });
  return qrCodeDataUrl;
};
```

### Validação pelo Parceiro

```typescript
// Quando o parceiro escaneia o QR Code
const processVoucherCode = async (scannedUUID: string) => {
  // Validar formato UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(scannedUUID)) {
    throw new Error('QR Code inválido');
  }

  // Buscar voucher no banco de dados
  const { data: voucher, error } = await supabase
    .from('tbvoucher')
    .select(`
      voucher_id,
      funcionario_nome,
      funcionario_email,
      valor,
      status,
      data_emissao,
      data_validade,
      tbvoucher_beneficio (
        beneficio_id,
        valor_unitario,
        tbbeneficio (
          titulo,
          descricao
        )
      )
    `)
    .eq('voucher_id', scannedUUID)
    .single();

  if (error || !voucher) {
    throw new Error('Voucher não encontrado');
  }

  // Validar status e validade
  if (voucher.status === 'resgatado') {
    throw new Error('Voucher já foi utilizado');
  }
  if (voucher.status === 'expirado' || new Date(voucher.data_validade) < new Date()) {
    throw new Error('Voucher expirado');
  }
  if (voucher.status === 'cancelado') {
    throw new Error('Voucher cancelado');
  }

  return voucher;
};
```

### Vantagens desta Abordagem

| Vantagem | Descrição |
|----------|-----------|
| **Simplicidade** | QR Code menor e mais fácil de escanear |
| **Single Source of Truth** | Dados sempre atualizados do banco |
| **Segurança** | Não expõe dados sensíveis no QR Code |
| **Flexibilidade** | Mudanças no voucher refletem imediatamente |
| **Revogação** | Cancelar voucher invalida QR Code instantaneamente |
| **LGPD** | Minimização de dados expostos |

### Desvantagens e Mitigações

| Desvantagem | Mitigação |
|-------------|-----------|
| **Requer conectividade** | Implementar cache local no app do parceiro |
| **Latência de rede** | Usar índices otimizados + cache Redis |
| **Ponto único de falha** | Fallback para validação manual posterior |

### Otimizações de Performance

#### 1. Cache no Frontend (SessionStorage)
```typescript
// Cache de vouchers validados recentemente
const getCachedVoucher = (voucherId: string) => {
  const cached = sessionStorage.getItem(`voucher_${voucherId}`);
  if (!cached) return null;

  const { data, timestamp } = JSON.parse(cached);
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  if (Date.now() - timestamp > CACHE_TTL) {
    sessionStorage.removeItem(`voucher_${voucherId}`);
    return null;
  }

  return data;
};

const setCachedVoucher = (voucherId: string, data: any) => {
  sessionStorage.setItem(`voucher_${voucherId}`, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
};
```

#### 2. Query Otimizada com Índice
```sql
-- Esta query usa o índice idx_voucher_scan_lookup
SELECT
  v.voucher_id,
  v.funcionario_nome,
  v.valor,
  v.status,
  v.data_validade
FROM tbvoucher v
WHERE v.voucher_id = $1
  AND v.status IN ('emitido', 'aprovado')
  AND v.data_validade >= CURRENT_DATE;

-- Tempo esperado: < 10ms com índice
```

#### 3. Cache Redis (Opcional - Alta Escala)
```typescript
// Para sistemas com alto volume de validações
const getVoucherWithCache = async (voucherId: string) => {
  // Tentar cache Redis primeiro
  const cached = await redis.get(`voucher:${voucherId}`);
  if (cached) return JSON.parse(cached);

  // Buscar do banco
  const voucher = await supabase
    .from('tbvoucher')
    .select('*')
    .eq('voucher_id', voucherId)
    .single();

  // Cachear por 5 minutos
  if (voucher.data) {
    await redis.setex(`voucher:${voucherId}`, 300, JSON.stringify(voucher.data));
  }

  return voucher.data;
};
```

---

## ⚙️ Funções Úteis (Stored Procedures)

> **💡 Nota:** Como a tabela `tbvoucher` usa UUID (`voucher_id`) como identificador único,
> não é necessário implementar funções de geração de números de voucher.
> O PostgreSQL gera automaticamente UUIDs únicos através de `gen_random_uuid()`.

### Função para Validar Voucher por UUID (Scan do Parceiro)

```sql
-- Função otimizada para validação de voucher escaneado
CREATE OR REPLACE FUNCTION validar_voucher_por_uuid(p_voucher_id UUID)
RETURNS TABLE (
    voucher_id UUID,
    funcionario_nome VARCHAR,
    valor NUMERIC,
    status VARCHAR,
    data_validade DATE,
    beneficios JSONB,
    valido BOOLEAN,
    mensagem TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.voucher_id,
        v.funcionario_nome,
        v.valor,
        v.status,
        v.data_validade,
        jsonb_agg(
            jsonb_build_object(
                'titulo', b.titulo,
                'valor', vb.valor_unitario
            )
        ) as beneficios,
        CASE
            WHEN v.status = 'resgatado' THEN false
            WHEN v.status = 'cancelado' THEN false
            WHEN v.status = 'expirado' THEN false
            WHEN v.data_validade < CURRENT_DATE THEN false
            WHEN v.status IN ('emitido', 'aprovado') THEN true
            ELSE false
        END as valido,
        CASE
            WHEN v.status = 'resgatado' THEN 'Voucher já foi utilizado'
            WHEN v.status = 'cancelado' THEN 'Voucher cancelado'
            WHEN v.status = 'expirado' THEN 'Voucher expirado'
            WHEN v.data_validade < CURRENT_DATE THEN 'Voucher vencido'
            WHEN v.status IN ('emitido', 'aprovado') THEN 'Voucher válido'
            ELSE 'Status inválido'
        END as mensagem
    FROM tbvoucher v
    LEFT JOIN tbvoucher_beneficio vb ON v.voucher_id = vb.voucher_id
    LEFT JOIN tbbeneficio b ON vb.beneficio_id = b.beneficio_id
    WHERE v.voucher_id = p_voucher_id
    GROUP BY v.voucher_id, v.funcionario_nome, v.valor, v.status, v.data_validade;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validar_voucher_por_uuid IS 'Valida voucher escaneado via QR Code e retorna todos os dados necessários';

-- Uso:
-- SELECT * FROM validar_voucher_por_uuid('550e8400-e29b-41d4-a716-446655440000');
```

---

### Função para Calcular Valor Total do Voucher

```sql
-- Função para calcular valor total do voucher
CREATE OR REPLACE FUNCTION calcular_valor_voucher(p_voucher_id UUID)
RETURNS NUMERIC(10,2) AS $$
DECLARE
    total NUMERIC(10,2);
BEGIN
    SELECT COALESCE(SUM(valor_unitario * quantidade), 0)
    INTO total
    FROM tbvoucher_beneficio
    WHERE voucher_id = p_voucher_id;

    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Procedure para expirar vouchers vencidos (job agendado)
CREATE OR REPLACE PROCEDURE expirar_vouchers_vencidos()
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE tbvoucher
    SET status = 'expirado',
        updated_at = NOW()
    WHERE status = 'emitido'
      AND data_validade < CURRENT_DATE;
END;
$$;
```

---

## ⚠️ Observações Importantes

1. **Segurança**:
   - Todas as credenciais devem ser configuradas via variáveis de ambiente
   - Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend

2. **Migração de Dados**:
   - Os dados atuais estão em `localStorage`
   - Será necessário script de migração para Supabase

3. **Backup**:
   - Configure backups automáticos no Supabase Dashboard
   - Mantenha histórico de alterações via triggers

4. **Performance**:
   - Os índices sugeridos cobrem as consultas mais frequentes
   - Monitore queries lentas no Supabase Dashboard

---

## 📚 Referências

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

---

## 📋 Checklist de Implementação

### Antes de Criar as Tabelas

- [ ] Verificar se `tbfuncionario` já existe no banco (✅ JÁ EXISTE)
- [ ] Verificar se `tbfuncionario` possui índices necessários (✅ JÁ POSSUI)
- [ ] ✅ **Decisão tomada:** Usar apenas UUID (`voucher_id`) como identificador
- [ ] Definir estratégia de autenticação (user_id, email ou tabela de vínculo)

### Criação das Tabelas

- [ ] Criar tabela `tbbeneficio` com `beneficio_id UUID` como PK
- [ ] Inserir dados iniciais em `tbbeneficio` (seeds)
- [ ] Criar tabela `tbvoucher` com:
  - `voucher_id UUID` como PK (gerado automaticamente)
  - `funcionario_id INTEGER` como FK para `tbfuncionario`
  - **SEM** campo `numero_voucher`
  - **SEM** campo `funcionario_cpf` (segurança)
- [ ] Criar tabela `tbvoucher_beneficio`
- [ ] Criar índices em `tbvoucher` e `tbvoucher_beneficio`

### Configuração de Segurança

- [ ] Habilitar RLS nas novas tabelas
- [ ] Criar políticas RLS para `tbvoucher`
- [ ] Criar políticas RLS para `tbbeneficio`
- [ ] Verificar/criar políticas RLS para `tbfuncionario`
- [ ] Testar políticas com diferentes perfis de usuário

### Funções e Triggers

- [ ] Criar função `update_updated_at_column()`
- [ ] Criar triggers de `updated_at` para as tabelas
- [ ] Criar trigger de expiração automática de vouchers
- [ ] ~~Criar função `gerar_numero_voucher()`~~ (❌ NÃO NECESSÁRIO - usando UUID)
- [ ] Criar função `calcular_valor_voucher()`
- [ ] Criar procedure `expirar_vouchers_vencidos()`

### Integração com Frontend

- [ ] Atualizar componente React para buscar `funcionario_id` de `tbfuncionario`
- [ ] Modificar interface `VoucherEmitido` para usar:
  - `voucher_id` (UUID) ao invés de `numero_voucher`
  - `funcionario_id` (INTEGER)
  - **Remover** campo `cpf` (não armazenado em tbvoucher)
  - **Alterar** `urgencia: string` para `urgente: boolean`
- [ ] Implementar query de busca de funcionário por matrícula (sem retornar CPF)
- [ ] Atualizar lógica de criação de voucher para usar Supabase
- [ ] **Simplificar geração de QR Code:**
  - Gerar QR Code com **APENAS** `voucher_id` (UUID)
  - Remover geração de JSON complexo
  - Remover campo `qr_code_data` do INSERT
- [ ] **Atualizar Scanner do Parceiro:**
  - Escanear UUID do QR Code
  - Buscar dados do voucher no Supabase por `voucher_id`
  - Validar status e validade em tempo real
- [ ] **Atualizar UI do campo de urgência:**
  - Substituir select/dropdown por checkbox ou toggle switch
  - Label: "Solicitação urgente?" ou "Marcar como urgente"
  - Valor padrão: `false` (desmarcado)
- [ ] Migrar dados do localStorage para Supabase (se necessário)
- [ ] Testar fluxo completo de criação e validação de voucher

### Testes

- [ ] Testar criação de voucher com funcionário válido
- [ ] Testar rejeição de voucher com funcionário inativo
- [ ] Testar políticas RLS (funcionário só vê seus vouchers)
- [ ] Testar expiração automática de vouchers
- [ ] Testar relacionamento N:N com benefícios
- [ ] Testar performance das queries com índices

---

## 🎯 Resumo Executivo dos Impactos

| Aspecto                  | Impacto                                                      | Ação Necessária                          |
|--------------------------|--------------------------------------------------------------|------------------------------------------|
| **Identificador**        | Usar UUID (`voucher_id`) ao invés de `numero_voucher`        | Atualizar frontend para usar UUID        |
| **QR Code**              | QR Code contém **APENAS UUID** (não JSON)                    | Simplificar geração de QR Code           |
| **Campo Removido**       | `qr_code_data` removido (redundante)                         | Remover do INSERT e queries              |
| **Validação**            | Validação por consulta ao banco (não offline)                | Implementar busca por UUID no scanner    |
| **Tipo de FK**           | `tbfuncionario` usa INTEGER, não UUID                        | Usar INTEGER em `tbvoucher.funcionario_id` |
| **Campos Desnormalizados** | Copiar nome, matrícula, email (NÃO CPF)                    | Implementar cópia no INSERT              |
| **Segurança de Dados**   | CPF não é armazenado em `tbvoucher`                          | Buscar CPF apenas de `tbfuncionario` quando necessário |
| **Autenticação**         | `tbfuncionario` não tem `user_id`                            | Adicionar campo ou usar email/matrícula  |
| **Busca de Funcionário** | Frontend precisa buscar funcionário antes de criar voucher   | Implementar query de busca (sem CPF)     |
| **Validações**           | Verificar se funcionário está ativo                          | Adicionar validação no frontend/backend  |
| **Índices**              | `tbfuncionario` já possui índices                            | Nenhuma (já existem)                     |
| **RLS**                  | Políticas precisam usar email ou tabela de vínculo           | Implementar estratégia de autenticação   |
| **Performance**          | Cada scan requer consulta ao banco                           | Implementar cache + índices otimizados   |
| **Campo Urgência**       | Simplificado de 4 níveis para binário (Sim/Não)              | Atualizar UI para checkbox/toggle        |

---

**Última atualização**: 03/12/2024
**Autor**: Documentação gerada a partir da análise do componente `SolicitarBeneficio.tsx`
**Versão**: 4.2 - Simplificação do campo de urgência

### 📝 Changelog

**v4.2 (03/12/2024)**
- ✅ **Simplificado campo de urgência**: `urgencia VARCHAR(20)` → `urgente BOOLEAN`
- ✅ **Removido ENUM `urgencia_nivel`** (não mais necessário)
- ✅ Alterado de 4 níveis (baixa/normal/alta/urgente) para binário (Sim/Não)
- ✅ Valor padrão: `false` (não urgente)
- ✅ Atualizado mapeamento de campos
- ✅ Atualizado exemplo de criação de voucher
- ✅ Adicionado comentário no campo `urgente`

**v4.1 (03/12/2024)**
- ✅ **Renomeado campo `valor_total` para `valor`** em `tbvoucher`
- ✅ **Alterado tipo `DECIMAL` para `NUMERIC`** (compatibilidade Supabase/PostgreSQL)
- ✅ Removido campo `valor_total` de `tbvoucher_beneficio` (calculado dinamicamente)
- ✅ Atualizada função `calcular_valor_voucher()` para usar `valor_unitario * quantidade`
- ✅ Atualizada função `validar_voucher_por_uuid()` para retornar `valor` (NUMERIC)
- ✅ Atualizados todos os exemplos e queries SQL
- ✅ Atualizado mapeamento de campos
- ✅ Atualizada constraint `chk_valor_positivo`

**v4.0 (03/12/2024)**
- ✅ **Removido campo `qr_code_data`** (redundante com UUID)
- ✅ **QR Code simplificado**: Contém apenas `voucher_id` (UUID)
- ✅ Validação de voucher por consulta ao banco de dados
- ✅ Atualizada seção de estrutura do QR Code
- ✅ Adicionados exemplos de geração e validação de QR Code
- ✅ Atualizado mapeamento de campos (removido qr_code_data)
- ✅ Atualizado checklist de implementação
- ✅ Atualizada tabela de impactos

**v3.0 (03/12/2024)**
- ✅ Renomeado campo `id` para `voucher_id` (UUID)
- ✅ Removido campo `numero_voucher` (usar apenas UUID)
- ✅ Removido campo `funcionario_cpf` (segurança - mantido apenas em tbfuncionario)
- ✅ Removida toda seção de métodos de geração de número de voucher
- ✅ Atualizado diagrama de relacionamentos
- ✅ Atualizado mapeamento de campos
- ✅ Atualizado checklist de implementação

**v2.0 (02/12/2024)**
- Atualizado para integração com `tbfuncionario`
- Aplicado padrão de nomenclatura `tb`

**v1.0 (02/12/2024)**
- Versão inicial da documentação