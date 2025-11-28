# 🧪 Guia de Teste - Funcionalidade de Rede Social de Aniversariantes

## 📋 Pré-requisitos

1. ✅ Estar logado no sistema
2. ✅ Ter dados de colaborador no localStorage
3. ✅ Navegador com suporte a localStorage
4. ✅ Console do navegador aberto (F12) para debug

---

## 🎯 Cenários de Teste

### Teste 1: Abrir Modal de Aniversariante

**Objetivo:** Verificar se o modal abre corretamente ao clicar em um aniversariante.

**Passos:**
1. Acesse a página inicial (`/`)
2. Localize o card "Aniversariantes do Mês" na sidebar
3. Clique em qualquer aniversariante da lista
4. Verifique se o modal abre

**Resultado Esperado:**
- ✅ Modal abre com animação suave
- ✅ Informações do aniversariante são exibidas:
  - Nome completo
  - Departamento
  - Data de aniversário
  - Tempo de empresa
  - Data de admissão
- ✅ Seção de curtidas aparece (0 curtidas inicialmente)
- ✅ Seção de comentários aparece vazia
- ✅ Formulário de comentário está visível

---

### Teste 2: Curtir Aniversariante

**Objetivo:** Verificar funcionalidade de curtir/descurtir.

**Passos:**
1. Abra o modal de um aniversariante
2. Observe o contador de curtidas (deve estar em 0)
3. Clique no botão "Parabenizar"
4. Aguarde o processamento
5. Verifique o contador
6. Clique novamente no botão "Curtido"
7. Verifique o contador novamente

**Resultado Esperado:**
- ✅ Ao clicar em "Parabenizar":
  - Contador aumenta para 1
  - Botão muda para "Curtido" (variant default)
  - Toast de sucesso aparece: "Parabéns enviado com sucesso!"
  - Ícone de coração fica preenchido
- ✅ Ao clicar em "Curtido":
  - Contador volta para 0
  - Botão muda para "Parabenizar" (variant outline)
  - Toast aparece: "Curtida removida"
  - Ícone de coração fica vazio

**Verificar localStorage:**
```javascript
// Abrir console e executar:
JSON.parse(localStorage.getItem('birthday_likes_2025'))
// Deve mostrar array com curtida quando curtido
// Deve mostrar array vazio quando descurtido
```

---

### Teste 3: Adicionar Comentário

**Objetivo:** Verificar funcionalidade de adicionar comentários.

**Passos:**
1. Abra o modal de um aniversariante
2. Role até a seção de comentários
3. Digite uma mensagem no campo de texto (ex: "Parabéns! Muita saúde!")
4. Observe o contador de caracteres (X/500)
5. Clique em "Enviar Felicitação"
6. Aguarde o processamento

**Resultado Esperado:**
- ✅ Contador de caracteres atualiza conforme digita
- ✅ Botão "Enviar Felicitação" fica habilitado quando há texto
- ✅ Ao enviar:
  - Toast de sucesso: "Felicitação enviada!"
  - Comentário aparece no topo da lista
  - Formulário é limpo automaticamente
  - Contador de felicitações aumenta
  - Avatar e nome do autor aparecem
  - Data "Agora" ou "há X minutos" aparece
  - Botão de lixeira aparece (pois é seu comentário)

**Verificar localStorage:**
```javascript
JSON.parse(localStorage.getItem('birthday_comments_2025'))
// Deve mostrar array com o comentário adicionado
```

---

### Teste 4: Remover Comentário

**Objetivo:** Verificar funcionalidade de remover próprio comentário.

**Passos:**
1. Adicione um comentário (seguir Teste 3)
2. Localize o comentário na lista
3. Clique no ícone de lixeira (🗑️)
4. Aguarde o processamento

**Resultado Esperado:**
- ✅ Comentário é removido da lista
- ✅ Toast de sucesso: "Comentário removido"
- ✅ Contador de felicitações diminui
- ✅ Se era o único comentário, mensagem "Seja o primeiro a parabenizar! 🎉" aparece

**Verificar localStorage:**
```javascript
JSON.parse(localStorage.getItem('birthday_comments_2025'))
// Comentário deve ter sido removido do array
```

---

### Teste 5: Validações de Comentário

**Objetivo:** Verificar validações do formulário de comentário.

#### 5.1 Comentário Vazio
**Passos:**
1. Abra o modal
2. Deixe o campo de comentário vazio
3. Tente clicar em "Enviar Felicitação"

**Resultado Esperado:**
- ✅ Botão está desabilitado (não é possível clicar)

#### 5.2 Comentário Muito Longo
**Passos:**
1. Abra o modal
2. Digite mais de 500 caracteres
3. Observe o contador

**Resultado Esperado:**
- ✅ Campo limita em 500 caracteres (não permite digitar mais)
- ✅ Contador fica vermelho quando próximo do limite (>450 chars)

