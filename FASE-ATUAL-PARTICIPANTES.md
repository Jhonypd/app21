# 📋 Fase Atual: Sistema de Gerenciamento de Participantes

**Data de Atualização:** 21/11/2025  
**Status:** Fase 1 - 95% Completo (Dialog Participantes implementado)  
**Próxima Ação:** Implementar persistência de mudanças no handleSalvar

---

## 🎯 Visão Geral

Sistema completo de gerenciamento de participantes em salas de Planning Poker, com hierarquia de 4 níveis de acesso e controle de permissões.

**Contexto:** Anteriormente, o dialog editar sala tinha aba Participantes vazia. Agora está **TOTALMENTE implementada** com gerenciamento local de participantes (add/remove/promote/demote), aguardando apenas persistência final via API.

### 🔐 Hierarquia de Roles

| Role          | Código | Descrição         | Permissões                                     |
| ------------- | ------ | ----------------- | ---------------------------------------------- |
| **Dono**      | 0      | Criador da sala   | Todas as permissões, incluir promover/rebaixar |
| **Admin**     | 1      | Administrador     | Gerenciar sessões, adicionar membros           |
| **Membro**    | 2      | Participante fixo | Participar de sessões, votar                   |
| **Visitante** | 3      | Acesso temporário | Apenas durante sessão ativa                    |

---

## ✅ O QUE FOI ENTREGUE

### 🔧 Backend (100% Completo)

#### **1. Service Layer** (`participante-sala.service.ts`)

- ✅ `adicionarParticipante(sala_id, pessoa_id_solicitante, pessoa_id_adicionar, role)`

  - Validação: Dono pode adicionar Admin (1) ou Membro (2)
  - Validação: Admin pode adicionar apenas Membro (2)
  - Verifica se participante já existe
  - Retorna erro se sem permissão

- ✅ `removerParticipante(sala_id, pessoa_id_solicitante, pessoa_id_remover)`
  - Validação: Não pode remover o Dono
  - Validação: Admin não pode remover outro Admin
  - Validação: Apenas Dono/Admin podem remover
- ✅ `alterarRoleParticipante(sala_id, pessoa_id_solicitante, pessoa_id_alterar, novo_role)`
  - Validação: **Apenas Dono** pode alterar roles
  - Não pode alterar role do próprio Dono
  - Permite promover Membro → Admin ou rebaixar Admin → Membro

#### **2. Controller Layer** (`sala.controller.ts`)

- ✅ `adicionarParticipante()` - POST `/salas/:id/participantes/adicionar`
- ✅ `removerParticipante()` - DELETE `/salas/:id/participantes/:pessoaId/remover`
- ✅ `alterarRoleParticipante()` - PATCH `/salas/:id/participantes/:pessoaId/role`

#### **3. Routes** (`sala.routes.ts`)

- ✅ Três rotas configuradas sem necessidade de token de sala
- ✅ Middleware de autenticação aplicado

#### **4. Repository Layer** (`participante-sala.repository.ts`)

- ✅ `alterarRole(sala_id, pessoa_id, role)` - Atualização de role no banco

---

### 🎨 Frontend (95% Completo)

#### **1. Componente TabsCustom** (`tabs.tsx`)

- ✅ Refatorado com suporte a ícones
- ✅ Controle externo de estado (`value`/`onValueChange`)
- ✅ Estilização Design System (gradiente purple/pink no ativo)
- ✅ Classes customizáveis (`className`, `tabsListClassName`)
- ✅ Retrocompatibilidade mantida (usado em login)

**Estilo Aplicado:**

```tsx
// Tab ativa
className="bg-gradient-to-r from-purple-600 to-pink-600"

// Estrutura
<TabsCustom value={abaAtiva} onValueChange={setAbaAtiva}>
  <TabsTriggerCustom value="geral" icon={Settings}>
    Geral
  </TabsTriggerCustom>
</TabsCustom>
```

#### **2. Dialog Editar Sala** (`dialog-editar-sala.tsx`)

