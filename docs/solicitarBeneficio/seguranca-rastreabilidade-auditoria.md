# 🔒 Segurança, Rastreabilidade e Auditoria - Sistema de Vouchers

## 📋 Índice

- [1. Contexto e Objetivo](#1-contexto-e-objetivo)
- [2. Análise Crítica da Situação Atual](#2-análise-crítica-da-situação-atual)
- [3. Gaps Críticos Identificados](#3-gaps-críticos-identificados)
- [4. Arquitetura de Solução](#4-arquitetura-de-solução)
- [5. Implementação Técnica](#5-implementação-técnica)
- [6. Schema do Banco de Dados](#6-schema-do-banco-de-dados)
- [7. Conformidade LGPD](#7-conformidade-lgpd)
- [8. Queries de Auditoria](#8-queries-de-auditoria)
- [9. Casos de Uso e Cenários](#9-casos-de-uso-e-cenários)
- [10. Roadmap de Implementação](#10-roadmap-de-implementação)
- [11. Checklist de Segurança](#11-checklist-de-segurança)

---

## 1. Contexto e Objetivo

### 1.1. Visão Geral

Este documento apresenta uma **análise crítica de segurança** do sistema de emissão de vouchers desenvolvido no componente `SolicitarBeneficio.tsx`, identificando gaps críticos de rastreabilidade e propondo soluções técnicas completas.

### 1.2. Criticidade do Sistema

O sistema lida com:
- 💰 **Valores financeiros** dos colaboradores
- 🎫 **Vouchers resgatáveis** em estabelecimentos parceiros
- 📊 **Dados pessoais sensíveis** (CPF, email, matrícula)
- ⚖️ **Responsabilidade legal** em caso de fraudes ou disputas

### 1.3. Motivação da Análise

> **Pergunta do stakeholder:**
> "Temos um campo para salvar a plataforma pela qual a aplicação foi acessada (desktop, tablet, celular)? E temos como capturar o IP da conexão? Pensando na criticidade de lidar com dinheiro de colaboradores, a aplicação tem que ser segura."

**Resposta direta:** ❌ **NÃO**, o sistema atual não possui nenhum mecanismo de rastreabilidade de origem das transações.

---

## 2. Análise Crítica da Situação Atual

### 2.1. Estado Atual do Código

**Arquivo analisado:** [`src/pages/SolicitarBeneficio.tsx`](../../src/pages/SolicitarBeneficio.tsx)

#### ✅ O que o sistema CAPTURA atualmente:

```typescript
const voucherDataToSave: VoucherEmitido = {
  id: voucherNumber,              // ✅ Número do voucher
  funcionario: colaborador.nome,   // ✅ Nome do colaborador
  cpf: colaborador.cpf,            // ✅ CPF do colaborador
  valor: valorBeneficio,           // ✅ Valor do voucher
  dataValidade: dataValidade,      // ✅ Data de validade
  beneficios: [beneficio.title],   // ✅ Benefício selecionado
  status: 'emitido',               // ✅ Status do voucher
};
```

#### ❌ O que o sistema NÃO CAPTURA:

```typescript
// ❌ AUSENTE - Nenhum dado de contexto técnico
{
  // Origem da requisição
  ip_address: undefined,           // ❌ IP do cliente
  ip_forwarded: undefined,         // ❌ IPs intermediários (proxy/load balancer)

  // Dispositivo
  device_type: undefined,          // ❌ desktop | tablet | mobile
  device_model: undefined,         // ❌ iPhone 15, Galaxy S23, etc.
  device_fingerprint: undefined,   // ❌ Hash único do dispositivo

  // Navegador
  user_agent: undefined,           // ❌ String completa do navegador
  browser: undefined,              // ❌ Chrome, Firefox, Safari, Edge
  browser_version: undefined,      // ❌ 120.0.6099.109

  // Sistema Operacional
  os: undefined,                   // ❌ Windows, macOS, Linux, Android, iOS
  os_version: undefined,           // ❌ Windows 11, iOS 17.2, etc.

  // Tela e Viewport
  screen_resolution: undefined,    // ❌ 1920x1080, 390x844, etc.
  viewport_size: undefined,        // ❌ Tamanho da janela do navegador
  pixel_ratio: undefined,          // ❌ Densidade de pixels (Retina, etc.)

  // Localização e Idioma
  timezone: undefined,             // ❌ America/Sao_Paulo
  language: undefined,             // ❌ pt-BR, en-US
  geolocation: undefined,          // ❌ Lat/Long (se autorizado)

  // Sessão
  session_id: undefined,           // ❌ ID da sessão do usuário
  session_duration: undefined,     // ❌ Tempo na página

  // Rede
  connection_type: undefined,      // ❌ 4g, wifi, ethernet

  // Timestamps detalhados
  timestamp_client: undefined,     // ❌ Timestamp do cliente
  timestamp_server: undefined,     // ❌ Timestamp do servidor
}
```

### 2.2. Estado Atual do Banco de Dados

**Arquivo analisado:** [`docs/solicitarBeneficio/database-schema.md`](./database-schema.md)

#### ✅ Campos de auditoria existentes na `tbvoucher`:

```sql
-- Auditoria básica
created_at TIMESTAMP,        -- ✅ Data/hora de criação
created_by INTEGER,          -- ✅ ID do usuário que criou
created_nome TEXT,           -- ✅ Nome do usuário que criou

updated_at TIMESTAMP,        -- ✅ Data/hora de atualização
updated_by INTEGER,          -- ✅ ID do usuário que atualizou
updated_nome TEXT,           -- ✅ Nome do usuário que atualizou

deleted_at TIMESTAMP,        -- ✅ Data/hora de deleção (soft delete)
deleted_by INTEGER,          -- ✅ ID do usuário que deletou
deleted_nome TEXT,           -- ✅ Nome do usuário que deletou

deletado CHAR(1),            -- ✅ Flag de soft delete (N/S)
```

#### ❌ Campos de rastreabilidade AUSENTES:

```sql
-- ❌ AUSENTE - Nenhum campo para metadados técnicos
created_ip_address TEXT,              -- ❌ IP de origem
created_device_type TEXT,             -- ❌ Tipo de dispositivo
created_user_agent TEXT,              -- ❌ User agent completo
created_browser TEXT,                 -- ❌ Navegador
created_os TEXT,                      -- ❌ Sistema operacional
created_geolocation JSONB,            -- ❌ Localização geográfica
metadata_emissao JSONB,               -- ❌ Metadados completos (RECOMENDADO)
```

---

## 3. Gaps Críticos Identificados

### 3.1. Gap #1: Zero Rastreabilidade de Origem 🔴 CRÍTICO

**Problema:**
Não há NENHUM mecanismo para identificar de onde um voucher foi emitido.

**Impacto:**
- ❌ Impossível rastrear a origem de fraudes
- ❌ Impossível detectar padrões suspeitos de acesso
- ❌ Impossível correlacionar múltiplas emissões do mesmo dispositivo/IP
- ❌ Sem evidências em caso de disputa judicial ou auditoria fiscal

**Cenários de risco:**

#### Cenário 1: Fraude Interna
```
Situação: Um funcionário mal-intencionado emite 50 vouchers fraudulentos
         do mesmo computador em 30 minutos.

Investigação atual:
- ✅ Sabemos QUEM emitiu (created_by)
- ✅ Sabemos QUANDO emitiu (created_at)
- ❌ NÃO sabemos DE ONDE emitiu (IP?)
- ❌ NÃO sabemos QUAL dispositivo usou (device?)
- ❌ NÃO conseguimos provar que foi do mesmo computador

Resultado: Evidências insuficientes para processo trabalhista.
```

#### Cenário 2: Acesso Não Autorizado
```
Situação: Credenciais de um gerente RH são roubadas. Criminoso acessa
         remotamente e emite vouchers para laranjas.

Investigação atual:
- ✅ Sabemos QUEM estava logado (created_by = gerente)
- ✅ Sabemos QUANDO aconteceu (created_at)
- ❌ NÃO sabemos se o IP é compatível com o gerente real
- ❌ NÃO sabemos se o dispositivo era o habitual
- ❌ NÃO conseguimos distinguir acesso legítimo de invasão

Resultado: Empresa pode ser responsabilizada por não detectar acesso suspeito.
```

#### Cenário 3: Auditoria Fiscal
```
Situação: Receita Federal questiona a legitimidade de R$ 500.000 em
         vouchers emitidos no último ano.

Documentação atual:
- ✅ Temos lista de vouchers e valores
- ✅ Temos data/hora e responsável
- ❌ NÃO temos prova de onde foram emitidos
- ❌ NÃO temos rastro técnico completo
- ❌ NÃO conseguimos demonstrar controles adequados

Resultado: Multa por controles internos inadequados.
```

### 3.2. Gap #2: Impossibilidade de Detecção de Padrões 🔴 CRÍTICO

**Problema:**
Sem dados de contexto técnico, é impossível criar sistemas de detecção de anomalias.

**Exemplos de padrões que NÃO PODEM ser detectados:**

| Padrão Suspeito | Por que não detectamos | Impacto |
|---|---|---|
| **50 vouchers do mesmo IP em 1 hora** | ❌ Não capturamos IP | Fraude automatizada passa despercebida |
| **Acesso de outro país** | ❌ Não capturamos IP/geolocation | Invasão não é detectada |
| **Alternância rápida mobile/desktop** | ❌ Não capturamos device_type | Conta compartilhada não é identificada |
| **Emissões fora do horário comercial** | ✅ Detectável (created_at) | ⚠️ Parcialmente detectável |
| **Mesmo dispositivo, múltiplos usuários** | ❌ Não temos device fingerprint | Fraude colaborativa não detectável |
| **Bot fazendo scraping** | ❌ Não validamos user agent | Sistema vulnerável a automação maliciosa |

### 3.3. Gap #3: Conformidade e Compliance 🟡 IMPORTANTE

**Problema:**
Sistema financeiro sem rastreabilidade adequada pode violar regulamentações.

**Frameworks afetados:**

#### ISO 27001 (Segurança da Informação)
- ❌ **A.12.4.1** - Registro de eventos: Incompleto (falta contexto técnico)
- ❌ **A.12.4.3** - Logs do administrador: Sem rastro de IP/dispositivo
- ❌ **A.9.4.3** - Sistema de gestão de acesso: Sem validação de origem

#### LGPD (Lei Geral de Proteção de Dados)
- ⚠️ **Art. 46** - Logs de acesso incompletos (falta IP para investigação de vazamentos)
- ⚠️ **Art. 48** - Dificuldade em notificar incidentes sem saber origem

#### SOX (Sarbanes-Oxley) - Se aplicável
- ❌ **Seção 404** - Controles internos inadequados para transações financeiras

### 3.4. Gap #4: Vulnerabilidade a Ataques 🔴 CRÍTICO

**Vetores de ataque não mitigados:**

#### 4.1. Credential Stuffing
```
Ataque: Criminoso testa 10.000 senhas vazadas em seu sistema.
Defesa atual: ❌ NENHUMA detecção baseada em IP/rate limiting
Resultado: Contas comprometidas sem alerta
```

#### 4.2. Account Takeover
```
Ataque: Após phishing, invasor acessa conta legítima.
Defesa atual: ❌ NENHUM alerta de mudança de IP/dispositivo
Resultado: Acesso não autorizado passa como legítimo
```

#### 4.3. Insider Threat
```
Ataque: Funcionário do RH emite vouchers fraudulentos para si mesmo.
Defesa atual: ⚠️ PARCIAL - Sabemos quem, mas não de onde
Resultado: Difícil provar intenção maliciosa
```

#### 4.4. Automated Fraud (Bots)
```
Ataque: Bot automatizado tenta gerar múltiplos vouchers.
Defesa atual: ❌ NENHUMA validação de user agent legítimo
Resultado: Sistema vulnerável a automação maliciosa
```

---

## 4. Arquitetura de Solução

### 4.1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Formulário de Solicitação de Voucher                      │ │
│  │  - Seleção de benefícios                                   │ │
│  │  - Justificativa e urgência                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Utilitário: captureSessionContext()                       │ │
│  │  - navigator.userAgent                                     │ │
│  │  - window.screen.*                                         │ │
│  │  - navigator.platform                                      │ │
│  │  - Intl.DateTimeFormat()                                   │ │
│  │  - getDeviceType() helper                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│         Payload com contexto técnico (JSON)                      │
└─────────────────────────────────────────────────────────────────┘
                               ↓ HTTP POST
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js/API)                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Middleware: captureRequestMetadata()                      │ │
│  │  - req.socket.remoteAddress (IP real)                      │ │
│  │  - req.headers['x-forwarded-for'] (proxy/CDN)             │ │
│  │  - req.headers['x-real-ip']                               │ │
│  │  - req.headers['user-agent'] (validação)                  │ │
│  │  - Date.now() (timestamp servidor)                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Função: enrichVoucherMetadata()                           │ │
│  │  - Merge dados cliente + dados servidor                    │ │
│  │  - Validação de coerência (user-agent match?)             │ │
│  │  - Enriquecimento (GeoIP lookup)                          │ │
│  │  - Sanitização de dados                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│         Voucher + metadata_emissao (JSONB)                       │
└─────────────────────────────────────────────────────────────────┘
                               ↓ SQL INSERT
┌─────────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS (Supabase)                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Tabela: tbvoucher                                         │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ voucher_id: UUID                                     │ │ │
│  │  │ funcionario: "João Silva"                            │ │ │
│  │  │ valor: 125.00                                        │ │ │
│  │  │ created_at: 2025-12-03 14:30:00                      │ │ │
│  │  │ created_by: 42                                       │ │ │
│  │  │ created_nome: "Maria Santos (RH)"                    │ │ │
│  │  │                                                       │ │ │
│  │  │ metadata_emissao: {                                  │ │ │
│  │  │   "ip_address": "177.55.142.23",                     │ │ │
│  │  │   "device_type": "desktop",                          │ │ │
│  │  │   "user_agent": "Mozilla/5.0...",                    │ │ │
│  │  │   "os": "Windows",                                   │ │ │
│  │  │   "browser": {                                       │ │ │
│  │  │     "name": "Chrome",                                │ │ │
│  │  │     "version": "120.0.6099.109"                      │ │ │
│  │  │   },                                                 │ │ │
│  │  │   "screen_resolution": "1920x1080",                  │ │ │
│  │  │   "timezone": "America/Sao_Paulo",                   │ │ │
│  │  │   "timestamp_client": "2025-12-03T14:29:58.234Z",    │ │ │
│  │  │   "timestamp_server": "2025-12-03T14:30:00.123Z"     │ │ │
│  │  │ }                                                    │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  │  Índices GIN para consultas eficientes:                    │ │
│  │  - idx_tbvoucher_metadata_ip                               │ │
│  │  - idx_tbvoucher_metadata_device                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2. Fluxo de Dados Detalhado

```
┌─────────────────────────────────────────────────────────────────┐
│ ETAPA 1: Captura no Cliente                                     │
├─────────────────────────────────────────────────────────────────┤
│ Quando: Ao clicar em "Confirmar Solicitação"                    │
│                                                                  │
│ const handleConfirmSolicitation = async () => {                 │
│   // 1. Captura contexto técnico do navegador                   │
│   const sessionContext = captureSessionContext();               │
│                                                                  │
│   // 2. Prepara payload completo                                │
│   const payload = {                                             │
│     voucherData: { ... },      // Dados do voucher              │
│     formData: { ... },         // Justificativa, urgência       │
│     sessionContext             // NOVO: Contexto técnico        │
│   };                                                            │
│                                                                  │
│   // 3. Envia para backend                                      │
│   await fetch('/api/send-voucher-email', {                      │
│     method: 'POST',                                             │
│     headers: { 'Content-Type': 'application/json' },            │
│     body: JSON.stringify(payload)                               │
│   });                                                           │
│ };                                                              │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│ ETAPA 2: Enriquecimento no Servidor                             │
├─────────────────────────────────────────────────────────────────┤
│ Quando: Requisição chega no backend                             │
│                                                                  │
│ app.post('/api/send-voucher-email', async (req, res) => {       │
│   // 1. Captura metadados do servidor (IP real)                 │
│   const serverMetadata = captureRequestMetadata(req);           │
│                                                                  │
│   // 2. Merge: dados cliente + dados servidor                   │
│   const enrichedMetadata = {                                    │
│     ...req.body.sessionContext,  // Do cliente                  │
│     ...serverMetadata,            // Do servidor                │
│     enrichment: await enrichWithGeoIP(serverMetadata.ip)        │
│   };                                                            │
│                                                                  │
│   // 3. Validação de coerência                                  │
│   validateMetadataConsistency(enrichedMetadata);                │
│                                                                  │
│   // 4. Salva no banco                                          │
│   await saveVoucherToDatabase({                                 │
│     ...req.body.voucherData,                                    │
│     metadata_emissao: enrichedMetadata                          │
│   });                                                           │
│ });                                                             │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│ ETAPA 3: Persistência no Banco                                  │
├─────────────────────────────────────────────────────────────────┤
│ Quando: INSERT na tabela tbvoucher                              │
│                                                                  │
│ INSERT INTO tbvoucher (                                         │
│   voucher_id,                                                   │
│   funcionario,                                                  │
│   valor,                                                        │
│   metadata_emissao,  -- NOVO: Campo JSONB                       │
│   created_at,                                                   │
│   created_by,                                                   │
│   created_nome                                                  │
│ ) VALUES (                                                      │
│   gen_random_uuid(),                                            │
│   'João Silva',                                                 │
│   125.00,                                                       │
│   '{"ip_address": "177.55.142.23", ...}'::jsonb,                │
│   NOW(),                                                        │
│   42,                                                           │
│   'Maria Santos'                                                │
│ );                                                              │
│                                                                  │
│ → Trigger de auditoria registra operação                        │
│ → Índices GIN permitem busca eficiente                          │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│ ETAPA 4: Análise e Auditoria                                    │
├─────────────────────────────────────────────────────────────────┤
│ Quando: Dashboard de auditoria ou investigação                  │
│                                                                  │
│ -- Consulta vouchers do mesmo IP                                │
│ SELECT * FROM tbvoucher                                         │
│ WHERE metadata_emissao->>'ip_address' = '177.55.142.23';        │
│                                                                  │
│ -- Detecta padrão suspeito                                      │
│ SELECT                                                          │
│   metadata_emissao->>'ip_address' as ip,                        │
│   COUNT(*) as total_vouchers                                    │
│ FROM tbvoucher                                                  │
│ WHERE created_at >= NOW() - INTERVAL '1 hour'                   │
│ GROUP BY metadata_emissao->>'ip_address'                        │
│ HAVING COUNT(*) > 10;  -- Mais de 10 em 1 hora = suspeito      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Implementação Técnica

### 5.1. Frontend - Captura de Contexto

#### 5.1.1. Criar Utilitário de Captura

**Arquivo:** `src/utils/sessionContext.ts`

```typescript
/**
 * ============================================================================
 * UTILITÁRIO DE CAPTURA DE CONTEXTO DE SESSÃO
 * ============================================================================
 *
 * Captura informações técnicas do navegador/dispositivo do usuário
 * para fins de auditoria e segurança.
 *
 * ⚠️ IMPORTANTE:
 * - Dados capturados são sensíveis (LGPD)
 * - Devem ser mencionados na Política de Privacidade
 * - Usados apenas para segurança e auditoria
 *
 * @module sessionContext
 */

/**
 * Interface para o contexto de sessão capturado
 */
export interface SessionContext {
  // Dispositivo
  device_type: 'desktop' | 'tablet' | 'mobile';
  platform: string;

  // Navegador
  user_agent: string;
  browser: {
    name: string;
    version: string;
  };

  // Sistema Operacional
  os: string;

  // Tela
  screen_resolution: string;
  viewport_size: string;
  pixel_ratio: number;
  color_depth: number;

  // Localização e Idioma
  timezone: string;
  language: string;
  languages: readonly string[];

  // Rede e Capacidades
  online: boolean;
  cookies_enabled: boolean;
  do_not_track: string | null;

  // Timestamp
  timestamp_client: string;

  // Hardware (se disponível)
  hardware_concurrency?: number;
  device_memory?: number;

  // Conexão (experimental)
  connection?: {
    type?: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
}

/**
 * Detecta o tipo de dispositivo com base no User Agent
 * @returns 'desktop' | 'tablet' | 'mobile'
 */
export const getDeviceType = (): 'desktop' | 'tablet' | 'mobile' => {
  const ua = navigator.userAgent.toLowerCase();

  // Tablets (incluindo iPads)
  if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua)) {
    return 'tablet';
  }

  // Mobile (smartphones)
  if (/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds|archos|skyfire|puffin|blazer|bolt|gobrowser|iris|maemo|semc|teashark|uzard)/.test(ua)) {
    return 'mobile';
  }

  // Desktop (padrão)
  return 'desktop';
};

/**
 * Detecta o sistema operacional
 * @returns Nome do sistema operacional
 */
export const getOperatingSystem = (): string => {
  const ua = navigator.userAgent;
  const platform = navigator.platform;

  // Windows
  if (ua.includes('Win')) {
    if (ua.includes('Windows NT 10.0')) return 'Windows 10/11';
    if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
    if (ua.includes('Windows NT 6.2')) return 'Windows 8';
    if (ua.includes('Windows NT 6.1')) return 'Windows 7';
    return 'Windows';
  }

  // macOS
  if (ua.includes('Mac') || platform.includes('Mac')) {
    const match = ua.match(/Mac OS X (\d+)[._](\d+)/);
    if (match) {
      return `macOS ${match[1]}.${match[2]}`;
    }
    return 'macOS';
  }

  // Linux
  if (ua.includes('Linux') || platform.includes('Linux')) {
    if (ua.includes('Ubuntu')) return 'Ubuntu Linux';
    if (ua.includes('Fedora')) return 'Fedora Linux';
    return 'Linux';
  }

  // Android
  if (ua.includes('Android')) {
    const match = ua.match(/Android (\d+\.?\d*)/);
    if (match) {
      return `Android ${match[1]}`;
    }
    return 'Android';
  }

  // iOS
  if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) {
    const match = ua.match(/OS (\d+)_(\d+)/);
    if (match) {
      return `iOS ${match[1]}.${match[2]}`;
    }
    return 'iOS';
  }

  return 'Unknown OS';
};

/**
 * Detecta informações do navegador
 * @returns { name, version }
 */
export const getBrowserInfo = (): { name: string; version: string } => {
  const ua = navigator.userAgent;

  // Edge (Chromium)
  if (ua.includes('Edg/')) {
    const match = ua.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/);
    return {
      name: 'Edge',
      version: match ? match[1] : 'Unknown'
    };
  }

  // Chrome
  if (ua.includes('Chrome/') && !ua.includes('Edg')) {
    const match = ua.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
    return {
      name: 'Chrome',
      version: match ? match[1] : 'Unknown'
    };
  }

  // Firefox
  if (ua.includes('Firefox/')) {
    const match = ua.match(/Firefox\/(\d+\.\d+)/);
    return {
      name: 'Firefox',
      version: match ? match[1] : 'Unknown'
    };
  }

  // Safari (não Chrome/Edge)
  if (ua.includes('Safari/') && !ua.includes('Chrome') && !ua.includes('Edg')) {
    const match = ua.match(/Version\/(\d+\.\d+)/);
    return {
      name: 'Safari',
      version: match ? match[1] : 'Unknown'
    };
  }

  // Opera
  if (ua.includes('OPR/') || ua.includes('Opera/')) {
    const match = ua.match(/(?:OPR|Opera)\/(\d+\.\d+)/);
    return {
      name: 'Opera',
      version: match ? match[1] : 'Unknown'
    };
  }

  // Internet Explorer (legado)
  if (ua.includes('Trident/') || ua.includes('MSIE')) {
    const match = ua.match(/(?:MSIE |rv:)(\d+\.\d+)/);
    return {
      name: 'Internet Explorer',
      version: match ? match[1] : 'Unknown'
    };
  }

  return {
    name: 'Unknown Browser',
    version: 'Unknown'
  };
};

/**
 * Captura informações de conexão (se disponível)
 * @returns Informações de conexão ou undefined
 */
const getConnectionInfo = () => {
  // @ts-ignore - API experimental
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (!connection) return undefined;

  return {
    type: connection.type,
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData
  };
};

/**
 * ============================================================================
 * FUNÇÃO PRINCIPAL: Captura contexto completo da sessão
 * ============================================================================
 *
 * Coleta todas as informações técnicas disponíveis do navegador/dispositivo.
 *
 * @returns {SessionContext} Objeto com todas as informações capturadas
 *
 * @example
 * const context = captureSessionContext();
 * console.log(context);
 * // {
 * //   device_type: 'desktop',
 * //   browser: { name: 'Chrome', version: '120.0.6099.109' },
 * //   os: 'Windows 10/11',
 * //   screen_resolution: '1920x1080',
 * //   timezone: 'America/Sao_Paulo',
 * //   ...
 * // }
 */
export const captureSessionContext = (): SessionContext => {
  const browserInfo = getBrowserInfo();

  const context: SessionContext = {
    // Dispositivo
    device_type: getDeviceType(),
    platform: navigator.platform,

    // Navegador
    user_agent: navigator.userAgent,
    browser: browserInfo,

    // Sistema Operacional
    os: getOperatingSystem(),

    // Tela
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    pixel_ratio: window.devicePixelRatio || 1,
    color_depth: window.screen.colorDepth,

    // Localização e Idioma
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    languages: navigator.languages,

    // Rede e Capacidades
    online: navigator.onLine,
    cookies_enabled: navigator.cookieEnabled,
    do_not_track: navigator.doNotTrack,

    // Timestamp
    timestamp_client: new Date().toISOString(),
  };

  // Hardware (se disponível)
  if ('hardwareConcurrency' in navigator) {
    context.hardware_concurrency = navigator.hardwareConcurrency;
  }

  // @ts-ignore - Propriedade experimental
  if ('deviceMemory' in navigator) {
    // @ts-ignore
    context.device_memory = navigator.deviceMemory;
  }

  // Conexão (se disponível)
  const connectionInfo = getConnectionInfo();
  if (connectionInfo) {
    context.connection = connectionInfo;
  }

  return context;
};

/**
 * ============================================================================
 * FUNÇÃO AUXILIAR: Formata contexto para exibição
 * ============================================================================
 */
export const formatSessionContext = (context: SessionContext): string => {
  return `
Dispositivo: ${context.device_type} (${context.platform})
Sistema: ${context.os}
Navegador: ${context.browser.name} ${context.browser.version}
Resolução: ${context.screen_resolution}
Fuso Horário: ${context.timezone}
Idioma: ${context.language}
Online: ${context.online ? 'Sim' : 'Não'}
Timestamp: ${context.timestamp_client}
  `.trim();
};

/**
 * ============================================================================
 * FUNÇÃO DE DEBUG: Log do contexto (remover em produção)
 * ============================================================================
 */
export const logSessionContext = (): void => {
  const context = captureSessionContext();
  console.group('📊 Session Context');
  console.log('🖥️  Device:', context.device_type);
  console.log('🌐 Browser:', `${context.browser.name} ${context.browser.version}`);
  console.log('💻 OS:', context.os);
  console.log('📱 Screen:', context.screen_resolution);
  console.log('🌍 Timezone:', context.timezone);
  console.log('🗣️  Language:', context.language);
  console.log('📡 Online:', context.online);
  console.log('🍪 Cookies:', context.cookies_enabled);
  console.log('⏰ Timestamp:', context.timestamp_client);
  if (context.connection) {
    console.log('📶 Connection:', context.connection.effectiveType);
  }
  console.groupEnd();
};
```

#### 5.1.2. Integrar no Componente SolicitarBeneficio

**Arquivo:** `src/pages/SolicitarBeneficio.tsx`

Modificar a função `handleConfirmSolicitation`:

```typescript
import { captureSessionContext, type SessionContext } from "@/utils/sessionContext";

const handleConfirmSolicitation = async () => {
  console.log('🚀 Iniciando handleConfirmSolicitation...');

  // ===================================================================
  // NOVO: Captura contexto técnico da sessão
  // ===================================================================
  const sessionContext = captureSessionContext();
  console.log('📊 Contexto de sessão capturado:', sessionContext);

  // Validações existentes...
  if (!colaborador) {
    // ...
  }

  // ... resto do código existente ...

  try {
    for (let index = 0; index < selectedBeneficios.length; index++) {
      // ... código existente ...

      // -----------------------------------------------------------------
      // MODIFICADO: Enviar contexto junto com o voucher
      // -----------------------------------------------------------------
      console.log(`  📧 Enviando e-mail para voucher: ${voucherNumber}...`);

      try {
        const response = await fetch('http://localhost:3001/api/send-voucher-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            destinatario: colaborador.email,
            nomeDestinatario: colaborador.nome,
            voucherNumber,
            beneficios: [beneficioFormatado],
            pdfBase64,
            formData,

            // ✅ NOVO: Adiciona contexto de sessão ao payload
            sessionContext: sessionContext
          }),
        });

        // ... resto do código de tratamento de resposta ...
      } catch (emailError) {
        // ...
      }
    }
  } catch (error) {
    // ...
  }
};
```

### 5.2. Backend - Captura de IP e Enriquecimento

#### 5.2.1. Middleware de Captura de Metadados

**Arquivo:** `backend/src/middleware/captureMetadata.ts` (ou similar)

```typescript
import { Request } from 'express';

/**
 * ============================================================================
 * INTERFACE: Metadados do Servidor
 * ============================================================================
 */
export interface ServerMetadata {
  // IP e Origem
  ip_address: string | null;
  ip_forwarded_for: string | null;
  ip_real: string | null;

  // Headers HTTP
  user_agent_header: string | null;
  referer: string | null;
  origin: string | null;

  // Timestamps
  timestamp_server: string;

  // Request Info
  method: string;
  path: string;
  protocol: string;
}

/**
 * ============================================================================
 * FUNÇÃO: Captura metadados da requisição HTTP
 * ============================================================================
 *
 * Extrai informações importantes da requisição, incluindo o IP REAL do cliente.
 *
 * ⚠️ IMPORTANTE:
 * - O IP capturado aqui é o ÚNICO confiável (não pode ser falsificado pelo cliente)
 * - Considera proxies reversos (Nginx, CloudFlare, etc.)
 *
 * @param req - Objeto Request do Express
 * @returns {ServerMetadata} Metadados capturados
 */
export const captureRequestMetadata = (req: Request): ServerMetadata => {
  // ===================================================================
  // CAPTURA DE IP: Considera múltiplas fontes
  // ===================================================================

  // 1. X-Forwarded-For: Lista de IPs (cliente original, proxies intermediários)
  //    Formato: "177.55.142.23, 172.16.0.1, 10.0.0.1"
  const forwardedFor = req.headers['x-forwarded-for'];
  const forwardedForIP = typeof forwardedFor === 'string'
    ? forwardedFor.split(',')[0].trim()
    : null;

  // 2. X-Real-IP: IP real do cliente (usado por alguns proxies)
  const realIP = req.headers['x-real-ip'] as string | undefined;

  // 3. req.socket.remoteAddress: IP da conexão direta
  //    Pode ser do proxy se houver um
  const socketIP = req.socket.remoteAddress;

  // 4. Lógica de decisão: Qual IP usar?
  //    Prioridade: X-Forwarded-For (primeiro) > X-Real-IP > socket.remoteAddress
  const clientIP = forwardedForIP || realIP || socketIP || null;

  // ===================================================================
  // CAPTURA DE OUTROS METADADOS
  // ===================================================================

  return {
    // IP e Origem
    ip_address: clientIP,
    ip_forwarded_for: typeof forwardedFor === 'string' ? forwardedFor : null,
    ip_real: realIP || null,

    // Headers HTTP
    user_agent_header: req.headers['user-agent'] || null,
    referer: req.headers['referer'] || req.headers['referrer'] || null,
    origin: req.headers['origin'] || null,

    // Timestamps
    timestamp_server: new Date().toISOString(),

    // Request Info
    method: req.method,
    path: req.path,
    protocol: req.protocol,
  };
};

/**
 * ============================================================================
 * FUNÇÃO: Valida coerência entre dados cliente e servidor
 * ============================================================================
 *
 * Verifica se os dados enviados pelo cliente são coerentes com os capturados
 * no servidor.
 *
 * @param clientContext - Contexto capturado no cliente
 * @param serverMetadata - Metadados capturados no servidor
 * @returns {boolean} True se coerente, false se suspeito
 */
export const validateMetadataConsistency = (
  clientContext: any,
  serverMetadata: ServerMetadata
): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  // 1. User Agent: Cliente e servidor devem reportar o mesmo
  if (clientContext.user_agent !== serverMetadata.user_agent_header) {
    warnings.push('User-Agent divergente entre cliente e servidor');
  }

  // 2. Timestamp: Diferença não deve ser maior que 5 minutos
  const clientTime = new Date(clientContext.timestamp_client).getTime();
  const serverTime = new Date(serverMetadata.timestamp_server).getTime();
  const diffMinutes = Math.abs(serverTime - clientTime) / 1000 / 60;

  if (diffMinutes > 5) {
    warnings.push(`Diferença de tempo suspeita: ${diffMinutes.toFixed(1)} minutos`);
  }

  // 3. Online status: Se cliente reporta offline, algo está errado
  if (clientContext.online === false) {
    warnings.push('Cliente reporta estar offline, mas conseguiu fazer requisição');
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
};

/**
 * ============================================================================
 * FUNÇÃO: Enriquece metadados com informações adicionais
 * ============================================================================
 *
 * Adiciona informações derivadas, como geolocalização por IP.
 *
 * @param metadata - Metadados base
 * @returns Metadados enriquecidos
 */
export const enrichMetadata = async (metadata: ServerMetadata): Promise<any> => {
  const enriched = { ...metadata };

  // GeoIP Lookup (exemplo usando uma API fictícia)
  // Em produção, usar: MaxMind, IP2Location, ipapi.co, etc.
  if (metadata.ip_address && metadata.ip_address !== '::1' && !metadata.ip_address.startsWith('192.168.')) {
    try {
      // Exemplo: const geoData = await fetch(`https://ipapi.co/${metadata.ip_address}/json/`);
      // enriched.geolocation = await geoData.json();

      // Por enquanto, placeholder:
      enriched.geolocation = {
        // city: 'São Paulo',
        // region: 'SP',
        // country: 'BR',
        // latitude: -23.5505,
        // longitude: -46.6333
        note: 'GeoIP lookup não implementado (placeholder)'
      };
    } catch (error) {
      console.warn('Erro ao fazer GeoIP lookup:', error);
    }
  }

  return enriched;
};
```

#### 5.2.2. Integrar no Endpoint de Email

**Arquivo:** `backend/src/routes/sendVoucherEmail.ts` (ou similar)

```typescript
import express from 'express';
import { captureRequestMetadata, enrichMetadata, validateMetadataConsistency } from '../middleware/captureMetadata';
import { saveVoucherToDatabase } from '../services/voucherService';

const router = express.Router();

router.post('/send-voucher-email', async (req, res) => {
  console.log('📨 Recebida requisição de envio de voucher');

  try {
    // ===================================================================
    // ETAPA 1: Captura metadados do servidor (IP, headers, etc.)
    // ===================================================================
    const serverMetadata = captureRequestMetadata(req);
    console.log('🔍 Metadados do servidor capturados:', {
      ip: serverMetadata.ip_address,
      user_agent: serverMetadata.user_agent_header?.substring(0, 50) + '...'
    });

    // ===================================================================
    // ETAPA 2: Validação de coerência (cliente vs servidor)
    // ===================================================================
    const clientContext = req.body.sessionContext;

    if (!clientContext) {
      console.warn('⚠️ Requisição sem contexto de sessão do cliente');
    } else {
      const validation = validateMetadataConsistency(clientContext, serverMetadata);

      if (!validation.isValid) {
        console.warn('⚠️ Metadados com inconsistências:', validation.warnings);
        // Em produção, considere:
        // - Alertar equipe de segurança
        // - Bloquear requisição se muito suspeito
        // - Registrar em log de segurança
      }
    }

    // ===================================================================
    // ETAPA 3: Enriquecimento (GeoIP, etc.)
    // ===================================================================
    const enrichedServerMetadata = await enrichMetadata(serverMetadata);

    // ===================================================================
    // ETAPA 4: Merge: cliente + servidor = metadados completos
    // ===================================================================
    const metadata_emissao = {
      // Dados do cliente (navegador)
      ...clientContext,

      // Dados do servidor (IP real, validações)
      server: enrichedServerMetadata,

      // Validação
      validation: validateMetadataConsistency(clientContext, serverMetadata),

      // Timestamp final
      processed_at: new Date().toISOString()
    };

    console.log('✅ Metadados completos preparados');

    // ===================================================================
    // ETAPA 5: Salvar no banco de dados
    // ===================================================================
    const voucherData = {
      voucherNumber: req.body.voucherNumber,
      funcionario: req.body.nomeDestinatario,
      email: req.body.destinatario,
      valor: req.body.beneficios[0]?.value || 0,
      beneficio_id: req.body.beneficios[0]?.id,
      justificativa: req.body.formData?.justificativa,
      urgente: req.body.formData?.urgencia === 'urgente' || req.body.formData?.urgencia === 'alta',

      // ✅ NOVO: Metadados completos
      metadata_emissao: metadata_emissao,

      // Auditoria
      created_by: req.user?.id, // Assumindo autenticação
      created_nome: req.user?.nome,
    };

    await saveVoucherToDatabase(voucherData);
    console.log('💾 Voucher salvo no banco com metadados');

    // ===================================================================
    // ETAPA 6: Enviar email (código existente)
    // ===================================================================
    // ... lógica de envio de email ...

    res.json({
      success: true,
      message: 'Voucher criado e email enviado com sucesso',
      voucherNumber: req.body.voucherNumber
    });

  } catch (error) {
    console.error('❌ Erro ao processar voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar voucher',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

export default router;
```

### 5.3. Serviço de Banco de Dados

**Arquivo:** `backend/src/services/voucherService.ts`

```typescript
import { supabase } from '../config/supabase'; // ou seu cliente de DB

/**
 * ============================================================================
 * INTERFACE: Dados do Voucher para INSERT
 * ============================================================================
 */
export interface VoucherInsertData {
  voucherNumber: string;
  funcionario: string;
  email: string;
  matricula?: string;
  valor: number;
  beneficio_id: number;
  justificativa?: string;
  urgente: boolean;
  metadata_emissao: any; // JSONB
  created_by?: number;
  created_nome: string;
}

/**
 * ============================================================================
 * FUNÇÃO: Salvar voucher no banco de dados
 * ============================================================================
 */
export const saveVoucherToDatabase = async (data: VoucherInsertData): Promise<any> => {
  console.log('💾 Salvando voucher no banco de dados...');

  try {
    const { data: result, error } = await supabase
      .from('tbvoucher')
      .insert({
        // Identificação (UUID gerado automaticamente pelo banco)

        // Dados do funcionário
        funcionario: data.funcionario,
        email: data.email,
        matricula: data.matricula,

        // Benefício
        beneficio_id: data.beneficio_id,

        // Valor
        valor: data.valor,

        // Datas
        data_emissao: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        data_validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 dias

        // Detalhes
        justificativa: data.justificativa,
        urgente: data.urgente,

        // Status
        status: 'emitido',

        // Soft delete
        deletado: 'N',

        // ✅ NOVO: Metadados de emissão
        metadata_emissao: data.metadata_emissao,

        // Auditoria
        created_by: data.created_by,
        created_nome: data.created_nome,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao inserir voucher:', error);
      throw error;
    }

    console.log('✅ Voucher salvo com sucesso:', result.voucher_id);
    return result;

  } catch (error) {
    console.error('❌ Erro na função saveVoucherToDatabase:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * FUNÇÃO: Buscar vouchers por IP (auditoria)
 * ============================================================================
 */
export const getVouchersByIP = async (ipAddress: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('tbvoucher')
    .select('*')
    .eq('deletado', 'N')
    // JSONB query: metadata_emissao->>'ip_address'
    .filter('metadata_emissao->>ip_address', 'eq', ipAddress)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * ============================================================================
 * FUNÇÃO: Detectar padrões suspeitos (múltiplas emissões do mesmo IP)
 * ============================================================================
 */
export const detectSuspiciousPatterns = async (
  timeWindowMinutes: number = 60,
  threshold: number = 10
): Promise<any[]> => {
  const timeAgo = new Date(Date.now() - timeWindowMinutes * 60 * 1000).toISOString();

  // Query complexa: agrupar por IP e contar
  // Nota: Pode precisar de query SQL raw dependendo do ORM
  const { data, error } = await supabase.rpc('detect_suspicious_ips', {
    time_threshold: timeAgo,
    count_threshold: threshold
  });

  if (error) throw error;
  return data || [];
};
```

---

## 6. Schema do Banco de Dados

### 6.1. Alteração na Tabela `tbvoucher`

```sql
-- ============================================================================
-- ALTERAÇÃO: Adicionar campo de metadados de emissão
-- ============================================================================

ALTER TABLE tbvoucher
ADD COLUMN IF NOT EXISTS metadata_emissao JSONB;

-- Comentário explicativo
COMMENT ON COLUMN tbvoucher.metadata_emissao IS
'Metadados técnicos da emissão do voucher: IP, dispositivo, navegador, OS, geolocalização, etc.
Usado para auditoria, segurança e detecção de fraudes.
Estrutura JSONB para flexibilidade e extensibilidade.';

-- ============================================================================
-- ÍNDICES: Performance em consultas de auditoria
-- ============================================================================

-- Índice GIN para consultas em campos JSONB
CREATE INDEX IF NOT EXISTS idx_tbvoucher_metadata_gin
ON tbvoucher USING gin (metadata_emissao);

-- Índice específico para busca por IP
CREATE INDEX IF NOT EXISTS idx_tbvoucher_metadata_ip
ON tbvoucher USING gin ((metadata_emissao->'server'->'ip_address'));

-- Índice específico para busca por device_type
CREATE INDEX IF NOT EXISTS idx_tbvoucher_metadata_device
ON tbvoucher USING gin ((metadata_emissao->'device_type'));

-- Índice específico para busca por browser
CREATE INDEX IF NOT EXISTS idx_tbvoucher_metadata_browser
ON tbvoucher USING gin ((metadata_emissao->'browser'->'name'));

-- ============================================================================
-- COMENTÁRIOS: Documentar índices
-- ============================================================================

COMMENT ON INDEX idx_tbvoucher_metadata_gin IS
'Índice GIN para consultas eficientes em todo o campo JSONB metadata_emissao';

COMMENT ON INDEX idx_tbvoucher_metadata_ip IS
'Índice GIN para busca rápida por IP de origem (metadata_emissao->server->ip_address)';

COMMENT ON INDEX idx_tbvoucher_metadata_device IS
'Índice GIN para busca por tipo de dispositivo (desktop/tablet/mobile)';

COMMENT ON INDEX idx_tbvoucher_metadata_browser IS
'Índice GIN para busca por navegador utilizado';
```

### 6.2. Estrutura do Campo `metadata_emissao`

```json
{
  "// ===================================================================": "",
  "// DADOS DO CLIENTE (capturados no navegador)": "",
  "// ===================================================================": "",

  "device_type": "desktop",
  "platform": "Win32",

  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",

  "browser": {
    "name": "Chrome",
    "version": "120.0.6099.109"
  },

  "os": "Windows 10/11",

  "screen_resolution": "1920x1080",
  "viewport_size": "1440x900",
  "pixel_ratio": 1,
  "color_depth": 24,

  "timezone": "America/Sao_Paulo",
  "language": "pt-BR",
  "languages": ["pt-BR", "pt", "en-US", "en"],

  "online": true,
  "cookies_enabled": true,
  "do_not_track": null,

  "timestamp_client": "2025-12-03T14:29:58.234Z",

  "hardware_concurrency": 8,
  "device_memory": 8,

  "connection": {
    "type": "wifi",
    "effectiveType": "4g",
    "downlink": 10,
    "rtt": 50
  },

  "// ===================================================================": "",
  "// DADOS DO SERVIDOR (capturados no backend)": "",
  "// ===================================================================": "",

  "server": {
    "ip_address": "177.55.142.23",
    "ip_forwarded_for": "177.55.142.23, 172.16.0.1",
    "ip_real": "177.55.142.23",

    "user_agent_header": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
    "referer": "https://sicfar-rh.com/portalbeneficio",
    "origin": "https://sicfar-rh.com",

    "timestamp_server": "2025-12-03T14:30:00.123Z",

    "method": "POST",
    "path": "/api/send-voucher-email",
    "protocol": "https",

    "geolocation": {
      "city": "São Paulo",
      "region": "SP",
      "country": "BR",
      "latitude": -23.5505,
      "longitude": -46.6333,
      "isp": "Vivo S.A.",
      "timezone": "America/Sao_Paulo"
    }
  },

  "// ===================================================================": "",
  "// VALIDAÇÃO (coerência entre cliente e servidor)": "",
  "// ===================================================================": "",

  "validation": {
    "isValid": true,
    "warnings": []
  },

  "// ===================================================================": "",
  "// TIMESTAMP DE PROCESSAMENTO": "",
  "// ===================================================================": "",

  "processed_at": "2025-12-03T14:30:00.500Z"
}
```

### 6.3. Função SQL para Detecção de Padrões Suspeitos

```sql
-- ============================================================================
-- FUNÇÃO: Detectar IPs suspeitos (múltiplas emissões em curto período)
-- ============================================================================

CREATE OR REPLACE FUNCTION detect_suspicious_ips(
  time_threshold TIMESTAMPTZ,
  count_threshold INTEGER
)
RETURNS TABLE (
  ip_address TEXT,
  total_vouchers BIGINT,
  first_emission TIMESTAMPTZ,
  last_emission TIMESTAMPTZ,
  usuarios_distintos BIGINT,
  devices_distintos BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.metadata_emissao->'server'->>'ip_address' as ip_address,
    COUNT(*) as total_vouchers,
    MIN(v.created_at) as first_emission,
    MAX(v.created_at) as last_emission,
    COUNT(DISTINCT v.created_by) as usuarios_distintos,
    COUNT(DISTINCT v.metadata_emissao->>'device_type') as devices_distintos
  FROM tbvoucher v
  WHERE
    v.created_at >= time_threshold
    AND v.deletado = 'N'
    AND v.metadata_emissao->'server'->>'ip_address' IS NOT NULL
  GROUP BY v.metadata_emissao->'server'->>'ip_address'
  HAVING COUNT(*) >= count_threshold
  ORDER BY total_vouchers DESC;
END;
$$ LANGUAGE plpgsql;

-- Comentário
COMMENT ON FUNCTION detect_suspicious_ips IS
'Detecta IPs com número suspeito de emissões de vouchers em um período.
Parâmetros:
  - time_threshold: Data/hora inicial (ex: NOW() - INTERVAL ''1 hour'')
  - count_threshold: Número mínimo de vouchers para considerar suspeito (ex: 10)
Retorna: Lista de IPs suspeitos com estatísticas';

-- ============================================================================
-- EXEMPLO DE USO:
-- ============================================================================

-- Detectar IPs com mais de 10 vouchers na última hora
SELECT * FROM detect_suspicious_ips(
  NOW() - INTERVAL '1 hour',
  10
);

-- Resultado esperado:
-- ip_address       | total_vouchers | first_emission       | last_emission        | usuarios_distintos | devices_distintos
-- -----------------|----------------|----------------------|----------------------|--------------------|------------------
-- 177.55.142.23    | 25             | 2025-12-03 13:00:00 | 2025-12-03 14:00:00 | 1                  | 1
```

### 6.4. View para Auditoria Simplificada

```sql
-- ============================================================================
-- VIEW: Visão simplificada dos metadados para auditoria
-- ============================================================================

CREATE OR REPLACE VIEW v_voucher_auditoria AS
SELECT
  v.voucher_id,
  v.funcionario,
  v.valor,
  v.status,
  v.created_at,
  v.created_nome,

  -- Extração de campos JSONB importantes
  v.metadata_emissao->'server'->>'ip_address' as ip_origem,
  v.metadata_emissao->>'device_type' as dispositivo,
  v.metadata_emissao->>'os' as sistema_operacional,
  v.metadata_emissao->'browser'->>'name' as navegador,
  v.metadata_emissao->'browser'->>'version' as versao_navegador,
  v.metadata_emissao->>'timezone' as fuso_horario,
  v.metadata_emissao->'server'->'geolocation'->>'city' as cidade,
  v.metadata_emissao->'server'->'geolocation'->>'country' as pais,

  -- Timestamp original do cliente
  (v.metadata_emissao->>'timestamp_client')::TIMESTAMPTZ as timestamp_cliente,

  -- Diferença de tempo (cliente vs servidor)
  (v.metadata_emissao->'server'->>'timestamp_server')::TIMESTAMPTZ -
  (v.metadata_emissao->>'timestamp_client')::TIMESTAMPTZ as time_diff,

  -- Flag de validação
  (v.metadata_emissao->'validation'->>'isValid')::BOOLEAN as validacao_ok

FROM tbvoucher v
WHERE v.deletado = 'N';

-- Comentário
COMMENT ON VIEW v_voucher_auditoria IS
'View simplificada dos vouchers com campos principais de auditoria extraídos do JSONB.
Facilita consultas sem necessidade de conhecer a estrutura completa do metadata_emissao.';

-- ============================================================================
-- EXEMPLOS DE USO DA VIEW:
-- ============================================================================

-- 1. Listar vouchers por IP
SELECT * FROM v_voucher_auditoria
WHERE ip_origem = '177.55.142.23'
ORDER BY created_at DESC;

-- 2. Estatísticas por dispositivo
SELECT
  dispositivo,
  COUNT(*) as total,
  SUM(valor) as valor_total
FROM v_voucher_auditoria
GROUP BY dispositivo;

-- 3. Vouchers com validação suspeita
SELECT * FROM v_voucher_auditoria
WHERE validacao_ok = FALSE
ORDER BY created_at DESC;

-- 4. Análise geográfica
SELECT
  pais,
  cidade,
  COUNT(*) as total_vouchers
FROM v_voucher_auditoria
WHERE cidade IS NOT NULL
GROUP BY pais, cidade
ORDER BY total_vouchers DESC;
```

---

## 7. Conformidade LGPD

### 7.1. Classificação de Dados Capturados

| Dado Capturado | Classificação LGPD | Base Legal | Prazo de Retenção |
|---|---|---|---|
| **IP Address** | Dado Pessoal (Art. 5º, I) | Legítimo Interesse (Art. 7º, IX) - Segurança | 12 meses |
| **User Agent** | Dado Pessoal (identificação indireta) | Legítimo Interesse - Auditoria | 12 meses |
| **Device Type** | Dado Técnico (não identificador) | Legítimo Interesse | 24 meses |
| **Geolocation** | Dado Pessoal Sensível (se preciso) | Consentimento (Art. 7º, I) | 6 meses |
| **Browser/OS** | Dado Técnico | Legítimo Interesse | 24 meses |
| **Timezone** | Dado Técnico | Legítimo Interesse | 24 meses |

### 7.2. Obrigações Legais

#### 7.2.1. Política de Privacidade - Trecho Necessário

```markdown
## Coleta de Dados Técnicos para Segurança

### Dados Coletados
Para garantir a segurança das transações financeiras (emissão de vouchers),
coletamos automaticamente as seguintes informações técnicas:

- **Endereço IP**: Identificação da origem da conexão
- **Tipo de dispositivo**: Desktop, tablet ou smartphone
- **Navegador e versão**: Software utilizado para acessar o sistema
- **Sistema operacional**: Windows, macOS, Linux, Android ou iOS
- **Resolução de tela**: Dimensões da tela do dispositivo
- **Fuso horário e idioma**: Configurações regionais
- **Informações de rede**: Tipo de conexão (Wi-Fi, 4G, etc.)

### Finalidade
Estes dados são utilizados exclusivamente para:
- ✅ Prevenção e detecção de fraudes
- ✅ Auditoria de segurança
- ✅ Investigação de incidentes
- ✅ Conformidade com obrigações legais

### Base Legal
A coleta é fundamentada no **legítimo interesse** da empresa em:
- Proteger os colaboradores contra fraudes financeiras
- Garantir a integridade do sistema de benefícios
- Cumprir obrigações fiscais e contábeis

### Retenção de Dados
- **Dados de segurança (IP, user agent)**: 12 meses
- **Dados técnicos (dispositivo, navegador)**: 24 meses
- Após o prazo, os dados são automaticamente anonimizados ou excluídos

### Compartilhamento
Estes dados **NÃO são compartilhados** com terceiros, exceto:
- Autoridades judiciais ou fiscais, mediante ordem legal
- Auditores externos, sob acordo de confidencialidade

### Seus Direitos
Você tem direito a:
- Acessar os dados técnicos coletados sobre você
- Solicitar explicações sobre a coleta
- Revogar o consentimento (quando aplicável)
- Solicitar a exclusão (sujeito a obrigações legais)

Para exercer seus direitos, entre em contato com nosso DPO:
dpo@sicfar-rh.com.br
```

#### 7.2.2. Termo de Consentimento (se necessário)

Se optar por coletar **geolocalização precisa** (latitude/longitude), é necessário consentimento explícito:

```typescript
// Exemplo de solicitação de consentimento para geolocalização
const requestGeolocationConsent = async (): Promise<GeolocationPosition | null> => {
  return new Promise((resolve) => {
    // Modal ou dialog explicando a coleta
    const userConsent = confirm(
      "Para maior segurança, gostaríamos de registrar sua localização aproximada " +
      "no momento da emissão do voucher. Isso nos ajuda a detectar acessos não autorizados.\n\n" +
      "Sua localização será usada apenas para fins de segurança e não será compartilhada.\n\n" +
      "Deseja permitir?"
    );

    if (!userConsent) {
      resolve(null);
      return;
    }

    // Solicita permissão do navegador
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        console.warn('Geolocalização negada ou não disponível:', error);
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  });
};
```

### 7.3. Registro de Atividades de Tratamento (ROPA)

```markdown
# Registro de Atividades de Tratamento - Metadados de Emissão de Vouchers

## Identificação
- **Atividade**: Coleta e armazenamento de metadados técnicos de emissão de vouchers
- **Controlador**: Farmace Benefícios LTDA
- **DPO**: [Nome do DPO]
- **Data de início**: 2025-12-03

## Dados Pessoais Tratados
- Endereço IP
- User agent (navegador/dispositivo)
- Tipo de dispositivo
- Sistema operacional
- Resolução de tela
- Fuso horário
- Idioma do navegador
- Geolocalização aproximada (cidade/região)

## Titulares
- Colaboradores da empresa (funcionários)
- Gestores de RH com permissão de emitir vouchers

## Finalidade
1. Prevenção e detecção de fraudes financeiras
2. Auditoria de conformidade
3. Segurança da informação
4. Investigação de incidentes de segurança
5. Cumprimento de obrigações legais (fiscal, trabalhista)

## Base Legal
- **Principal**: Legítimo interesse (Art. 7º, IX da LGPD)
  - Proteção do crédito (Art. 10, II, f)
  - Segurança do titular
  - Prevenção à fraude

- **Secundária**: Cumprimento de obrigação legal (Art. 7º, II)
  - Registros contábeis (10 anos - Código Civil)
  - Documentação trabalhista (5 anos - CLT)

## Compartilhamento
- **Interno**: Equipe de TI, RH, Auditoria Interna
- **Externo**:
  - Auditores externos (sob NDA)
  - Autoridades judiciais/fiscais (mediante ordem)

## Retenção
- **Dados de segurança (IP, user agent)**: 12 meses após emissão
- **Dados técnicos (dispositivo, SO)**: 24 meses após emissão
- **Após retenção**: Anonimização ou exclusão automática

## Medidas de Segurança
- Criptografia em trânsito (TLS 1.3)
- Criptografia em repouso (AES-256)
- Controle de acesso baseado em função (RBAC)
- Logs de auditoria de acessos
- Backup criptografado (retenção de 30 dias)
- Segregação de ambientes (dev/staging/prod)

## Transferência Internacional
- ❌ Não há transferência internacional de dados

## Riscos e Mitigações
| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Vazamento de IPs | Baixa | Médio | Criptografia + controle de acesso |
| Uso indevido para tracking | Baixa | Alto | Finalidade específica + auditoria |
| Retenção excessiva | Média | Baixo | Exclusão automática após prazo |
| Acesso não autorizado | Baixa | Alto | MFA + RBAC + logs de auditoria |

## Direitos dos Titulares
- Acesso aos dados coletados
- Correção de dados incorretos
- Eliminação (sujeito a obrigações legais)
- Informação sobre compartilhamento
- Revogação de consentimento (quando aplicável)

## Revisão
- **Última revisão**: 2025-12-03
- **Próxima revisão**: 2026-06-03 (6 meses)
- **Responsável**: [Nome do DPO]
```

### 7.4. Script de Anonimização Automática

```sql
-- ============================================================================
-- FUNÇÃO: Anonimizar metadados antigos (cumprimento de retenção LGPD)
-- ============================================================================

CREATE OR REPLACE FUNCTION anonymize_old_metadata()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Anonimiza metadados de vouchers com mais de 12 meses
  UPDATE tbvoucher
  SET metadata_emissao = jsonb_set(
    jsonb_set(
      metadata_emissao,
      '{server,ip_address}',
      '"[ANONIMIZADO]"'::jsonb
    ),
    '{server,geolocation}',
    '{"anonimizado": true}'::jsonb
  )
  WHERE
    created_at < NOW() - INTERVAL '12 months'
    AND deletado = 'N'
    AND metadata_emissao->'server'->>'ip_address' != '[ANONIMIZADO]';

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  -- Log da operação
  INSERT INTO log_anonimizacao (
    data_execucao,
    registros_anonimizados,
    observacao
  ) VALUES (
    NOW(),
    updated_count,
    'Anonimização automática de metadados com mais de 12 meses'
  );

  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- AGENDAMENTO: Executar anonimização mensalmente
-- ============================================================================

-- Usando pg_cron (se disponível no Supabase)
SELECT cron.schedule(
  'anonimizar-metadados-mensalmente',
  '0 2 1 * *', -- Todo dia 1 às 02:00
  $$SELECT anonymize_old_metadata();$$
);
```

---

## 8. Queries de Auditoria

### 8.1. Investigação de Fraudes

#### 8.1.1. Vouchers do Mesmo IP

```sql
-- ============================================================================
-- QUERY: Listar todos os vouchers emitidos de um IP específico
-- ============================================================================

SELECT
  v.voucher_id,
  v.funcionario,
  v.valor,
  v.status,
  v.created_at,
  v.created_nome as emitido_por,
  v.metadata_emissao->>'device_type' as dispositivo,
  v.metadata_emissao->'browser'->>'name' as navegador,
  v.metadata_emissao->>'os' as sistema
FROM tbvoucher v
WHERE
  v.deletado = 'N'
  AND v.metadata_emissao->'server'->>'ip_address' = '177.55.142.23'
ORDER BY v.created_at DESC;
```

#### 8.1.2. Múltiplas Emissões em Curto Período

```sql
-- ============================================================================
-- QUERY: Detectar usuários que emitiram muitos vouchers rapidamente
-- ============================================================================

WITH emissoes_rapidas AS (
  SELECT
    created_by,
    created_nome,
    metadata_emissao->'server'->>'ip_address' as ip,
    COUNT(*) as total_vouchers,
    SUM(valor) as valor_total,
    MIN(created_at) as primeira_emissao,
    MAX(created_at) as ultima_emissao,
    MAX(created_at) - MIN(created_at) as duracao
  FROM tbvoucher
  WHERE
    deletado = 'N'
    AND created_at >= NOW() - INTERVAL '24 hours'
  GROUP BY created_by, created_nome, metadata_emissao->'server'->>'ip_address'
  HAVING COUNT(*) >= 5  -- 5 ou mais vouchers
)
SELECT
  *,
  EXTRACT(EPOCH FROM duracao)/60 as duracao_minutos,
  ROUND(valor_total / total_vouchers, 2) as valor_medio
FROM emissoes_rapidas
WHERE EXTRACT(EPOCH FROM duracao)/60 < 60  -- Em menos de 1 hora
ORDER BY total_vouchers DESC;
```

#### 8.1.3. Acesso de Localização Incomum

```sql
-- ============================================================================
-- QUERY: Detectar acessos de localizações diferentes do padrão do usuário
-- ============================================================================

WITH localizacoes_usuario AS (
  SELECT
    created_by,
    metadata_emissao->'server'->'geolocation'->>'city' as cidade,
    COUNT(*) as vezes
  FROM tbvoucher
  WHERE
    deletado = 'N'
    AND created_at >= NOW() - INTERVAL '90 days'
    AND metadata_emissao->'server'->'geolocation'->>'city' IS NOT NULL
  GROUP BY created_by, metadata_emissao->'server'->'geolocation'->>'city'
),
cidade_mais_comum AS (
  SELECT
    created_by,
    cidade as cidade_habitual,
    vezes
  FROM localizacoes_usuario
  WHERE (created_by, vezes) IN (
    SELECT created_by, MAX(vezes)
    FROM localizacoes_usuario
    GROUP BY created_by
  )
)
SELECT
  v.voucher_id,
  v.funcionario,
  v.created_nome as emitido_por,
  v.created_at,
  v.metadata_emissao->'server'->'geolocation'->>'city' as cidade_emissao,
  c.cidade_habitual,
  v.metadata_emissao->'server'->>'ip_address' as ip
FROM tbvoucher v
LEFT JOIN cidade_mais_comum c ON c.created_by = v.created_by
WHERE
  v.deletado = 'N'
  AND v.created_at >= NOW() - INTERVAL '7 days'
  AND v.metadata_emissao->'server'->'geolocation'->>'city' != c.cidade_habitual
  AND v.metadata_emissao->'server'->'geolocation'->>'city' IS NOT NULL
ORDER BY v.created_at DESC;
```

### 8.2. Análise Estatística

#### 8.2.1. Distribuição por Tipo de Dispositivo

```sql
-- ============================================================================
-- QUERY: Estatísticas de emissão por tipo de dispositivo
-- ============================================================================

SELECT
  metadata_emissao->>'device_type' as tipo_dispositivo,
  COUNT(*) as total_vouchers,
  SUM(valor) as valor_total,
  ROUND(AVG(valor), 2) as valor_medio,
  COUNT(DISTINCT created_by) as usuarios_distintos,
  MIN(created_at) as primeira_emissao,
  MAX(created_at) as ultima_emissao
FROM tbvoucher
WHERE
  deletado = 'N'
  AND metadata_emissao->>'device_type' IS NOT NULL
GROUP BY metadata_emissao->>'device_type'
ORDER BY total_vouchers DESC;
```

#### 8.2.2. Navegadores Mais Utilizados

```sql
-- ============================================================================
-- QUERY: Distribuição de navegadores
-- ============================================================================

SELECT
  metadata_emissao->'browser'->>'name' as navegador,
  metadata_emissao->'browser'->>'version' as versao,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentual
FROM tbvoucher
WHERE
  deletado = 'N'
  AND metadata_emissao->'browser'->>'name' IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY
  metadata_emissao->'browser'->>'name',
  metadata_emissao->'browser'->>'version'
ORDER BY total DESC
LIMIT 10;
```

#### 8.2.3. Horários de Pico de Emissão

```sql
-- ============================================================================
-- QUERY: Análise de horários de emissão
-- ============================================================================

SELECT
  EXTRACT(HOUR FROM created_at) as hora,
  COUNT(*) as total_emissoes,
  SUM(valor) as valor_total,
  COUNT(DISTINCT created_by) as usuarios_ativos,
  ROUND(AVG(valor), 2) as valor_medio
FROM tbvoucher
WHERE
  deletado = 'N'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hora;
```

### 8.3. Compliance e Auditoria

#### 8.3.1. Vouchers Sem Metadados (Gap de Segurança)

```sql
-- ============================================================================
-- QUERY: Identificar vouchers emitidos SEM metadados (antes da implementação)
-- ============================================================================

SELECT
  voucher_id,
  funcionario,
  valor,
  status,
  created_at,
  created_nome,
  CASE
    WHEN metadata_emissao IS NULL THEN 'SEM METADADOS'
    WHEN metadata_emissao->'server'->>'ip_address' IS NULL THEN 'SEM IP'
    WHEN metadata_emissao->>'device_type' IS NULL THEN 'SEM DEVICE'
    ELSE 'COMPLETO'
  END as status_metadados
FROM tbvoucher
WHERE deletado = 'N'
ORDER BY created_at DESC;
```

#### 8.3.2. Relatório de Conformidade LGPD

```sql
-- ============================================================================
-- QUERY: Vouchers próximos ao prazo de retenção (precisam ser anonimizados)
-- ============================================================================

SELECT
  COUNT(*) as total_proximos_anonimizacao,
  MIN(created_at) as mais_antigo,
  MAX(created_at) as mais_recente,
  SUM(valor) as valor_total_afetado
FROM tbvoucher
WHERE
  deletado = 'N'
  AND created_at < NOW() - INTERVAL '11 months'  -- Falta 1 mês para 12 meses
  AND created_at >= NOW() - INTERVAL '12 months'
  AND metadata_emissao->'server'->>'ip_address' != '[ANONIMIZADO]';
```

#### 8.3.3. Histórico de Acessos por Usuário

```sql
-- ============================================================================
-- QUERY: Listar todos os IPs únicos usados por um usuário específico
-- ============================================================================

SELECT DISTINCT
  v.created_by,
  v.created_nome,
  v.metadata_emissao->'server'->>'ip_address' as ip_utilizado,
  v.metadata_emissao->>'device_type' as dispositivo,
  v.metadata_emissao->'server'->'geolocation'->>'city' as cidade,
  MIN(v.created_at) as primeira_vez,
  MAX(v.created_at) as ultima_vez,
  COUNT(*) as vezes_utilizado
FROM tbvoucher v
WHERE
  v.deletado = 'N'
  AND v.created_by = 42  -- ID do usuário investigado
  AND v.metadata_emissao->'server'->>'ip_address' IS NOT NULL
GROUP BY
  v.created_by,
  v.created_nome,
  v.metadata_emissao->'server'->>'ip_address',
  v.metadata_emissao->>'device_type',
  v.metadata_emissao->'server'->'geolocation'->>'city'
ORDER BY primeira_vez DESC;
```

---

## 9. Casos de Uso e Cenários

### 9.1. Cenário 1: Detecção de Fraude Interna

**Situação:**
Um funcionário do RH está emitindo vouchers fraudulentos para parentes fictícios.

**Como o sistema detecta:**

```sql
-- 1. Detectar padrão: Múltiplas emissões do mesmo IP em curto período
SELECT * FROM detect_suspicious_ips(
  NOW() - INTERVAL '2 hours',
  15  -- Mais de 15 vouchers em 2 horas
);

-- Resultado:
-- ip_address       | total_vouchers | usuarios_distintos
-- -----------------|----------------|-------------------
-- 177.55.142.23    | 30             | 1

-- 2. Investigar detalhes dos vouchers suspeitos
SELECT
  voucher_id,
  funcionario,
  cpf,
  valor,
  created_at,
  metadata_emissao->'server'->>'ip_address' as ip,
  metadata_emissao->>'device_type' as dispositivo,
  metadata_emissao->'browser'->>'name' as navegador
FROM tbvoucher
WHERE
  created_by = 42  -- ID do funcionário suspeito
  AND created_at >= NOW() - INTERVAL '2 hours'
ORDER BY created_at;
```

**Ação recomendada:**
1. Alertar gerência de RH imediatamente
2. Suspender conta do usuário suspeito
3. Bloquear vouchers não resgatados
4. Iniciar investigação interna
5. Preservar evidências (logs, metadados)

---

### 9.2. Cenário 2: Conta Comprometida

**Situação:**
Credenciais de um gerente são roubadas. Criminoso acessa remotamente de outro estado.

**Como o sistema detecta:**

```sql
-- 1. Analisar mudança súbita de localização
WITH historico AS (
  SELECT
    metadata_emissao->'server'->'geolocation'->>'city' as cidade,
    COUNT(*) as vezes
  FROM tbvoucher
  WHERE
    created_by = 42
    AND created_at >= NOW() - INTERVAL '90 days'
    AND deletado = 'N'
  GROUP BY cidade
)
SELECT * FROM tbvoucher
WHERE
  created_by = 42
  AND created_at >= NOW() - INTERVAL '1 day'
  AND metadata_emissao->'server'->'geolocation'->>'city' NOT IN (
    SELECT cidade FROM historico
  );

-- 2. Verificar mudança de dispositivo
SELECT
  created_at,
  metadata_emissao->>'device_type' as dispositivo,
  metadata_emissao->>'os' as sistema,
  metadata_emissao->'browser'->>'name' as navegador,
  metadata_emissao->'server'->>'ip_address' as ip,
  metadata_emissao->'server'->'geolocation'->>'city' as cidade
FROM tbvoucher
WHERE created_by = 42
ORDER BY created_at DESC
LIMIT 10;
```

**Ação recomendada:**
1. Bloquear conta imediatamente
2. Notificar o gerente legítimo
3. Forçar redefinição de senha
4. Anular vouchers emitidos de localização suspeita
5. Implementar autenticação de dois fatores (MFA)

---

### 9.3. Cenário 3: Auditoria Fiscal

**Situação:**
Receita Federal solicita comprovação da legitimidade de R$ 500.000 em vouchers emitidos no último ano.

**Documentação gerada:**

```sql
-- 1. Relatório completo de emissões
SELECT
  TO_CHAR(created_at, 'YYYY-MM') as mes_ano,
  COUNT(*) as total_vouchers,
  SUM(valor) as valor_total,
  COUNT(DISTINCT created_by) as emissores_distintos,
  COUNT(DISTINCT funcionario_id) as beneficiarios_distintos,
  COUNT(DISTINCT metadata_emissao->'server'->>'ip_address') as ips_distintos
FROM tbvoucher
WHERE
  deletado = 'N'
  AND created_at >= NOW() - INTERVAL '12 months'
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY mes_ano;

-- 2. Detalhamento com metadados de segurança
SELECT
  voucher_id,
  funcionario,
  cpf,
  valor,
  created_at,
  created_nome as aprovador,
  metadata_emissao->'server'->>'ip_address' as ip_origem,
  metadata_emissao->'server'->'geolocation'->>'city' as cidade,
  metadata_emissao->>'device_type' as dispositivo,
  CASE
    WHEN metadata_emissao->'validation'->>'isValid' = 'true' THEN 'VALIDADO'
    ELSE 'REVISAR'
  END as status_validacao
FROM tbvoucher
WHERE
  deletado = 'N'
  AND created_at >= NOW() - INTERVAL '12 months'
ORDER BY created_at;

-- 3. Exportar para CSV (executar via pg_dump ou ferramenta BI)
COPY (
  SELECT * FROM v_voucher_auditoria
  WHERE created_at >= NOW() - INTERVAL '12 months'
) TO '/tmp/relatorio_vouchers_auditoria_fiscal.csv'
WITH (FORMAT CSV, HEADER true, DELIMITER ';');
```

**Documentação adicional fornecida:**
- ✅ Data/hora precisa de cada emissão (timezone: America/Sao_Paulo)
- ✅ IP de origem (rastreável geograficamente)
- ✅ Dispositivo utilizado (desktop/mobile)
- ✅ Usuário do sistema que aprovou (nome + ID)
- ✅ Validação técnica (coerência entre cliente e servidor)
- ✅ Localização geográfica aproximada

**Resultado:** Auditoria passa com louvor, demonstrando controles internos robustos.

---

### 9.4. Cenário 4: Análise de Performance e UX

**Situação:**
Equipe de produto quer entender como usuários estão acessando o sistema.

**Análises possíveis:**

```sql
-- 1. Dispositivos mais utilizados
SELECT
  metadata_emissao->>'device_type' as dispositivo,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentual
FROM tbvoucher
WHERE
  deletado = 'N'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY dispositivo;

-- Resultado:
-- dispositivo | total | percentual
-- ------------|-------|------------
-- desktop     | 850   | 68.5%
-- mobile      | 320   | 25.8%
-- tablet      | 71    | 5.7%

-- 2. Navegadores com problemas de performance
SELECT
  metadata_emissao->'browser'->>'name' as navegador,
  COUNT(*) as total_emissoes,
  AVG(
    EXTRACT(EPOCH FROM (
      (metadata_emissao->'server'->>'timestamp_server')::TIMESTAMPTZ -
      (metadata_emissao->>'timestamp_client')::TIMESTAMPTZ
    ))
  ) as latencia_media_segundos
FROM tbvoucher
WHERE
  deletado = 'N'
  AND created_at >= NOW() - INTERVAL '7 days'
  AND metadata_emissao->'server'->>'timestamp_server' IS NOT NULL
GROUP BY navegador
ORDER BY latencia_media_segundos DESC;

-- 3. Horários de maior uso
SELECT
  EXTRACT(HOUR FROM created_at) as hora,
  COUNT(*) as emissoes,
  metadata_emissao->>'device_type' as dispositivo
FROM tbvoucher
WHERE
  deletado = 'N'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY hora, dispositivo
ORDER BY hora, dispositivo;
```

**Insights obtidos:**
- 📱 25% dos usuários acessam via mobile → Priorizar UX mobile
- ⏰ Pico de acessos entre 9h-11h → Planejar capacidade
- 🌐 Internet Explorer com alta latência → Descontinuar suporte
- 🏙️ 80% dos acessos de São Paulo → Considerar CDN regional

---

## 10. Roadmap de Implementação

### 10.1. Fase 1: MVP - Implementação Básica (Semana 1-2) 🔴 CRÍTICO

**Objetivo:** Capturar dados essenciais de segurança o mais rápido possível.

#### Sprint 1.1: Frontend (3 dias)
- [ ] Criar utilitário `sessionContext.ts`
  - [ ] Função `captureSessionContext()`
  - [ ] Helpers: `getDeviceType()`, `getOperatingSystem()`, `getBrowserInfo()`
  - [ ] Testes unitários
- [ ] Integrar em `SolicitarBeneficio.tsx`
  - [ ] Capturar contexto no `handleConfirmSolicitation`
  - [ ] Incluir no payload para backend
  - [ ] Logging para debug
- [ ] Testes manuais em múltiplos dispositivos
  - [ ] Desktop: Chrome, Firefox, Edge
  - [ ] Mobile: Safari iOS, Chrome Android
  - [ ] Tablet: iPad, Android

#### Sprint 1.2: Backend (3 dias)
- [ ] Criar middleware `captureMetadata.ts`
  - [ ] Função `captureRequestMetadata()`
  - [ ] Captura de IP (considerar proxies)
  - [ ] Validação de coerência
- [ ] Atualizar endpoint `/api/send-voucher-email`
  - [ ] Merge dados cliente + servidor
  - [ ] Salvar metadados no banco
  - [ ] Error handling
- [ ] Testes de integração

#### Sprint 1.3: Banco de Dados (2 dias)
- [ ] Criar migration para adicionar campo `metadata_emissao`
  - [ ] `ALTER TABLE tbvoucher ADD COLUMN metadata_emissao JSONB`
- [ ] Criar índices GIN
  - [ ] `idx_tbvoucher_metadata_ip`
  - [ ] `idx_tbvoucher_metadata_device`
- [ ] Testar queries de busca
- [ ] Rollback plan (caso necessário)

#### Sprint 1.4: Testes e Deploy (2 dias)
- [ ] Testes end-to-end
  - [ ] Emitir voucher e verificar metadados salvos
  - [ ] Validar estrutura do JSONB
  - [ ] Performance (tempo de resposta)
- [ ] Deploy em staging
- [ ] Validação com stakeholders
- [ ] Deploy em produção

**Entregáveis:**
- ✅ IP capturado e salvo no banco
- ✅ Device type, OS, Browser capturados
- ✅ Timestamps cliente/servidor
- ✅ Queries básicas de auditoria funcionando

---

### 10.2. Fase 2: Enriquecimento (Semana 3-4) 🟡 IMPORTANTE

**Objetivo:** Adicionar informações complementares e validações.

#### Sprint 2.1: GeoIP e Validações (5 dias)
- [ ] Implementar GeoIP lookup
  - [ ] Escolher provedor (MaxMind, IP2Location, ipapi.co)
  - [ ] Integrar API
  - [ ] Cachear resultados (Redis/Memcached)
  - [ ] Fallback se API falhar
- [ ] Implementar validações adicionais
  - [ ] Detectar VPN/proxy (heurísticas)
  - [ ] Validar consistência timezone
  - [ ] Rate limiting por IP
- [ ] Criar função `enrichMetadata()`
- [ ] Testes unitários e de integração

#### Sprint 2.2: Dashboard de Auditoria (5 dias)
- [ ] Criar página de auditoria no frontend
  - [ ] Componente `AuditoriaVouchers.tsx`
  - [ ] Tabela com filtros (IP, dispositivo, data)
  - [ ] Visualização de metadados (JSON viewer)
- [ ] Implementar queries de análise
  - [ ] Vouchers por IP
  - [ ] Estatísticas por dispositivo
  - [ ] Detecção de padrões suspeitos
- [ ] Gráficos e visualizações
  - [ ] Chart.js ou Recharts
  - [ ] Distribuição por dispositivo
  - [ ] Timeline de emissões

**Entregáveis:**
- ✅ Geolocalização (cidade/estado) capturada
- ✅ Dashboard de auditoria funcional
- ✅ Queries de análise disponíveis
- ✅ Alertas para padrões suspeitos

---

### 10.3. Fase 3: Automação e Alertas (Semana 5-6) 🟡 IMPORTANTE

**Objetivo:** Sistema proativo de detecção de anomalias.

#### Sprint 3.1: Sistema de Alertas (5 dias)
- [ ] Criar função SQL `detect_suspicious_ips()`
- [ ] Implementar sistema de alertas
  - [ ] Email para equipe de segurança
  - [ ] Notificação no Slack/Teams
  - [ ] Log em sistema de SIEM (se houver)
- [ ] Definir regras de detecção
  - [ ] Mais de X vouchers por IP em Y minutos
  - [ ] Acesso de localização incomum
  - [ ] Mudança súbita de dispositivo
  - [ ] Emissões fora do horário comercial
- [ ] Configurar agendamento (cron)
  - [ ] Executar a cada 15 minutos
  - [ ] Processar apenas novos vouchers

#### Sprint 3.2: Anonimização LGPD (5 dias)
- [ ] Criar função `anonymize_old_metadata()`
- [ ] Implementar tabela de log de anonimização
- [ ] Configurar agendamento mensal
- [ ] Testes de anonimização
  - [ ] Verificar integridade após anonimização
  - [ ] Garantir que queries de auditoria não quebram
- [ ] Documentar processo de retenção

**Entregáveis:**
- ✅ Alertas automáticos para atividades suspeitas
- ✅ Anonimização automática conforme LGPD
- ✅ Logs de todas as operações de segurança

---

### 10.4. Fase 4: Compliance e Documentação (Semana 7-8) 🟢 DESEJÁVEL

**Objetivo:** Conformidade legal e documentação completa.

#### Sprint 4.1: Documentação LGPD (5 dias)
- [ ] Atualizar Política de Privacidade
  - [ ] Seção sobre coleta de metadados
  - [ ] Finalidades e base legal
  - [ ] Direitos dos titulares
- [ ] Criar Registro de Atividades de Tratamento (ROPA)
- [ ] Implementar mecanismo de consentimento (se geolocation)
- [ ] Treinamento para equipe de RH
  - [ ] Apresentação sobre segurança
  - [ ] Como identificar atividades suspeitas
  - [ ] Procedimentos de resposta a incidentes

#### Sprint 4.2: Auditoria e Testes de Segurança (5 dias)
- [ ] Pentesting básico
  - [ ] Tentar forjar metadados
  - [ ] Tentar bypass de validações
  - [ ] Injeção de dados maliciosos no JSONB
- [ ] Code review de segurança
- [ ] Análise de performance
  - [ ] Impacto no tempo de emissão
  - [ ] Otimizar queries se necessário
- [ ] Documentação técnica final
  - [ ] Este documento (atualizar conforme implementação)
  - [ ] README para desenvolvedores
  - [ ] Runbook para operações

**Entregáveis:**
- ✅ Conformidade total com LGPD
- ✅ Documentação completa e atualizada
- ✅ Sistema testado e validado
- ✅ Equipe treinada

---

### 10.5. Fase 5: Melhorias Avançadas (Semana 9+) 🟢 FUTURO

**Objetivo:** Features avançadas de segurança.

#### Funcionalidades Avançadas:
- [ ] **Device Fingerprinting**
  - Canvas fingerprinting
  - WebGL fingerprinting
  - Identificação única de dispositivo (sem cookies)

- [ ] **Behavioral Biometrics**
  - Velocidade de digitação
  - Padrões de mouse/touch
  - Detecção de bots

- [ ] **Machine Learning para Detecção de Fraudes**
  - Modelo treinado com histórico
  - Score de risco por transação
  - Aprendizado contínuo

- [ ] **Autenticação Multifator (MFA)**
  - SMS/Email para operações sensíveis
  - Authenticator app (TOTP)
  - Biometria (face/fingerprint)

- [ ] **Blockchain para Imutabilidade**
  - Hash do voucher em blockchain
  - Prova de existência e integridade
  - Auditoria descentralizada

**Priorização:** A ser definida conforme feedback e necessidade.

---

## 11. Checklist de Segurança

### 11.1. Checklist de Implementação

#### Frontend
- [ ] ✅ Utilitário `sessionContext.ts` criado e testado
- [ ] ✅ Captura de device type (desktop/tablet/mobile)
- [ ] ✅ Captura de user agent completo
- [ ] ✅ Captura de sistema operacional
- [ ] ✅ Captura de navegador e versão
- [ ] ✅ Captura de resolução de tela
- [ ] ✅ Captura de timezone
- [ ] ✅ Captura de idioma
- [ ] ✅ Timestamps do cliente
- [ ] ✅ Integração em `SolicitarBeneficio.tsx`
- [ ] ✅ Tratamento de erros (graceful degradation)
- [ ] ✅ Testes em múltiplos navegadores
- [ ] ✅ Testes em múltiplos dispositivos

#### Backend
- [ ] ✅ Middleware `captureMetadata.ts` criado
- [ ] ✅ Captura de IP real (considera proxies)
- [ ] ✅ Captura de headers HTTP relevantes
- [ ] ✅ Validação de coerência cliente/servidor
- [ ] ✅ Merge de metadados (cliente + servidor)
- [ ] ✅ Enriquecimento com GeoIP (opcional)
- [ ] ✅ Integração no endpoint `/api/send-voucher-email`
- [ ] ✅ Logging apropriado (sem expor dados sensíveis)
- [ ] ✅ Error handling robusto
- [ ] ✅ Testes de integração
- [ ] ✅ Sanitização de dados (prevenir injection)

#### Banco de Dados
- [ ] ✅ Migration criada e testada
- [ ] ✅ Campo `metadata_emissao JSONB` adicionado
- [ ] ✅ Índices GIN criados
  - [ ] `idx_tbvoucher_metadata_ip`
  - [ ] `idx_tbvoucher_metadata_device`
  - [ ] `idx_tbvoucher_metadata_browser`
- [ ] ✅ Função `detect_suspicious_ips()` criada
- [ ] ✅ Função `anonymize_old_metadata()` criada
- [ ] ✅ View `v_voucher_auditoria` criada
- [ ] ✅ Testes de performance das queries
- [ ] ✅ Backup e rollback plan

#### Segurança
- [ ] ✅ Metadados não podem ser falsificados pelo cliente
- [ ] ✅ IP é capturado no servidor (não no cliente)
- [ ] ✅ Validação de input (prevenir injection)
- [ ] ✅ Criptografia em trânsito (HTTPS/TLS)
- [ ] ✅ Criptografia em repouso (banco)
- [ ] ✅ Controle de acesso (RBAC)
- [ ] ✅ Logs de auditoria de acessos aos metadados
- [ ] ✅ Rate limiting implementado
- [ ] ✅ Proteção contra CSRF
- [ ] ✅ Headers de segurança configurados

#### LGPD e Compliance
- [ ] ✅ Política de Privacidade atualizada
- [ ] ✅ Seção sobre coleta de metadados adicionada
- [ ] ✅ Finalidades claramente especificadas
- [ ] ✅ Base legal definida (legítimo interesse)
- [ ] ✅ ROPA (Registro de Atividades) documentado
- [ ] ✅ Prazos de retenção definidos e implementados
- [ ] ✅ Anonimização automática configurada
- [ ] ✅ Mecanismo de consentimento (se geolocation)
- [ ] ✅ Direitos dos titulares implementados
- [ ] ✅ DPO informado e treinado

#### Auditoria e Monitoramento
- [ ] ✅ Dashboard de auditoria criado
- [ ] ✅ Queries de investigação testadas
- [ ] ✅ Queries de análise estatística funcionando
- [ ] ✅ Sistema de alertas configurado
- [ ] ✅ Notificações para eventos suspeitos
- [ ] ✅ Agendamento de tarefas (cron) configurado
- [ ] ✅ Logs centralizados (se aplicável)
- [ ] ✅ Integração com SIEM (se aplicável)

#### Documentação
- [ ] ✅ Este documento completo e atualizado
- [ ] ✅ README técnico para desenvolvedores
- [ ] ✅ Runbook para operações
- [ ] ✅ Diagramas de arquitetura
- [ ] ✅ Exemplos de uso (queries)
- [ ] ✅ Procedimentos de resposta a incidentes
- [ ] ✅ Guia de troubleshooting

#### Testes
- [ ] ✅ Testes unitários (frontend)
- [ ] ✅ Testes unitários (backend)
- [ ] ✅ Testes de integração
- [ ] ✅ Testes end-to-end
- [ ] ✅ Testes de performance
- [ ] ✅ Testes de segurança (pentesting básico)
- [ ] ✅ Testes de usabilidade
- [ ] ✅ Testes de compatibilidade (navegadores/dispositivos)

#### Deploy e Operações
- [ ] ✅ Deploy em staging realizado
- [ ] ✅ Validação em staging concluída
- [ ] ✅ Plano de rollback preparado
- [ ] ✅ Deploy em produção realizado
- [ ] ✅ Monitoramento pós-deploy
- [ ] ✅ Comunicação com stakeholders
- [ ] ✅ Treinamento da equipe
- [ ] ✅ Documentação de incidentes (se houver)

---

### 11.2. Checklist de Auditoria Periódica (Mensal)

- [ ] Executar `detect_suspicious_ips()` manualmente
- [ ] Revisar alertas de segurança do último mês
- [ ] Analisar estatísticas de uso (dispositivos, navegadores)
- [ ] Verificar vouchers sem metadados (gap)
- [ ] Validar funcionamento da anonimização automática
- [ ] Revisar logs de acesso aos metadados
- [ ] Atualizar documentação (se necessário)
- [ ] Backup dos dados de auditoria
- [ ] Relatório para DPO/CISO

---

### 11.3. Checklist de Resposta a Incidentes

**Quando detectar atividade suspeita:**

1. **Investigação Inicial (15 minutos)**
   - [ ] Executar queries de auditoria para o IP/usuário suspeito
   - [ ] Identificar padrão: Múltiplas emissões? Localização incomum? Dispositivo diferente?
   - [ ] Coletar evidências: Screenshots, queries, resultados

2. **Contenção (30 minutos)**
   - [ ] Suspender conta do usuário suspeito (se confirmado)
   - [ ] Bloquear IP de origem (se aplicável)
   - [ ] Anular vouchers não resgatados (se fraude confirmada)
   - [ ] Notificar gerência de RH e TI

3. **Erradicação (1-2 horas)**
   - [ ] Identificar causa raiz (credenciais vazadas? Phishing? Insider?)
   - [ ] Forçar redefinição de senha
   - [ ] Revogar sessões ativas
   - [ ] Implementar correções adicionais (se necessário)

4. **Recuperação (2-4 horas)**
   - [ ] Restaurar acessos legítimos
   - [ ] Reemitir vouchers legítimos anulados (se houver)
   - [ ] Notificar usuários afetados

5. **Lições Aprendidas (1 semana após)**
   - [ ] Documentar incidente completo
   - [ ] Identificar melhorias necessárias
   - [ ] Atualizar procedimentos
   - [ ] Treinamento adicional da equipe
   - [ ] Implementar melhorias de segurança

---

## 12. Conclusão e Recomendações Finais

### 12.1. Resumo Executivo

Este documento analisou criticamente a **ausência de rastreabilidade** no sistema de emissão de vouchers do SICFAR-RH e propôs uma **solução técnica completa** para resolver os gaps de segurança identificados.

**Principais descobertas:**
- ❌ Sistema atual **não captura nenhum dado técnico** de origem (IP, dispositivo, navegador)
- ❌ **Impossível rastrear fraudes** ou investigar incidentes de segurança
- ❌ **Risco crítico** para sistema que lida com valores financeiros
- ❌ **Não conformidade** com melhores práticas de auditoria (ISO 27001, SOX)

**Solução proposta:**
- ✅ Captura abrangente de **metadados técnicos** (IP, dispositivo, navegador, localização)
- ✅ Arquitetura de **3 camadas** (Frontend → Backend → Banco)
- ✅ Campo **JSONB flexível** para extensibilidade futura
- ✅ **Queries de auditoria** prontas para investigações
- ✅ **Conformidade LGPD** com anonimização automática
- ✅ **Sistema de alertas** para detecção proativa de anomalias

### 12.2. Recomendações Prioritárias

#### 🔴 URGENTE - Implementar IMEDIATAMENTE (Semanas 1-2)
1. **Captura de IP no backend** - Não negociável para segurança
2. **Captura de device type e user agent** - Essencial para auditoria
3. **Campo `metadata_emissao` no banco** - Fundação para tudo mais
4. **Queries básicas de investigação** - Suporte a incidentes

#### 🟡 IMPORTANTE - Implementar logo (Semanas 3-4)
5. **GeoIP lookup** - Detectar acessos de localizações incomuns
6. **Dashboard de auditoria** - Facilitar análises pela equipe de RH
7. **Sistema de alertas** - Detecção proativa de fraudes

#### 🟢 DESEJÁVEL - Roadmap futuro (Semanas 5+)
8. **Conformidade LGPD completa** - Anonimização, documentação
9. **Features avançadas** - Fingerprinting, ML, MFA
10. **Integrações** - SIEM, alertas Slack/Teams

### 12.3. ROI (Return on Investment)

**Investimento estimado:**
- Desenvolvimento: 6-8 semanas (1 desenvolvedor full-time)
- Custo: ~R$ 30.000 - R$ 50.000 (estimativa)

**Retorno esperado:**
- ✅ Prevenção de fraudes: **R$ 100.000 - R$ 500.000/ano** (evitados)
- ✅ Redução de risco legal: **Inestimável** (multas LGPD podem chegar a 2% do faturamento)
- ✅ Conformidade regulatória: **Essencial** para contratos governamentais
- ✅ Confiança dos colaboradores: **Melhora NPS e satisfação**
- ✅ Eficiência em investigações: **10x mais rápido** (horas → minutos)

**ROI estimado:** **300-500%** no primeiro ano.

### 12.4. Riscos de NÃO Implementar

Se a empresa decidir **NÃO implementar** esta solução:

| Risco | Probabilidade | Impacto | Custo Estimado |
|---|---|---|---|
| Fraude interna não detectada | Alta | Crítico | R$ 50.000 - R$ 200.000 |
| Perda em auditoria fiscal | Média | Alto | R$ 100.000 - R$ 500.000 (multas) |
| Vazamento de dados não rastreado | Média | Crítico | R$ 500.000 - R$ 5.000.000 (LGPD) |
| Reputacional | Baixa | Alto | Inestimável |
| Perda de contratos | Baixa | Alto | R$ 1.000.000+ |

**Conclusão:** O **custo de NÃO implementar** é **significativamente maior** que o investimento necessário.

### 12.5. Próximos Passos

1. **Aprovação da gerência** - Apresentar este documento e obter sign-off
2. **Alocação de recursos** - 1 desenvolvedor full-time por 6-8 semanas
3. **Kick-off do projeto** - Reunião com stakeholders (RH, TI, Jurídico, DPO)
4. **Início da Fase 1** - Implementação MVP (Semanas 1-2)
5. **Checkpoint semanal** - Acompanhamento de progresso e blockers

### 12.6. Contatos e Responsáveis

**Dúvidas técnicas:**
- Desenvolvedor responsável: [Seu nome]
- Email: [seu-email]

**Dúvidas legais (LGPD):**
- DPO (Data Protection Officer): [Nome do DPO]
- Email: [email-do-dpo]

**Aprovações:**
- Gerente de TI: [Nome]
- Gerente de RH: [Nome]
- Diretor Financeiro: [Nome]

---

## 📚 Referências

- [LGPD - Lei nº 13.709/2018](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [ISO/IEC 27001:2022](https://www.iso.org/standard/27001)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN - User-Agent](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent)
- [MDN - Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [PostgreSQL - JSONB Type](https://www.postgresql.org/docs/current/datatype-json.html)
- [MaxMind GeoIP2](https://www.maxmind.com/en/geoip2-services-and-databases)

---

**Versão:** 1.0
**Data:** 2025-12-03
**Autor:** Claude Code (Anthropic)
**Status:** ✅ Completo e pronto para implementação
**Última atualização:** 2025-12-03

---

_Este documento é confidencial e destinado exclusivamente ao uso interno da Farmace Benefícios LTDA._
