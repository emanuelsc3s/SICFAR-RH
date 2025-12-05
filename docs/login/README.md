# 🔐 Documentação - Sistema de Autenticação e Permissões

Bem-vindo à documentação completa do sistema de autenticação e controle de permissões do SICFAR-RH.

---

## 📚 Documentos Disponíveis

### **1. Sistema de Permissões Dinâmicas**
📄 [`sistema-permissoes-dinamicas.md`](./sistema-permissoes-dinamicas.md)

**Conteúdo:**
- Visão geral da arquitetura
- Estrutura do banco de dados (tabelas, índices, constraints)
- Dados iniciais (perfis, recursos, permissões padrão)
- Funções PostgreSQL para verificação de permissões
- Políticas RLS (Row Level Security) dinâmicas
- Exemplos de aplicação em tabelas principais

**Quando usar:**
- Para entender a arquitetura do sistema
- Para criar novas tabelas no banco de dados
- Para configurar políticas RLS
- Para adicionar novos perfis ou recursos

---

### **2. Implementação Frontend**
📄 [`sistema-permissoes-frontend.md`](./sistema-permissoes-frontend.md)

**Conteúdo:**
- Hook `usePermissoes` - gerenciamento de permissões no React
- Componente `ProtectedByPermission` - proteção de elementos UI
- Interface administrativa `GerenciarPermissoes`
- Exemplos de uso em componentes

**Quando usar:**
- Para implementar verificação de permissões em componentes React
- Para proteger rotas e elementos da interface
- Para criar a interface de gerenciamento de permissões
- Para entender como usar o hook de permissões

---

### **3. Exemplos Práticos**
📄 [`sistema-permissoes-exemplos.md`](./sistema-permissoes-exemplos.md)

**Conteúdo:**
- Exemplos de uso no frontend (rotas, menus, formulários, tabelas)
- Queries SQL úteis (verificação, gerenciamento, auditoria)
- Casos de uso comuns (colaborador, RH, admin, parceiro)
- Troubleshooting e soluções de problemas
- Checklist de implementação

**Quando usar:**
- Para ver exemplos práticos de implementação
- Para resolver problemas comuns
- Para entender fluxos de trabalho específicos
- Para copiar código de exemplo

---

## 🎯 Guia Rápido de Início

### **Para Desenvolvedores Frontend**

1. **Leia primeiro:**
   - [`sistema-permissoes-frontend.md`](./sistema-permissoes-frontend.md) - Seção "Hook usePermissoes"
   - [`sistema-permissoes-exemplos.md`](./sistema-permissoes-exemplos.md) - Seção "Exemplos de Uso no Frontend"

2. **Implemente:**
   - Crie o hook `usePermissoes` em `src/hooks/usePermissoes.ts`
   - Crie o componente `ProtectedByPermission` em `src/components/ProtectedByPermission.tsx`
   - Use nos seus componentes conforme exemplos

3. **Teste:**
   - Faça login com diferentes perfis
   - Verifique se elementos aparecem/desaparecem corretamente

---

### **Para Desenvolvedores Backend/Database**

1. **Leia primeiro:**
   - [`sistema-permissoes-dinamicas.md`](./sistema-permissoes-dinamicas.md) - Seções completas

2. **Implemente:**
   - Execute scripts SQL para criar tabelas
   - Insira dados iniciais (perfis, recursos, permissões)
   - Crie funções PostgreSQL
   - Configure políticas RLS

3. **Teste:**
   - Execute queries de teste no SQL Editor
   - Verifique se RLS está funcionando corretamente
   - Teste com diferentes usuários

---

### **Para Administradores do Sistema**

1. **Leia primeiro:**
   - [`sistema-permissoes-frontend.md`](./sistema-permissoes-frontend.md) - Seção "Interface de Gerenciamento"
   - [`sistema-permissoes-exemplos.md`](./sistema-permissoes-exemplos.md) - Seção "Casos de Uso Comuns"