**Estado e Arquitetura:**

- ✅ Type `ParticipanteLocal` para gerenciamento local
- ✅ State `participantesLocais: useState<ParticipanteLocal[]>([])`
- ✅ Mudanças **apenas salvas ao clicar em "Salvar"** (UX otimizada)
- ✅ Nenhuma chamada API durante edições (add/remove/alter role)

**Aba Participantes:**

- ✅ Lista de participantes com badges visuais (Dono/Admin/Membro)
- ✅ Busca de pessoas com debounce (300ms)
- ✅ Filtragem de participantes já existentes nos resultados
- ✅ Dialog de adicionar participante (Design System aplicado)
- ✅ Dialog de remover participante (AlertDialog estilizado)
- ✅ Botões Promover/Rebaixar (apenas para Dono)
- ✅ Info box explicativo: "Alterações salvas apenas ao clicar em Salvar"

**Funcionalidades Locais:**

```tsx
// Adicionar (local)
const handleAdicionarParticipante = (pessoaId, role) => {
  const pessoa = pessoasEncontradas.find((p) => p.id === pessoaId);
  onAlterarParticipantes([
    ...participantes,
    {
      pessoa_id: pessoaId,
      role: role,
      pessoa: {
        /* dados da pessoa */
      },
    },
  ]);
};

// Remover (local)
const handleRemoverParticipante = (pessoaId) => {
  onAlterarParticipantes(participantes.filter((p) => p.pessoa_id !== pessoaId));
};

// Alterar Role (local)
const handleAlterarRole = (pessoaId, novoRole) => {
  onAlterarParticipantes(
    participantes.map((p) =>
      p.pessoa_id === pessoaId ? { ...p, role: novoRole } : p
    )
  );
};
```

**Design System Aplicado:**

- ✅ AlertDialog: `bg-slate-900`, `border-white/20`
- ✅ Botão confirmar adicionar: Gradiente purple/pink
- ✅ Botão confirmar remover: Gradiente red (`from-red-500 to-rose-500`)
- ✅ Botão cancelar: Glass effect (`bg-white/5`)
- ✅ Info box: `bg-purple-500/10`, `border-purple-500/30`, `text-purple-300`
- ✅ Inputs: `bg-white/5`, `border-white/10`, `focus:border-purple-500`
- ✅ Badges: Crown (Dono), Shield (Admin), User (Membro)

**Acessibilidade:**

- ✅ `DialogHeader` com `sr-only` class
- ✅ `DialogTitle`: "Editar Sala"
- ✅ `DialogDescription`: "Gerencie as configurações da sala"
- ✅ Conforme WCAG para screen readers

#### **3. RTK Query API** (`salas-api.ts`)

- ✅ Interfaces: `AdicionarParticipantePayload`, `RemoverParticipantePayload`, `AlterarRoleParticipantePayload`
- ✅ Mutations definidas (não usadas atualmente devido ao approach local)
- ⏳ **Serão usadas no handleSalvar** para persistir mudanças

#### **4. API de Pesquisa** (`pessoas.api.ts`)

- ✅ `useLazyPesquisarPorNomeOuEmailQuery`
- ✅ Retorna `DadosPessoaResumo`: id, nome, email, inativo
- ✅ Usado na busca de participantes

---

## 🚧 O QUE FALTA (Fase 1 - 5%)

### ⚠️ PRIORIDADE MÁXIMA

#### **1. Implementar handleSalvar** (`dialog-editar-sala.tsx`)

**Objetivo:** Persistir mudanças locais de participantes na API quando usuário clicar em "Salvar"

**Algoritmo:**

