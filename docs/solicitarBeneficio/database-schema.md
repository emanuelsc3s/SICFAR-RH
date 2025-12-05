# 📊 Estrutura de Banco de Dados - Vouchers Solicitados

## Documentação Técnica para Supabase

Este documento define a estrutura de banco de dados necessária para armazenar os vouchers solicitados através do componente `SolicitarBeneficio.tsx`.

---

## 🚨 MUDANÇAS IMPORTANTES - Versão 6.0 (BREAKING CHANGES)

> **⚠️ Esta documentação foi atualizada para refletir a estrutura REAL da tabela `tbvoucher`**
>
> Principais mudanças em relação à versão anterior:

### ✅ Novidades Implementadas

1. **Soft Delete Completo**
   - Campo `deletado` CHAR(1) com valores 'N' ou 'S'
   - Campos `deleted_at`, `deleted_by`, `deleted_nome` para auditoria
   - Trigger que previne DELETE físico automaticamente
   - Procedure `soft_delete_voucher_by_id` para soft delete programático

2. **Sistema de Auditoria Robusto**
   - Campos `created_nome`, `updated_nome`, `deleted_nome` para preservar histórico
   - Referências a `tbusuario.usuario_id` (INTEGER) ao invés de `auth.users(id)` (UUID)
   - Timezone configurado: `America/Sao_Paulo`

3. **Campos Renomeados/Removidos**
   - ✅ `funcionario_nome` → `funcionario` (TEXT)
   - ✅ `funcionario_email` → `email` (TEXT)
   - ✅ `funcionario_matricula` → `matricula` (TEXT)
   - ❌ Removidos: `beneficio_titulo`, `beneficio_descricao`, `informacoes_adicionais`

4. **Tipos Atualizados**
   - `data_emissao`: `TIMESTAMPTZ` → `DATE`
   - `status`: `VARCHAR(20)` → `public.voucher_status` (ENUM)
   - Campos de auditoria: `TIMESTAMPTZ` → `TIMESTAMP WITHOUT TIME ZONE`

### 📋 Impactos no Código

- **INSERT**: Adicionar `deletado`, `created_by`, `created_nome`
- **SELECT**: Filtrar `deletado = 'N'` em todas as queries
- **DELETE**: Usar soft delete (UPDATE) ao invés de DELETE físico
- **Campos**: Usar novos nomes (`funcionario`, `email`, `matricula`)
- **Benefícios**: Buscar `beneficio_titulo` de JOIN com `tbbeneficio`

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
>
> **⚠️ IMPORTANTE - Arquitetura 1:1:**
> - **Cada voucher contém APENAS UM benefício** (relacionamento 1:1)
> - Se o usuário seleciona 3 benefícios, são gerados 3 vouchers separados
> - A tabela `tbvoucher_beneficio` **NÃO é mais necessária**
> - O campo `beneficio_id` é uma FK direta para `tbbeneficio`

```sql
CREATE TABLE tbvoucher (
    -- Identificação
    voucher_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Dados do Funcionário (desnormalizados para histórico)
    funcionario_id INTEGER NULL REFERENCES tbfuncionario(funcionario_id),
    funcionario TEXT NULL,
    email TEXT NULL,
    matricula TEXT NULL,

    -- Benefício Associado (1:1)
    beneficio_id INTEGER NULL REFERENCES tbbeneficio(beneficio_id),

    -- Valor
    valor NUMERIC(10,2) NOT NULL DEFAULT 0.00,

    -- Datas
    data_emissao DATE NOT NULL,
    data_validade DATE NOT NULL,
    data_resgate TIMESTAMP WITHOUT TIME ZONE NULL,
    hora_resgate TIME WITHOUT TIME ZONE NULL,

    -- Detalhes da Solicitação
    justificativa TEXT NULL,
    urgente BOOLEAN NOT NULL,

    -- Status e Controle
    status public.voucher_status NULL,

    -- Soft Delete
    deletado CHAR(1) NOT NULL DEFAULT 'N' CHECK (deletado IN ('N', 'S')),

    -- Metadados de Auditoria
    created_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'::text),
    created_by INTEGER NULL REFERENCES tbusuario(usuario_id),
    created_nome TEXT NOT NULL,

    updated_at TIMESTAMP WITHOUT TIME ZONE NULL,
    updated_by INTEGER NULL REFERENCES tbusuario(usuario_id),
    updated_nome TEXT NULL,

    deleted_at TIMESTAMP WITHOUT TIME ZONE NULL,
    deleted_by INTEGER NULL REFERENCES tbusuario(usuario_id),
    deleted_nome TEXT NULL
);

-- Comentários da tabela
COMMENT ON TABLE tbvoucher IS 'Tabela principal de vouchers de benefícios solicitados - cada voucher contém APENAS UM benefício';
COMMENT ON COLUMN tbvoucher.voucher_id IS 'Identificador único do voucher (UUID v4) - usado diretamente no QR Code';
COMMENT ON COLUMN tbvoucher.funcionario_id IS 'Referência ao funcionário (INTEGER da tbfuncionario)';
COMMENT ON COLUMN tbvoucher.funcionario IS 'Nome do funcionário no momento da emissão (desnormalizado para histórico)';
COMMENT ON COLUMN tbvoucher.email IS 'Email do funcionário no momento da emissão (desnormalizado para histórico)';
COMMENT ON COLUMN tbvoucher.matricula IS 'Matrícula do funcionário no momento da emissão (desnormalizado para histórico)';
COMMENT ON COLUMN tbvoucher.beneficio_id IS 'Benefício associado a este voucher (relacionamento 1:1)';
COMMENT ON COLUMN tbvoucher.valor IS 'Valor do voucher';
COMMENT ON COLUMN tbvoucher.data_emissao IS 'Data de emissão do voucher (DATE)';
COMMENT ON COLUMN tbvoucher.data_validade IS 'Data de validade do voucher';
COMMENT ON COLUMN tbvoucher.data_resgate IS 'Data e hora em que o voucher foi resgatado';
COMMENT ON COLUMN tbvoucher.hora_resgate IS 'Hora de resgate do voucher';
COMMENT ON COLUMN tbvoucher.justificativa IS 'Justificativa para solicitação do voucher';
COMMENT ON COLUMN tbvoucher.urgente IS 'Indica se a solicitação é urgente (true) ou normal (false)';
COMMENT ON COLUMN tbvoucher.status IS 'Status atual do voucher no ciclo de vida (ENUM: pendente, emitido, aprovado, resgatado, expirado, cancelado)';
COMMENT ON COLUMN tbvoucher.deletado IS 'Indica se o voucher foi deletado logicamente (S=Sim, N=Não) - Soft Delete';
COMMENT ON COLUMN tbvoucher.created_at IS 'Data e hora de criação do registro (timezone: America/Sao_Paulo)';
COMMENT ON COLUMN tbvoucher.created_by IS 'ID do usuário que criou o registro (FK para tbusuario)';
COMMENT ON COLUMN tbvoucher.created_nome IS 'Nome do usuário que criou o registro';
COMMENT ON COLUMN tbvoucher.updated_at IS 'Data e hora da última atualização do registro';
COMMENT ON COLUMN tbvoucher.updated_by IS 'ID do usuário que atualizou o registro (FK para tbusuario)';
COMMENT ON COLUMN tbvoucher.updated_nome IS 'Nome do usuário que atualizou o registro';
COMMENT ON COLUMN tbvoucher.deleted_at IS 'Data e hora em que o registro foi deletado (soft delete)';
COMMENT ON COLUMN tbvoucher.deleted_by IS 'ID do usuário que deletou o registro (FK para tbusuario)';
COMMENT ON COLUMN tbvoucher.deleted_nome IS 'Nome do usuário que deletou o registro';
```

### 2. Tabela: `tbparceiro` (Cadastro de Parceiros/Fornecedores)

> **💡 Decisão de Design:**
> - **Chave primária INTEGER**: Usa `INT4` com `GENERATED ALWAYS AS IDENTITY` para compatibilidade e performance
> - **Campos TEXT**: Maioria dos campos usa TEXT ao invés de VARCHAR para maior flexibilidade
> - **Campos com tamanho sugerido**: `uf` (VARCHAR 2) e `cep` (VARCHAR 9) mantêm VARCHAR como sugestão de tamanho, mas sem validação obrigatória
> - **Sem constraints de validação**: Todos os campos de dados (CPF/CNPJ, UF, CEP, etc.) não têm validação no banco
> - **Responsabilidade de validação**: Validação de formato e conteúdo deve ser feita no frontend/backend da aplicação
> - **Contatos múltiplos**: Campos separados para telefone e WhatsApp
> - **Endereço completo**: Estrutura detalhada para localização do parceiro

