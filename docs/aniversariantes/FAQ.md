# ❓ FAQ - Perguntas Frequentes

## 📚 Índice

1. [Geral](#geral)
2. [Funcionalidades](#funcionalidades)
3. [Problemas Técnicos](#problemas-técnicos)
4. [Desenvolvimento](#desenvolvimento)
5. [Migração Supabase](#migração-supabase)

---

## 🌐 Geral

### O que é esta funcionalidade?
É um sistema de rede social integrado ao SICFAR-RH que permite aos colaboradores interagir com aniversariantes através de curtidas e comentários/felicitações.

### Por que usar localStorage ao invés de banco de dados?
**Fase 1 (atual):** localStorage permite desenvolvimento e testes rápidos sem necessidade de configuração de backend.

**Fase 2 (planejada):** Migração para Supabase trará persistência em nuvem, sincronização entre dispositivos e escalabilidade.

### Os dados são seguros?
**Fase 1:** Dados armazenados localmente no navegador. Não são compartilhados entre dispositivos.

**Fase 2:** Com Supabase, teremos Row Level Security (RLS), autenticação JWT e backup em nuvem.

### Posso usar em produção agora?
Sim, mas com limitações:
- ✅ Funciona perfeitamente para testes e uso local
- ⚠️ Dados não sincronizam entre dispositivos
- ⚠️ Dados podem ser perdidos se localStorage for limpo
- 🔄 Recomendado migrar para Supabase antes de uso em larga escala

---

## 🎯 Funcionalidades

### Como curtir um aniversariante?
1. Clique no card do aniversariante
2. No modal, clique em "Parabenizar"
3. O contador aumenta e o botão muda para "Curtido"

### Posso descurtir?
Sim! Clique novamente no botão "Curtido" para remover sua curtida.

### Como adicionar um comentário?
1. Abra o modal do aniversariante
2. Role até a seção de comentários
3. Digite sua mensagem (máx. 500 caracteres)
4. Clique em "Enviar Felicitação"

### Posso editar um comentário?
**Fase 1:** Não. Você pode apenas remover e adicionar novamente.

**Fase 2:** Planejado adicionar funcionalidade de edição.

### Posso remover comentários de outras pessoas?
Não. Você só pode remover seus próprios comentários por questões de segurança.

### Quantos caracteres posso usar em um comentário?
Máximo de 500 caracteres. O contador mostra quantos caracteres você já usou.

### Os dados persistem após fechar o navegador?
Sim! Os dados ficam salvos no localStorage e permanecem mesmo após fechar e reabrir o navegador.

### Posso ver quem curtiu?
**Fase 1:** Não. Apenas o contador total é exibido.

**Fase 2:** Planejado adicionar lista de pessoas que curtiram.

---

## 🐛 Problemas Técnicos

### O modal não abre quando clico no aniversariante
**Possíveis causas:**
1. Erro de JavaScript no console
2. Componente não foi importado corretamente
3. Estado não está sendo gerenciado

**Solução:**
1. Abra o console (F12) e verifique erros
2. Verifique se `BirthdayDetailModal` está importado em `BirthdayCard.tsx`
3. Limpe o cache e recarregue a página

### Minhas curtidas/comentários desapareceram
**Possíveis causas:**
1. localStorage foi limpo manualmente
2. Navegador em modo privado/anônimo
3. Extensão de navegador limpou dados

**Solução:**
1. Não use modo privado/anônimo
2. Desative extensões que limpam dados automaticamente
3. **Fase 2:** Migrar para Supabase resolve este problema

### Erro: "Você precisa estar logado"
**Causa:** Dados do usuário não estão no localStorage.

**Solução:**
1. Faça login novamente no sistema
2. Verifique se `localStorage.getItem('colaborador')` retorna dados válidos

### O contador de curtidas está errado
**Possíveis causas:**
1. Dados corrompidos no localStorage
2. Múltiplas curtidas do mesmo usuário (bug)

**Solução:**
```javascript
// Limpar e reiniciar
localStorage.removeItem('birthday_likes_2025');
location.reload();
```

### Comentário não aparece após enviar
**Possíveis causas:**
1. Mensagem vazia
2. Erro de validação
3. Usuário não logado

**Solução:**
1. Verifique se a mensagem tem conteúdo
2. Verifique o console para erros
3. Confirme que está logado

---

## 💻 Desenvolvimento

### Como adicionar um novo campo ao comentário?
1. Atualizar interface em `src/types/aniversariante.ts`
2. Atualizar método `addComment()` em `src/services/birthdayStorage.ts`
3. Atualizar componente `BirthdayCommentItem.tsx` para exibir o campo

### Como mudar o limite de caracteres?
Editar `src/config/birthday.ts`:
```typescript
export const BIRTHDAY_CONFIG = {
  MAX_COMMENT_LENGTH: 1000, // Alterar aqui
  // ...
}
```

### Como adicionar novas validações?
Editar `src/utils/birthdayHelpers.ts`:
```typescript
export function validateMessage(message: string) {
  // Adicionar suas validações aqui
  if (message.includes('palavra_proibida')) {
    return { valid: false, error: 'Conteúdo inapropriado' };
  }
  // ...
}
```

### Como customizar as mensagens de toast?
Editar `src/config/birthday.ts`:
```typescript
export const BIRTHDAY_MESSAGES = {
  LIKE_SUCCESS: 'Sua mensagem customizada!',
  // ...
}
```

### Como adicionar reações além de curtida?
**Fase 1:** Requer modificações significativas na estrutura de dados.

**Fase 2:** Mais fácil implementar com Supabase usando tabela de reações.

### Como integrar em outra página?
Veja exemplos em `docs/aniversariantes/EXEMPLOS-USO.md`, seção "Integração em Outras Páginas".

---

## 🗄️ Migração Supabase

### Quando devo migrar para Supabase?
Migre quando:
- ✅ Precisar sincronizar dados entre dispositivos
- ✅ Tiver mais de 50 usuários ativos
- ✅ Precisar de backup em nuvem
- ✅ Quiser notificações em tempo real

### Vou perder os dados do localStorage?
Não! O guia de migração (`05-guia-migracao.md`) inclui script para migrar dados existentes.

### Quanto tempo leva a migração?
Estimativa: 15-20 horas de desenvolvimento + testes.

### Preciso mudar o código dos componentes?
Não! A arquitetura foi projetada para trocar apenas a camada de storage. Os componentes e hooks permanecem os mesmos.

### Como funciona a migração?
1. Criar tabelas no Supabase
2. Criar `supabaseStorage.ts` com mesma interface de `birthdayStorage.ts`
3. Atualizar hooks para usar novo storage
4. Migrar dados existentes
5. Testar extensivamente

### Posso usar ambos (localStorage + Supabase)?
Sim! Você pode implementar um sistema híbrido:
- Supabase como fonte principal
- localStorage como cache offline

### Qual o custo do Supabase?
- **Free tier:** Até 500MB de banco de dados, 1GB de storage
- **Pro:** $25/mês com recursos expandidos
- Veja: https://supabase.com/pricing

---

## 🔧 Troubleshooting Avançado

### Como debugar problemas de estado?
```javascript
// Adicionar no componente
useEffect(() => {
  console.log('Estado atual:', { totalLikes, isLiked, comments });
}, [totalLikes, isLiked, comments]);
```

### Como verificar dados no localStorage?
```javascript
// Console do navegador
const likes = JSON.parse(localStorage.getItem('birthday_likes_2025'));
const comments = JSON.parse(localStorage.getItem('birthday_comments_2025'));
console.table(likes);
console.table(comments);
```

### Como resetar tudo?
```javascript
// Limpar todos os dados de aniversariantes
Object.keys(localStorage)
  .filter(key => key.startsWith('birthday_'))
  .forEach(key => localStorage.removeItem(key));
location.reload();
```

### Como simular múltiplos usuários?
1. Abra o navegador em modo anônimo
2. Faça login com outro usuário
3. Interaja com os aniversariantes
4. Compare dados entre as janelas

---

## 📞 Suporte

### Onde encontro mais informações?
- 📖 `README.md` - Visão geral
- 🧪 `GUIA-TESTE.md` - Testes completos
- 💡 `EXEMPLOS-USO.md` - Exemplos de código
- 📊 `RESUMO-EXECUTIVO.md` - Resumo do projeto

### Como reportar um bug?
1. Verifique se o bug já não está documentado
2. Reproduza o bug de forma consistente
3. Anote os passos para reproduzir
4. Verifique o console para erros
5. Documente e reporte

### Como sugerir melhorias?
Consulte o roadmap em `RESUMO-EXECUTIVO.md` e veja se sua sugestão já está planejada.

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0