2. **Use:**
   - Acesse a página de gerenciamento de permissões
   - Configure permissões para cada perfil
   - Crie novos perfis conforme necessário

3. **Monitore:**
   - Use queries de auditoria para verificar configurações
   - Revise permissões periodicamente

---

## 🏗️ Arquitetura Resumida

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│                                                          │
│  ┌────────────────┐      ┌──────────────────┐          │
│  │ usePermissoes  │──────│ ProtectedBy      │          │
│  │ Hook           │      │ Permission       │          │
│  └────────┬───────┘      └────────┬─────────┘          │
│           │                       │                     │
│           └───────────┬───────────┘                     │
│                       │                                 │
└───────────────────────┼─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              SUPABASE / POSTGRESQL                       │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Funções PostgreSQL                              │  │
│  │  • usuario_tem_permissao(user_id, recurso)       │  │
│  │  • usuario_permissoes(user_id)                   │  │
│  │  • perfil_permissoes(perfil_id)                  │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────▼─────────────────────────────────┐  │
│  │  Políticas RLS (Row Level Security)              │  │
│  │  • Aplicam permissões automaticamente            │  │
│  │  • Filtram dados baseado em permissões           │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────▼─────────────────────────────────┐  │
│  │  Tabelas                                         │  │
│  │  • tbperfil (Perfis: Admin, RH, Colaborador)    │  │
│  │  • tbrecurso (Recursos/Funcionalidades)         │  │
│  │  • tbperfil_recurso (Permissões N:N)            │  │
│  │  • tbusuario (Usuários com perfil_id)           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Conceitos Principais

### **Perfil**
Grupo de usuários com permissões similares.

**Exemplos:** Admin, RH, Parceiro, Colaborador

### **Recurso**
Funcionalidade específica do sistema que pode ser controlada.

**Formato:** `{entidade}.{acao}`

**Exemplos:** 
- `funcionarios.visualizar_todos`
- `vouchers.criar`
- `config.permissoes`

### **Permissão**
Relacionamento entre um Perfil e um Recurso, indicando que aquele perfil pode acessar aquela funcionalidade.

**Exemplo:** Perfil "RH" tem permissão para recurso "vouchers.aprovar"

---

## 🔒 Segurança

### **Princípios de Segurança**

1. **Defense in Depth (Defesa em Profundidade)**
   - Verificação no frontend (UX)
   - Verificação no backend (RLS)
   - Nunca confiar apenas no frontend

2. **Least Privilege (Menor Privilégio)**
   - Usuários têm apenas as permissões necessárias
   - Perfis começam sem permissões
   - Permissões são adicionadas explicitamente

3. **Separation of Duties (Separação de Funções)**
   - Diferentes perfis para diferentes responsabilidades
   - Admin não faz trabalho operacional
   - Colaborador não tem acesso administrativo

### **Boas Práticas**

✅ **FAÇA:**
- Use RLS em todas as tabelas sensíveis
- Verifique permissões no frontend E backend
- Use funções `SECURITY DEFINER` para verificações
- Mantenha permissões granulares
- Documente novos recursos criados

❌ **NÃO FAÇA:**
- Confiar apenas em verificações frontend
- Expor secret key no frontend
- Dar permissões excessivas
- Desabilitar RLS em produção
- Hardcodar verificações de perfil

---

## 📖 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript](https://www.typescriptlang.org/docs/)

---

## 🆘 Suporte

**Problemas comuns?** Consulte a seção "Troubleshooting" em [`sistema-permissoes-exemplos.md`](./sistema-permissoes-exemplos.md)

**Dúvidas sobre implementação?** Veja os exemplos práticos em [`sistema-permissoes-exemplos.md`](./sistema-permissoes-exemplos.md)

**Precisa entender a arquitetura?** Leia [`sistema-permissoes-dinamicas.md`](./sistema-permissoes-dinamicas.md)

---

**Última atualização:** 2025-12-05