```sql
CREATE TABLE tbparceiro (
    parceiro_id INT4 GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome_fantasia TEXT NOT NULL,
    razao_social TEXT,
    cpf_cnpj TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    whatsapp TEXT,
    endereco TEXT,
    bairro TEXT,
    cidade TEXT,
    uf VARCHAR(2),
    cep VARCHAR(9),
    complemento TEXT,
    observacao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,

    -- Metadados
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE tbparceiro IS 'Cadastro de parceiros/fornecedores de benefícios';
COMMENT ON COLUMN tbparceiro.parceiro_id IS 'ID sequencial do parceiro (INT4 IDENTITY)';
COMMENT ON COLUMN tbparceiro.nome_fantasia IS 'Nome comercial/fantasia do parceiro';
COMMENT ON COLUMN tbparceiro.razao_social IS 'Razão social (nome jurídico)';
COMMENT ON COLUMN tbparceiro.cpf_cnpj IS 'CPF ou CNPJ do parceiro (aceita qualquer formato: com ou sem pontuação)';
COMMENT ON COLUMN tbparceiro.email IS 'E-mail de contato do parceiro';
COMMENT ON COLUMN tbparceiro.telefone IS 'Telefone fixo ou celular';
COMMENT ON COLUMN tbparceiro.whatsapp IS 'Número do WhatsApp para contato';
COMMENT ON COLUMN tbparceiro.endereco IS 'Logradouro completo';
COMMENT ON COLUMN tbparceiro.bairro IS 'Bairro/distrito';
COMMENT ON COLUMN tbparceiro.cidade IS 'Cidade/município';
COMMENT ON COLUMN tbparceiro.uf IS 'Unidade federativa (sigla de 2 letras)';
COMMENT ON COLUMN tbparceiro.cep IS 'CEP formatado (XXXXX-XXX)';
COMMENT ON COLUMN tbparceiro.complemento IS 'Complemento do endereço';
COMMENT ON COLUMN tbparceiro.observacao IS 'Observações gerais sobre o parceiro';
COMMENT ON COLUMN tbparceiro.ativo IS 'Indica se o parceiro está ativo';
```

#### ⚠️ Impactos da Ausência de Constraints

**Sem constraints de validação no banco de dados:**

| Campo      | Aceita agora                                    | Impacto                                              |
|------------|-------------------------------------------------|------------------------------------------------------|
| `cpf_cnpj` | Qualquer texto                                  | Permite `12345678901`, `123.456.789-01`, `abc123`   |
| `uf`       | Qualquer texto (não apenas 2 chars)             | Permite `SP`, `SAO`, `123`, ou texto vazio           |
| `cep`      | Qualquer texto (não obriga 9 chars)             | Permite `12345-678`, `12345`, `abc`, ou texto vazio  |

**⚠️ IMPORTANTE - Validações necessárias na aplicação:**

1. **No Frontend (antes de enviar ao banco):**
   - Validar formato de CPF/CNPJ (com ou sem pontuação)
   - Validar dígitos verificadores de CPF/CNPJ
   - Validar se UF existe na lista de estados brasileiros (AC, AL, AM, etc.)
   - Validar formato de CEP (XXXXX-XXX ou apenas números)
   - Validar formato de telefone/WhatsApp

2. **No Backend (antes de INSERT/UPDATE):**
   - Revalidar todos os dados (nunca confiar apenas no frontend)
   - Sanitizar dados (remover caracteres especiais se necessário)
   - Normalizar formatos (escolher: sempre formatado ou sempre sem formatação)

3. **Vantagens desta abordagem:**
   - ✅ Maior flexibilidade para aceitar diferentes formatos
   - ✅ Facilita migrações de dados legados
   - ✅ Permite adaptação a mudanças de regras de negócio
   - ✅ Evita erros de constraint no banco durante desenvolvimento

4. **Desvantagens desta abordagem:**
   - ❌ Permite inserção de dados inválidos se a validação falhar
   - ❌ Dados inconsistentes podem existir no banco
   - ❌ Maior responsabilidade da aplicação em validar dados
   - ❌ Queries podem precisar lidar com formatos diferentes

**Recomendação:** Implemente validações rigorosas no frontend e backend para garantir a qualidade dos dados, mesmo sem constraints no banco.

### 3. Tabela: `tbbeneficio` (Catálogo de Benefícios)

> **💡 Decisão de Design:**
> - **Chave primária INTEGER**: Usa `INT4` com `GENERATED ALWAYS AS IDENTITY` para compatibilidade e performance
> - **Campo `beneficio`**: Renomeado de `titulo` para `beneficio` (TEXT ao invés de VARCHAR)
> - **Campo `valor_limite`**: Adicionado para controle de valor máximo permitido por benefício
> - **Campo `parceiro_id`**: Relacionamento com `tbparceiro` (opcional - permite benefícios sem parceiro específico)
> - **Sem código único**: Campo `codigo` removido (usar `beneficio_id` ou `beneficio` para identificação)

```sql
CREATE TABLE tbbeneficio (
    beneficio_id INT4 GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    parceiro_id INT4 REFERENCES tbparceiro(parceiro_id) ON DELETE RESTRICT,
    beneficio TEXT,
    descricao TEXT,
    valor NUMERIC(10,2),
    valor_limite NUMERIC(10,2),
    icone VARCHAR(50),
    ativo BOOLEAN NOT NULL DEFAULT true,

    -- Metadados
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tbbeneficio IS 'Catálogo de benefícios disponíveis para solicitação';
COMMENT ON COLUMN tbbeneficio.beneficio_id IS 'ID sequencial do benefício (INT4 IDENTITY)';
COMMENT ON COLUMN tbbeneficio.parceiro_id IS 'Parceiro/fornecedor associado ao benefício (opcional)';
COMMENT ON COLUMN tbbeneficio.beneficio IS 'Nome/título do benefício';
COMMENT ON COLUMN tbbeneficio.descricao IS 'Descrição detalhada do benefício';
COMMENT ON COLUMN tbbeneficio.valor IS 'Valor padrão do benefício';
COMMENT ON COLUMN tbbeneficio.valor_limite IS 'Valor máximo permitido para solicitação deste benefício';
COMMENT ON COLUMN tbbeneficio.icone IS 'Nome do ícone para exibição na interface';
COMMENT ON COLUMN tbbeneficio.ativo IS 'Indica se o benefício está disponível para solicitação';
```

### 4. Tabela: `tbusuario` (Referência - Já Existente)

> **⚠️ IMPORTANTE:** Esta tabela **já existe** no banco de dados.
> A tabela `tbvoucher` faz referência a ela através dos campos `created_by`, `updated_by` e `deleted_by` (INTEGER).

```sql
-- TABELA JÁ EXISTENTE - NÃO CRIAR NOVAMENTE
-- Estrutura de referência para entendimento do relacionamento

CREATE TABLE tbusuario (
    usuario_id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'America/Fortaleza'::text),
    usuario TEXT NULL,  -- Email do usuário (usado para login e exibição)
    user_id UUID NULL REFERENCES auth.users(id),  -- Vínculo com Supabase Auth
    perfil_id INTEGER NULL,
    deletado TEXT NULL DEFAULT 'N',  -- Soft delete: 'N' ou 'S'
    funcionario_id INTEGER NULL REFERENCES tbfuncionario(funcionario_id),
    parceiro_id INTEGER NULL REFERENCES tbparceiro(parceiro_id),
    created_by INTEGER NULL REFERENCES tbusuario(usuario_id),
    updated_at TIMESTAMP WITHOUT TIME ZONE NULL,
    updated_by INTEGER NULL REFERENCES tbusuario(usuario_id),
    updated_nome TEXT NULL,
    deleted_at TIMESTAMP WITHOUT TIME ZONE NULL,
    deleted_by INTEGER NULL REFERENCES tbusuario(usuario_id),
    deleted_nome TEXT NULL,

    CONSTRAINT tbusuario_pkey PRIMARY KEY (usuario_id),
    CONSTRAINT tbusuario_usuario_id_key UNIQUE (usuario_id)
);

COMMENT ON TABLE tbusuario IS 'Cadastro de usuários do sistema (TABELA JÁ EXISTENTE)';
COMMENT ON COLUMN tbusuario.usuario_id IS 'ID sequencial do usuário (INTEGER IDENTITY)';
COMMENT ON COLUMN tbusuario.usuario IS 'Email do usuário - usado para login e exibição no sistema';
COMMENT ON COLUMN tbusuario.user_id IS 'UUID do usuário no Supabase Auth (auth.users.id)';
COMMENT ON COLUMN tbusuario.perfil_id IS 'ID do perfil/role do usuário';
COMMENT ON COLUMN tbusuario.funcionario_id IS 'Vínculo com tbfuncionario para obter matrícula e cargo';
COMMENT ON COLUMN tbusuario.deletado IS 'Soft delete: N (ativo) ou S (deletado)';
```

### 5. Tabela: `tbfuncionario` (Referência - Já Existente)

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

> **💡 Arquitetura Simplificada:**
> Com a nova lógica de **um voucher por benefício**, o relacionamento é direto (1:1).
> A tabela intermediária `tbvoucher_beneficio` foi **removida**.
> **Novo relacionamento:** `tbbeneficio` ↔ `tbparceiro` (N:1 - muitos benefícios podem ter o mesmo parceiro)

```
                                      ┌───────────────┐
                                      │  tbparceiro   │
                                      │               │
                                      └───────────────┘
                                         parceiro_id
                                         (INT4 PK)
                                              │
                                              │ 1:N
                                              v
┌──────────────────┐     ┌───────────────────────┐     ┌───────────────┐
│  tbfuncionario   │────<│      tbvoucher        │>────│  tbbeneficio  │
│  (JÁ EXISTENTE)  │     │   (1 voucher =        │     │               │
└──────────────────┘     │    1 benefício)       │     └───────────────┘
   funcionario_id        └───────────────────────┘        beneficio_id
   (INTEGER PK)               funcionario_id               (INT4 PK)
        │                     (INTEGER FK)                 parceiro_id
        │                     beneficio_id                 (INT4 FK)
        │                     (INT4 FK)                         │
        │                     voucher_id                        │
        │                     (UUID PK)                         │
        │                     deletado (CHAR 1)                 │
        │                                                       │
   ┌────┴────┐                    │                            │
   │tbusuario│                    │                            │
   └─────────┘                    │                            │
   usuario_id                     │                            │
   (INTEGER PK)                   │                            │
        │                         │                            │
        └─────────────────────────┴────────────────────────────┘
              (created_by/updated_by/deleted_by)
```

