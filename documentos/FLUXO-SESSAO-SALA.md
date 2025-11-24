# Fluxo: Início de Sessão em uma Sala

## 📋 Visão Geral

Este documento descreve o fluxo completo de como uma sessão é iniciada quando um usuário entra em uma sala de Planning Poker.

---

## 🔄 Fluxo Atual (Implementado)

### 1️⃣ **Usuário Acessa a Sala**

```
Rota: /salas/[codigo]
Componente: PageSala
```

**O que acontece:**

- URL captura código da sala via `useParams()`
- Sistema busca dados da sala via API

### 2️⃣ **Carregamento dos Dados da Sala**

```typescript
useObterSalaPorCodigoQuery(codigoSala);
```

**API Call:**

```
GET /salas/codigo/:codigo
```

**Responde:**

```json
{
  "Sucesso": true,
  "Mensagem": "Operação realizada com sucesso",
  "Detalhe": null,
  "CodigoRetorno": 200,
  "TipoRetorno": 1,
  "Resultado": {
    "sala": {
      "id": "9c843fc7-7fe9-4036-825d-e3a8ec7d3499",
      "codigo": "DDRBHA",
      "titulo": "Alterando o titulo",
      "criado_por": "e483f765-5e6b-43a0-877e-6bf5c5a9d4af",
      "inativo": false,
      "data_criacao": "2025-11-20T23:18:32.823Z",
      "data_alteracao": null,
      "historia_atual_id": null,
      "votos_revelados": false,
      "proprietario": {
        "id": "e483f765-5e6b-43a0-877e-6bf5c5a9d4af",
        "nome": "Jhony Pereira",
        "inativo": false
      },
      "participantes": [
        {
          "id": "6b711ad8-17fa-4862-a9f4-e77bd6c8a9e1",
          "nome": "Jhony Teste",
          "inativo": false
        },
        {
          "id": "e483f765-5e6b-43a0-877e-6bf5c5a9d4af",
          "nome": "Jhony Pereira",
          "inativo": false
        }
      ],
      "historias": [],
      "sessoes": [
        {
          "id": "fd74145c-ecf6-4953-b9b4-756aebbd5d97",
          "criada_em": "2025-11-23T01:43:08.837Z",
          "historias": []
        }
      ],
      "votos": []
    }
  }
}
```

Novo retorno:

```json
{
  "Sucesso": true,
  "Mensagem": "Operação realizada com sucesso",
  "Detalhe": null,
  "CodigoRetorno": 200,
  "TipoRetorno": 1,
  "Resultado": {
    "sala": {
      "id": "9c843fc7-7fe9-4036-825d-e3a8ec7d3499",
      "codigo": "DDRBHA",
      "titulo": "Alterando o titulo",
      "criado_por": "e483f765-5e6b-43a0-877e-6bf5c5a9d4af",
      "inativo": false,
      "data_criacao": "2025-11-20T23:18:32.823Z", // não precisa nesse omento eu acho
      "data_alteracao": null,
      "historia_atual_id": null,
      "votos_revelados": false,
      "proprietario": {
        "id": "e483f765-5e6b-43a0-877e-6bf5c5a9d4af",
        "nome": "Jhony Pereira",
        "inativo": false
      },
      "participantes": [
        {
          "id": "6b711ad8-17fa-4862-a9f4-e77bd6c8a9e1",
          "nome": "Jhony Teste",
          "inativo": false,
          "role": Number //  para melhorar a identificação do papel de cada usuario na lista
        },
      ],
      "historias": [], // A historia quando estamos dentro da sala de votação pertence a sessão atual da sala, então deve vim apenas as que possuem historiaSessao com sessaoId igual ao id da sessaoSala atualmente ativa para a sala
      "sessoes": [ // Nã faz sentido vim aqui, afinal precisamos da sessão para poder validar a sessão que é gerenciada no front
        {
          "id": "fd74145c-ecf6-4953-b9b4-756aebbd5d97",
          "criada_em": "2025-11-23T01:43:08.837Z",
          "historias": [],
          "votos": []
        }
      ],
      "votos": [] // se aplica a mesma regra das historias, porem deve trazer os votos com hisoria_sessao_id em historiaSessao.id e historiaSessao.sessaoId igual ao id da sessaoSala atualmente ativa para a sala
    }
  }
}
```