```typescript
const handleSalvar = async () => {
  try {
    setCarregando(true);

    // 1. Salvar dados gerais da sala (já implementado)
    await atualizarSala(dadosForm);

    // 2. Detectar mudanças nos participantes
    const original = dadosSala.participantes;
    const local = participantesLocais;

    // 3. Identificar participantes adicionados
    const adicionados = local.filter(
      (l) => !original.find((o) => o.pessoa_id === l.pessoa_id)
    );

    // 4. Identificar participantes removidos
    const removidos = original.filter(
      (o) => !local.find((l) => l.pessoa_id === o.pessoa_id)
    );

    // 5. Identificar mudanças de role
    const rolesAlterados = local.filter((l) => {
      const orig = original.find((o) => o.pessoa_id === l.pessoa_id);
      return orig && orig.role !== l.role;
    });

    // 6. Executar mutations
    await Promise.all([
      ...adicionados.map((p) =>
        adicionarParticipante({
          salaId: dadosSala.id,
          pessoaId: p.pessoa_id,
          role: p.role,
        })
      ),
      ...removidos.map((p) =>
        removerParticipante({
          salaId: dadosSala.id,
          pessoaId: p.pessoa_id,
        })
      ),
      ...rolesAlterados.map((p) =>
        alterarRoleParticipante({
          salaId: dadosSala.id,
          pessoaId: p.pessoa_id,
          novoRole: p.role,
        })
      ),
    ]);

    // 7. Atualizar lista de salas e fechar
    toast.success("Sala atualizada com sucesso!");
    refetch(); // Atualizar lista
    aoFechar();
  } catch (erro) {
    toast.error("Erro ao salvar alterações");
    console.error(erro);
  } finally {
    setCarregando(false);
  }
};
```

**Imports Necessários:**

```tsx
import {
  useAdicionarParticipanteMutation,
  useRemoverParticipanteMutation,
  useAlterarRoleParticipanteMutation,
} from "@/services/api/salas-api";
```

**Estado Adicional:**

```tsx
const [adicionarParticipante] = useAdicionarParticipanteMutation();
const [removerParticipante] = useRemoverParticipanteMutation();
const [alterarRoleParticipante] = useAlterarRoleParticipanteMutation();
```

---

#### **2. Visual Feedback de Mudanças** (Opcional mas Recomendado)

**Badge de contador:**

```tsx
{
  participantesLocais.length !== dadosSala.participantes.length && (
    <Badge variant="secondary" className="ml-2">
      {Math.abs(participantesLocais.length - dadosSala.participantes.length)}{" "}
      alterações
    </Badge>
  );
}
```

**Destaque no botão Salvar:**

```tsx
<Button
  type="submit"
  className={cn(
    buttons.primary,
    temMudancas && "ring-2 ring-purple-400 ring-offset-2"
  )}
>
  Salvar
  {temMudancas && <span className="ml-2">•</span>}
</Button>
```

**Dialog de confirmação ao fechar com mudanças:**

```tsx
const aoFecharDialog = () => {
  const temMudancas =
    JSON.stringify(participantesLocais) !==
    JSON.stringify(dadosSala.participantes);

  if (temMudancas) {
    // Mostrar AlertDialog perguntando se deseja descartar
  } else {
    aoFechar();
  }
};
```

---

## 📋 FASES SEGUINTES

### 🔜 Fase 2: Sistema de Visitantes

**Objetivo:** Permitir acesso temporário durante sessão ativa

**Backend:**

- [ ] Criar tabela `visitantes_temporarios`
- [ ] Método `adicionarVisitante(sala_id, pessoa_id, sessao_id)`
- [ ] Método `removerVisitantesAposSessao(sala_id, sessao_id)`
- [ ] Hook no encerramento de sessão para limpar visitantes

**Frontend:**

- [ ] Aba "Visitantes" no dialog da sala
- [ ] Lista de visitantes com badge "Temporário"
- [ ] Botão "Adicionar Visitante" (apenas durante sessão ativa)
- [ ] Info: "Visitantes são removidos ao final da sessão"

---

### 🔒 Fase 3: Middleware de Segurança

**Objetivo:** Proteger rotas com validação de permissões

**Backend:**

- [ ] Criar `salaPermissaoGuard.ts`
- [ ] Validar role mínimo necessário por rota
- [ ] Aplicar middleware em todas as rotas de sala
- [ ] Logs de tentativas de acesso não autorizado