### Detalhes dos Relacionamentos

| Tabela Origem | Campo FK           | Tabela Destino  | Campo PK          | Tipo    | Cardinalidade |
|---------------|--------------------|-----------------|-------------------|---------|---------------|
| `tbvoucher`   | `funcionario_id`   | `tbfuncionario` | `funcionario_id`  | INTEGER | N:1           |
| `tbvoucher`   | `beneficio_id`     | `tbbeneficio`   | `beneficio_id`    | INT4    | N:1           |
| `tbvoucher`   | `created_by`       | `tbusuario`     | `usuario_id`      | INTEGER | N:1           |
| `tbvoucher`   | `updated_by`       | `tbusuario`     | `usuario_id`      | INTEGER | N:1           |
| `tbvoucher`   | `deleted_by`       | `tbusuario`     | `usuario_id`      | INTEGER | N:1           |
| `tbbeneficio` | `parceiro_id`      | `tbparceiro`    | `parceiro_id`     | INT4    | N:1           |

### Exemplo de Dados

**Cenário:** Usuário seleciona 3 benefícios (Vale Gás, Vale Farmácia Santa Cecília, Vale Transporte)

**Resultado:** São gerados 3 vouchers separados:

| voucher_id (UUID) | funcionario_id | beneficio_id (INT4) | funcionario           | valor  | deletado |
|-------------------|----------------|---------------------|-----------------------|--------|----------|
| `550e8400-...`    | 123            | 1                   | João Silva            | 125.00 | N        |
| `660e9511-...`    | 123            | 2                   | João Silva            | 300.00 | N        |
| `770ea622-...`    | 123            | 6                   | João Silva            | 35.00  | N        |

### Consulta de Benefícios com Parceiros

```sql
-- Consultar todos os benefícios ativos com informações do parceiro
SELECT
    b.beneficio_id,
    b.beneficio,
    b.descricao,
    b.valor,
    b.valor_limite,
    b.icone,
    p.parceiro_id,
    p.nome_fantasia AS parceiro_nome,
    p.email AS parceiro_email,
    p.telefone AS parceiro_telefone,
    p.whatsapp AS parceiro_whatsapp,
    p.cidade AS parceiro_cidade,
    p.uf AS parceiro_uf
FROM tbbeneficio b
LEFT JOIN tbparceiro p ON b.parceiro_id = p.parceiro_id
WHERE b.ativo = true
ORDER BY b.beneficio;
```

---

## 📊 Índices para Otimização

```sql
-- Índices na tabela tbvoucher
CREATE INDEX idx_voucher_funcionario_id ON tbvoucher(funcionario_id);
CREATE INDEX idx_voucher_beneficio_id ON tbvoucher(beneficio_id);
CREATE INDEX idx_voucher_status ON tbvoucher(status);
CREATE INDEX idx_voucher_data_emissao ON tbvoucher(data_emissao DESC);
CREATE INDEX idx_voucher_data_validade ON tbvoucher(data_validade);
CREATE INDEX idx_voucher_created_by ON tbvoucher(created_by);
CREATE INDEX idx_voucher_updated_by ON tbvoucher(updated_by);
CREATE INDEX idx_voucher_deleted_by ON tbvoucher(deleted_by);

-- Índice para soft delete
CREATE INDEX idx_voucher_deletado ON tbvoucher(deletado);
CREATE INDEX idx_voucher_deletado_deleted_at ON tbvoucher(deletado, deleted_at);

-- Índice otimizado para consultas de vouchers ativos (não deletados)
CREATE INDEX idx_voucher_ativos ON tbvoucher(status, data_validade)
    WHERE deletado = 'N';

-- Índice otimizado para validação rápida de QR Code (scan do parceiro)
-- Cobre a query mais comum: buscar voucher ativo por UUID (não deletado)
CREATE INDEX idx_voucher_scan_lookup ON tbvoucher(voucher_id, status, data_validade)
    WHERE status IN ('emitido', 'aprovado') AND deletado = 'N';

COMMENT ON INDEX idx_voucher_scan_lookup IS 'Índice otimizado para validação rápida de vouchers escaneados via QR Code (apenas não deletados)';

-- Índice composto para consultas por funcionário e benefício
CREATE INDEX idx_voucher_funcionario_beneficio ON tbvoucher(funcionario_id, beneficio_id)
    WHERE deletado = 'N';

COMMENT ON INDEX idx_voucher_funcionario_beneficio IS 'Índice para consultas de vouchers por funcionário e tipo de benefício (apenas não deletados)';

-- Índices na tabela tbfuncionario (JÁ EXISTENTES - NÃO CRIAR NOVAMENTE)
-- CREATE INDEX idx_tbfuncionario_matricula ON tbfuncionario(matricula);
-- CREATE INDEX idx_tbfuncionario_email ON tbfuncionario(email);
-- CREATE INDEX idx_tbfuncionario_ativo ON tbfuncionario(ativo);
-- (Ver seção da tabela tbfuncionario para lista completa de índices)

-- Índices na tabela tbparceiro
CREATE INDEX idx_parceiro_nome_fantasia ON tbparceiro(nome_fantasia);
CREATE INDEX idx_parceiro_cpf_cnpj ON tbparceiro(cpf_cnpj);
CREATE INDEX idx_parceiro_email ON tbparceiro(email);
CREATE INDEX idx_parceiro_ativo ON tbparceiro(ativo) WHERE ativo = true;
CREATE INDEX idx_parceiro_cidade ON tbparceiro(cidade);
CREATE INDEX idx_parceiro_uf ON tbparceiro(uf);

-- Índices na tabela tbbeneficio
CREATE INDEX idx_beneficio_parceiro_id ON tbbeneficio(parceiro_id);
CREATE INDEX idx_beneficio_ativo ON tbbeneficio(ativo) WHERE ativo = true;
CREATE INDEX idx_beneficio_nome ON tbbeneficio(beneficio);
CREATE INDEX idx_beneficio_parceiro_ativo ON tbbeneficio(parceiro_id, ativo) WHERE ativo = true;
```

---

## 🔐 Políticas RLS (Row Level Security)

### Habilitar RLS nas Tabelas

```sql
-- Habilitar RLS
ALTER TABLE tbvoucher ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbparceiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbbeneficio ENABLE ROW LEVEL SECURITY;
-- tbfuncionario: Avaliar se já possui RLS configurado
-- tbvoucher_beneficio: REMOVIDA (não mais necessária)
```

### Políticas para Tabela `tbvoucher`

> **⚠️ NOTA:** As políticas abaixo assumem que existe uma tabela `tbusuario` para controle de usuários e permissões.
> Ajuste conforme a estrutura de autenticação do seu projeto.

```sql
-- Funcionários podem ver apenas seus próprios vouchers (não deletados)
CREATE POLICY "Funcionarios visualizam proprios vouchers"
ON tbvoucher FOR SELECT
TO authenticated
USING (
    deletado = 'N' AND
    funcionario_id IN (
        SELECT funcionario_id FROM tbfuncionario
        WHERE email = auth.jwt()->>'email'  -- Ajustar conforme autenticação
        AND ativo = true
    )
);

-- RH e Admin podem visualizar todos os vouchers (incluindo deletados)
CREATE POLICY "RH visualiza todos vouchers"
ON tbvoucher FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM tbusuario
        WHERE usuario_id = auth.uid()::INTEGER  -- Ajustar conforme autenticação
        AND perfil IN ('admin', 'rh')  -- Ajustar conforme campo de perfil
    )
);

-- Funcionários podem criar vouchers para si mesmos
CREATE POLICY "Funcionarios criam proprios vouchers"
ON tbvoucher FOR INSERT
TO authenticated
WITH CHECK (
    deletado = 'N' AND
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
        SELECT 1 FROM tbusuario
        WHERE usuario_id = auth.uid()::INTEGER  -- Ajustar conforme autenticação
        AND perfil IN ('admin', 'rh')  -- Ajustar conforme campo de perfil
    )
);

-- Ninguém pode deletar vouchers fisicamente (apenas soft delete)
CREATE POLICY "Vouchers nao podem ser deletados fisicamente"
ON tbvoucher FOR DELETE
TO authenticated
USING (false);

-- Comentário sobre segurança de dados
COMMENT ON POLICY "Funcionarios visualizam proprios vouchers" ON tbvoucher IS
'Garante que funcionários vejam apenas seus próprios vouchers não deletados. CPF não é exposto nesta tabela.';
```

### Políticas para Tabela `tbparceiro`

```sql
-- Todos os usuários autenticados podem visualizar parceiros ativos
CREATE POLICY "Visualizar parceiros ativos"
ON tbparceiro FOR SELECT
TO authenticated
USING (ativo = true);

-- Apenas Admin e RH podem gerenciar parceiros
CREATE POLICY "Admin e RH gerenciam parceiros"
ON tbparceiro FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM tbusuario
        WHERE usuario_id = auth.uid()::INTEGER  -- Ajustar conforme autenticação
        AND perfil IN ('admin', 'rh')  -- Ajustar conforme campo de perfil
    )
);
```

### Políticas para Tabela `tbbeneficio`

