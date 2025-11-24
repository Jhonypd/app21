# Plano de Implementação: Sistema de Sessão Planning Poker

## 📋 Estado Atual do Sistema

### Banco de Dados (Schema Prisma)

✅ **Estrutura Completa:**

- `Sala`: possui `historia_atual_id` e `votos_revelados`
- `SessaoSala`: representa uma sessão ativa de planning
- `ParticipanteSessao`: participantes ativos na sessão
- `HistoriaSala`: histórias cadastradas na sala
- `HistoriaSessao`: vínculo entre história e sessão (permite votar múltiplas histórias)
- `Voto`: votos por história dentro da sessão

### Backend - Endpoints Existentes

✅ **Sala:**

- `POST /salas/entrar` - Retorna token, role, sessaoId
- `GET /salas/codigo/:codigo/sessao-ativa` - Dados da sala com sessão ativa

✅ **Sessão:**

- `POST /salas/:id/sessoes` - Criar sessão
- `POST /salas/:id/sessoes/encerrar` - Encerrar sessão
- `POST /sessoes/:id/participantes` - Adicionar participante à sessão

✅ **Votos:**

- `POST /sessoes/:id/votar` - Enviar voto
- `POST /sessoes/:id/revelar` - Revelar votos
- `POST /sessoes/:id/resetar` - Resetar votos

### Frontend - Estado Atual

✅ **Componentes:**

- `SalaPlanning` - Interface principal do planning poker
- `wizard-criar-sessao.tsx` - Modal para entrar/criar sessão
- Hooks: `useSalaAuth` - Gerencia autenticação e sessões ativas

⚠️ **Problemas Identificados:**

1. **Gestão de História Atual**: Não há forma de selecionar/trocar a história sendo votada
2. **Fluxo de Votação**: Incompleto, não conecta com backend
3. **Estado da Sessão**: Não sincroniza histórias e votos em tempo real
4. **Revelação de Votos**: Flag `votos_revelados` não está sendo usada

---

## 🎯 Objetivos do Plano

### 1. Sistema de Gestão de Histórias

- Selecionar história atual para votação
- Exibir histórias disponíveis
- Navegar entre histórias (anterior/próxima)

### 2. Sistema de Votação Funcional

- Enviar votos para história atual
- Visualizar votos dos participantes
- Revelar votos (apenas Dono/Admin)
- Resetar votos da história atual

### 3. Sincronização de Estado

- Atualizar interface quando votos são enviados
- Atualizar quando votos são revelados
- Atualizar quando história atual muda

---

## 📝 Tarefas de Implementação

### FASE 1: Backend - Gestão de História Atual

#### 1.1 Criar Endpoint para Selecionar História Atual

```
PATCH /salas/:id/historia-atual
Body: { historiaId: string }
```

**Responsabilidades:**

- Validar que usuário é Dono ou Admin
- Validar que história pertence à sala
- Atualizar `sala.historia_atual_id`
- Resetar `sala.votos_revelados` = false
- Criar `HistoriaSessao` se não existir para sessão ativa
- Retornar dados atualizados

**Arquivos a criar/modificar:**

- `src/controllers/salas/sala.controller.ts` - Adicionar método `selecionarHistoriaAtual`
- `src/services/salas/sala.service.ts` - Adicionar lógica `selecionarHistoriaAtual`
- `src/routes/salas/sala.routes.ts` - Adicionar rota PATCH

#### 1.2 Melhorar Endpoint de Sessão Ativa

Endpoint: `GET /salas/codigo/:codigo/sessao-ativa`

**Adicionar ao retorno:**

- `historia_atual`: objeto completo da história atual (id, titulo, descricao)
- `historia_atual_votada`: boolean indicando se usuário já votou
- `total_participantes`: número de participantes na sessão
- `total_votos`: número de votos na história atual

**Arquivos a modificar:**

- `src/services/salas/sala.service.ts` - Método `obterDadosSessaoAtiva`

---

### FASE 2: Frontend - Interface de Gestão de Histórias

#### 2.1 Criar Componente de Seleção de História

**Arquivo:** `app21-web/components/planning-poker/seletor-historia.tsx`

**Funcionalidades:**

- Dropdown/Modal com lista de histórias da sala
- Exibir história atual em destaque
- Botões "Anterior" / "Próxima" história
- Indicador visual: "3/10 histórias votadas"
- Apenas Dono/Admin pode trocar história

**Props:**

```typescript
interface SeletorHistoriaProps {
  historias: Historia[];
  historiaAtualId: string | null;
  podeAlterar: boolean; // role 0 ou 1
  aoSelecionar: (historiaId: string) => Promise<void>;
}
```

#### 2.2 Criar Hook de Gestão de História

**Arquivo:** `app21-web/hooks/useHistoriaAtual.ts`

```typescript
export function useHistoriaAtual(salaId: string) {
  const [selecionarHistoria] = useSelecionarHistoriaAtualMutation();

  const handleSelecionar = async (historiaId: string) => {
    await selecionarHistoria({ salaId, historiaId }).unwrap();
    // Invalida cache para recarregar dados
  };

  return { handleSelecionar };
}
```

#### 2.3 Adicionar API Mutation

**Arquivo:** `app21-web/services/api/salas-api.ts`