**Exemplo:**

```typescript
// Middleware
const salaPermissaoGuard = (roleMinimo: number) => {
  return async (req, res, next) => {
    const { salaId } = req.params;
    const { pessoaId } = req.user;

    const participante = await obterParticipante(salaId, pessoaId);

    if (!participante || participante.role > roleMinimo) {
      return res.status(403).json({ erro: "Sem permissão" });
    }

    req.participante = participante;
    next();
  };
};

// Uso
router.post(
  "/salas/:id/sessoes",
  salaPermissaoGuard(1), // Apenas Admin ou Dono
  sessaoController.criar
);
```

---

## 📋 COMPARATIVO DETALHADO: Pendências vs Implementado

### 🎯 Pendências Principais (Do Histórico)

#### 1️⃣ Gerenciamento de Participantes na Sala ⚠️ CRÍTICO

| Item                                          | Status Antigo | Status Atual             | Detalhes           |
| --------------------------------------------- | ------------- | ------------------------ | ------------------ |
| Wizard criar sala com participantes (role=2)  | ✅ FEITO      | ✅ MANTIDO               | Wizard funcionando |
| Dialog editar sala - Aba Participantes        | ❌ VAZIA      | ✅ **100% IMPLEMENTADA** | **GRANDE AVANÇO!** |
| Listar participantes com seus roles           | ❌ FALTANDO   | ✅ FEITO                 | Com badges 👑🛡️👤  |
| Promover membro (2→1) ou rebaixar admin (1→2) | ❌ FALTANDO   | ✅ FEITO                 | Apenas Dono        |
| Remover participantes                         | ❌ FALTANDO   | ✅ FEITO                 | Dono e Admin       |
| Adicionar novos participantes permanentes     | ❌ FALTANDO   | ✅ FEITO                 | Com busca          |
| **Persistir mudanças na API**                 | ❌ FALTANDO   | ⏳ **PRÓXIMO**           | handleSalvar       |

**Progresso:** 6/7 itens completos (86%) ✅

---

#### 2️⃣ Gerenciamento de Visitantes (Tipo 3) ⚠️ IMPORTANTE

| Item                                                     | Status          | Fase   |
| -------------------------------------------------------- | --------------- | ------ |
| Adicionar visitantes temporários ao criar/iniciar sessão | ❌ NÃO INICIADO | Fase 2 |
| Rota POST `/salas/:id/sessoes/visitantes`                | ❌ NÃO INICIADO | Fase 2 |
| Rota DELETE `/salas/:id/sessoes/visitantes/:pessoaId`    | ❌ NÃO INICIADO | Fase 2 |
| UI para gerenciar visitantes durante sessão ativa        | ❌ NÃO INICIADO | Fase 2 |

**Progresso:** 0/4 (0%) - Aguardando Fase 1 ⏳

---

#### 3️⃣ Validações e Segurança ⚠️ IMPORTANTE

| Item                                                  | Status      | Fase   |
| ----------------------------------------------------- | ----------- | ------ |
| Campo role no schema Prisma                           | ✅ FEITO    | ✅     |
| Backend valida permissões na alteração de sala        | ✅ FEITO    | ✅     |
| Middleware `salaPermissaoGuard([0,1,2,3])` para rotas | ❌ FALTANDO | Fase 3 |
| Validação em todas as rotas sensíveis                 | ❌ FALTANDO | Fase 3 |
| `salaAuthGuard` validar sessão ativa + autorizado     | ❌ FALTANDO | Fase 3 |

**Progresso:** 2/5 (40%) - Fundação pronta ✅

---

#### 4️⃣ Funcionalidades de Sessão 🔄

| Item                                    | Status      | Observação |
| --------------------------------------- | ----------- | ---------- |
| Helper `determinarTipoAcesso`           | ✅ PARCIAL  | Já existe  |
| Dono/Admin podem criar sessão ao entrar | ❌ FALTANDO | Fase 2     |
| Adicionar visitantes ao criar sessão    | ❌ FALTANDO | Fase 2     |
| Kickar participante da sessão           | ❌ FALTANDO | Fase 2     |