```sql
-- Todos os usuários autenticados podem visualizar benefícios ativos
-- Incluindo informações do parceiro associado
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
        SELECT 1 FROM tbusuario
        WHERE usuario_id = auth.uid()::INTEGER  -- Ajustar conforme autenticação
        AND perfil = 'admin'  -- Ajustar conforme campo de perfil
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

-- Constraint para validar campo deletado
ALTER TABLE tbvoucher
ADD CONSTRAINT chk_deletado_valores
CHECK (deletado IN ('N', 'S'));

-- Constraint para garantir que deleted_at seja preenchido quando deletado = 'S'
ALTER TABLE tbvoucher
ADD CONSTRAINT chk_deleted_at_consistency
CHECK (
    (deletado = 'N' AND deleted_at IS NULL AND deleted_by IS NULL) OR
    (deletado = 'S' AND deleted_at IS NOT NULL AND deleted_by IS NOT NULL)
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = (now() AT TIME ZONE 'America/Sao_Paulo');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para soft delete (marcar deletado = 'S' ao invés de DELETE)
CREATE OR REPLACE FUNCTION soft_delete_voucher()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevenir DELETE físico, fazer soft delete
    UPDATE tbvoucher
    SET deletado = 'S',
        deleted_at = (now() AT TIME ZONE 'America/Sao_Paulo'),
        deleted_by = OLD.updated_by,  -- Usar o último usuário que atualizou
        deleted_nome = OLD.updated_nome
    WHERE voucher_id = OLD.voucher_id;

    -- Retornar NULL previne o DELETE físico
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_soft_delete_voucher
    BEFORE DELETE ON tbvoucher
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete_voucher();

CREATE TRIGGER update_voucher_updated_at
    BEFORE UPDATE ON tbvoucher
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parceiro_updated_at
    BEFORE UPDATE ON tbparceiro
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

### Parceiros do Sistema

```sql
-- Inserir parceiros exemplo
-- Nota: parceiro_id será gerado automaticamente como INT4 IDENTITY
INSERT INTO tbparceiro (nome_fantasia, razao_social, cpf_cnpj, email, telefone, whatsapp, endereco, bairro, cidade, uf, cep, ativo)
VALUES
    ('Farmácia Santa Cecília', 'Farmácia Santa Cecília Ltda', '12.345.678/0001-90', 'contato@farmaciastacecilia.com.br', '(11) 3456-7890', '(11) 98765-4321', 'Rua das Flores, 123', 'Centro', 'São Paulo', 'SP', '01234-567', true),
    ('Farmácia Gentil', 'Farmácia Gentil e Cia Ltda', '23.456.789/0001-01', 'contato@farmaciagentil.com.br', '(11) 3567-8901', '(11) 98876-5432', 'Av. Principal, 456', 'Jardim América', 'São Paulo', 'SP', '02345-678', true),
    ('Posto de Combustível Central', 'Combustíveis Central Ltda', '34.567.890/0001-12', 'contato@postocentral.com.br', '(11) 3678-9012', '(11) 98987-6543', 'Rodovia Estadual, Km 15', 'Bairro Industrial', 'São Paulo', 'SP', '03456-789', true),
    ('Transportes Urbanos', 'Transportes Urbanos S.A.', '45.678.901/0001-23', 'contato@transportesurbanos.com.br', '(11) 3789-0123', '(11) 99098-7654', 'Av. dos Transportes, 789', 'Vila Nova', 'São Paulo', 'SP', '04567-890', true);

-- Nota: Valores de CPF/CNPJ são fictícios para exemplo
-- Substitua pelos dados reais dos parceiros da empresa
```

### Benefícios do Sistema

```sql
-- Campo codigo foi REMOVIDO
-- Campo titulo foi RENOMEADO para beneficio (agora TEXT)
-- Campo valor_limite foi ADICIONADO
-- Campo parceiro_id foi ADICIONADO (FK para tbparceiro)
INSERT INTO tbbeneficio (parceiro_id, beneficio, descricao, valor, valor_limite, icone, ativo)
VALUES
    (NULL, 'Vale Gás', 'Benefício para compra de gás de cozinha', 125.00, 150.00, 'Flame', true),
    (1, 'Vale Farmácia Santa Cecília', 'Benefício para compras na Farmácia Santa Cecília', 300.00, 500.00, 'Pill', true),
    (2, 'Vale Farmácia Gentil', 'Benefício para compras na Farmácia Gentil', 300.00, 500.00, 'Pill', true),
    (3, 'Vale Combustível', 'Benefício para abastecimento de veículos', 100.00, 200.00, 'Fuel', true),
    (NULL, 'Plano de Saúde', 'Cobertura de assistência médica e hospitalar', 79.00, 100.00, 'Heart', true),
    (4, 'Vale Transporte', 'Auxílio para deslocamento urbano', 35.00, 50.00, 'Bus', true);