### 3️⃣ **Verificação de Sessão Ativa (Redux)**

```typescript
const sessaoAtiva = obterSessaoAtiva(sala.id);
```

**Verifica no Redux (persistido):**

- `state.salaAuth.sessoesAtivas[]`
- Busca sessão com `salaId` correspondente
- Verifica se ainda está válida (não expirou - 24h)

**Resultados possíveis:**

- ✅ `sessaoId` - Sessão ativa encontrada
- ❌ `null` - Nenhuma sessão ativa

### 4️⃣ **Criação de Nova Sessão (se necessário)**

**Condições para criar:**

```typescript
if (!sessaoAtiva && !sessaoInicializadaRef.current) {
  // Criar sessão
}
```

**API Call:**
Essa rota deveria trazer apenas uma sessão ativa e não todas, ou deveria ser usada uma rota que retorne apenas a sessão ativa e não todas as sessões, e o backend deve se responsabilizar para sempre manter apenas uma sessão ativa para a sala.

```
POST /salas/:id/sessoes
```

**Responde:**

```json
{
  "Sucesso": true,
  "Mensagem": "Sessão criada com sucesso.",
  "Detalhe": null,
  "CodigoRetorno": 200,
  "TipoRetorno": 1,
  "Resultado": {
    "sessao": {
      "id": "fd74145c-ecf6-4953-b9b4-756aebbd5d97",
      "sala_id": "9c843fc7-7fe9-4036-825d-e3a8ec7d3499",
      "criada_em": "2025-11-23T01:43:08.837Z",
      "ativa": true,
      "sala": {
        "id": "9c843fc7-7fe9-4036-825d-e3a8ec7d3499",
        "codigo": "DDRBHA",
        "titulo": "Alterando o titulo",
        "criado_por": "e483f765-5e6b-43a0-877e-6bf5c5a9d4af"
      },
      "participantes": [],
      "historias": []
    }
  }
}
```

Novo retorno:

```json
{
  "Sucesso": true,
  "Mensagem": "Sessão criada com sucesso.",
  "Detalhe": null,
  "CodigoRetorno": 200,
  "TipoRetorno": 1,
  "Resultado": {
    "sessao": {
      "id": "fd74145c-ecf6-4953-b9b4-756aebbd5d97",
      "sala_id": "9c843fc7-7fe9-4036-825d-e3a8ec7d3499",
      "criada_em": "2025-11-23T01:43:08.837Z", //front deve usar para calcular o tempo de atividade da sala, ou seja online/iniciada a tanto tempo
      "ativa": true
    }
  }
}
```

### 5️⃣ **Armazenamento no Redux**

```typescript
iniciarSessaoAtiva(sala.id, sessao.id);
```

**Redux State atualizado:**

```typescript
{
  salaAuth: {
    sessoesAtivas: [
      {
        salaId: "uuid-sala",
        sessaoId: "uuid-sessao",
        timestamp: 1700700000000,
      },
    ];
  }
}
```

**Persistência:**

- Redux Persist salva automaticamente no localStorage
- Sessão persiste entre recarregamentos
- Expira automaticamente após 24h

### 6️⃣ **Renderização do Planning**

```typescript
<SalaPlanning
  sala={sala}
  sessaoId={sessaoAtiva}
  meuRole={meuRole}
  ...
/>
```

**Componente recebe:**

- `sessaoId` - ID da sessão ativa (pode ser undefined)
- `meuRole` - Papel do usuário (0=Dono, 1=Admin, 2=Membro, 3=Visitante)
- Dados completos da sala

---

## 🎯 Fluxo Ideal (Recomendado)

### **Mudanças Sugeridas:**

#### 1. API da Sala já retorna sessão ativa

```
GET /salas/codigo/:codigo
```

**Resposta melhorada:**

```json
{
  "Sucesso": true,
  "Resultado": {
    "sala": {
      "id": "uuid",
      "codigo": "DDRBHA",
      "titulo": "Sprint Planning",
      "participantes": [...],
      "historias": [...],

      "sessaoAtiva": {
        "id": "uuid-sessao",
        "ativa": true,
        "meuRole": 0
      }
    }
  }
}
```

