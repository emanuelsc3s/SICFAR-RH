# Mapeamento de Ícones por Benefício

## 📋 Visão Geral

Este documento especifica o mapeamento entre os benefícios disponíveis no sistema SICFAR-RH e seus respectivos ícones, além de definir a estratégia de persistência na coluna `icone` da tabela `tbbeneficio` no Supabase.

---

## 🎯 Mapeamento Atual de Ícones

### Tabela de Benefícios e Ícones

| ID do Benefício | Nome do Benefício | Ícone Lucide | Componente React | Descrição Visual |
|-----------------|-------------------|--------------|------------------|------------------|
| `vale-gas` | Vale Gás | `flame` | `Flame` | Chama de fogo |
| `vale-farmacia-santa-cecilia` | Vale Farmácia Santa Cecília | `pill` | `Pill` | Pílula/medicamento |
| `vale-farmacia-gentil` | Vale Farmácia Gentil | `pill` | `Pill` | Pílula/medicamento |
| `vale-combustivel` | Vale Combustível | `fuel` | `Fuel` | Bomba de combustível |
| `plano-saude` | Plano de Saúde | `heart` | `Heart` | Coração |
| `vale-transporte` | Vale Transporte | `bus` | `Bus` | Ônibus |

---

## 💾 Estratégia de Persistência

### Estrutura da Tabela `tbbeneficio`

```sql
-- Coluna existente na tabela tbbeneficio
icone character varying(50)
```

**Limitação:** Máximo de 50 caracteres

### Formato Recomendado: **Nome do Ícone Lucide**

**Decisão:** Armazenar o nome do ícone da biblioteca Lucide React em formato **kebab-case** (minúsculas com hífen).

**Justificativa:**
- ✅ Compatível com a limitação de 50 caracteres
- ✅ Formato padrão da biblioteca Lucide React
- ✅ Fácil mapeamento direto no frontend
- ✅ Legível e autodescritivo
- ✅ Permite expansão futura com novos ícones

---

## 📝 Valores para Inserção no Banco de Dados

### Script SQL de Exemplo

```sql
-- Atualizar coluna icone para cada benefício existente
UPDATE tbbeneficio SET icone = 'flame' WHERE id_beneficio = 'vale-gas';
UPDATE tbbeneficio SET icone = 'pill' WHERE id_beneficio = 'vale-farmacia-santa-cecilia';
UPDATE tbbeneficio SET icone = 'pill' WHERE id_beneficio = 'vale-farmacia-gentil';
UPDATE tbbeneficio SET icone = 'fuel' WHERE id_beneficio = 'vale-combustivel';
UPDATE tbbeneficio SET icone = 'heart' WHERE id_beneficio = 'plano-saude';
UPDATE tbbeneficio SET icone = 'bus' WHERE id_beneficio = 'vale-transporte';
```

### Tabela de Referência Rápida

| Benefício | Valor para `icone` |
|-----------|-------------------|
| Vale Gás | `flame` |
| Vale Farmácia Santa Cecília | `pill` |
| Vale Farmácia Gentil | `pill` |
| Vale Combustível | `fuel` |
| Plano de Saúde | `heart` |
| Vale Transporte | `bus` |

---

## 🔧 Implementação no Frontend

### Mapeamento Dinâmico de Ícones

```typescript
import { Flame, Pill, Fuel, Heart, Bus, LucideIcon } from 'lucide-react';

// Mapa de ícones disponíveis
const iconMap: Record<string, LucideIcon> = {
  'flame': Flame,
  'pill': Pill,
  'fuel': Fuel,
  'heart': Heart,
  'bus': Bus,
};

// Função para obter o componente de ícone
const getIconComponent = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Pill; // Ícone padrão caso não encontre
};

// Uso no componente
interface Beneficio {
  id: string;
  nome: string;
  icone: string; // Valor vindo do banco: 'flame', 'pill', etc.
}

const BeneficioCard = ({ beneficio }: { beneficio: Beneficio }) => {
  const IconComponent = getIconComponent(beneficio.icone);
  
  return (
    <div className="flex items-center">
      <IconComponent className="w-6 h-6 text-gray-600" />
      <span>{beneficio.nome}</span>
    </div>
  );
};
```

---

## 📚 Ícones Lucide Disponíveis

### Ícones Atualmente Utilizados

- **`flame`** - Chama (Vale Gás)
- **`pill`** - Pílula (Farmácias)
- **`fuel`** - Combustível (Vale Combustível)
- **`heart`** - Coração (Plano de Saúde)
- **`bus`** - Ônibus (Vale Transporte)

### Sugestões de Ícones para Futuros Benefícios

| Tipo de Benefício | Ícone Sugerido | Nome Lucide |
|-------------------|----------------|-------------|
| Vale Alimentação | `utensils` | Talheres |
| Vale Refeição | `coffee` | Café/Refeição |
| Auxílio Educação | `graduation-cap` | Capelo |
| Seguro de Vida | `shield` | Escudo |
| Auxílio Creche | `baby` | Bebê |
| Auxílio Home Office | `home` | Casa |
| Plano Odontológico | `smile` | Sorriso |
| Academia/Fitness | `dumbbell` | Haltere |

---

## ⚠️ Considerações Importantes

### Validação de Dados

1. **Tamanho máximo:** 50 caracteres (todos os ícones Lucide respeitam esse limite)
2. **Formato:** kebab-case (ex: `graduation-cap`, não `GraduationCap`)
3. **Valor padrão:** Recomenda-se usar `pill` como ícone padrão caso o valor seja nulo

### Migração de Dados Existentes

Se a coluna `icone` já possui dados em formato diferente, será necessário:

1. Fazer backup da tabela
2. Executar script de migração para converter valores antigos
3. Validar a conversão
4. Atualizar o frontend para usar o novo formato

---

## 🔄 Processo de Adição de Novos Benefícios

1. **Escolher o ícone** da biblioteca Lucide React
2. **Inserir no banco** o nome do ícone em kebab-case na coluna `icone`
3. **Atualizar o mapa** `iconMap` no frontend (se necessário)
4. **Testar** a renderização do ícone na interface

---

## 📖 Referências

- **Biblioteca Lucide React:** https://lucide.dev/icons/
- **Documentação Lucide:** https://lucide.dev/guide/
- **Arquivo fonte:** `/src/pages/SolicitarBeneficio.tsx` (linhas 130-173)