-- Notas:
-- - beneficio_id será gerado automaticamente como INT4 IDENTITY (1, 2, 3, 4, 5, 6)
-- - parceiro_id NULL significa que o benefício não está vinculado a um parceiro específico
-- - parceiro_id 1 = Farmácia Santa Cecília
-- - parceiro_id 2 = Farmácia Gentil
-- - parceiro_id 3 = Posto de Combustível Central
-- - parceiro_id 4 = Transportes Urbanos
-- - Valores de valor_limite são exemplos e devem ser ajustados conforme política da empresa
```

---

## 🗺️ Mapeamento: Componente → Banco de Dados

### SolicitarBeneficio.tsx → Tabelas

| Origem no Componente                    | Destino no Banco                      | Observação                           |
|-----------------------------------------|---------------------------------------|--------------------------------------|
| `voucher_id` (gerado)                   | `tbvoucher.voucher_id`                | UUID v4 gerado automaticamente (usado no QR Code) |
| `colaborador.matricula`                 | `tbfuncionario.matricula` → `tbvoucher.funcionario_id` | Buscar funcionario_id pela matrícula |
| `colaborador.nome`                      | `tbvoucher.funcionario`               | Copiar de tbfuncionario.nome (desnormalizado) |
| `colaborador.email`                     | `tbvoucher.email`                     | Copiar de tbfuncionario.email (desnormalizado) |
| `colaborador.matricula`                 | `tbvoucher.matricula`                 | Copiar de tbfuncionario.matricula (desnormalizado) |
| `colaborador.cpf`                       | **NÃO ARMAZENADO**                    | Mantido apenas em tbfuncionario (segurança) |
| `beneficio.id`                          | `tbvoucher.beneficio_id`              | INTEGER do benefício (FK direta)     |
| `beneficio.value`                       | `tbvoucher.valor`                     | Valor individual do benefício        |
| `new Date()` (emissão)                  | `tbvoucher.data_emissao`              | Data atual (DATE)                    |
| `dataValidade` (+30 dias)               | `tbvoucher.data_validade`             | data_emissao + 30 dias (DATE)        |
| `formData.justificativa`                | `tbvoucher.justificativa`             | Texto livre                          |
| `formData.urgente`                      | `tbvoucher.urgente`                   | Boolean (true/false)                 |
| `'emitido'` (status inicial)            | `tbvoucher.status`                    | Status padrão (ENUM voucher_status)  |
| `'N'` (padrão)                          | `tbvoucher.deletado`                  | 'N' = não deletado, 'S' = deletado   |
| `usuario.id`                            | `tbvoucher.created_by`                | ID do usuário que criou (INTEGER)    |
| `usuario.nome`                          | `tbvoucher.created_nome`              | Nome do usuário que criou            |

**⚠️ IMPORTANTE:**
- `selectedBeneficios[]` → Gera **múltiplos registros** em `tbvoucher` (um por benefício)
- **NÃO há mais** tabela `tbvoucher_beneficio` (relacionamento 1:1 direto)

---

## ⚠️ Impactos da Integração com `tbfuncionario`

### Mudanças Importantes

1. **Tipo de Chave Primária Diferente**
   - `tbfuncionario` usa `INTEGER` (IDENTITY) como PK
   - `tbvoucher` usa `UUID` como PK (`voucher_id`)
   - **Impacto:** O campo `funcionario_id` em `tbvoucher` deve ser `INTEGER`, não `UUID`

2. **Campos Desnormalizados em `tbvoucher`**
   - Os campos `funcionario` (nome), `matricula`, `email` são cópias de `tbfuncionario`
   - **Motivo:** Preservar dados históricos caso o funcionário seja alterado/desativado
   - **Vantagem:** Vouchers mantêm informações originais mesmo após mudanças no cadastro
   - **Segurança:** CPF **NÃO é armazenado** em `tbvoucher` (mantido apenas em `tbfuncionario`)
   - **Novidade:** Campos de auditoria `created_nome`, `updated_nome`, `deleted_nome` também são desnormalizados

3. **Soft Delete Implementado**
   - Campo `deletado` (CHAR 1) com valores 'N' ou 'S'
   - Campos `deleted_at`, `deleted_by`, `deleted_nome` para rastreamento
   - Vouchers nunca são deletados fisicamente (DELETE bloqueado por RLS)
   - Queries devem sempre filtrar `deletado = 'N'` para obter apenas registros ativos

4. **Sistema de Auditoria Completo**
   - Todos os campos de auditoria referenciam `tbusuario.usuario_id` (INTEGER), não `auth.users(id)` (UUID)
   - Campos adicionados: `created_nome`, `updated_nome`, `deleted_nome` (TEXT)
   - Timezone configurado: `America/Sao_Paulo` no default de `created_at`

5. **Busca de Funcionário no Frontend**
   - O componente React precisa buscar o `funcionario_id` antes de criar o voucher
   - **Query necessária:**
   ```sql
   SELECT funcionario_id, nome, email, matricula
   FROM tbfuncionario
   WHERE matricula = ? AND ativo = true
   ```
   - **Nota:** CPF não é retornado para reduzir exposição de dados sensíveis

6. **Validações Necessárias**
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

// 2. Buscar benefícios com informações do parceiro
const { data: beneficiosSelecionadosComParceiro } = await supabase
  .from('tbbeneficio')
  .select(`
    beneficio_id,
    beneficio,
    descricao,
    valor,
    valor_limite,
    icone,
    tbparceiro (
      parceiro_id,
      nome_fantasia,
      email,
      telefone,
      whatsapp,
      cidade,
      uf
    )
  `)
  .in('beneficio_id', beneficiosSelecionados.map(b => b.beneficio_id));

// 3. Criar vouchers individuais (um para cada benefício selecionado)
// IMPORTANTE: Se o usuário selecionou 3 benefícios, este loop cria 3 vouchers
const vouchersGerados = [];

for (const beneficio of beneficiosSelecionadosComParceiro) {
  const { data: voucher, error } = await supabase
    .from('tbvoucher')
    .insert({
      // voucher_id é gerado automaticamente (UUID)
      funcionario_id: funcionario.funcionario_id,  // INTEGER
      funcionario: funcionario.nome,  // Desnormalizado
      email: funcionario.email,        // Desnormalizado
      matricula: funcionario.matricula, // Desnormalizado
      // CPF NÃO é armazenado aqui (segurança)

      // Benefício associado (1:1)
      beneficio_id: beneficio.beneficio_id,

      // Valor individual do benefício
      valor: beneficio.valor,
      data_emissao: new Date().toISOString().split('T')[0],  // Data atual (DATE)
      data_validade: dataValidade,
      status: 'emitido',  // ENUM voucher_status
      justificativa: formData.justificativa,
      urgente: formData.urgente,  // Boolean: true ou false

      // Soft Delete (padrão)
      deletado: 'N',

      // Auditoria
      created_by: currentUser.usuario_id,  // INTEGER (FK para tbusuario)
      created_nome: currentUser.nome       // Nome do usuário (desnormalizado)
    })
    .select('voucher_id')  // Retorna o UUID gerado
    .single();

  if (voucher) {
    vouchersGerados.push({
      ...voucher,
      beneficio: beneficio,
      parceiro: beneficio.tbparceiro  // Informações do parceiro (pode ser null)
    });
  }
}

// 4. Cada voucher_id (UUID) é usado diretamente no seu próprio QR Code
console.log(`${vouchersGerados.length} vouchers criados:`, vouchersGerados.map(v => v.voucher_id));

// 5. Gerar QR Code com apenas o UUID
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

  // Buscar voucher no banco de dados (relacionamento 1:1 direto)
  // Incluindo informações do parceiro associado ao benefício
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
      beneficio_titulo,
      beneficio_descricao,
      tbbeneficio (
        beneficio_id,
        beneficio,
        descricao,
        valor,
        valor_limite,
        icone,
        tbparceiro (
          parceiro_id,
          nome_fantasia,
          razao_social,
          email,
          telefone,
          whatsapp,
          cidade,
          uf
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
-- ATUALIZADA v6.0: Suporte a soft delete e campos atualizados
CREATE OR REPLACE FUNCTION validar_voucher_por_uuid(p_voucher_id UUID)
RETURNS TABLE (
    voucher_id UUID,
    funcionario TEXT,
    valor NUMERIC,
    status voucher_status,
    data_validade DATE,
    deletado CHAR,
    beneficio JSONB,
    parceiro JSONB,
    valido BOOLEAN,
    mensagem TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.voucher_id,
        v.funcionario,
        v.valor,
        v.status,
        v.data_validade,
        v.deletado,
        jsonb_build_object(
            'id', b.beneficio_id,
            'beneficio', b.beneficio,
            'descricao', b.descricao,
            'valor', b.valor,
            'valor_limite', b.valor_limite,
            'icone', b.icone
        ) as beneficio,
        CASE
            WHEN p.parceiro_id IS NOT NULL THEN
                jsonb_build_object(
                    'id', p.parceiro_id,
                    'nome_fantasia', p.nome_fantasia,
                    'razao_social', p.razao_social,
                    'email', p.email,
                    'telefone', p.telefone,
                    'whatsapp', p.whatsapp,
                    'cidade', p.cidade,
                    'uf', p.uf
                )
            ELSE NULL
        END as parceiro,
        CASE
            WHEN v.deletado = 'S' THEN false
            WHEN v.status = 'resgatado' THEN false
            WHEN v.status = 'cancelado' THEN false
            WHEN v.status = 'expirado' THEN false
            WHEN v.data_validade < CURRENT_DATE THEN false
            WHEN v.status IN ('emitido', 'aprovado') THEN true
            ELSE false
        END as valido,
        CASE
            WHEN v.deletado = 'S' THEN 'Voucher foi deletado'
            WHEN v.status = 'resgatado' THEN 'Voucher já foi utilizado'
            WHEN v.status = 'cancelado' THEN 'Voucher cancelado'
            WHEN v.status = 'expirado' THEN 'Voucher expirado'
            WHEN v.data_validade < CURRENT_DATE THEN 'Voucher vencido'
            WHEN v.status IN ('emitido', 'aprovado') THEN 'Voucher válido'
            ELSE 'Status inválido'
        END as mensagem
    FROM tbvoucher v
    INNER JOIN tbbeneficio b ON v.beneficio_id = b.beneficio_id
    LEFT JOIN tbparceiro p ON b.parceiro_id = p.parceiro_id
    WHERE v.voucher_id = p_voucher_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validar_voucher_por_uuid IS 'Valida voucher escaneado via QR Code e retorna todos os dados necessários incluindo informações do parceiro e status de soft delete (1 voucher = 1 benefício)';

-- Uso:
-- SELECT * FROM validar_voucher_por_uuid('550e8400-e29b-41d4-a716-446655440000');
-- Retorno inclui:
-- - Dados do voucher (id, funcionário, valor, status, validade, deletado)
-- - Dados do benefício (id, título, descrição, valor, ícone)
-- - Dados do parceiro (id, nome, contatos, localização) - NULL se benefício sem parceiro
-- - Flag 'valido' (false se deletado = 'S')
```

---

### ~~Função para Calcular Valor Total do Voucher~~ (REMOVIDA)

> **💡 Nota:** Esta função não é mais necessária, pois cada voucher tem apenas um benefício.
> O valor já está armazenado diretamente no campo `tbvoucher.valor`.

-- Procedure para expirar vouchers vencidos (job agendado)
CREATE OR REPLACE PROCEDURE expirar_vouchers_vencidos()
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE tbvoucher
    SET status = 'expirado',
        updated_at = (now() AT TIME ZONE 'America/Sao_Paulo')
    WHERE status = 'emitido'
      AND data_validade < CURRENT_DATE
      AND deletado = 'N';  -- Apenas vouchers não deletados
END;
$$;