**Vantagens:**

- ✅ 1 request em vez de 2
- ✅ Backend calcula `meuRole`
- ✅ Dados sempre sincronizados
- ✅ Sem necessidade de criar sessão no frontend

#### 2. Endpoint separado para dados da sessão

```
GET /sessoes/:id/detalhes
```

**Retorna apenas quando necessário:**

```json
{
  "id": "uuid-sessao",
  "sala_id": "uuid-sala",
  "ativa": true,
  "votos": [...],
  "historiaAtual": {
    "id": "uuid",
    "titulo": "User Story X"
  },
  "historiasSessao": [...]
}
```

---

## 🔐 Controle de Acesso

### **Verificações no Backend:**

1. **Usuário está na sala?**

   - Verifica `ParticipanteSala`
   - Ou `ParticipanteSessao` (visitante)

2. **Qual o papel do usuário?**

   ```sql
   SELECT role FROM ParticipanteSala
   WHERE sala_id = ? AND pessoa_id = ?
   ```

   - 0 = Dono (criou a sala)
   - 1 = Admin (pode gerenciar)
   - 2 = Membro (pode votar)
   - 3 = Visitante (acesso temporário)

3. **Sessão está ativa?**
   - Verifica `data_encerramento IS NULL`

---

## 🚫 Prevenção de Loops

### **Problema Anterior:**

```typescript
useEffect(() => {
  criarSessao(); // Invalida tags
}, [data]); // data muda, loop infinito!
```

### **Solução Implementada:**

```typescript
const sessaoInicializadaRef = useRef(false);

useEffect(() => {
  if (sessaoInicializadaRef.current) return;

  if (!sessaoAtiva) {
    sessaoInicializadaRef.current = true;
    criarSessao();
  }
}, [data?.Resultado?.sala?.id]); // Apenas ID, não objeto completo
```

**Garantias:**

- ✅ Executa apenas 1 vez por sala
- ✅ Não re-executa em invalidações de cache
- ✅ Reset apenas em erro ou mudança de sala

---

## 📊 Diagrama de Sequência

```
Usuario                PageSala              Redux           API Backend
  |                       |                    |                  |
  |--[Acessa /salas/X]-->|                    |                  |
  |                       |                    |                  |
  |                       |--[Buscar sala]----|----------------->|
  |                       |                    |                  |
  |                       |<------------------|--[Dados sala]----|
  |                       |                    |                  |
  |                       |--[Verificar sessão]->                |
  |                       |<-[sessaoAtiva: null]-|               |
  |                       |                    |                  |
  |                       |--[Criar sessão]---|----------------->|
  |                       |                    |                  |
  |                       |<------------------|--[Sessão criada]-|
  |                       |                    |                  |
  |                       |--[Salvar sessão]->|                  |
  |                       |<-[OK, persistido]--|                 |
  |                       |                    |                  |
  |<--[Renderiza Planning Poker]--------------|                  |
  |                       |                    |                  |
```

---

## 🔄 Ciclo de Vida da Sessão

### **Estados:**

1. **Não Existe**

   - Primeira vez que alguém entra na sala
   - Ou última sessão foi encerrada

2. **Ativa**

   - Sessão foi criada
   - Pessoas podem votar
   - Histórias podem ser selecionadas

3. **Encerrada**
   - Dono/Admin encerra manualmente
   - `data_encerramento` é setada
   - Não pode mais receber votos

### **Transições:**

```
[Não Existe] --POST /sessoes--> [Ativa]
[Ativa] --POST /sessoes/encerrar--> [Encerrada]
[Encerrada] --POST /sessoes--> [Nova Sessão Ativa]
```

---

## 🧪 Casos de Teste

### ✅ **Caso 1: Primeira entrada na sala**

- Redux não tem sessão
- Sistema cria automaticamente
- Toast: "Sessão iniciada"

### ✅ **Caso 2: Re-entrada (navegação)**

- Redux tem sessão ativa
- Sistema NÃO cria nova
- Continua na mesma sessão

### ✅ **Caso 3: Recarga da página**

- Redux Persist recupera sessão
- Sistema NÃO cria nova
- Sessão continua ativa