```typescript
selecionarHistoriaAtual: builder.mutation<ApiResponse, { salaId: string; historiaId: string }>({
  query: ({ salaId, historiaId }) => ({
    url: `/salas/${salaId}/historia-atual`,
    method: 'PATCH',
    body: { historiaId },
  }),
  invalidatesTags: ['salaPlaning'],
}),
```

---

### FASE 3: Sistema de Votação Funcional

#### 3.1 Completar Fluxo de Votação no Frontend

**Arquivo:** `app21-web/components/sala-planning.tsx`

**Modificações:**

1. Remover mock de `handleEnviarVoto`
2. Implementar chamada real:

```typescript
const handleEnviarVoto = async (valor: number) => {
  if (!sessaoId || !sala.historia_atual_id) {
    toast.error("Selecione uma história para votar");
    return;
  }

  await enviarVoto({
    sessaoId,
    historiaId: sala.historia_atual_id,
    valor,
  }).unwrap();

  toast.success("Voto enviado!");
};
```

3. Desabilitar botões de voto se:

   - Não há história atual
   - Votos já revelados
   - Usuário já votou

4. Exibir indicador: "Aguardando votos: 3/8 participantes votaram"

#### 3.2 Implementar Revelar Votos

**Modificações em:** `app21-web/components/sala-planning.tsx`

```typescript
const handleRevelarVotos = async () => {
  if (!sessaoId) return;

  await revelarVotos(sessaoId).unwrap();
  toast.success("Votos revelados!");
};
```

**Comportamento:**

- Botão "Revelar Votos" apenas para Dono/Admin
- Desabilitar se votos já revelados
- Após revelar, exibir votos de todos

#### 3.3 Implementar Resetar Votos

**Modificações em:** `app21-web/components/sala-planning.tsx`

```typescript
const handleResetarVotos = async () => {
  if (!sessaoId) return;

  await resetarVotos(sessaoId).unwrap();
  toast.success("Votos resetados! Podem votar novamente.");
};
```

**Comportamento:**

- Botão "Resetar Votos" apenas para Dono/Admin
- Limpa votos da história atual
- Esconde votos novamente (votos_revelados = false)

---

### FASE 4: Melhorias de UX e Validações

#### 4.1 Indicadores Visuais

- Badge no card do participante: "Votou ✓" ou "Aguardando..."
- Barra de progresso: "5/8 participantes votaram"
- Destaque visual na história atual

#### 4.2 Validações e Mensagens

- Não permitir votar sem história selecionada
- Não permitir trocar história se há votos não revelados (opcional)
- Mensagem clara quando sessão não está ativa

#### 4.3 Estado de Carregamento

- Skeleton/Loading ao enviar voto
- Loading ao revelar votos
- Loading ao trocar história

---

### FASE 5: WebSocket (Futuro - Opcional)

#### 5.1 Eventos em Tempo Real

- `historia_alterada`: Quando Dono/Admin troca história
- `voto_recebido`: Quando alguém vota (sem revelar valor)
- `votos_revelados`: Quando Dono/Admin revela votos
- `votos_resetados`: Quando votos são limpos

#### 5.2 Implementação

- Backend: Socket.IO
- Frontend: Hook `useSocket` com auto-reconnect
- Sincronizar sem recarregar página

---

## 🔄 Ordem de Execução Recomendada

### Sprint 1: História Atual (2-3 horas)

1. Backend: Endpoint PATCH /salas/:id/historia-atual
2. Frontend: Mutation e Hook
3. Frontend: Componente SeletorHistoria
4. Integração e testes

### Sprint 2: Votação (2-3 horas)

1. Frontend: Implementar handleEnviarVoto real
2. Frontend: Implementar handleRevelarVotos
3. Frontend: Implementar handleResetarVotos
4. Adicionar validações e desabilitações
5. Testes de fluxo completo

### Sprint 3: UX e Polimento (1-2 horas)

1. Adicionar indicadores visuais
2. Melhorar mensagens de erro
3. Adicionar loading states
4. Testes de usabilidade

### Sprint 4: WebSocket (Futuro)

1. Configurar Socket.IO no backend
2. Criar hook useSocket no frontend
3. Implementar eventos
4. Testes de sincronização

---

## 📊 Critérios de Sucesso

### Funcional

- ✅ Dono/Admin pode selecionar história atual
- ✅ Participantes podem votar na história atual
- ✅ Dono/Admin pode revelar votos
- ✅ Dono/Admin pode resetar votos
- ✅ Interface atualiza após cada ação

### UX

- ✅ Indicadores claros de estado (votou, aguardando, revelado)
- ✅ Botões desabilitados quando ação não disponível
- ✅ Mensagens de erro/sucesso claras
- ✅ Loading states em operações assíncronas

### Técnico

- ✅ Cache invalidado corretamente (RTK Query)
- ✅ Sem vazamento de memória
- ✅ Código tipado (TypeScript)
- ✅ Tratamento de erros adequado

---

## 🚀 Começar Implementação

**Próximo Passo:** Implementar Sprint 1 - Sistema de História Atual

**Comando para iniciar:**

```bash
# Criar endpoint backend
# Arquivo: src/controllers/salas/sala.controller.ts
```

Aguardo sua confirmação para começar! 🎯