---

#### 5️⃣ Interface de Gerenciamento 🎨 UI

| Item                                                           | Status Antigo | Status Atual  |
| -------------------------------------------------------------- | ------------- | ------------- |
| Dialog editar sala - Estrutura básica                          | ✅ FEITO      | ✅ MANTIDO    |
| Aba Participantes no dialog - listar/editar/remover            | ❌ FALTANDO   | ✅ **FEITO!** |
| Badge visual de roles nos cards (👑 Dono, ⚡ Admin, 👤 Membro) | ❌ FALTANDO   | ✅ FEITO      |
| Modal/Dialog para gerenciar visitantes durante sessão          | ❌ FALTANDO   | Fase 2        |
| Lista de participantes online na sala-planning                 | ❌ FALTANDO   | Fase 2        |

**Progresso:** 3/5 (60%) ✅

---

### 📊 Resumo Executivo do Progresso

| Categoria                          | Progresso | Status            |
| ---------------------------------- | --------- | ----------------- |
| **1. Gerenciamento Participantes** | 86% (6/7) | 🟢 Quase completo |
| **2. Visitantes**                  | 0% (0/4)  | ⏳ Fase 2         |
| **3. Segurança**                   | 40% (2/5) | 🟡 Base pronta    |
| **4. Sessões**                     | 25% (1/4) | ⏳ Fase 2         |
| **5. Interface**                   | 60% (3/5) | 🟢 Avançado       |

**Média Geral:** 42% de todas as pendências históricas resolvidas ✅

---

## 📚 RECURSOS DO PROJETO

### 🎨 Design System

**Arquivo Principal:** `#file:disigner-system.ts`

**Usar SEMPRE:**

- ✅ `buttons.primary` - Gradiente purple/pink
- ✅ `buttons.secondary` - Glass effect
- ✅ `buttons.danger` - Red gradient
- ✅ `modal.container` - bg-slate-900
- ✅ `card.default` - Glass effect com backdrop-blur
- ✅ `input.default` - Background white/5

**Documentação:** `#file:DESIGN-SYSTEM.md`

---

### 🧩 Componentes Disponíveis

**Pasta:** `components/`

Componentes já criados que **devem ser reutilizados:**

| Componente       | Arquivo                         | Uso                         |
| ---------------- | ------------------------------- | --------------------------- |
| TabsCustom       | `tabs.tsx`                      | Tabs com ícones e gradiente |
| TextInput        | `inputs/input-text.tsx`         | Input de texto padronizado  |
| PasswordInput    | `inputs/input-password.tsx`     | Input de senha              |
| EmailInput       | `inputs/input-email.tsx`        | Input de email validado     |
| CustomRadioGroup | `inputs/custom-radio-group.tsx` | Radio buttons               |
| InputCombobox    | `inputs/input-combobox.tsx`     | Combobox com busca          |
| SelectableBadge  | `inputs/selectable-badge.tsx`   | Badge clicável              |

**⚠️ ANTES DE CRIAR:** Sempre verificar se já existe na pasta `#file:inputs` ou `components/`!

---

## ✅ Checklist de Implementação

### Fase 1 - Gerenciamento de Participantes (95% ✅)

#### Backend - 100% Completo ✅

- [x] Service: `adicionarParticipante` com validação de permissões
- [x] Service: `removerParticipante` com matriz de permissões
- [x] Service: `alterarRoleParticipante` (apenas Dono)
- [x] Controller: Três endpoints (POST/DELETE/PATCH)
- [x] Routes: Rotas configuradas em `/salas/:id/participantes/*`
- [x] Repository: Método `alterarRole`

#### Frontend - 95% Completo ✅