-- Procedure para soft delete de voucher
CREATE OR REPLACE PROCEDURE soft_delete_voucher_by_id(
    p_voucher_id UUID,
    p_deleted_by INTEGER,
    p_deleted_nome TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE tbvoucher
    SET deletado = 'S',
        deleted_at = (now() AT TIME ZONE 'America/Sao_Paulo'),
        deleted_by = p_deleted_by,
        deleted_nome = p_deleted_nome
    WHERE voucher_id = p_voucher_id
      AND deletado = 'N';  -- Apenas se ainda não foi deletado
END;
$$;

COMMENT ON PROCEDURE soft_delete_voucher_by_id IS 'Marca um voucher como deletado (soft delete) sem removê-lo fisicamente do banco';
```

---

## ⚠️ Observações Importantes

1. **Soft Delete (CRÍTICO)**:
   - **NUNCA** use `DELETE FROM tbvoucher` diretamente
   - Use a procedure `soft_delete_voucher_by_id` ou UPDATE com `deletado = 'S'`
   - Todas as queries SELECT devem incluir `WHERE deletado = 'N'` (exceto para administração)
   - O trigger `trigger_soft_delete_voucher` previne DELETE físico automaticamente
   - Vouchers deletados são preservados para auditoria e histórico

2. **Sistema de Auditoria**:
   - SEMPRE preencher `created_by` e `created_nome` no INSERT
   - SEMPRE preencher `updated_by` e `updated_nome` no UPDATE
   - SEMPRE preencher `deleted_by` e `deleted_nome` no soft delete
   - Os campos `*_nome` são desnormalizados para preservar histórico (caso o usuário seja renomeado/deletado)

3. **Segurança**:
   - Todas as credenciais devem ser configuradas via variáveis de ambiente
   - Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend
   - CPF **NUNCA** é armazenado em `tbvoucher` (mantido apenas em `tbfuncionario`)

4. **Migração de Dados**:
   - Os dados atuais estão em `localStorage`
   - Será necessário script de migração para Supabase
   - Ao migrar, definir `deletado = 'N'` para todos os registros

5. **Backup**:
   - Configure backups automáticos no Supabase Dashboard
   - Mantenha histórico de alterações via triggers
   - Soft delete garante que dados nunca sejam perdidos permanentemente

6. **Performance**:
   - Os índices sugeridos cobrem as consultas mais frequentes
   - Use índices com `WHERE deletado = 'N'` para consultas de registros ativos
   - Monitore queries lentas no Supabase Dashboard

### Exemplos de Uso do Soft Delete

**❌ ERRADO - Não fazer:**
```sql
-- NUNCA faça DELETE direto (será bloqueado pelo trigger)
DELETE FROM tbvoucher WHERE voucher_id = '550e8400-...';
```

**✅ CORRETO - Usar procedure:**
```sql
-- Usar procedure de soft delete
CALL soft_delete_voucher_by_id(
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    123,  -- usuario_id de tbusuario
    'João Admin'  -- nome do usuário
);
```

**✅ CORRETO - Ou UPDATE direto:**
```typescript
// No código TypeScript/JavaScript
const { error } = await supabase
  .from('tbvoucher')
  .update({
    deletado: 'S',
    deleted_at: new Date().toISOString(),
    deleted_by: currentUser.usuario_id,
    deleted_nome: currentUser.nome
  })
  .eq('voucher_id', voucherId)
  .eq('deletado', 'N');  // Apenas se ainda não foi deletado
```

**✅ CORRETO - Consultar apenas registros ativos:**
```typescript
// Listar vouchers ativos
const { data: vouchers } = await supabase
  .from('tbvoucher')
  .select('*')
  .eq('deletado', 'N')
  .eq('funcionario_id', funcionarioId);
```

**✅ CORRETO - Consultar TODOS os registros (admin):**
```typescript
// Listar todos os vouchers (incluindo deletados) - apenas para administração
const { data: allVouchers } = await supabase
  .from('tbvoucher')
  .select('*, deletado, deleted_at, deleted_by, deleted_nome')
  .eq('funcionario_id', funcionarioId);
```

---

## 📚 Referências

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🛠️ Script SQL Completo para Implementação

### Script de Atualização da `tbvoucher` (se já existe)

```sql
-- ============================================
-- SCRIPT DE ATUALIZAÇÃO DA TABELA TBVOUCHER
-- Versão 6.0 - Soft Delete e Auditoria
-- ============================================

-- 1. Adicionar campo deletado (se não existe)
ALTER TABLE tbvoucher
ADD COLUMN IF NOT EXISTS deletado CHAR(1) NOT NULL DEFAULT 'N';

-- 2. Adicionar campos de soft delete (se não existem)
ALTER TABLE tbvoucher
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITHOUT TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS deleted_by INTEGER NULL,
ADD COLUMN IF NOT EXISTS deleted_nome TEXT NULL;

-- 3. Adicionar campos de nome de auditoria (se não existem)
ALTER TABLE tbvoucher
ADD COLUMN IF NOT EXISTS created_nome TEXT,
ADD COLUMN IF NOT EXISTS updated_nome TEXT;

-- 4. Adicionar constraints
ALTER TABLE tbvoucher
DROP CONSTRAINT IF EXISTS chk_deletado_valores;

ALTER TABLE tbvoucher
ADD CONSTRAINT chk_deletado_valores
CHECK (deletado IN ('N', 'S'));

ALTER TABLE tbvoucher
DROP CONSTRAINT IF EXISTS chk_deleted_at_consistency;

ALTER TABLE tbvoucher
ADD CONSTRAINT chk_deleted_at_consistency
CHECK (
    (deletado = 'N' AND deleted_at IS NULL AND deleted_by IS NULL) OR
    (deletado = 'S' AND deleted_at IS NOT NULL AND deleted_by IS NOT NULL)
);

-- 5. Adicionar FK para tbusuario (se a tabela existe)
ALTER TABLE tbvoucher
DROP CONSTRAINT IF EXISTS tbvoucher_deleted_by_fkey;

ALTER TABLE tbvoucher
ADD CONSTRAINT tbvoucher_deleted_by_fkey
FOREIGN KEY (deleted_by) REFERENCES tbusuario(usuario_id);

-- 6. Criar índices para soft delete
CREATE INDEX IF NOT EXISTS idx_voucher_deletado ON tbvoucher(deletado);
CREATE INDEX IF NOT EXISTS idx_voucher_deletado_deleted_at ON tbvoucher(deletado, deleted_at);
CREATE INDEX IF NOT EXISTS idx_voucher_deleted_by ON tbvoucher(deleted_by);
CREATE INDEX IF NOT EXISTS idx_voucher_created_by ON tbvoucher(created_by);
CREATE INDEX IF NOT EXISTS idx_voucher_updated_by ON tbvoucher(updated_by);

-- 7. Atualizar índices existentes para incluir filtro de soft delete
DROP INDEX IF EXISTS idx_voucher_ativos;
CREATE INDEX idx_voucher_ativos ON tbvoucher(status, data_validade)
    WHERE deletado = 'N';

DROP INDEX IF EXISTS idx_voucher_scan_lookup;
CREATE INDEX idx_voucher_scan_lookup ON tbvoucher(voucher_id, status, data_validade)
    WHERE status IN ('emitido', 'aprovado') AND deletado = 'N';

DROP INDEX IF EXISTS idx_voucher_funcionario_beneficio;
CREATE INDEX idx_voucher_funcionario_beneficio ON tbvoucher(funcionario_id, beneficio_id)
    WHERE deletado = 'N';

-- 8. Criar função de soft delete
CREATE OR REPLACE FUNCTION soft_delete_voucher()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tbvoucher
    SET deletado = 'S',
        deleted_at = (now() AT TIME ZONE 'America/Sao_Paulo'),
        deleted_by = OLD.updated_by,
        deleted_nome = OLD.updated_nome
    WHERE voucher_id = OLD.voucher_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 9. Criar trigger de soft delete
DROP TRIGGER IF EXISTS trigger_soft_delete_voucher ON tbvoucher;
CREATE TRIGGER trigger_soft_delete_voucher
    BEFORE DELETE ON tbvoucher
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete_voucher();

-- 10. Criar procedure de soft delete
CREATE OR REPLACE PROCEDURE soft_delete_voucher_by_id(
    p_voucher_id UUID,
    p_deleted_by INTEGER,
    p_deleted_nome TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE tbvoucher
    SET deletado = 'S',
        deleted_at = (now() AT TIME ZONE 'America/Sao_Paulo'),
        deleted_by = p_deleted_by,
        deleted_nome = p_deleted_nome
    WHERE voucher_id = p_voucher_id
      AND deletado = 'N';
END;
$$;

-- 11. Atualizar procedure de expiração
CREATE OR REPLACE PROCEDURE expirar_vouchers_vencidos()
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE tbvoucher
    SET status = 'expirado',
        updated_at = (now() AT TIME ZONE 'America/Sao_Paulo')
    WHERE status = 'emitido'
      AND data_validade < CURRENT_DATE
      AND deletado = 'N';
END;
$$;

-- 12. Atualizar função de validação
CREATE OR REPLACE FUNCTION validar_voucher_por_uuid(p_voucher_id UUID)
RETURNS TABLE (
    voucher_id UUID,
    funcionario TEXT,
    valor NUMERIC,
    status voucher_status,
    data_validade DATE,
    deletado CHAR,
    beneficio JSONB,
    parceiro JSONB,
    valido BOOLEAN,
    mensagem TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.voucher_id,
        v.funcionario,
        v.valor,
        v.status,
        v.data_validade,
        v.deletado,
        jsonb_build_object(
            'id', b.beneficio_id,
            'beneficio', b.beneficio,
            'descricao', b.descricao,
            'valor', b.valor,
            'valor_limite', b.valor_limite,
            'icone', b.icone
        ) as beneficio,
        CASE
            WHEN p.parceiro_id IS NOT NULL THEN
                jsonb_build_object(
                    'id', p.parceiro_id,
                    'nome_fantasia', p.nome_fantasia,
                    'razao_social', p.razao_social,
                    'email', p.email,
                    'telefone', p.telefone,
                    'whatsapp', p.whatsapp,
                    'cidade', p.cidade,
                    'uf', p.uf
                )
            ELSE NULL
        END as parceiro,
        CASE
            WHEN v.deletado = 'S' THEN false
            WHEN v.status = 'resgatado' THEN false
            WHEN v.status = 'cancelado' THEN false
            WHEN v.status = 'expirado' THEN false
            WHEN v.data_validade < CURRENT_DATE THEN false
            WHEN v.status IN ('emitido', 'aprovado') THEN true
            ELSE false
        END as valido,
        CASE
            WHEN v.deletado = 'S' THEN 'Voucher foi deletado'
            WHEN v.status = 'resgatado' THEN 'Voucher já foi utilizado'
            WHEN v.status = 'cancelado' THEN 'Voucher cancelado'
            WHEN v.status = 'expirado' THEN 'Voucher expirado'
            WHEN v.data_validade < CURRENT_DATE THEN 'Voucher vencido'
            WHEN v.status IN ('emitido', 'aprovado') THEN 'Voucher válido'
            ELSE 'Status inválido'
        END as mensagem
    FROM tbvoucher v
    INNER JOIN tbbeneficio b ON v.beneficio_id = b.beneficio_id
    LEFT JOIN tbparceiro p ON b.parceiro_id = p.parceiro_id
    WHERE v.voucher_id = p_voucher_id;
END;
$$ LANGUAGE plpgsql;

-- 13. Migrar dados existentes (definir deletado = 'N' para todos)
UPDATE tbvoucher
SET deletado = 'N'
WHERE deletado IS NULL OR deletado = '';

-- 14. Adicionar comentários
COMMENT ON COLUMN tbvoucher.deletado IS 'Indica se o voucher foi deletado logicamente (S=Sim, N=Não) - Soft Delete';
COMMENT ON COLUMN tbvoucher.deleted_at IS 'Data e hora em que o registro foi deletado (soft delete)';
COMMENT ON COLUMN tbvoucher.deleted_by IS 'ID do usuário que deletou o registro (FK para tbusuario)';
COMMENT ON COLUMN tbvoucher.deleted_nome IS 'Nome do usuário que deletou o registro';
COMMENT ON COLUMN tbvoucher.created_nome IS 'Nome do usuário que criou o registro';
COMMENT ON COLUMN tbvoucher.updated_nome IS 'Nome do usuário que atualizou o registro';

-- ============================================
-- FIM DO SCRIPT DE ATUALIZAÇÃO
-- ============================================
```

### Verificação da Implementação

```sql
-- Verificar se a tabela foi atualizada corretamente
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'tbvoucher'
ORDER BY ordinal_position;

-- Verificar constraints
SELECT
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'tbvoucher';

-- Verificar índices
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'tbvoucher';

-- Testar função de validação
SELECT * FROM validar_voucher_por_uuid('550e8400-e29b-41d4-a716-446655440000');

-- Testar soft delete (substitua os valores)
CALL soft_delete_voucher_by_id(
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    1,  -- ID do usuário
    'Nome do Usuário'
);

-- Verificar vouchers deletados
SELECT
    voucher_id,
    funcionario,
    valor,
    status,
    deletado,
    deleted_at,
    deleted_by,
    deleted_nome
FROM tbvoucher
WHERE deletado = 'S';
```

---

---

## 📋 Checklist de Implementação

### Antes de Criar as Tabelas

- [ ] Verificar se `tbfuncionario` já existe no banco (✅ JÁ EXISTE)
- [ ] Verificar se `tbfuncionario` possui índices necessários (✅ JÁ POSSUI)
- [ ] ✅ **Decisão tomada:** Usar apenas UUID (`voucher_id`) como identificador
- [ ] Definir estratégia de autenticação (user_id, email ou tabela de vínculo)

### Criação das Tabelas

- [ ] Criar tabela `tbparceiro` com `parceiro_id INT4 GENERATED ALWAYS AS IDENTITY` como PK
- [ ] Inserir dados iniciais em `tbparceiro` (seeds - parceiros exemplo)
- [ ] Criar tabela `tbbeneficio` com `beneficio_id INT4 GENERATED ALWAYS AS IDENTITY` como PK
- [ ] Inserir dados iniciais em `tbbeneficio` (seeds - com campo `valor_limite`, `parceiro_id`, sem campo `codigo`)
- [ ] Criar tabela `tbvoucher` com:
  - `voucher_id UUID` como PK (gerado automaticamente)
  - `funcionario_id INTEGER` como FK para `tbfuncionario`
  - `beneficio_id INT4` como FK para `tbbeneficio` (relacionamento 1:1)
  - `beneficio_titulo` e `beneficio_descricao` (desnormalizados para histórico)
  - **SEM** campo `numero_voucher`
  - **SEM** campo `funcionario_cpf` (segurança)
- [ ] ~~Criar tabela `tbvoucher_beneficio`~~ ❌ **NÃO CRIAR** (não mais necessária)
- [ ] Criar índices em `tbparceiro` (nome, cpf_cnpj, email, cidade, uf, ativo)
- [ ] Criar índices em `tbbeneficio` (incluindo `idx_beneficio_parceiro_id`)
- [ ] Criar índices em `tbvoucher` (incluindo `idx_voucher_beneficio_id`)

### Configuração de Segurança

- [ ] Habilitar RLS nas novas tabelas
- [ ] Criar políticas RLS para `tbparceiro`
- [ ] Criar políticas RLS para `tbbeneficio`
- [ ] Criar políticas RLS para `tbvoucher`
- [ ] Verificar/criar políticas RLS para `tbfuncionario`
- [ ] Testar políticas com diferentes perfis de usuário

### Funções e Triggers

- [ ] Criar função `update_updated_at_column()`
- [ ] Criar trigger de `updated_at` para `tbvoucher`
- [ ] Criar trigger de `updated_at` para `tbparceiro`
- [ ] Criar trigger de `updated_at` para `tbbeneficio`
- [ ] Criar trigger de expiração automática de vouchers
- [ ] ~~Criar função `gerar_numero_voucher()`~~ (❌ NÃO NECESSÁRIO - usando UUID)
- [ ] ~~Criar função `calcular_valor_voucher()`~~ (❌ NÃO NECESSÁRIO - valor já está em tbvoucher.valor)
- [ ] Criar procedure `expirar_vouchers_vencidos()`
- [ ] Criar função `validar_voucher_por_uuid()` (atualizada para relacionamento 1:1)

### Integração com Frontend

- [ ] Atualizar componente React para buscar `funcionario_id` de `tbfuncionario`
- [ ] Modificar interface `VoucherEmitido` para usar:
  - `voucher_id` (UUID) ao invés de `numero_voucher`
  - `funcionario_id` (INTEGER)
  - `beneficio_id` (INT4) - relacionamento 1:1
  - **Remover** campo `cpf` (não armazenado em tbvoucher)
  - **Alterar** `urgencia: string` para `urgente: boolean`
- [ ] Implementar query de busca de funcionário por matrícula (sem retornar CPF)
- [ ] **Implementar lógica de múltiplos vouchers:**
  - Loop através de `selectedBeneficios[]`
  - Criar um voucher separado para cada benefício
  - Gerar QR Code individual para cada voucher
  - Enviar e-mail individual para cada voucher (ou consolidado)
- [ ] **Simplificar geração de QR Code:**
  - Gerar QR Code com **APENAS** `voucher_id` (UUID)
  - Remover geração de JSON complexo
  - Remover campo `qr_code_data` do INSERT
- [ ] **Atualizar Scanner do Parceiro:**
  - Escanear UUID do QR Code
  - Buscar dados do voucher no Supabase por `voucher_id` (JOIN com tbbeneficio)
  - Validar status e validade em tempo real
  - Exibir benefício único associado ao voucher
- [ ] **Atualizar UI do campo de urgência:**
  - Substituir select/dropdown por checkbox ou toggle switch
  - Label: "Solicitação urgente?" ou "Marcar como urgente"
  - Valor padrão: `false` (desmarcado)
- [ ] **Atualizar UI de exibição de vouchers:**
  - Exibir múltiplos vouchers quando mais de um for gerado
  - Cada card mostra um voucher individual com seu benefício
- [ ] Migrar dados do localStorage para Supabase (se necessário)
- [ ] Testar fluxo completo de criação e validação de voucher

### Testes

- [ ] Testar criação de voucher com funcionário válido
- [ ] Testar rejeição de voucher com funcionário inativo
- [ ] Testar políticas RLS (funcionário só vê seus vouchers)
- [ ] Testar expiração automática de vouchers
- [ ] Testar criação de múltiplos vouchers (1 por benefício)
- [ ] Testar relacionamento 1:1 entre voucher e benefício
- [ ] Testar performance das queries com índices
- [ ] Testar validação de voucher individual via QR Code

---

## 🎯 Resumo Executivo dos Impactos

| Aspecto                  | Impacto                                                      | Ação Necessária                          |
|--------------------------|--------------------------------------------------------------|------------------------------------------|
| **Nova Tabela**          | Criada tabela `tbparceiro` para cadastro de fornecedores    | Implementar CRUD de parceiros            |
| **Novo Relacionamento**  | `tbbeneficio.parceiro_id` relaciona benefício com parceiro   | Atualizar forms de benefício             |
| **Identificador**        | Usar UUID (`voucher_id`) ao invés de `numero_voucher`        | Atualizar frontend para usar UUID        |
| **QR Code**              | QR Code contém **APENAS UUID** (não JSON)                    | Simplificar geração de QR Code           |
| **Campo Removido**       | `qr_code_data` removido (redundante)                         | Remover do INSERT e queries              |
| **Tabela Removida**      | `tbvoucher_beneficio` **NÃO é mais necessária**              | Não criar esta tabela                    |
| **Relacionamento**       | Mudou de N:N para 1:1 (voucher ↔ benefício)                 | FK direta `beneficio_id INT4` em `tbvoucher` |
| **Múltiplos Vouchers**   | 1 benefício = 1 voucher (3 benefícios = 3 vouchers)          | Loop de criação no frontend              |
| **Campos Adicionados**   | `beneficio_titulo` e `beneficio_descricao` em `tbvoucher`    | Desnormalizar para histórico             |
| **Tipo PK Benefício**    | `tbbeneficio.beneficio_id` mudou de UUID para INT4           | Usar INT4 IDENTITY (sequencial)          |
| **Campo Renomeado**      | `titulo` → `beneficio` (VARCHAR → TEXT)                      | Atualizar referências para usar `beneficio` |
| **Campo Adicionado**     | `tbbeneficio.valor_limite` adicionado (NUMERIC)              | Permite definir valor máximo por benefício |
| **Campo Removido**       | `tbbeneficio.codigo` removido                                | Usar `beneficio_id` ou `beneficio` para identificação |
| **Validação**            | Validação por consulta ao banco (não offline)                | Implementar busca por UUID no scanner    |
| **Tipo de FK**           | `tbfuncionario` usa INTEGER, não UUID                        | Usar INTEGER em `tbvoucher.funcionario_id` |
| **Campos Desnormalizados** | Copiar nome, matrícula, email, benefício (NÃO CPF)         | Implementar cópia no INSERT              |
| **Segurança de Dados**   | CPF não é armazenado em `tbvoucher`                          | Buscar CPF apenas de `tbfuncionario` quando necessário |
| **Autenticação**         | `tbfuncionario` não tem `user_id`                            | Adicionar campo ou usar email/matrícula  |
| **Busca de Funcionário** | Frontend precisa buscar funcionário antes de criar voucher   | Implementar query de busca (sem CPF)     |
| **Validações**           | Verificar se funcionário está ativo                          | Adicionar validação no frontend/backend  |
| **Índices**              | `tbfuncionario` já possui índices                            | Nenhuma (já existem)                     |
| **RLS**                  | Políticas precisam usar email ou tabela de vínculo           | Implementar estratégia de autenticação   |
| **Performance**          | Cada scan requer consulta ao banco                           | Implementar cache + índices otimizados   |
| **Campo Urgência**       | Simplificado de 4 níveis para binário (Sim/Não)              | Atualizar UI para checkbox/toggle        |
| **UI de Vouchers**       | Exibir múltiplos vouchers quando mais de um for gerado       | Atualizar componente de visualização     |
| **Soft Delete**          | Campo `deletado` CHAR(1) com valores 'N' ou 'S'              | Implementar lógica de soft delete no frontend |
| **Campos de Auditoria**  | `created_nome`, `updated_nome`, `deleted_nome` (TEXT)         | Armazenar nome do usuário em cada operação |
| **Referências Auditoria**| `created_by`, `updated_by`, `deleted_by` → `tbusuario.usuario_id` | Usar INTEGER ao invés de UUID            |
| **Timezone**             | `created_at` com timezone `America/Sao_Paulo`                 | Configurar timezone no banco             |
| **Campos Removidos**     | `beneficio_titulo`, `beneficio_descricao`, `informacoes_adicionais` | Remover referências no código          |
| **Campos Renomeados**    | `funcionario_nome` → `funcionario`, `funcionario_email` → `email` | Atualizar queries e INSERT statements    |
| **Nova Tabela**          | `tbusuario` (já existente) para auditoria                     | Configurar FK e políticas RLS            |
| **Validação QR Code**    | Incluir validação de `deletado = 'N'`                         | Atualizar scanner para verificar soft delete |
| **Índices Novos**        | Índices para `deletado`, `created_by`, `updated_by`, `deleted_by` | Criar índices para performance         |
| **Trigger Soft Delete**  | Trigger BEFORE DELETE previne exclusão física                 | Implementar trigger no banco             |

---

**Última atualização**: 03/12/2024
**Autor**: Documentação gerada a partir da análise do componente `SolicitarBeneficio.tsx` e estrutura real da `tbvoucher`
**Versão**: 6.0 - Soft Delete e Sistema de Auditoria Completo

### 📝 Changelog

**v6.0 (03/12/2024) - BREAKING CHANGE** 🚨
- ✅ **Implementado Soft Delete**: Campo `deletado` CHAR(1) com valores 'N' ou 'S'
- ✅ **Campos de auditoria de soft delete**: `deleted_at`, `deleted_by`, `deleted_nome`
- ✅ **Sistema de auditoria completo**: Campos `created_nome`, `updated_nome`, `deleted_nome` adicionados
- ✅ **Mudança de referências**: `created_by`, `updated_by`, `deleted_by` agora referenciam `tbusuario.usuario_id` (INTEGER) ao invés de `auth.users(id)` (UUID)
- ✅ **Timezone configurado**: `created_at` usa timezone `America/Sao_Paulo`
- ✅ **Campos renomeados**:
  - `funcionario_nome` → `funcionario` (TEXT)
  - `funcionario_email` → `email` (TEXT)
  - `funcionario_matricula` → `matricula` (TEXT)
- ✅ **Campos removidos**:
  - `beneficio_titulo` (buscar de tbbeneficio)
  - `beneficio_descricao` (buscar de tbbeneficio)
  - `informacoes_adicionais`
- ✅ **Tipo de data alterado**: `data_emissao` mudou de `TIMESTAMPTZ` para `DATE`
- ✅ **Status como ENUM**: Campo `status` agora usa tipo `public.voucher_status` ao invés de VARCHAR com CHECK
- ✅ **Adicionada tabela `tbusuario`**: Documentação da tabela já existente para referência de auditoria
- ✅ **Índices para soft delete**: Índices otimizados para consultas com `deletado = 'N'`
- ✅ **Trigger de soft delete**: Previne DELETE físico e marca registro como deletado
- ✅ **Procedure de soft delete**: Procedure `soft_delete_voucher_by_id` para deletar vouchers programaticamente
- ✅ **Constraints adicionadas**: Validação de consistência entre `deletado`, `deleted_at` e `deleted_by`
- ✅ **Função validar_voucher_por_uuid atualizada**: Inclui verificação de soft delete
- ✅ **Procedure expirar_vouchers_vencidos atualizada**: Considera apenas vouchers não deletados
- ✅ **Políticas RLS atualizadas**: Incluem filtro `deletado = 'N'` e referências a `tbusuario`
- ✅ **Fluxo de criação atualizado**: Exemplo de INSERT com todos os campos novos
- ✅ **Mapeamento de campos atualizado**: Reflete estrutura real da tabela

**v5.3 (03/12/2024)**
- ✅ **Adicionada tabela `tbparceiro`** para cadastro de parceiros/fornecedores
- ✅ Campos em `tbparceiro`: nome_fantasia, razao_social, cpf_cnpj, email, telefone, whatsapp, endereco, bairro, cidade, uf, cep, complemento, observacao
- ✅ **Campos TEXT em `tbparceiro`**: nome_fantasia, razao_social, cpf_cnpj, email, telefone, whatsapp, endereco, bairro, cidade, complemento (mantidos VARCHAR apenas uf e cep como sugestão de tamanho)
- ✅ **Campo `cpf_cnpj` como TEXT**: Aceita qualquer formato (formatado ou apenas números) - sem constraint de validação
- ✅ **Removida todas as constraints de validação**: CPF/CNPJ e UF não têm validação no banco de dados
- ⚠️ **Responsabilidade de validação transferida**: Todas as validações de formato devem ser feitas no frontend/backend da aplicação
- ✅ **Adicionado campo `parceiro_id`** em `tbbeneficio` (FK para tbparceiro)
- ✅ Relacionamento N:1 entre `tbbeneficio` e `tbparceiro`
- ✅ Adicionados índices para `tbparceiro` (nome, cpf_cnpj, email, cidade, uf, ativo)
- ✅ Adicionado índice `idx_beneficio_parceiro_id` e `idx_beneficio_parceiro_ativo`
- ✅ Criadas políticas RLS para `tbparceiro` (Admin e RH podem gerenciar)
- ✅ Adicionado trigger `update_parceiro_updated_at`
- ✅ Adicionados seeds de exemplo para parceiros
- ✅ Atualizados seeds de `tbbeneficio` para incluir `parceiro_id`
- ✅ Atualizado diagrama de relacionamentos
- ✅ Atualizado checklist de implementação
- ✅ Atualizada tabela de impactos

**v5.2 (03/12/2024)**
- ✅ **Renomeado campo `titulo` → `beneficio`** (VARCHAR → TEXT) em `tbbeneficio`
- ✅ **Adicionado campo `valor_limite`** (NUMERIC) em `tbbeneficio` para controle de valor máximo
- ✅ Atualizado CREATE TABLE de `tbbeneficio` com novos campos
- ✅ Atualizado INSERT de seeds incluindo `valor_limite` com valores exemplo
- ✅ Atualizado índices (renomeado `idx_beneficio_titulo` → `idx_beneficio_nome`)
- ✅ Atualizado mapeamento de campos no fluxo de criação de voucher
- ✅ Atualizada função `validar_voucher_por_uuid()` para incluir `valor_limite`
- ✅ Atualizado exemplo de validação de QR Code
- ✅ Atualizada tabela de impactos
- ✅ Atualizado checklist de implementação
- ✅ Adicionados comentários detalhados para todos os campos

**v5.1 (03/12/2024)**
- ✅ **Removido campo `codigo`** de `tbbeneficio`
- ✅ Atualizado CREATE TABLE de `tbbeneficio` (sem campo `codigo`)
- ✅ Atualizado INSERT de seeds (sem campo `codigo`)
- ✅ Atualizado índices (removido `idx_beneficio_codigo`, adicionado `idx_beneficio_titulo`)
- ✅ Atualizada tabela de impactos
- ✅ Atualizado checklist de implementação

**v5.0 (03/12/2024) - BREAKING CHANGE** 🚨
- ✅ **REMOVIDA tabela `tbvoucher_beneficio`** (não mais necessária)
- ✅ **Mudança de arquitetura**: N:N → 1:1 (cada voucher tem apenas 1 benefício)
- ✅ **Adicionados campos em `tbvoucher`**:
  - `beneficio_id INT4` (FK para tbbeneficio - mudou de UUID para INT4)
  - `beneficio_titulo VARCHAR(100)` (desnormalizado)
  - `beneficio_descricao TEXT` (desnormalizado)
- ✅ **Mudança em `tbbeneficio`**:
  - `beneficio_id` mudou de `UUID` para `INT4 GENERATED ALWAYS AS IDENTITY`
  - Campo `valor_maximo` **REMOVIDO** (controle em nível de aplicação)
- ✅ **Lógica de criação**: Loop para gerar múltiplos vouchers (1 por benefício)
- ✅ **Atualizada função `validar_voucher_por_uuid()`**: Retorna 1 benefício (não array)
- ✅ **Removida função `calcular_valor_voucher()`**: Valor já está em `tbvoucher.valor`
- ✅ Atualizado diagrama de relacionamentos
- ✅ Atualizado mapeamento de campos
- ✅ Atualizado exemplo de criação de voucher (loop)
- ✅ Atualizado exemplo de validação de voucher
- ✅ Atualizado checklist de implementação
- ✅ Atualizada tabela de impactos
- ✅ Adicionados índices para `beneficio_id`
- ✅ Atualizado seeds (removido valor_maximo, ajustado valores NULL)

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