### ✅ **Caso 4: Sessão expirada (24h)**

- Redux detecta timestamp antigo
- Sistema cria nova sessão
- Toast: "Sessão iniciada"

### ✅ **Caso 5: Múltiplas abas**

- Redux sincroniza entre abas
- Mesma sessão em todas
- Sem duplicação

### ❌ **Caso 6: Erro na criação**

- API retorna erro
- Flag é resetada
- Usuário pode tentar novamente
- Toast de erro exibido

---

## 🎛️ Configurações

### **Expiração de Sessão:**

```typescript
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas
```

### **Redux Persist:**

```typescript
whitelist: ["auth", "salaAuth"]; // Persiste sessões
```

### **Cache Invalidation (RTK Query):**

```typescript
invalidatesTags: ["salaPlaning", "visitantes"];
```

---

## 📝 Notas de Implementação

### **Pontos de Atenção:**

1. **useRef vs useState**

   - `useRef` não causa re-render
   - Perfeito para flags de controle
   - Não afeta performance

2. **Dependências do useEffect**

   - Usar apenas `sala.id` (primitivo)
   - Não usar objeto completo `data`
   - Evita re-execuções desnecessárias

3. **Toast Notifications**

   - Sucesso: Sessão iniciada
   - Erro: Detalhes do problema
   - Não bloqueia UI

4. **Tratamento de Erros**
   - Reset da flag em erro
   - Mensagem amigável ao usuário
   - Permite retry manual

---

## 🚀 Melhorias Futuras

1. **Sessão Compartilhada (WebSocket)**

   - Sincronizar estado em tempo real
   - Notificar novos participantes
   - Atualizar votos instantaneamente

2. **Auto-recovery**

   - Detectar sessão órfã
   - Reconectar automaticamente
   - Sincronizar estado perdido

3. **Métricas**

   - Tempo médio de sessão
   - Quantidade de votos por sessão
   - Histórias estimadas

4. **Histórico de Sessões**
   - Listar sessões anteriores
   - Ver resultados passados
   - Exportar relatórios

---

## 📚 Referências

- **Redux Toolkit**: https://redux-toolkit.js.org
- **RTK Query**: https://redux-toolkit.js.org/rtk-query
- **Redux Persist**: https://github.com/rt2zz/redux-persist
- **React useRef**: https://react.dev/reference/react/useRef

minhas observações:

apenas o usuario admin e dono podem iniciar e finalizar a sessão
quando iniciada sempre deve ser utilizada essa até que o dono ou admin encerre a sessão da sala
o admin só pode encerrar a sessão se foi ele que iniciou, talvez precise dessa informação no banco, não sei.
quando o usuario admin ou dono iniciar a sessão sabemos que é gerado participanteSessao para todos permanentes e os convidados informados no wizard de iniciar a sessão o mesmo deve ocorrer para historias,criamos as historias e devemos criar historia sessao
quando iniciamos a sessao da sala criamos os participanteSessao de todos os permanentes, mas não devemos dar update em participanteSala.online = true para todos, apenas para o usuario que iniciou a sessaoSala, o update ocorre quando cada um entrar na sala, os convidados apenas esperamos e acreditamos que estão na sala, afinal ele irão votar, se não votar o adm/dono pode prejulgar que ele não esteve naa sala.
o hook de sessão da sala server para o front saber qual sala está com a sessão ativa para o usuario, como cada usuario só pode ou dever ter apenas uma participanteSessao se não for assim ainda então talvez precisemos dar um update em participanteSessao.autorizado = false depois de encerrar a sessaoSala automaticamente sempre sabemos apara onde devemos direcionar o usuario logado.
quando o usuario participante permanente clicar em encerrar ele encerra apenas a sua participação na sessão atual da sala, isso gera um participanteSessao.autorizado = false e limpa o token da sala e participanteSala.online = false, se ele clicar em entrar depois, e o seu ultimo participanteSessao.sessao_id for igual ao id da sessão atual da sala então podemos lançar uma notificação visual sei lá para o admin e dono poderem permitir o ingresso novamente então podermos regerar o token e ele entra novamente na sala e participanteSala.online = true caso contrario ele não entra isso ajuda quando ele for kickado da sala e tentar voltar.