---

### Teste 6: Persistência de Dados

**Objetivo:** Verificar se dados persistem após fechar modal e recarregar página.

**Passos:**
1. Curta um aniversariante
2. Adicione um comentário
3. Feche o modal (clique no X ou fora do modal)
4. Reabra o modal do mesmo aniversariante
5. Verifique curtidas e comentários
6. Recarregue a página (F5)
7. Abra o modal novamente

**Resultado Esperado:**
- ✅ Após fechar e reabrir: dados permanecem
- ✅ Após recarregar página: dados permanecem
- ✅ Curtida ainda está marcada
- ✅ Comentário ainda aparece na lista

---

### Teste 7: Múltiplos Aniversariantes

**Objetivo:** Verificar isolamento de dados entre aniversariantes.

**Passos:**
1. Curta o primeiro aniversariante
2. Adicione comentário no primeiro
3. Feche o modal
4. Abra o modal do segundo aniversariante
5. Verifique curtidas e comentários

**Resultado Esperado:**
- ✅ Segundo aniversariante tem 0 curtidas
- ✅ Segundo aniversariante não tem comentários
- ✅ Dados são isolados por matrícula

---

### Teste 8: Usuário Não Logado

**Objetivo:** Verificar comportamento quando usuário não está logado.

**Passos:**
1. Abra o console do navegador
2. Execute: `localStorage.removeItem('colaborador')`
3. Recarregue a página
4. Abra o modal de um aniversariante
5. Tente curtir
6. Tente comentar

**Resultado Esperado:**
- ✅ Ao tentar curtir: Toast de erro "Você precisa estar logado para parabenizar"
- ✅ Ao tentar comentar: Toast de erro "Você precisa estar logado para comentar"
- ✅ Ações não são executadas

**Restaurar login:**
```javascript
// Fazer login novamente pela página de login
```

---

### Teste 9: Acessibilidade

**Objetivo:** Verificar navegação por teclado.

**Passos:**
1. Use Tab para navegar pelos cards de aniversariantes
2. Pressione Enter em um card
3. Use Tab para navegar pelos elementos do modal
4. Pressione Enter no botão "Parabenizar"
5. Use Tab para chegar ao campo de comentário
6. Digite e pressione Tab até o botão "Enviar"
7. Pressione Enter

**Resultado Esperado:**
- ✅ Todos os elementos são acessíveis via teclado
- ✅ Foco visual é claro
- ✅ Enter/Space ativam botões
- ✅ Esc fecha o modal

---

### Teste 10: Responsividade

**Objetivo:** Verificar layout em diferentes tamanhos de tela.

**Passos:**
1. Abra o DevTools (F12)
2. Ative o modo responsivo (Ctrl+Shift+M)
3. Teste em diferentes resoluções:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

**Resultado Esperado:**
- ✅ Modal se adapta ao tamanho da tela
- ✅ Textos não quebram de forma estranha
- ✅ Botões são clicáveis
- ✅ ScrollArea funciona em mobile

---

## 🐛 Problemas Comuns e Soluções

### Problema: "Cannot read property 'matricula' of null"
**Causa:** Usuário não está logado
**Solução:** Fazer login novamente

### Problema: Curtidas/comentários não aparecem
**Causa:** localStorage vazio ou corrompido
**Solução:** 
```javascript
// Limpar e reiniciar
localStorage.removeItem('birthday_likes_2025');
localStorage.removeItem('birthday_comments_2025');
```

### Problema: Modal não abre
**Causa:** Erro de importação ou componente não renderizado
**Solução:** Verificar console para erros de JavaScript

### Problema: Toast não aparece
**Causa:** Toaster não está configurado no App
**Solução:** Verificar se `<Toaster />` está no layout principal

---

## ✅ Checklist Final

Antes de considerar os testes concluídos, verifique:

- [ ] Modal abre e fecha corretamente
- [ ] Curtir/descurtir funciona
- [ ] Adicionar comentário funciona
- [ ] Remover comentário funciona
- [ ] Validações de formulário funcionam
- [ ] Dados persistem no localStorage
- [ ] Dados são isolados por aniversariante
- [ ] Toasts aparecem corretamente
- [ ] Navegação por teclado funciona
- [ ] Layout responsivo funciona
- [ ] Sem erros no console
- [ ] Performance é aceitável

---

## 📊 Dados de Teste

### Mensagens de Teste Sugeridas

```
"Parabéns! Muita saúde e sucesso!"
"Feliz aniversário! Que Deus abençoe sempre!"
"Parabéns pelo seu dia! Muitas felicidades!"
"Felicidades! Que este novo ano seja repleto de realizações!"
```

### Teste de Limite de Caracteres

```
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
```
(Exatamente 500 caracteres)