- [x] TabsCustom refatorado com ícones e gradientes
- [x] Dialog editar sala com 2 abas funcionais (Geral + Participantes)
- [x] **Aba Participantes TOTALMENTE implementada:**
  - [x] Listar participantes com badges visuais (👑 Dono, 🛡️ Admin, 👤 Membro)
  - [x] Botões Promover/Rebaixar (apenas para Dono) ✅
  - [x] Botões Remover (Dono e Admin) ✅
  - [x] Dialog adicionar participante com busca ✅
  - [x] Dialog remover com confirmação estilizada ✅
- [x] Estado local `participantesLocais` (UX otimizada)
- [x] Busca de pessoas com debounce (300ms)
- [x] Filtragem de participantes já existentes
- [x] Acessibilidade (DialogTitle/Description sr-only)
- [x] Design System 100% aplicado (gradientes, glass effects)
- [x] Info box: "Alterações salvas ao clicar em Salvar"
- [ ] **handleSalvar para persistir mudanças na API** ⚠️ **ÚLTIMA PENDÊNCIA**
- [ ] Visual feedback de mudanças não salvas (opcional)
- [ ] Testes end-to-end dos fluxos

### Fase 2 - Visitantes Temporários (0% ⏳)

#### Backend

- [ ] Criar tabela `visitantes_sessao` no Prisma
- [ ] Service: `adicionarVisitante(sala_id, pessoa_id, sessao_id)`
- [ ] Service: `removerVisitantesAposSessao(sessao_id)`
- [ ] Hook em encerramento de sessão para limpar visitantes
- [ ] Rota: POST `/salas/:id/sessoes/:sessaoId/visitantes`
- [ ] Rota: DELETE `/salas/:id/sessoes/:sessaoId/visitantes/:pessoaId`

#### Frontend

- [ ] Aba "Visitantes" no dialog editar sala
- [ ] Badge "Temporário" para visitantes
- [ ] Dialog adicionar visitantes (apenas em sessão ativa)
- [ ] Lista de visitantes online na sala-planning
- [ ] Info: "Visitantes são removidos ao final da sessão"

### Fase 3 - Segurança e Middleware (0% ⏳)

#### Backend

- [ ] Criar `salaPermissaoGuard(roleMinimo)` middleware
- [ ] Aplicar em rotas de sessões (criar/encerrar)
- [ ] Aplicar em rotas de histórias (criar/editar/deletar)
- [ ] Aplicar em rotas de votos
- [ ] Logs de tentativas de acesso não autorizado
- [ ] Auditoria completa de permissões

#### Frontend

- [ ] Validação de permissões antes de mostrar botões
- [ ] Mensagens de erro amigáveis para sem permissão
- [ ] Loading states durante verificações

---

## 🐛 Problemas Resolvidos Historicamente

### 1. ✅ Aba Participantes estava vazia

**Problema:** Dialog editar sala tinha aba Participantes sem implementação  
**Solução:** Implementação completa com:

- Listagem de participantes com badges (👑 Dono, 🛡️ Admin, 👤 Membro)
- Busca de pessoas para adicionar
- Dialogs de confirmação estilizados
- Botões de promover/rebaixar/remover com validação de permissões

### 2. ✅ UX Ruim - Chamadas API imediatas

**Problema:** Cada add/remove/alter role chamava API instantaneamente  
**Solução:** Estado local `participantesLocais`, mudanças persistidas apenas ao clicar "Salvar"

### 3. ✅ Confirmação sem Design System

**Problema:** Dialog de confirmação não seguia padrões visuais  
**Solução:** AlertDialog com bg-slate-900, gradientes purple/pink e red

### 4. ✅ Acessibilidade - DialogContent

**Problema:** Lint warning sobre DialogTitle ausente (WCAG)  
**Solução:** DialogHeader com sr-only contendo DialogTitle e DialogDescription

### 5. ✅ Badges e visual feedback ausentes

**Problema:** Não tinha indicação visual de roles  
**Solução:** Badges com Crown (Dono), Shield (Admin), User (Membro)

---

## 📊 Métricas de Progresso Detalhadas

### Por Fase

| Fase                       | Progresso | Status            | Detalhes                  |
| -------------------------- | --------- | ----------------- | ------------------------- |
| **Fase 1 - Participantes** | 95%       | 🟢 Quase completo | Falta apenas handleSalvar |
| **Fase 2 - Visitantes**    | 0%        | ⏳ Não iniciado   | Aguardando Fase 1         |
| **Fase 3 - Segurança**     | 0%        | ⏳ Não iniciado   | Aguardando Fase 2         |

### Por Camada

| Camada       | Fase 1  | Fase 2 | Fase 3 |
| ------------ | ------- | ------ | ------ |
| **Backend**  | 100% ✅ | 0% ⏳  | 0% ⏳  |
| **Frontend** | 95% 🟡  | 0% ⏳  | 0% ⏳  |
| **Testes**   | 0% ⏳   | 0% ⏳  | 0% ⏳  |

### Progresso Total

**Sistema de Participantes Completo:** 32% concluído  
**Fase 1 Isolada:** 95% (falta 1 função: handleSalvar)

---

## 🎯 Comparação: Antes vs Agora

### ❌ ANTES (Estado Antigo)

```
✅ Wizard criar sala com participantes (role=2) - FEITO
❌ Dialog editar sala - Aba Participantes (atualmente vazia) ⚠️
❌ Listar participantes com seus roles
❌ Promover membro (role 2→1) ou rebaixar admin (role 1→2) - só dono
❌ Remover participantes - dono e admin
❌ Adicionar novos participantes permanentes
```

### ✅ AGORA (Estado Atual)

```
✅ Wizard criar sala com participantes (role=2) - FEITO
✅ Dialog editar sala - Aba Participantes TOTALMENTE implementada ✅
✅ Listar participantes com badges visuais (👑🛡️👤)
✅ Promover membro (2→1) ou rebaixar admin (1→2) - só dono
✅ Remover participantes - dono e admin (com confirmação)
✅ Adicionar novos participantes permanentes (com busca)
⏳ Persistir mudanças via API no handleSalvar - ÚNICA PENDÊNCIA
```

**Evolução:** De 0% para 95% na Fase 1!

---

## 🚀 Próximos Passos Priorizados

### 🔴 PRIORIDADE CRÍTICA (Agora)

1. **Implementar handleSalvar** no `dialog-editar-sala.tsx`
   - Detectar mudanças: comparar `participantesLocais` vs `dadosSala.participantes`
   - Chamar mutations: `adicionarParticipante`, `removerParticipante`, `alterarRoleParticipante`
   - Executar em paralelo com `Promise.all`
   - Feedback de sucesso/erro
   - **Tempo estimado:** 30-45 minutos

### 🟡 PRIORIDADE ALTA (Logo após)

2. **Visual feedback de mudanças não salvas**
   - Badge contador no botão Salvar
   - Highlight quando há mudanças
   - Dialog ao tentar fechar com mudanças
   - **Tempo estimado:** 15-20 minutos

### 🟢 PRIORIDADE MÉDIA (Depois)

3. **Testes end-to-end**

   - Adicionar participante como Dono
   - Adicionar participante como Admin
   - Remover como Dono/Admin
   - Promover/rebaixar como Dono
   - Validar erros de permissão
   - **Tempo estimado:** 1-2 horas

4. **Iniciar Fase 2 - Visitantes**
   - Depende da aprovação do usuário
   - Backend: tabela e service methods
   - Frontend: UI de gerenciamento
   - **Tempo estimado:** 3-4 horas

---

## 📖 Referências Importantes

- **Design System:** `/lib/disigner-system.ts`
- **Documentação Design:** `/DESIGN-SYSTEM.md`
- **Inputs Customizados:** `/components/inputs/`
- **Service:** `/src/services/participante-sala.service.ts`
- **Controller:** `/src/controllers/sala.controller.ts`
- **Frontend Dialog:** `/components/dialog-editar-sala.tsx`
- **RTK API:** `/services/api/salas-api.ts`

---

✨ **Última Atualização:** 21/11/2025 - Sistema local de participantes completo, aguardando integração com API no handleSalvar
